export type MediaFileType = "IMAGE" | "VIDEO" | "DOCUMENT";

export interface MediaItem {
    id: string;
    original_name: string;
    file_name: string;
    mime_type: string;
    file_type: MediaFileType;
    file_size: number;
    url: string;
    alt_text?: string | null;
    created_at: string;
    uploaded_by?: string;
}

export interface MediaUploadResponse {
    success: boolean;
    message: string;
    data: MediaItem;
}

export interface MediaListResponse {
    success: boolean;
    data: MediaItem[];
}
