import { Layout } from "antd";
import { Outlet, Navigate } from "react-router-dom";

import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAppSelector } from "../../hooks/redux";
import { isEmployeeUser } from "../../utils/roles";

const { Sider, Content } = Layout;

const MainLayout = () => {
    const user = useAppSelector((state) => state.auth.user);

    // If current user is an employee, only the live portal is accessible
    if (isEmployeeUser(user)) {
        return <Navigate to="/portal" replace />;
    }

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider width={240} className="custom-cms-sider">
                <div
                    style={{
                        height: 64,
                        display: "flex",
                        alignItems: "center",
                        padding: "0 20px",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: "linear-gradient(135deg, #1677ff 0%, #0050b3 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: 800,
                            fontSize: 16,
                            boxShadow: "0 2px 8px rgba(22, 119, 255, 0.4)",
                            flexShrink: 0,
                        }}
                    >
                        C
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ color: "#ffffff", fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>
                            Company CMS
                        </span>
                        <span style={{ color: "rgba(255, 255, 255, 0.45)", fontSize: 11, fontWeight: 500 }}>
                            Enterprise Portal
                        </span>
                    </div>
                </div>

                <Sidebar />
            </Sider>

            <Layout>
                <Header />

                <Content
                    style={{
                        padding: 24,
                        background: "#f5f5f5",
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
