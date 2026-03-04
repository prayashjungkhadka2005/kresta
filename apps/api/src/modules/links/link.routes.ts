import { FastifyInstance } from "fastify";
import { LinkController } from "./link.controller";

const linkController = new LinkController();

export async function linkRoutes(fastify: FastifyInstance) {
    const authenticate = async (request: any, reply: any) => {
        try {
            const decoded = await request.jwtVerify();
            request.user = decoded;
        } catch (err) {
            return reply.status(401).send({ message: "Unauthorized" });
        }
    };

    // All link routes require authentication
    fastify.addHook("preHandler", authenticate);

    // GET  /api/creators/me/links           → list all my links
    fastify.get("/", linkController.getMyLinks.bind(linkController));

    // GET  /api/creators/me/links/product/:productId → check if I have a link for this product
    fastify.get("/product/:productId", linkController.getLinkByProduct.bind(linkController));

    // POST /api/creators/me/links           → generate (or retrieve) a link
    fastify.post("/", linkController.generateLink.bind(linkController));

    // DELETE /api/creators/me/links/:id     → remove a link
    fastify.delete("/:id", linkController.deleteLink.bind(linkController));
}
