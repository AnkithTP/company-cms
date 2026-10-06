import { createBrowserRouter } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ContentListPage from "../pages/content/ContentListPage";
import CreateContentPage from "../pages/content/CreateContentPage";
import ContentDetailPage from "../pages/content/ContentDetailPage";
import ApprovalsPage from "../pages/approvals/ApprovalsPage";
import CategoryListPage from "../pages/categories/CategoryListPage";
import MediaListPage from "../pages/media/MediaListPage";
import EventListPage from "../pages/events/EventListPage";
import UserListPage from "../pages/users/UserListPage";
import PortalFeedPage from "../pages/portal/PortalFeedPage";
import PortalArticlePage from "../pages/portal/PortalArticlePage";

import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";

const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/register",
        element: <RegisterPage />,
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: "/portal",
                element: <PortalFeedPage />,
            },
            {
                path: "/portal/article/:slug",
                element: <PortalArticlePage />,
            },
            {
                element: <MainLayout />,
                children: [
                    {
                        path: "/",
                        element: <DashboardPage />,
                    },
                    {
                        path: "/approvals",
                        element: <ApprovalsPage />,
                    },
                    {
                        path: "/content",
                        element: <ContentListPage />,
                    },
                    {
                        path: "/content/create",
                        element: <CreateContentPage />,
                    },
                    {
                        path: "/content/:id",
                        element: <ContentDetailPage />,
                    },
                    {
                        path: "/categories",
                        element: <CategoryListPage />,
                    },
                    {
                        path: "/media",
                        element: <MediaListPage />,
                    },
                    {
                        path: "/events",
                        element: <EventListPage />,
                    },
                    {
                        path: "/users",
                        element: <UserListPage />,
                    },
                ],
            },
        ],
    },
]);

export default router;
