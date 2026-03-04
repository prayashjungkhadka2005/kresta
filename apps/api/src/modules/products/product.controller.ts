import { FastifyReply, FastifyRequest } from "fastify";
import { ProductService } from "./product.service";
import { CreateProductSchema, UpdateProductSchema } from "shared";

const productService = new ProductService();

export class ProductController {
    async createProduct(request: FastifyRequest, reply: FastifyReply) {
        const user = (request as any).user;
        if (user.role !== "brand") {
            return reply.status(403).send({ message: "Only brands can create products" });
        }

        const data = CreateProductSchema.parse(request.body);
        const product = await productService.createProduct(user.id, data);

        return reply.status(201).send({
            message: "Product created successfully",
            product,
        });
    }

    async getBrandProducts(request: FastifyRequest, reply: FastifyReply) {
        const user = (request as any).user;
        if (user.role !== "brand") {
            return reply.status(403).send({ message: "Access denied" });
        }

        const products = await productService.getBrandProducts(user.id);
        return reply.send({ products });
    }

    async getPublicProducts(_request: FastifyRequest, reply: FastifyReply) {
        const products = await productService.getPublicProducts();
        return reply.send({ products });
    }

    async getProduct(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const product = await productService.getProductById(id);

        if (!product) {
            return reply.status(404).send({ message: "Product not found" });
        }

        return reply.send({ product });
    }

    async updateProduct(request: FastifyRequest, reply: FastifyReply) {
        const user = (request as any).user;
        const { id } = request.params as { id: string };

        if (user.role !== "brand") {
            return reply.status(403).send({ message: "Access denied" });
        }

        const data = UpdateProductSchema.parse(request.body);
        const product = await productService.updateProduct(id, user.id, data);

        return reply.send({
            message: "Product updated successfully",
            product,
        });
    }
}
