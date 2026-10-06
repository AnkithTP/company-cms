import apiClient from "../../api/client";
import type { MediaItem, MediaListResponse, MediaUploadResponse } from "./media.types";

export const uploadMediaFile = async (
    file: File,
    altText?: string
): Promise<MediaItem> => {
    const formData = new FormData();
    formData.append("file", file);
    if (altText) {
        formData.append("alt_text", altText);
    }

    const response = await apiClient.post<MediaUploadResponse>(
        "/media",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data.data;
};

export const fetchAllMedia = async (): Promise<MediaItem[]> => {
    const response = await apiClient.get<MediaListResponse>("/media");
    return response.data.data;
};

export const deleteMediaItem = async (id: string): Promise<void> => {
    await apiClient.delete(`/media/${id}`);
};
