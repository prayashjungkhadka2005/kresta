import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";
import { ZodError } from "zod";
import { authRoutes } from "./modules/auth/auth.routes";
import { productRoutes } from "./modules/products/product.routes";

const fastify = Fastify({
    logger: true,
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

    // Decorate request with JWT
    fastify.addHook("preHandler", async (request) => {
        request.jwt = fastify.jwt;
    });

    // Error handler for Zod validation errors
    fastify.setErrorHandler((error, _request, reply) => {
        if (error instanceof ZodError) {
            return reply.status(400).send({
                message: "Validation failed",
                errors: error.flatten().fieldErrors,
            });
        }

        // Default error handler
        reply.send(error);
    });

    // Routes
    await fastify.register(authRoutes, { prefix: "/api/auth" });
    await fastify.register(productRoutes, { prefix: "/api/products" });

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
