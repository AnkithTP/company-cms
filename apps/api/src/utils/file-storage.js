import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const uploadDirectory = path.resolve("uploads");

export const saveFile = async (file) => {
    await fs.mkdir(uploadDirectory, {
        recursive: true,
    });

    const uniqueName =
        `${crypto.randomUUID()}-${file.originalname}`;

    const filePath = path.join(
        uploadDirectory,
        uniqueName
    );

    await fs.writeFile(
        filePath,
        file.buffer
    );

    return {
        fileName: uniqueName,
        storagePath: filePath,
    };
};

export const deleteFile = async (filePath) => {
    try {
        await fs.unlink(filePath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
    }
};