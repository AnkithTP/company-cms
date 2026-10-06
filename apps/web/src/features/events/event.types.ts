import type { Content } from "../contents/content.types";

export interface EventDetail {
    id: string;
    content_id: string;
    event_date: string;
    start_time: string;
    end_time?: string | null;
    location?: string | null;
    meeting_url?: string | null;
    organizer?: string | null;
    registration_url?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface EventItem extends Content {
    eventDetails?: EventDetail | null;
}

export interface CreateEventRequest {
    event_date: string;
    start_time: string;
    end_time?: string | null;
    location?: string | null;
    meeting_url?: string | null;
    organizer?: string | null;
    registration_url?: string | null;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {}
