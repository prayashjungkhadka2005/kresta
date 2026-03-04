import { Product, prisma } from "db";
import { CreateProductInput, UpdateProductInput } from "shared";

export class ProductService {
    async createProduct(brandId: string, data: CreateProductInput): Promise<Product> {
        return prisma.product.create({
            data: {
                ...data,
                brandId,
                price: data.price.toString(),
                commissionRate: data.commissionRate.toString(),
            },
        });
    }

    async getBrandProducts(brandId: string): Promise<Product[]> {
        return prisma.product.findMany({
            where: { brandId, status: { not: "ARCHIVED" } },
            orderBy: { createdAt: "desc" },
        });
    }

    async getPublicProducts(): Promise<(Product & { brand: { companyName: string; logoUrl: string | null } })[]> {
        return prisma.product.findMany({
            where: { status: "ACTIVE", approvalStatus: "APPROVED" },
            include: { brand: { select: { companyName: true, logoUrl: true } } },
            orderBy: { createdAt: "desc" },
        });
    }

    async getProductById(id: string): Promise<(Product & { brand: { companyName: string } }) | null> {
        return prisma.product.findUnique({
            where: { id },
            include: { brand: { select: { companyName: true } } },
        });
    }

    async updateProduct(id: string, brandId: string, data: UpdateProductInput): Promise<Product> {
        return prisma.product.update({
            where: { id, brandId },
            data: {
                ...data,
                price: data.price?.toString(),
                commissionRate: data.commissionRate?.toString(),
            },
        });
    }

    async deleteProduct(id: string, brandId: string): Promise<Product> {
        return prisma.product.update({
            where: { id, brandId },
            data: { status: "ARCHIVED" },
        });
    }
}
