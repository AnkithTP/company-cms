import crypto from "crypto";
import cloudinary from "../../config/cloudinary.js";
import * as mediaRepository from "./media.repository.js";

/**
 * Searches Unsplash for stock photos using the official Unsplash API
 * @param {string} query - Keyword search term (e.g., "technology", "office")
 * @param {number} page - Page number (defaults to 1)
 * @param {number} perPage - Items per page (defaults to 18)
 */
export const searchStockPhotos = async (query = "business", page = 1, perPage = 18) => {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!accessKey) {
        return {
            configured: false,
            message: "Unsplash Access Key is not configured. Please add UNSPLASH_ACCESS_KEY to apps/api/.env",
            total: 0,
            totalPages: 0,
            results: [],
        };
    }

    const trimmedQuery = query.trim() || "business";
    const endpoint = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        trimmedQuery
    )}&page=${page}&per_page=${perPage}&orientation=landscape`;

    const response = await fetch(endpoint, {
        headers: {
            Authorization: `Client-ID ${accessKey}`,
            "Accept-Version": "v1",
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Unsplash search error:", response.status, errorText);

        if (response.status === 401) {
            const err = new Error("Invalid Unsplash Access Key. Please check UNSPLASH_ACCESS_KEY in .env");
            err.statusCode = 401;
            throw err;
        }

        if (response.status === 403) {
            const err = new Error("Unsplash API rate limit exceeded or access forbidden");
            err.statusCode = 403;
            throw err;
        }

        const err = new Error(`Unsplash API error: ${response.statusText}`);
        err.statusCode = response.status;
        throw err;
    }

    const data = await response.json();

    const formattedResults = (data.results || []).map((photo) => ({
        id: photo.id,
        title: photo.alt_description || photo.description || "Unsplash Stock Photo",
        thumbUrl: photo.urls?.thumb || photo.urls?.small,
        regularUrl: photo.urls?.regular,
        fullUrl: photo.urls?.full,
        smallUrl: photo.urls?.small,
        downloadLocation: photo.links?.download_location,
        photographer: photo.user?.name || photo.user?.username || "Unsplash Contributor",
        photographerUrl: photo.user?.links?.html
            ? `${photo.user.links.html}?utm_source=company_cms&utm_medium=referral`
            : "https://unsplash.com",
        unsplashUrl: photo.links?.html
            ? `${photo.links.html}?utm_source=company_cms&utm_medium=referral`
            : "https://unsplash.com",
    }));

    return {
        configured: true,
        total: data.total || 0,
        totalPages: data.total_pages || 0,
        results: formattedResults,
    };
};

/**
 * Imports an Unsplash image: triggers download tracking, uploads directly to Cloudinary,
 * and creates a permanent record in the PostgreSQL media table.
 */
export const importStockPhoto = async (
    { photoUrl, downloadLocation, title, photographer, photographerUrl },
    userId
) => {
    if (!photoUrl) {
        const error = new Error("Photo URL is required for import");
        error.statusCode = 400;
        throw error;
    }

    const accessKey = process.env.UNSPLASH_ACCESS_KEY;

    // Trigger Unsplash download metric (requirement of Unsplash API terms)
    if (downloadLocation && accessKey) {
        try {
            fetch(`${downloadLocation}${downloadLocation.includes("?") ? "&" : "?"}client_id=${accessKey}`).catch(
                (err) => console.warn("Failed to notify Unsplash download endpoint:", err.message)
            );
        } catch {
            // Non-blocking
        }
    }

    const uniqueId = crypto.randomUUID();
    const cleanSlug = (title || "stock-photo")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 35);
    const publicId = `${uniqueId}-${cleanSlug}`;

    // Upload directly from remote photo URL into Cloudinary
    let uploadResult;
    try {
        uploadResult = await cloudinary.uploader.upload(photoUrl, {
            folder: "company-cms",
            public_id: publicId,
            resource_type: "image",
        });
    } catch (uploadError) {
        console.error("Cloudinary stock photo upload failed:", uploadError);
        const err = new Error("Failed to upload stock photo to Cloudinary");
        err.statusCode = 502;
        throw err;
    }

    const originalName = `${cleanSlug || "stock-image"}.${uploadResult.format || "jpg"}`;
    const attribution = photographer ? `Photo by ${photographer} on Unsplash` : "Unsplash Stock Image";

    // Save in CMS media library
    return mediaRepository.create({
        original_name: originalName,
        file_name: publicId,
        mime_type: `image/${uploadResult.format || "jpeg"}`,
        file_type: "IMAGE",
        file_size: uploadResult.bytes || 150000,
        storage_path: uploadResult.public_id,
        url: uploadResult.secure_url,
        alt_text: title || attribution,
        uploaded_by: userId,
    });
};
