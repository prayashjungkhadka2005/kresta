import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export const BrandRegisterSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    companyName: z.string().min(2, "Company name must be at least 2 characters"),
    websiteUrl: z.string().url("Invalid website URL").optional().or(z.literal("")),
    hasWebsite: z.boolean().default(false),
});

export const CreatorRegisterSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type BrandRegisterInput = z.infer<typeof BrandRegisterSchema>;
export type CreatorRegisterInput = z.infer<typeof CreatorRegisterSchema>;
