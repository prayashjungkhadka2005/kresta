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

        return prisma.product.update({
            where: { id, brandId },
            data: {
                ...productData,
                price: productData.price?.toString(),
                commissionRate: productData.commissionRate?.toString(),
                // Simple media update: If media is provided, we could replace it. 
                // For now, let's just handle the main fields.
            },
            include: { media: true }
        });
    }

    async deleteProduct(id: string, brandId: string): Promise<any> {
        return prisma.product.update({
            where: { id, brandId },
            data: { status: "ARCHIVED" },
        });
    }
}
