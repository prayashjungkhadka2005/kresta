import { FastifyReply, FastifyRequest } from "fastify";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { v4 as uuidv4 } from "uuid";

export class UploadController {
    async uploadFile(request: FastifyRequest, reply: FastifyReply) {
        const data = await request.file();
        if (!data) {
            return reply.status(400).send({ message: "No file uploaded" });
        }

        const extension = path.extname(data.filename);
        const fileName = `${uuidv4()}${extension}`;
        const uploadDir = path.join(__dirname, "../../../uploads");

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, fileName);
        await pipeline(data.file, fs.createWriteStream(filePath));

        const host = request.headers.host || "localhost:3001";
        const protocol = request.protocol;
        const url = `${protocol}://${host}/uploads/${fileName}`;

        return reply.send({
            message: "File uploaded successfully",
            url,
            fileName: data.filename,
            storedName: fileName
        });
    }

    async uploadMultipleFiles(request: FastifyRequest, reply: FastifyReply) {
        const parts = request.files();
        const uploadedFiles = [];

        for await (const part of parts) {
            const extension = path.extname(part.filename);
            const fileName = `${uuidv4()}${extension}`;
            const uploadDir = path.join(__dirname, "../../../uploads");

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filePath = path.join(uploadDir, fileName);
            await pipeline(part.file, fs.createWriteStream(filePath));

            const host = request.headers.host || "localhost:3001";
            const protocol = request.protocol;
            const url = `${protocol}://${host}/uploads/${fileName}`;

            uploadedFiles.push({
                url,
                fileName: part.filename,
                storedName: fileName,
                type: part.mimetype.startsWith("video") ? "VIDEO" : "IMAGE"
            });
        }

        return reply.send({
            message: "Files uploaded successfully",
            files: uploadedFiles
        });
    }

    async deleteFile(request: FastifyRequest, reply: FastifyReply) {
        const { filename } = request.params as { filename: string };
        const uploadDir = path.join(__dirname, "../../../uploads");
        const filePath = path.join(uploadDir, filename);

        try {
            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
                return reply.send({ message: "File deleted successfully" });
            }
            return reply.status(404).send({ message: "File not found" });
        } catch (err) {
            console.error("Delete error:", err);
            return reply.status(500).send({ message: "Failed to delete file" });
        }
    }
}
