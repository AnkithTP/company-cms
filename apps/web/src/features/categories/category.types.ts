export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    parent_id?: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    parent?: {
        id: string;
        name: string;
        slug: string;
    } | null;
    children?: Category[];
    contents?: {
        id: string;
        title?: string;
    }[];
}

export interface CreateCategoryRequest {
    name: string;
    slug: string;
    description?: string | null;
    parent_id?: string | null;
    is_active?: boolean;
}

export interface UpdateCategoryRequest {
    name?: string;
    slug?: string;
    description?: string | null;
    parent_id?: string | null;
    is_active?: boolean;
}

export interface CategoryApiResponse<T = Category> {
    success: boolean;
    message?: string;
    data: T;
}

export interface CategoryListResponse {
    success: boolean;
    data: Category[];
}
