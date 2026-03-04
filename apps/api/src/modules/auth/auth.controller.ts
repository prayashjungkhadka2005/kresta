import { FastifyReply, FastifyRequest } from "fastify";
import bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { BrandRegisterSchema, CreatorRegisterSchema, LoginSchema } from "shared";

const authService = new AuthService();

export class AuthController {
    async registerBrand(request: FastifyRequest, reply: FastifyReply) {
        const data = BrandRegisterSchema.parse(request.body);
        const existingUser = await authService.findUserByEmail(data.email);

        if (existingUser) {
            return reply.status(400).send({ message: "User already exists" });
        }

        const brand = await authService.registerBrand(data);
        return reply.status(201).send({ message: "Brand registered successfully", id: brand.id });
    }

    async registerCreator(request: FastifyRequest, reply: FastifyReply) {
        const data = CreatorRegisterSchema.parse(request.body);
        const existingUser = await authService.findUserByEmail(data.email);

        if (existingUser) {
            return reply.status(400).send({ message: "User already exists" });
        }

        const creator = await authService.registerCreator(data);
        return reply.status(201).send({ message: "Creator registered successfully", id: creator.id });
    }

    async login(request: FastifyRequest, reply: FastifyReply) {
        const { email, password } = LoginSchema.parse(request.body);
        const result = await authService.findUserByEmail(email);

        if (!result || !(await bcrypt.compare(password, result.user.passwordHash))) {
            return reply.status(401).send({ message: "Invalid email or password" });
        }

        const token = request.jwt.sign({
            id: result.user.id,
            email: result.user.email,
            role: result.type,
        });

        reply.setCookie("token", token, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });

        return reply.send({ message: "Login successful", user: { id: result.user.id, email: result.user.email, role: result.type } });
    }

    async logout(request: FastifyRequest, reply: FastifyReply) {
        reply.clearCookie("token", { path: "/" });
        return reply.send({ message: "Logged out successfully" });
    }
}
