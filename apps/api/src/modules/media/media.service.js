import * as mediaRepository from "./media.repository.js";
import { saveFile } from "../../utils/file-storage.js";

const getFileType = (mimeType) => {
    if (mimeType.startsWith("image/")) {
        return "IMAGE";
    }

    if (mimeType.startsWith("video/")) {
        return "VIDEO";
    }

    return "DOCUMENT";
};

export const uploadMedia = async (
    file,
    userId,
    altText = null
) => {
    if (!file) {
        const error = new Error("File is required");
        error.statusCode = 400;
        throw error;
    }

    const storedFile = await saveFile(file);

    const fileType = getFileType(file.mimetype);

    return mediaRepository.create({
        original_name: file.originalname,
        file_name: storedFile.fileName,
        mime_type: file.mimetype,
        file_type: fileType,
        file_size: file.size,
        storage_path: storedFile.storagePath,
        url: `/uploads/${storedFile.fileName}`,
        alt_text: altText,
        uploaded_by: userId,
    });
};

export const getAllMedia = async () => {
    return mediaRepository.findAll();
};

export const getMediaById = async (id) => {
    const media = await mediaRepository.findById(id);

    if (!media) {
        const error = new Error("Media not found");
        error.statusCode = 404;
        throw error;
    }

    return media;
};

export const deleteMedia = async (id) => {
    const media = await mediaRepository.findById(id);
    if (!media) {
        const error = new Error("Media not found");
        error.statusCode = 404;
        throw error;
    }

    await mediaRepository.remove(id);
    return true;
};