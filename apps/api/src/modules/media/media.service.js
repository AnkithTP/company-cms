import * as mediaRepository from "./media.repository.js";
import {
    saveFile,
    deleteFile,
} from "../../utils/file-storage.js";

const getFileType = (mimeType) => {
    if (mimeType.startsWith("image/")) {
        return "IMAGE";
    }

    if (mimeType.startsWith("video/")) {
        return "VIDEO";
    }

    return "DOCUMENT";
};

export const uploadMedia = async (file, userId, altText = null) => {
    if (!file) {
        const error = new Error("File is required");
        error.statusCode = 400;
        throw error;
    }

    // Upload file to Cloudinary
    const storedFile = await saveFile(file);

    // Determine DB file type
    const fileType = getFileType(file.mimetype);

    // Save Cloudinary information in DB
    return mediaRepository.create({
        original_name: file.originalname,
        file_name: storedFile.fileName,
        mime_type: file.mimetype,
        file_type: fileType,
        file_size: file.size,
        storage_path: storedFile.storagePath,
        url: storedFile.url,
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

    // Determine Cloudinary resource type
    let resourceType = "raw";

    if (media.mime_type.startsWith("image/")) {
        resourceType = "image";
    } else if (media.mime_type.startsWith("video/")) {
        resourceType = "video";
    }

    // Delete from Cloudinary
    await deleteFile(media.storage_path, resourceType);

    // Delete database record
    await mediaRepository.remove(id);

    return true;
};