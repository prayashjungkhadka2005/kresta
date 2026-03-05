import { FastifyReply, FastifyRequest } from "fastify";
import { LinkService } from "./link.service";

const linkService = new LinkService();

export class LinkController {
    async generateLink(request: FastifyRequest, reply: FastifyReply) {
        const user = (request as any).user;

        if (user.role !== "creator") {
            return reply.status(403).send({ message: "Only creators can generate affiliate links" });
        }

        const { productId } = request.body as { productId: string };

        if (!productId) {
            return reply.status(400).send({ message: "productId is required" });
        }

        try {
            const link = await linkService.generateLink(user.id, productId);
            return reply.status(201).send({
                message: "Affiliate link ready",
                link,
            });
        } catch (error: any) {
            if (error.message === "Product not found") {
                return reply.status(404).send({ message: error.message });
            }
            if (error.message === "Product is not available for promotion") {
                return reply.status(409).send({ message: error.message });
            }
            throw error;
        }
    }

    async getMyLinks(request: FastifyRequest, reply: FastifyReply) {
        const user = (request as any).user;

        if (user.role !== "creator") {
            return reply.status(403).send({ message: "Access denied" });
        }

        const links = await linkService.getCreatorLinks(user.id);
        return reply.send({ links });
    }

    async getLinkByProduct(request: FastifyRequest, reply: FastifyReply) {
        const user = (request as any).user;
        const { productId } = request.params as { productId: string };

        if (user.role !== "creator") {
            return reply.status(403).send({ message: "Access denied" });
        }

        const link = await linkService.getLinkByProduct(user.id, productId);
        return reply.send({ link: link ?? null });
    }

    async deleteLink(request: FastifyRequest, reply: FastifyReply) {
        const user = (request as any).user;
        const { id } = request.params as { id: string };

        if (user.role !== "creator") {
            return reply.status(403).send({ message: "Access denied" });
        }

        try {
            await linkService.deleteLink(id, user.id);
            return reply.send({ message: "Link removed successfully" });
        } catch (error: any) {
            if (error.message === "Link not found") {
                return reply.status(404).send({ message: error.message });
            }
            if (error.message === "Forbidden") {
                return reply.status(403).send({ message: "You do not own this link" });
            }
            throw error;
        }
    }

    async getStats(request: FastifyRequest, reply: FastifyReply) {
        const user = (request as any).user;

        if (user.role !== "creator") {
            return reply.status(403).send({ message: "Access denied" });
        }

        try {
            const stats = await linkService.getCreatorStats(user.id);
            return reply.send({ stats });
        } catch (error: any) {
            request.log.error(error);
            return reply.status(500).send({ message: "Failed to load creator stats" });
        }
    }
}
