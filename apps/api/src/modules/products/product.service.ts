import { Product, prisma } from "db";
import { CreateProductInput, UpdateProductInput } from "shared";

export class ProductService {
    async createProduct(brandId: string, data: CreateProductInput): Promise<any> {
        const { media, ...productData } = data;

        return prisma.product.create({
            data: {
                ...productData,
                brandId,
                price: productData.price.toString(),
                commissionRate: productData.commissionRate.toString(),
                media: {
                    create: media.map(m => ({
                        url: m.url,
                        type: m.type as any,
                        order: m.order
                    }))
                }
            },
            include: { media: true }
        });
    }

    async getBrandProducts(brandId: string): Promise<any[]> {
        return prisma.product.findMany({
            where: { brandId, status: { not: "ARCHIVED" } },
            include: { media: true },
            orderBy: { createdAt: "desc" },
        });
    }

    async getPublicProducts(): Promise<any[]> {
        return prisma.product.findMany({
            where: { status: "ACTIVE", approvalStatus: "APPROVED" },
            include: {
                brand: { select: { companyName: true, logoUrl: true } },
                media: true
            },
            orderBy: { createdAt: "desc" },
        });
    }

    async getProductById(id: string): Promise<any | null> {
        return prisma.product.findUnique({
            where: { id },
            include: {
                brand: { select: { companyName: true } },
                media: true
            },
        });
    }

    async updateProduct(id: string, brandId: string, data: UpdateProductInput): Promise<any> {
        const { media, ...productData } = data;

        return prisma.$transaction(async (tx) => {
            // Fetch current product to check approval status
            const existingProduct = await tx.product.findUnique({
                where: { id, brandId },
                select: { approvalStatus: true }
            });

            if (!existingProduct) {
                throw new Error("Product not found");
            }

            // Enforce ACTIVE status requirement
            if (data.status === "ACTIVE" && existingProduct.approvalStatus !== "APPROVED") {
                throw new Error("Product must be APPROVED before it can be set to ACTIVE");
            }

            // Update core product data
            const product = await tx.product.update({
                where: { id, brandId },
                data: {
                    ...productData,
                    price: productData.price?.toString(),
                    commissionRate: productData.commissionRate?.toString(),
                }
            });

            // If media is provided, sync it
            if (media) {
                // Delete existing media
                await tx.productMedia.deleteMany({
                    where: { productId: id }
                });

                // Create new media items
                await tx.productMedia.createMany({
                    data: media.map(m => ({
                        productId: id,
                        url: m.url,
                        type: m.type as any,
                        order: m.order
                    }))
                });
            }

            return tx.product.findUnique({
                where: { id },
                include: { media: true }
            });
        });
    }

    async deleteProduct(id: string, brandId: string): Promise<any> {
        return prisma.product.update({
            where: { id, brandId },
            data: { status: "ARCHIVED" },
        });
    }
}
