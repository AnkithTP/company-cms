import apiClient from "../../api/client";
import type {
    Category,
    CategoryListResponse,
    CategoryApiResponse,
    CreateCategoryRequest,
    UpdateCategoryRequest,
} from "./category.types";

const BASE = "/categories";

export const fetchCategories = (): Promise<Category[]> =>
    apiClient
        .get<CategoryListResponse>(BASE)
        .then((r) => r.data.data);

export const fetchCategoryById = (id: string): Promise<Category> =>
    apiClient
        .get<CategoryApiResponse<Category>>(`${BASE}/${id}`)
        .then((r) => r.data.data);

export const createCategory = (
    data: CreateCategoryRequest
): Promise<Category> =>
    apiClient
        .post<CategoryApiResponse<Category>>(BASE, data)
        .then((r) => r.data.data);

export const updateCategory = (
    id: string,
    data: UpdateCategoryRequest
): Promise<Category> =>
    apiClient
        .put<CategoryApiResponse<Category>>(`${BASE}/${id}`, data)
        .then((r) => r.data.data);

export const deleteCategory = (id: string): Promise<void> =>
    apiClient.delete(`${BASE}/${id}`).then(() => undefined);

export const assignCategoriesToContent = (
    contentId: string,
    categoryIds: string[]
): Promise<any> =>
    apiClient
        .put(`/contents/${contentId}/categories`, {
            category_ids: categoryIds,
        })
        .then((r) => r.data);
