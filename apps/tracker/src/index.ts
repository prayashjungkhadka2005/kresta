import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";
import { COOKIE_MAX_AGE_DAYS } from "shared";
import crypto from 'crypto';

const prisma = new PrismaClient();
const app = Fastify({ logger: true });

// Register Plugins
app.register(cors, { origin: true });
app.register(cookie, {
    secret: process.env.COOKIE_SECRET || "kresta-super-secret-cookie-key",
    parseOptions: {}
});

app.get("/health", async (request, reply) => {
    return { status: "ok", service: "tracker" };
});

/**
 * Endpoint: /t/:refCode
 * Purpose: Handle the Creator's affiliate link, drop the cookie, and redirect to the specific product on the Brand's website.
 */
app.get("/t/:refCode", async (request, reply) => {
    const { refCode } = request.params as { refCode: string };

    try {
        // 1. Verify Affiliate Link
        const link = await prisma.affiliateLink.findUnique({
            where: { refCode },
            include: { product: true },
        });

        if (!link) {
            // Future gracefully handle invalid links (maybe redirect to a static Kresta 404 page)
            return reply.status(404).send({ error: "Link not found" });
        }

        // 2. Generate Click ID and Hash IP for anonymous tracking
        const ip = request.ip;
        const ipHash = crypto.createHash('sha256').update(ip).digest('hex');
        const userAgent = request.headers['user-agent'] || 'Unknown';

        // 3. Set standard 30-day "kresta_ref" cookie
        // We use the `refCode` as the value so the pixel can simply read the creator+product identity directly
        reply.setCookie('kresta_ref', refCode, {
            domain: process.env.COOKIE_DOMAIN || undefined,
            path: '/',
            maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60, // 30 days
            httpOnly: false, // Must be readable by client-side JS pixel securely installed on brand's site
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none' // Required for cross-site tracking (Brand site reading the cookie)
        });

        // 4. Fire-and-Forget Analytics Logging
        // We do NOT `await` this to ensure the redirect happens blazingly fast measured in <10ms
        prisma.$transaction([
            prisma.clickEvent.create({
                data: {
                    affiliateLinkId: link.id,
                    refCode,
                    ipHash,
                    userAgent,
                    referrer: request.headers.referer || null,
                }
            }),
            prisma.affiliateLink.update({
                where: { id: link.id },
                data: { totalClicks: { increment: 1 } }
            })
        ]).catch(err => {
            app.log.error("Failed to async log click event", err);
        });

        // 5. Blazing Fast Redirect
        return reply.redirect(link.product.productUrl);

    } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: "Internal Server Error" });
    }
});

/**
 * Serve the lightweight Tracking Pixel snippet for Brands to embed.
 */
app.get("/pixel.js", async (request, reply) => {
    // This script will be deeply expanded later!
    const trackerUrl = process.env.TRACKER_URL || "http://localhost:3002";

    // Minified-style standard JS code that will fire a conversion to our backend
    const pixelJs = `
(function(window, document) {
    if (window.kresta && window.kresta.initialized) return;
    
    var k = window.kresta = window.kresta || function() {
        (k.q = k.q || []).push(arguments);
    };
    k.initialized = true;

    // Helper to read the tracking cookie injected by our redirector
    function getCookie(name) {
        var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        if (match) return match[2];
        return null;
    }

    // Core Tracking Logic
    k.track = function(eventName, payload) {
        var refCode = getCookie('kresta_ref');
        
        // If no tracking cookie is found, ignore the event (it's not an affiliate sale)
        if (!refCode) {
            console.warn("[KREST PIXEL] No affiliate cookie found. Ignoring event:", eventName);
            return;
        }

        var data = {
            eventName: eventName,
            refCode: refCode,
            payload: payload || {},
            url: window.location.href,
            title: document.title,
            timestamp: new Date().toISOString()
        };

        // Send fire-and-forget beacon or XHR to the tracker service
        var endpoint = "${trackerUrl}/track";
        
        if (navigator.sendBeacon) {
            navigator.sendBeacon(endpoint, JSON.stringify(data));
        } else {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', endpoint, true);
            xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8'); // Prevents CORS preflight
            xhr.send(JSON.stringify(data));
        }
        
        console.log("[KRESTA PIXEL] Tracked:", eventName);
    };

    // Process any events that were queued before the script loaded
    if (k.q && k.q.length > 0) {
        for (var i = 0; i < k.q.length; i++) {
            k.track.apply(null, k.q[i]);
        }
    }
})(window, document);
    `;

    reply.header('Content-Type', 'application/javascript');
    return reply.send(pixelJs);
});

/**
 * Endpoint: POST /track
 * Purpose: Receive events from the Pixel (like 'purchase') and handle them inline or forward them to the API.
 */
app.post("/track", async (request, reply) => {
    try {
        // Pixel sends data as text/plain to avoid CORS preflight, so we manually parse it
        const body = typeof request.body === 'string'
            ? JSON.parse(request.body)
            : request.body;

        const { eventName, refCode, payload } = body as {
            eventName: string;
            refCode: string;
            payload: any;
        };

        if (!refCode || !eventName) {
            return reply.status(400).send({ error: "Missing required fields" });
        }

        // For now we log it. Next step: Forward 'purchase' events to the robust Kresta API for financial calculations.
        app.log.info({ msg: "Received Pixel Event", eventName, refCode, payload });

        return reply.status(200).send({ success: true });
    } catch (err) {
        app.log.error({ msg: "Failed to process tracker event", err });
        return reply.status(500).send({ error: "Internal Error" });
    }
});

// Start Server
const start = async () => {
    try {
        const port = process.env.PORT ? parseInt(process.env.PORT) : 3002;
        await app.listen({ port, host: '0.0.0.0' });
        console.log(`🚀 Tracker Service listening on port ${port}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
