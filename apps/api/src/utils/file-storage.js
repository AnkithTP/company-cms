import crypto from "crypto";
import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";

const getResourceType = (mimeType) => {
    if (mimeType.startsWith("image/")) {
        return "image";
    }

    if (mimeType.startsWith("video/")) {
        return "video";
    }

    return "raw";
};

export const saveFile = async (file) => {
    if (!file || !file.buffer) {
        throw new Error("File buffer is required");
    }

    const resourceType = getResourceType(file.mimetype);

    const uniqueName = `${crypto.randomUUID()}-${file.originalname}`;

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "company-cms",
                public_id: uniqueName,
                resource_type: resourceType,
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve({
                    fileName: uniqueName,
                    storagePath: result.public_id,
                    url: result.secure_url,
                    resourceType,
                });
            }
        );

        Readable.from(file.buffer).pipe(uploadStream);
    });
};

export const deleteFile = async (
    publicId,
    resourceType = "image"
) => {
    try {
        await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });
    } catch (error) {
        console.error("Cloudinary delete failed:", error);
        throw error;
    }
};