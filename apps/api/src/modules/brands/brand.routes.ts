import { FastifyInstance } from "fastify";
import { BrandController } from "./brand.controller";

const brandController = new BrandController();

export async function brandRoutes(fastify: FastifyInstance) {
    // Authentication hook for protected routes
    const authenticate = async (request: any, reply: any) => {
        try {
            const decoded = await request.jwtVerify();
            request.user = decoded;
        } catch (err) {
            return reply.status(401).send({ message: "Unauthorized" });
        }
    };

    // Public Routes
    fastify.get("/", brandController.listBrands.bind(brandController));
    fastify.get("/:slug", brandController.getBrandProfile.bind(brandController));

    // Private Management (Brand only)
    fastify.register(async (privateRoutes) => {
        privateRoutes.addHook("preHandler", authenticate);
        privateRoutes.get("/me", brandController.getMyBrand.bind(brandController));
        privateRoutes.patch("/me", brandController.updateProfile.bind(brandController));
    });
}
