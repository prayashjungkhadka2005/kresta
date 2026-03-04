import { z } from "zod";

export const ProductStatusSchema = z.enum(["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"]);
export const ProductApprovalStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);
export const MediaTypeSchema = z.enum(["IMAGE", "VIDEO"]);

export const ProductMediaSchema = z.object({
    url: z.string().url("Invalid media URL"),
    type: MediaTypeSchema.default("IMAGE"),
    order: z.number().int().default(0),
});

export const CreateProductSchema = z.object({
    name: z.string().trim().min(3, "Name must be at least 3 characters").max(100),
    description: z.string().trim().min(10, "Description must be at least 10 characters").max(1000),
    price: z.number().positive("Price must be a positive number"),
    commissionRate: z.number().min(0.01, "Minimum commission is 1%").max(90, "Maximum commission is 90%"),
    productUrl: z.string().url("Invalid product URL"),
    media: z.array(ProductMediaSchema).min(1, "At least one image is required"),
    isHosted: z.boolean().default(false),
});

export const UpdateProductSchema = CreateProductSchema.partial().extend({
    status: ProductStatusSchema.optional(),
});

export type ProductStatus = z.infer<typeof ProductStatusSchema>;
export type ProductApprovalStatus = z.infer<typeof ProductApprovalStatusSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
