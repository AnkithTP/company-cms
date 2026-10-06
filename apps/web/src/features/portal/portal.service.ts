import apiClient from "../../api/client";
import type {
    PortalListQuery,
    PortalListResponse,
    PortalDetailResponse,
} from "./portal.types";

export const fetchPortalContents = async (
    params?: PortalListQuery
): Promise<PortalListResponse> => {
    const response = await apiClient.get<PortalListResponse>("/portal/contents", {
        params,
    });
    return response.data;
};

export const fetchPortalContentBySlug = async (
    slug: string
): Promise<PortalDetailResponse> => {
    const response = await apiClient.get<PortalDetailResponse>(
        `/portal/contents/${slug}`
    );
    return response.data;
};
