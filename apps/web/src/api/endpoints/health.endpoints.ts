import apiClient from "../client";

export interface HealthResponse {
    status: string;
    message: string;
}

export const getHealth = async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>("/health");

    return response.data;
};
