import { prisma, Brand, Creator } from "db";
import bcrypt from "bcrypt";
import { BrandRegisterInput, CreatorRegisterInput } from "shared";

export class AuthService {
    async registerBrand(data: BrandRegisterInput): Promise<Brand> {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return prisma.brand.create({
            data: {
                email: data.email,
                passwordHash: hashedPassword,
                companyName: data.companyName,
                websiteUrl: data.websiteUrl || null,
                hasWebsite: data.hasWebsite,
            },
        });
    }

    async registerCreator(data: CreatorRegisterInput): Promise<Creator> {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return prisma.creator.create({
            data: {
                email: data.email,
                passwordHash: hashedPassword,
                fullName: data.fullName,
                username: data.username,
            },
        });
    }

    async findUserByEmail(email: string): Promise<{ user: Brand | Creator; type: "brand" | "creator" } | null> {
        const brand = await prisma.brand.findUnique({ where: { email } });
        if (brand) return { user: brand, type: "brand" as const };

        const creator = await prisma.creator.findUnique({ where: { email } });
        if (creator) return { user: creator, type: "creator" as const };

        return null;
    }
}
