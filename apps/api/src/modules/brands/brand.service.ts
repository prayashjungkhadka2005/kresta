import { prisma, Brand } from "db";

export class BrandService {
    async getAllBrands() {
        const brands = await prisma.brand.findMany({
            where: {
                status: "APPROVED",
                products: {
                    some: {
                        status: "ACTIVE",
                        approvalStatus: "APPROVED"
                    }
                }
            },
            select: {
                id: true,
                companyName: true,
                slug: true,
                logoUrl: true,
                bannerUrl: true,
                bio: true,
                products: {
                    where: {
                        status: "ACTIVE",
                        approvalStatus: "APPROVED"
                    },
                    select: {
                        commissionRate: true
                    }
                },
                _count: {
                    select: {
                        products: {
                            where: {
                                status: "ACTIVE",
                                approvalStatus: "APPROVED"
                            }
                        }
                    }
                }
            },
            orderBy: {
                companyName: "asc"
            }
        });

        return brands.map(brand => {
            const totalCommission = brand.products.reduce((acc, p) => acc + Number(p.commissionRate || 0), 0);
            const avgCommission = brand.products.length > 0
                ? parseFloat((totalCommission / brand.products.length).toFixed(2))
                : 0;

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { products, ...rest } = brand;
            return {
                ...rest,
                avgCommission
            };
        });
    }

    async getBrandBySlug(slug: string) {
        const brand = await prisma.brand.findUnique({
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
                facebookUrl: true,
                tiktokUrl: true,
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

        if (!brand) return null;

        const totalCommission = brand.products.reduce((acc, p) => acc + Number(p.commissionRate || 0), 0);
        const avgCommission = brand.products.length > 0
            ? parseFloat((totalCommission / brand.products.length).toFixed(2))
            : 0;

        return {
            ...brand,
            avgCommission
        };
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
                facebookUrl: data.facebookUrl,
                tiktokUrl: data.tiktokUrl,
            }
        });
    }
}
