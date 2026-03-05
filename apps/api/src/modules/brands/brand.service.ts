import { prisma, Brand } from "db";

export class BrandService {
    async getBrandBySlug(slug: string) {
        return prisma.brand.findUnique({
            where: { slug },
            select: {
                id: true,
                companyName: true,
                slug: true,
                bio: true,
                logoUrl: true,
                bannerUrl: true,
                websiteUrl: true,
                instagramUrl: true,
                twitterUrl: true,
                tiktokUrl: true,
                linkedinUrl: true,
                products: {
                    where: {
                        status: "ACTIVE",
                        approvalStatus: "APPROVED"
                    },
                    include: {
                        media: {
                            orderBy: { order: "asc" }
                        }
                    }
                }
            }
        });
    }

    async getBrandById(id: string) {
        return prisma.brand.findUnique({
            where: { id },
        });
    }

    async updateBrandProfile(brandId: string, data: any) {
        return prisma.brand.update({
            where: { id: brandId },
            data: {
                companyName: data.companyName,
                bio: data.bio,
                logoUrl: data.logoUrl,
                bannerUrl: data.bannerUrl,
                websiteUrl: data.websiteUrl,
                instagramUrl: data.instagramUrl,
                twitterUrl: data.twitterUrl,
                tiktokUrl: data.tiktokUrl,
                linkedinUrl: data.linkedinUrl,
            }
        });
    }
}
