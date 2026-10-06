export type ContentType =
    | "ANNOUNCEMENT"
    | "POLICY"
    | "ARTICLE"
    | "TECH_ARTICLE"
    | "EVENT";

export type ContentStatus =
    | "DRAFT"
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "PUBLISHED"
    | "ARCHIVED";

export type BlockType =
    | "HEADING"
    | "PARAGRAPH"
    | "IMAGE"
    | "GALLERY"
    | "VIDEO"
    | "LIST"
    | "TABLE"
    | "QUOTE"
    | "CALLOUT"
    | "BUTTON"
    | "DIVIDER"
    | "COLUMNS"
    | "ACCORDION"
    | "DOCUMENT"
    | "CODE"
    | "SPACER";

export interface ContentAuthor {
    id: string;
    employee_code: string;
    first_name: string;
    last_name: string;
    email?: string;
}

export interface ContentBlock {
    id?: string | null;
    block_type: BlockType;
    block_order: number;
    content: Record<string, any>;
    style?: Record<string, any> | null;
}

export interface Content {
    id: string;
    title: string;
    slug: string;
    content_type: ContentType;
    status: ContentStatus;
    expires_at: string | null;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    author?: ContentAuthor;
    author_id?: string;
    ContentBlocks?: ContentBlock[];
    categories?: {
        id: string;
        name: string;
        slug: string;
    }[];
}

// ---------- Request / Response Types ----------

export interface ContentListQuery {
    search?: string;
    content_type?: ContentType;
    status?: ContentStatus;
    author_id?: string;
    page?: number;
    limit?: number;
    sort?: "created_at" | "updated_at" | "title" | "published_at";
    order?: "ASC" | "DESC";
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ContentListResponse {
    success: boolean;
    data: Content[];
    pagination: Pagination;
}

export interface ContentDetailResponse {
    success: boolean;
    data: Content;
}

export interface CreateContentRequest {
    title: string;
    slug: string;
    content_type: ContentType;
    expires_at?: string | null;
    category_ids?: string[];
    blocks?: ContentBlock[];
}

export interface UpdateContentRequest {
    title?: string;
    slug?: string;
    content_type?: ContentType;
    expires_at?: string | null;
    category_ids?: string[];
    blocks?: ContentBlock[];
}

export interface EditorSaveRequest {
    title: string;
    slug: string;
    content_type: ContentType;
    expires_at?: string | null;
    blocks: ContentBlock[];
    category_ids?: string[];
}

export interface WorkflowActionRequest {
    reason?: string;
}
