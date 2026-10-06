import apiClient from "../../api/client";
import type { EventDetail, CreateEventRequest } from "./event.types";
import * as contentService from "../contents/content.service";
import type { Content } from "../contents/content.types";

export const fetchAllEvents = async (): Promise<Content[]> => {
    const res = await contentService.fetchContents({ content_type: "EVENT" });
    return res.data || [];
};

export const fetchEventDetails = async (contentId: string): Promise<EventDetail | null> => {
    try {
        const res = await apiClient.get<{ success: boolean; data: EventDetail }>(
            `/contents/${contentId}/event`
        );
        return res.data.data;
    } catch {
        return null;
    }
};

export const saveEventDetails = async (
    contentId: string,
    data: CreateEventRequest
): Promise<EventDetail> => {
    // Check if event details exist first; if so PUT, otherwise POST
    const existing = await fetchEventDetails(contentId);
    if (existing) {
        const res = await apiClient.put<{ success: boolean; data: EventDetail }>(
            `/contents/${contentId}/event`,
            data
        );
        return res.data.data;
    } else {
        const res = await apiClient.post<{ success: boolean; data: EventDetail }>(
            `/contents/${contentId}/event`,
            data
        );
        return res.data.data;
    }
};

export const deleteEventDetails = async (contentId: string): Promise<void> => {
    await apiClient.delete(`/contents/${contentId}/event`);
};
