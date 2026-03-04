import { FastifyInstance } from "fastify";
import { ProductController } from "./product.controller";

const productController = new ProductController();

export async function productRoutes(fastify: FastifyInstance) {
    // Authentication hook for protected routes
    const authenticate = async (request: any, reply: any) => {
        try {
            const decoded = await request.jwtVerify();
            request.user = decoded;
        } catch (err) {
            return reply.status(401).send({ message: "Unauthorized" });
        }
    };

    // Public routes
    fastify.get("/", productController.getPublicProducts.bind(productController));
    fastify.get("/:id", productController.getProduct.bind(productController));

    // Private routes (Brand only)
    fastify.register(async (privateRoutes) => {
        privateRoutes.addHook("preHandler", authenticate);

        privateRoutes.post("/", productController.createProduct.bind(productController));
        privateRoutes.get("/brand/me", productController.getBrandProducts.bind(productController));
        privateRoutes.patch("/:id", productController.updateProduct.bind(productController));
    });
}
