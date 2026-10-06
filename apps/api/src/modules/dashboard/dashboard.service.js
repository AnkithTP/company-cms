import * as dashboardRepository
    from "./dashboard.repository.js";

export const getDashboardSummary = async () => {

    const [
        totalContents,
        statusCounts,
        typeCounts,
        upcomingEvents,
        recentActivity,
    ] = await Promise.all([
        dashboardRepository.getTotalContentCount(),

        dashboardRepository.getContentStatusCounts(),

        dashboardRepository.getContentTypeCounts(),

        dashboardRepository.getUpcomingEvents(5),

        dashboardRepository.getRecentAuditLogs(10),
    ]);

    const statusSummary = {
        DRAFT: 0,
        SUBMITTED: 0,
        UNDER_REVIEW: 0,
        APPROVED: 0,
        PUBLISHED: 0,
        ARCHIVED: 0,
    };

    for (const item of statusCounts) {
        statusSummary[item.status] =
            Number(item.count);
    }

    const typeSummary = {
        ANNOUNCEMENT: 0,
        POLICY: 0,
        ARTICLE: 0,
        TECH_ARTICLE: 0,
        EVENT: 0,
    };

    for (const item of typeCounts) {
        typeSummary[item.content_type] =
            Number(item.count);
    }

    return {
        content: {
            total: totalContents,

            status: statusSummary,

            type: typeSummary,
        },

        upcomingEvents,

        recentActivity,
    };
};