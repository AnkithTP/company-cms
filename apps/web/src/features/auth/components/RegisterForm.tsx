import { Button, Form, Input, Select, Typography, Space, Tag } from "antd";

import {
    MailOutlined,
    LockOutlined,
    UserOutlined,
    IdcardOutlined,
    SafetyCertificateOutlined,
} from "@ant-design/icons";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { register, getRoles } from "../auth.service";
import type { RegisterRequest, RoleItem } from "../auth.types";

const { Title, Text } = Typography;
const { Option } = Select;

const defaultRolesList: RoleItem[] = [
    {
        id: "emp",
        name: "EMPLOYEE",
        description: "Standard employee: can read and consume published company content",
    },
    {
        id: "edit",
        name: "EDITOR",
        description: "Content creator: can draft, edit and submit news, articles, and updates",
    },
    {
        id: "hr",
        name: "HR_ADMIN",
        description: "HR administrator: manages company announcements, events, and HR policies",
    },
    {
        id: "tech",
        name: "TECH_ADMIN",
        description: "Technology administrator: manages technical articles and portal architecture",
    },
    {
        id: "super",
        name: "SUPER_ADMIN",
        description: "Super administrator: full access to approval workflows, user roles, and media",
    },
];

const roleBadges: Record<string, string> = {
    EMPLOYEE: "default",
    EDITOR: "blue",
    HR_ADMIN: "purple",
    TECH_ADMIN: "cyan",
    SUPER_ADMIN: "gold",
};

const RegisterForm = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [roles, setRoles] = useState<RoleItem[]>(defaultRolesList);
    const [selectedRole, setSelectedRole] = useState<string>("EMPLOYEE");

    useEffect(() => {
        const fetchAvailableRoles = async () => {
            try {
                const data = await getRoles();
                if (data && data.length > 0) {
                    setRoles(data);
                }
            } catch {
                // Keep default roles if API is unreachable
            }
        };

        fetchAvailableRoles();
    }, []);

    const onFinish = async (
        values: RegisterRequest & {
            confirm_password: string;
        },
    ) => {
        setIsLoading(true);
        setError(null);

        try {
            const { confirm_password, ...registerData } = values;

            await register(registerData);

            navigate("/login", {
                replace: true,
                state: {
                    message: "Registration successful. Please login.",
                },
            });
        } catch (error: any) {
            setError(error.response?.data?.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    const currentRoleDesc =
        roles.find((r) => r.name === selectedRole)?.description ||
        "Select your assigned role in the company";

    return (
        <div style={{ width: 460, margin: "20px auto" }}>
            <Title level={2} style={{ textAlign: "center", marginBottom: 8 }}>
                Create Account
            </Title>
            <Text
                type="secondary"
                style={{ display: "block", textAlign: "center", marginBottom: 24 }}
            >
                Register to access the internal company portal & CMS
            </Text>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
                initialValues={{ role: "EMPLOYEE" }}
            >
                <Form.Item
                    label="Employee Code"
                    name="employee_code"
                    rules={[
                        {
                            required: true,
                            message: "Please enter employee code",
                        },
                    ]}
                >
                    <Input prefix={<IdcardOutlined />} placeholder="e.g. EMP001" />
                </Form.Item>

                <Form.Item
                    label="Assign Role"
                    name="role"
                    rules={[
                        {
                            required: true,
                            message: "Please choose a role",
                        },
                    ]}
                    extra={
                        <div style={{ marginTop: 4 }}>
                            <Space size={6} align="center">
                                <Tag color={roleBadges[selectedRole] || "default"}>
                                    {selectedRole}
                                </Tag>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {currentRoleDesc}
                                </Text>
                            </Space>
                        </div>
                    }
                >
                    <Select
                        placeholder="Choose user role"
                        onChange={(val) => setSelectedRole(val)}
                        prefix={<SafetyCertificateOutlined style={{ marginRight: 6, color: "#1677ff" }} />}
                    >
                        {roles.map((r) => (
                            <Option key={r.id || r.name} value={r.name}>
                                <Space>
                                    <Tag color={roleBadges[r.name] || "default"}>
                                        {r.name}
                                    </Tag>
                                    <span>{r.description || r.name}</span>
                                </Space>
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <div style={{ display: "flex", gap: 12 }}>
                    <Form.Item
                        label="First Name"
                        name="first_name"
                        style={{ flex: 1 }}
                        rules={[
                            {
                                required: true,
                                message: "Please enter first name",
                            },
                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="First name" />
                    </Form.Item>

                    <Form.Item
                        label="Last Name"
                        name="last_name"
                        style={{ flex: 1 }}
                        rules={[
                            {
                                required: true,
                                message: "Please enter last name",
                            },
                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Last name" />
                    </Form.Item>
                </div>

                <Form.Item
                    label="Company Email"
                    name="email"
                    rules={[
                        {
                            required: true,
                            message: "Please enter email",
                        },
                        {
                            type: "email",
                            message: "Please enter a valid email",
                        },
                    ]}
                >
                    <Input
                        prefix={<MailOutlined />}
                        placeholder="employee@company.com"
                    />
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: "Please enter password",
                        },
                        {
                            min: 8,
                            message: "Password must be at least 8 characters",
                        },
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="At least 8 characters"
                    />
                </Form.Item>

                <Form.Item
                    label="Confirm Password"
                    name="confirm_password"
                    dependencies={["password"]}
                    rules={[
                        {
                            required: true,
                            message: "Please confirm your password",
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (
                                    !value ||
                                    getFieldValue("password") === value
                                ) {
                                    return Promise.resolve();
                                }

                                return Promise.reject(
                                    new Error("Passwords do not match"),
                                );
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Confirm password"
                    />
                </Form.Item>

                {error && (
                    <div style={{ marginBottom: 16 }}>
                        <Text type="danger">{error}</Text>
                    </div>
                )}

                <Form.Item style={{ marginTop: 16 }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isLoading}
                        block
                        size="large"
                    >
                        Register Account
                    </Button>
                </Form.Item>

                <Button type="link" block onClick={() => navigate("/login")}>
                    Already have an account? Login
                </Button>
            </Form>
        </div>
    );
};

export default RegisterForm;
