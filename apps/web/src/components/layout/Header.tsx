import { Button, Space, Typography, Tag, Avatar } from "antd";
import { LogoutOutlined, UserOutlined, GlobalOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { logout } from "../../features/auth/authSlice";

const Header = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const user = useAppSelector((state) => state.auth.user);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login", { replace: true });
    };

    const primaryRole = user?.roles?.[0] || "EMPLOYEE";
    const roleColor =
        primaryRole === "SUPER_ADMIN"
            ? "magenta"
            : primaryRole.includes("ADMIN")
              ? "geekblue"
              : primaryRole === "EDITOR"
                ? "purple"
                : "blue";

    return (
        <header
            style={{
                height: 64,
                padding: "0 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #f0f0f0",
                background: "#fff",
            }}
        >
            <Typography.Title level={4} style={{ margin: 0 }}>
                Company CMS
            </Typography.Title>

            <Space size="middle">
                {user && (
                    <Space size="small">
                        <Avatar
                            icon={<UserOutlined />}
                            style={{ backgroundColor: "#1677ff" }}
                        />
                        <Typography.Text strong>
                            {user.first_name} {user.last_name}
                        </Typography.Text>
                        <Tag color={roleColor}>{primaryRole}</Tag>
                    </Space>
                )}

                <Button
                    icon={<GlobalOutlined />}
                    onClick={() => navigate("/portal")}
                    style={{ borderColor: "#1677ff", color: "#1677ff" }}
                >
                    View Portal 🌐
                </Button>

                <Button icon={<LogoutOutlined />} onClick={handleLogout}>
                    Logout
                </Button>
            </Space>
        </header>
    );
};

export default Header;
