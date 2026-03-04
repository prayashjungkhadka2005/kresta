import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";
import { authRoutes } from "./modules/auth/auth.routes";

const fastify = Fastify({
    logger: true,
});

// Extend Fastify types
declare module "fastify" {
    interface FastifyRequest {
        jwt: any; // Simplified for now, or use the actual type if known
    }
}

async function bootstrap() {
    // Plugins
    await fastify.register(cors, {
        origin: true, // In production, this should be restricted
        credentials: true,
    });

    await fastify.register(jwt, {
        secret: process.env.JWT_SECRET || "supersecret",
    });

    await fastify.register(cookie, {
        secret: process.env.COOKIE_SECRET || "cookiesecret",
        parseOptions: {},
    });

    // Decorate request with JWT for easier access in controllers
    fastify.addHook("preHandler", async (request) => {
        request.jwt = fastify.jwt;
    });

    // Routes
    await fastify.register(authRoutes, { prefix: "/api/auth" });

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
