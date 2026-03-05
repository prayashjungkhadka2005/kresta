import { prisma } from "db";
import crypto from "crypto";

function generateRefCode(length = 8): string {
    return crypto.randomBytes(length).toString("base64url").slice(0, length);
}

export class LinkService {
    /**
     * Generate or return an existing affiliate link for a creator-product pair.
     * Idempotent: will never create duplicates.
     */
    async generateLink(creatorId: string, productId: string): Promise<any> {
        // Check if a link already exists for this creator-product pair
        const existing = await prisma.affiliateLink.findUnique({
            where: { creatorId_productId: { creatorId, productId } },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        commissionRate: true,
                        productUrl: true,
                        status: true,
                        approvalStatus: true,
                        brand: { select: { companyName: true } },
                        media: { orderBy: { order: "asc" }, take: 1 },
                    },
                },
            },
        });

        if (existing) {
            return existing;
        }

        // Verify the product exists and is active + approved
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { id: true, status: true, approvalStatus: true },
        });

        if (!product) {
            throw new Error("Product not found");
        }

        if (product.status !== "ACTIVE" || product.approvalStatus !== "APPROVED") {
            throw new Error("Product is not available for promotion");
        }

        // Generate a unique refCode — retry if collision (extremely rare)
        let refCode: string;
        let attempts = 0;
        do {
            refCode = generateRefCode(8);
            const collision = await prisma.affiliateLink.findUnique({
                where: { refCode },
            });
            if (!collision) break;
            attempts++;
        } while (attempts < 5);

        const link = await prisma.affiliateLink.create({
            data: {
                creatorId,
                productId,
                refCode: refCode!,
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        commissionRate: true,
                        productUrl: true,
                        status: true,
                        approvalStatus: true,
                        brand: { select: { companyName: true } },
                        media: { orderBy: { order: "asc" }, take: 1 },
                    },
                },
            },
        });

        return link;
    }

    /**
     * Get all affiliate links for a creator with product + brand details.
     */
    async getCreatorLinks(creatorId: string): Promise<any[]> {
        return prisma.affiliateLink.findMany({
            where: { creatorId },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        commissionRate: true,
                        productUrl: true,
                        status: true,
                        approvalStatus: true,
                        brand: { select: { companyName: true, logoUrl: true } },
                        media: { orderBy: { order: "asc" }, take: 1 },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    /**
     * Get a single link for a creator by productId (to check if already promoted).
     */
    async getLinkByProduct(creatorId: string, productId: string): Promise<any | null> {
        return prisma.affiliateLink.findUnique({
            where: { creatorId_productId: { creatorId, productId } },
        });
    }

    /**
     * Deactivate (delete) an affiliate link.
     */
    async deleteLink(linkId: string, creatorId: string): Promise<void> {
        const link = await prisma.affiliateLink.findUnique({
            where: { id: linkId },
            select: { creatorId: true },
        });

        if (!link) {
            throw new Error("Link not found");
        }

        if (link.creatorId !== creatorId) {
            throw new Error("Forbidden");
        }

        await prisma.affiliateLink.delete({ where: { id: linkId } });
    }

    /**
     * Get aggregate statistics for the Creator Dashboard
     */
    async getCreatorStats(creatorId: string) {
        // Total Earnings (from creator record)
        const creator = await prisma.creator.findUnique({
            where: { id: creatorId },
            select: { totalEarnings: true, pendingBalance: true }
        });

        // Active Links (count)
        const activeLinks = await prisma.affiliateLink.count({
            where: { creatorId }
        });

        // Aggregate Clicks & Sales across all links
        const linkAggregates = await prisma.affiliateLink.aggregate({
            where: { creatorId },
            _sum: { totalClicks: true, totalSales: true }
        });

        // Total Marketplace Items (global count of available products)
        const marketplaceItems = await prisma.product.count({
            where: { status: "ACTIVE", approvalStatus: "APPROVED" }
        });

        return {
            totalEarnings: creator?.totalEarnings || 0,
            pendingEarnings: creator?.pendingBalance || 0,
            activeLinks,
            totalClicks: linkAggregates._sum.totalClicks || 0,
            totalSales: linkAggregates._sum.totalSales || 0,
            marketplaceItems
        };
    }
}
