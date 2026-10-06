import React, { useMemo } from "react";
import {
    DashboardOutlined,
    AuditOutlined,
    FileTextOutlined,
    GlobalOutlined,
    FolderOutlined,
    PictureOutlined,
    CalendarOutlined,
    UserOutlined,
} from "@ant-design/icons";

import { Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

import { useAppSelector } from "../../hooks/redux";
import { isAdminUser } from "../../utils/roles";

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAppSelector((state) => state.auth.user);
    const isAdmin = isAdminUser(user);

    const activeKey = useMemo(() => {
        const path = location.pathname;
        if (
            path === "/" ||
            path === "/approvals" ||
            path === "/categories" ||
            path === "/media" ||
            path === "/events" ||
            path === "/users"
        ) {
            return path;
        }
        if (path.startsWith("/content")) {
            return "/content";
        }
        if (path.startsWith("/categories")) {
            return "/categories";
        }
        if (path.startsWith("/portal")) {
            return "/portal";
        }
        return path;
    }, [location.pathname]);

    const items = [
        {
            key: "/",
            icon: <DashboardOutlined style={{ fontSize: 16 }} />,
            label: "Dashboard",
        },
        {
            key: "/approvals",
            icon: <AuditOutlined style={{ fontSize: 16 }} />,
            label: "Approvals Queue",
        },
        {
            key: "/content",
            icon: <FileTextOutlined style={{ fontSize: 16 }} />,
            label: "Content",
        },
        {
            key: "/portal",
            icon: <GlobalOutlined style={{ fontSize: 16 }} />,
            label: "Live Portal 🌐",
        },
        {
            key: "/categories",
            icon: <FolderOutlined style={{ fontSize: 16 }} />,
            label: "Categories",
        },
        {
            key: "/media",
            icon: <PictureOutlined style={{ fontSize: 16 }} />,
            label: "Media",
        },
        {
            key: "/events",
            icon: <CalendarOutlined style={{ fontSize: 16 }} />,
            label: "Events",
        },
        ...(isAdmin
            ? [
                  {
                      key: "/users",
                      icon: <UserOutlined style={{ fontSize: 16 }} />,
                      label: "Users",
                  },
              ]
            : []),
    ];

    return (
        <Menu
            theme="dark"
            mode="inline"
            className="custom-cms-sidebar-menu"
            selectedKeys={[activeKey]}
            items={items}
            onClick={({ key }) => navigate(key)}
            style={{ background: "transparent", borderRight: 0 }}
        />
    );
};

export default Sidebar;
