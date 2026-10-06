import React, { useState } from "react";
import { Button, Form, Input, Typography, Segmented, Alert, Card, Space } from "antd";
import {
    LockOutlined,
    MailOutlined,
    UserOutlined,
    SafetyCertificateOutlined,
    GlobalOutlined,
    AppstoreOutlined,
} from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { loginUser, logout, clearAuthError } from "../authSlice";
import { useNavigate } from "react-router-dom";
import { canAccessCms } from "../../../utils/roles";

const { Title, Text } = Typography;

interface LoginFormValues {
    email: string;
    password: string;
}

type LoginMode = "employee" | "admin";

const LoginForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [loginMode, setLoginMode] = useState<LoginMode>("employee");
    const [roleAccessError, setRoleAccessError] = useState<string | null>(null);

    const { isLoading, error } = useAppSelector((state) => state.auth);

    const onFinish = async (values: LoginFormValues) => {
        setRoleAccessError(null);
        dispatch(clearAuthError());

        const result = await dispatch(loginUser(values));

        if (loginUser.fulfilled.match(result)) {
            const user = result.payload.data.user;

            // Strict authorization check if user selected Admin / Editor login mode
            if (loginMode === "admin") {
                if (!canAccessCms(user)) {
                    // Standard employee who does not have admin/editor access
                    dispatch(logout());
                    setRoleAccessError(
                        "Access Denied: This account is a standard Employee and does not have Admin or Editor privileges to access the CMS management dashboard. Please switch to 'Login as Employee'."
                    );
                    return;
                }
                navigate("/", { replace: true });
            } else {
                // Employee mode is accessible to all employees, including admins and editors
                navigate("/portal", { replace: true });
            }
        }
    };

    return (
        <Card
            style={{
                width: 440,
                borderRadius: 16,
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.15)",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
            }}
            styles={{ body: { padding: "32px 28px" } }}
        >
            {/* Header Branding */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: "linear-gradient(135deg, #1677ff 0%, #003eb3 100%)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: 22,
                        marginBottom: 12,
                        boxShadow: "0 4px 12px rgba(22, 119, 255, 0.35)",
                    }}
                >
                    C
                </div>
                <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
                    Company CMS
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                    Sign in to your workplace account
                </Text>
            </div>

            {/* Login Mode Selector: Employee vs Admin / Editor */}
            <div style={{ marginBottom: 18 }}>
                <Text strong style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6 }}>
                    SELECT LOGIN ROLE:
                </Text>
                <Segmented
                    value={loginMode}
                    onChange={(val) => {
                        setLoginMode(val as LoginMode);
                        setRoleAccessError(null);
                        dispatch(clearAuthError());
                    }}
                    block
                    size="large"
                    options={[
                        {
                            label: (
                                <Space align="center" style={{ padding: "4px 0" }}>
                                    <UserOutlined />
                                    <span>Login as Employee</span>
                                </Space>
                            ),
                            value: "employee",
                        },
                        {
                            label: (
                                <Space align="center" style={{ padding: "4px 0" }}>
                                    <SafetyCertificateOutlined />
                                    <span>Login as Admin</span>
                                </Space>
                            ),
                            value: "admin",
                        },
                    ]}
                />
            </div>

            {/* Role Context Hint */}
            {loginMode === "employee" ? (
                <div
                    style={{
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        padding: "10px 14px",
                        borderRadius: 8,
                        marginBottom: 20,
                    }}
                >
                    <Text strong style={{ color: "#166534", fontSize: 12, display: "block" }}>
                        <GlobalOutlined style={{ marginRight: 6 }} /> Employee Live Portal Access
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11, color: "#15803d" }}>
                        Open to all employees: browse published news, policies, announcements & events.
                    </Text>
                </div>
            ) : (
                <div
                    style={{
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        padding: "10px 14px",
                        borderRadius: 8,
                        marginBottom: 20,
                    }}
                >
                    <Text strong style={{ color: "#1e40af", fontSize: 12, display: "block" }}>
                        <AppstoreOutlined style={{ marginRight: 6 }} /> CMS Management Access
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11, color: "#1d4ed8" }}>
                        Requires authorized Admin or Editor credentials with CMS management permissions.
                    </Text>
                </div>
            )}

            {/* Access Denied Alert */}
            {roleAccessError && (
                <Alert
                    message="Access Denied"
                    description={
                        <div>
                            <div style={{ marginBottom: 6 }}>{roleAccessError}</div>
                            <Button
                                size="small"
                                type="primary"
                                onClick={() => {
                                    setLoginMode("employee");
                                    setRoleAccessError(null);
                                    dispatch(clearAuthError());
                                }}
                            >
                                Switch to Employee Login
                            </Button>
                        </div>
                    }
                    type="error"
                    showIcon
                    style={{ marginBottom: 18, borderRadius: 8 }}
                />
            )}

            {/* General Auth Error */}
            {error && !roleAccessError && (
                <Alert
                    message={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 18, borderRadius: 8 }}
                />
            )}

            <Form layout="vertical" onFinish={onFinish} autoComplete="off">
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        {
                            required: true,
                            message: "Please enter your email",
                        },
                        {
                            type: "email",
                            message: "Please enter a valid email",
                        },
                    ]}
                >
                    <Input
                        prefix={<MailOutlined style={{ color: "#94a3b8" }} />}
                        placeholder="e.g. employee@company.com"
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: "Please enter your password",
                        },
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined style={{ color: "#94a3b8" }} />}
                        placeholder="Enter your password"
                        size="large"
                    />
                </Form.Item>

                <Form.Item style={{ marginTop: 20, marginBottom: 12 }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isLoading}
                        block
                        size="large"
                        style={{
                            height: 44,
                            borderRadius: 8,
                            fontWeight: 600,
                            ...(loginMode === "admin"
                                ? { background: "#0f172a", borderColor: "#0f172a" }
                                : { background: "#1677ff", borderColor: "#1677ff" }),
                        }}
                    >
                        {loginMode === "admin" ? "Login to CMS Dashboard" : "Login to Employee Portal"}
                    </Button>
                </Form.Item>

                <Button
                    type="link"
                    block
                    onClick={() => navigate("/register")}
                    style={{ color: "#64748b" }}
                >
                    Don't have an account? <span style={{ color: "#1677ff", fontWeight: 600 }}>Register</span>
                </Button>
            </Form>
        </Card>
    );
};

export default LoginForm;
