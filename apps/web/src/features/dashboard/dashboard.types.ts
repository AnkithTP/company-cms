export interface DashboardEvent {
    id: string;
    title: string;
    event_date: string;
    start_time: string;
    location: string | null;
}

export interface DashboardAuditLog {
    id: string;
    action: string;
    entity_type: string;
    entity_id: string | null;
    created_at: string;
    user?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
}

export interface DashboardSummary {
    content: {
        total: number;
        status: {
            DRAFT: number;
            SUBMITTED: number;
            UNDER_REVIEW: number;
            APPROVED: number;
            PUBLISHED: number;
            ARCHIVED: number;
            [key: string]: number;
        };
        type: {
            ANNOUNCEMENT: number;
            POLICY: number;
            ARTICLE: number;
            TECH_ARTICLE: number;
            EVENT: number;
            [key: string]: number;
        };
    };
    upcomingEvents: DashboardEvent[];
    recentActivity: DashboardAuditLog[];
}

export interface DashboardResponse {
    success: boolean;
    data: DashboardSummary;
}
