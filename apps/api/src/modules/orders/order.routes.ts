import { FastifyInstance } from "fastify";
import { OrderController } from "./order.controller";

export const orderRoutes = async (app: FastifyInstance) => {
    // Public Webhook / Pixel endpoint for receiving tracked conversions
    app.post("/track", OrderController.trackConversion);
};
