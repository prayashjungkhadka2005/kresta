import { FastifyInstance } from "fastify";
import { AuthController } from "./auth.controller";

const authController = new AuthController();

export async function authRoutes(fastify: FastifyInstance) {
    fastify.post("/register/brand", authController.registerBrand);
    fastify.post("/register/creator", authController.registerCreator);
    fastify.post("/login", authController.login);
    fastify.post("/logout", authController.logout);
}
