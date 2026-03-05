import { FastifyReply, FastifyRequest } from "fastify";
import { BrandService } from "./brand.service";

const brandService = new BrandService();

export class BrandController {
    async getBrandProfile(request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
        const { slug } = request.params;
        const brand = await brandService.getBrandBySlug(slug);

        if (!brand) {
            return reply.status(404).send({ message: "Brand not found" });
        }

        return { brand };
    }

    async listBrands(request: FastifyRequest, reply: FastifyReply) {
        const brands = await brandService.getAllBrands();
        return { brands };
    }

    async getMyBrand(request: FastifyRequest, reply: FastifyReply) {
        const brandId = (request.user as any).id;
        const brand = await brandService.getBrandById(brandId);
        if (!brand) return reply.status(404).send({ message: "Brand not found" });
        return { brand };
    }

    async updateProfile(request: FastifyRequest, reply: FastifyReply) {
        const brandId = (request.user as any).id;
        const data = request.body as any;

        const brand = await brandService.updateBrandProfile(brandId, data);
        return { brand, message: "Profile updated successfully" };
    }
}
