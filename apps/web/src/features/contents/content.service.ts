import apiClient from "../../api/client";
import type {
    ContentListQuery,
    ContentListResponse,
    ContentDetailResponse,
    CreateContentRequest,
    UpdateContentRequest,
    EditorSaveRequest,
    WorkflowActionRequest,
} from "./content.types";

const BASE = "/contents";

export const fetchContents = (
    params: ContentListQuery
): Promise<ContentListResponse> =>
    apiClient
        .get<ContentListResponse>(BASE, { params })
        .then((r) => r.data);

export const fetchContentById = (
    id: string
): Promise<ContentDetailResponse> =>
    apiClient
        .get<ContentDetailResponse>(`${BASE}/${id}`)
        .then((r) => r.data);

export const createContent = (
    data: CreateContentRequest
): Promise<ContentDetailResponse> =>
    apiClient
        .post<ContentDetailResponse>(BASE, data)
        .then((r) => r.data);

export const updateContent = (
    id: string,
    data: UpdateContentRequest
): Promise<ContentDetailResponse> =>
    apiClient
        .put<ContentDetailResponse>(`${BASE}/${id}`, data)
        .then((r) => r.data);

export const saveEditorContent = (
    id: string,
    data: EditorSaveRequest
): Promise<ContentDetailResponse> =>
    apiClient
        .put<ContentDetailResponse>(`${BASE}/${id}/editor`, data)
        .then((r) => r.data);

export const fetchContentBlocks = (
    contentId: string
): Promise<{ success: boolean; data: any[] }> =>
    apiClient
        .get<{ success: boolean; data: any[] }>(`${BASE}/${contentId}/blocks`)
        .then((r) => r.data);

// ---------- Workflow ----------

const workflowPost = (id: string, action: string, body?: WorkflowActionRequest) =>
    apiClient
        .post<ContentDetailResponse>(`${BASE}/${id}/${action}`, body ?? {})
        .then((r) => r.data);

export const submitContent  = (id: string) => workflowPost(id, "submit");
export const startReview    = (id: string) => workflowPost(id, "start-review");
export const approveContent = (id: string) => workflowPost(id, "approve");
export const rejectContent  = (id: string, reason: string) =>
    workflowPost(id, "reject", { reason });
export const publishContent  = (id: string) => workflowPost(id, "publish");
export const archiveContent  = (id: string) => workflowPost(id, "archive");

export const fetchRevisions = (contentId: string): Promise<{ success: boolean; data: any[] }> =>
    apiClient.get(`${BASE}/${contentId}/revisions`).then((r) => r.data);

export const restoreRevision = (contentId: string, revisionId: string): Promise<ContentDetailResponse> =>
    apiClient.post<ContentDetailResponse>(`${BASE}/${contentId}/revisions/${revisionId}/restore`).then((r) => r.data);

