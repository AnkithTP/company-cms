import type { ContentType, ContentBlock } from "../contents/content.types";

export interface PortalAuthor {
    id: string;
    first_name: string;
    last_name: string;
}

export interface PortalCategory {
    id: string;
    name: string;
    slug: string;
}

export interface PortalContentItem {
    id: string;
    title: string;
    slug: string;
    content_type: ContentType;
    status: string;
    published_at: string;
    created_at: string;
    updated_at: string;
    author?: PortalAuthor;
    categories?: PortalCategory[];
    blocks?: ContentBlock[];
    cover_image_url?: string | null;
    excerpt?: string | null;
    eventDetails?: any;
}

export interface PortalListQuery {
    search?: string;
    content_type?: ContentType;
    category_id?: string;
    page?: number;
    limit?: number;
}

export interface PortalListResponse {
    success: boolean;
    data: PortalContentItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface PortalDetailResponse {
    success: boolean;
    data: PortalContentItem;
}
