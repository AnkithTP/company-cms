import apiClient from "../../api/client";

import type { DashboardResponse, DashboardSummary } from "./dashboard.types";

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
    const response =
        await apiClient.get<DashboardResponse>("/dashboard/summary");

    return response.data.data;
};
