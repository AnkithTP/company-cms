import * as dashboardService from "./dashboard.service.js";

export const getDashboardSummary = async (req, res, next) => {
    try {
        const summary = await dashboardService.getDashboardSummary();

        res.status(200).json({
            success: true,
            data: summary,
        });
    } catch (error) {
        next(error);
    }
};