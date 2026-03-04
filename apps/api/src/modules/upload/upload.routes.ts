import { FastifyInstance } from "fastify";
import { UploadController } from "./upload.controller";

const uploadController = new UploadController();

export async function uploadRoutes(fastify: FastifyInstance) {
    const authenticate = async (request: any, reply: any) => {
        try {
            const decoded = await request.jwtVerify();
            request.user = decoded;

            if (request.user.role !== "brand") {
                return reply.status(403).send({ message: "Only brands can upload files" });
            }
        } catch (err) {
            return reply.status(401).send({ message: "Unauthorized" });
        }
    };

    await fastify.register(async (privateRoutes) => {
        privateRoutes.addHook("preHandler", authenticate);

        privateRoutes.post("/", uploadController.uploadFile.bind(uploadController));
        privateRoutes.post("/multiple", uploadController.uploadMultipleFiles.bind(uploadController));
        privateRoutes.delete("/:filename", uploadController.deleteFile.bind(uploadController));
    });
}
