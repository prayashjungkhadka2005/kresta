import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
import staticPlugin from "@fastify/static";
import path from "path";
import { ZodError } from "zod";
import { authRoutes } from "./modules/auth/auth.routes";
import { productRoutes } from "./modules/products/product.routes";
import { uploadRoutes } from "./modules/upload/upload.routes";
import { linkRoutes } from "./modules/links/link.routes";
import { brandRoutes } from "./modules/brands/brand.routes";

const fastify = Fastify({
    logger: true,
    bodyLimit: 100 * 1024 * 1024, // 100MB
});

// Extend Fastify types
declare module "fastify" {
    interface FastifyRequest {
        jwt: any;
    }
}

async function bootstrap() {
    // Plugins
    await fastify.register(cors, {
        origin: true,
        credentials: true,
    });

    await fastify.register(jwt, {
        secret: process.env.JWT_SECRET || "supersecret",
        cookie: {
            cookieName: "token",
            signed: false,
        },
    });

    await fastify.register(cookie, {
        secret: process.env.COOKIE_SECRET || "cookiesecret",
        parseOptions: {},
    });

    await fastify.register(multipart, {
        limits: {
            fileSize: 100 * 1024 * 1024, // 100MB
        },
    });

    await fastify.register(staticPlugin, {
        root: path.join(__dirname, "../uploads"),
        prefix: "/uploads/",
    });

    // Decorate request with JWT
    fastify.addHook("preHandler", async (request) => {
        request.jwt = fastify.jwt;
    });

    // Error handler for Zod validation errors and payload limits
    fastify.setErrorHandler((error, _request, reply) => {
        if (error instanceof ZodError) {
            return reply.status(400).send({
                message: "Validation failed",
                errors: error.flatten().fieldErrors,
            });
        }

        // Catch 413 (Payload Too Large) errors
        if ((error as any).statusCode === 413 || (error as any).code === 'FST_ERR_CTP_BODY_TOO_LARGE') {
            return reply.status(413).send({
                message: "File too large. Maximum allowed size is 100MB.",
            });
        }

        // Default error handler
        reply.send(error);
    });

    // Routes
    await fastify.register(authRoutes, { prefix: "/api/auth" });
    await fastify.register(productRoutes, { prefix: "/api/products" });
    await fastify.register(uploadRoutes, { prefix: "/api/upload" });
    await fastify.register(linkRoutes, { prefix: "/api/creators/me/links" });
    await fastify.register(brandRoutes, { prefix: "/api/brands" });

    // Health check
    fastify.get("/health", async () => {
        return { status: "OK" };
    });

    try {
        await fastify.listen({ port: Number(process.env.PORT) || 3001, host: "0.0.0.0" });
        console.log(`API server listening on port ${process.env.PORT || 3001}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

bootstrap();
