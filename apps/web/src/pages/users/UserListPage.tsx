import React, { useEffect, useState, useMemo } from "react";
import {
    Card,
    Typography,
    Button,
    Space,
    Input,
    Select,
    Row,
    Col,
    Table,
    Tag,
    Modal,
    Form,
    Switch,
    message,
    Avatar,
    Statistic,
    Popconfirm,
    Result,
} from "antd";
import { useNavigate } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";
import {
    UserOutlined,
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
    SafetyCertificateOutlined,
    CrownOutlined,
    EditOutlined,
    CheckCircleOutlined,
    StopOutlined,
    TeamOutlined,
    KeyOutlined,
} from "@ant-design/icons";
import * as userService from "../../features/users/user.service";
import type { UserListItem } from "../../features/users/user.types";
import { useAppSelector } from "../../hooks";
import { isAdminUser } from "../../utils/roles";

const { Title, Text } = Typography;
const { Option } = Select;

const roleColors: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
    SUPER_ADMIN: { color: "magenta", label: "Super Admin", icon: <CrownOutlined /> },
    HR_ADMIN: { color: "gold", label: "HR Admin", icon: <SafetyCertificateOutlined /> },
    TECH_ADMIN: { color: "purple", label: "Tech Admin", icon: <SafetyCertificateOutlined /> },
    EDITOR: { color: "cyan", label: "Editor", icon: <EditOutlined /> },
    EMPLOYEE: { color: "blue", label: "Employee", icon: <UserOutlined /> },
};

const UserListPage: React.FC = () => {
    const navigate = useNavigate();
    const currentUser = useAppSelector((state) => state.auth.user);
    const isAdmin = isAdminUser(currentUser);

    const [users, setUsers] = useState<UserListItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Create User Modal
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createSubmitting, setCreateSubmitting] = useState(false);
    const [createForm] = Form.useForm();

    // Change Role Modal
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [roleTargetUser, setRoleTargetUser] = useState<UserListItem | null>(null);
    const [selectedNewRole, setSelectedNewRole] = useState<string>("EMPLOYEE");
    const [roleSubmitting, setRoleSubmitting] = useState(false);

    const loadUsers = async () => {
        if (!isAdmin) return;
        setIsLoading(true);
        try {
            const data = await userService.fetchAllUsers();
            setUsers(data || []);
        } catch {
            message.error("Failed to load users list");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            loadUsers();
        }
    }, [isAdmin]);

    if (!isAdmin) {
        return (
            <Card style={{ margin: "40px auto", maxWidth: 640, textAlign: "center", borderRadius: 12, padding: "24px 0" }}>
                <Result
                    status="403"
                    title="403 - Admin Access Only"
                    subTitle="The Users management module is strictly restricted to Administrators. You do not have permission to view or manage user accounts."
                    extra={
                        <Button type="primary" onClick={() => navigate("/")}>
                            Return to Dashboard
                        </Button>
                    }
                />
            </Card>
        );
    }

    // Filtered users
    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
            const matchesSearch =
                !searchTerm ||
                fullName.includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.employee_code.toLowerCase().includes(searchTerm.toLowerCase());

            const userRoleName = u.roles?.[0]?.name || "EMPLOYEE";
            const matchesRole = roleFilter === "ALL" || userRoleName === roleFilter;

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && u.is_active) ||
                (statusFilter === "INACTIVE" && !u.is_active);

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchTerm, roleFilter, statusFilter]);

    // Stats
    const stats = useMemo(() => {
        const total = users.length;
        const active = users.filter((u) => u.is_active).length;
        const editors = users.filter((u) => u.roles?.some((r) => r.name === "EDITOR")).length;
        const admins = users.filter((u) =>
            u.roles?.some((r) => r.name.includes("ADMIN"))
        ).length;
        return { total, active, editors, admins };
    }, [users]);

    // Toggle Active Status
    const handleStatusToggle = async (user: UserListItem, checked: boolean) => {
        try {
            await userService.updateUserStatus(user.id, checked);
            message.success(
                `Account for ${user.first_name} ${user.last_name} ${checked ? "activated" : "suspended"}`
            );
            setUsers((prev) =>
                prev.map((u) => (u.id === user.id ? { ...u, is_active: checked } : u))
            );
        } catch (err: any) {
            message.error(err.response?.data?.message || "Failed to update user status");
        }
    };

    // Open Role Change Modal
    const handleOpenRoleModal = (user: UserListItem) => {
        setRoleTargetUser(user);
        setSelectedNewRole(user.roles?.[0]?.name || "EMPLOYEE");
        setRoleModalOpen(true);
    };

    // Submit Role Change
    const handleRoleSubmit = async () => {
        if (!roleTargetUser) return;
        setRoleSubmitting(true);
        try {
            const updated = await userService.updateUserRole(roleTargetUser.id, selectedNewRole);
            message.success(
                `Role for ${roleTargetUser.first_name} updated to ${selectedNewRole}!`
            );
            setUsers((prev) =>
                prev.map((u) => (u.id === roleTargetUser.id ? { ...u, roles: updated.roles } : u))
            );
            setRoleModalOpen(false);
        } catch (err: any) {
            message.error(err.response?.data?.message || "Failed to update role");
        } finally {
            setRoleSubmitting(false);
        }
    };

    // Submit Create User
    const handleCreateSubmit = async () => {
        try {
            const values = await createForm.validateFields();
            setCreateSubmitting(true);
            const created = await userService.createNewUser({
                employee_code: values.employee_code.trim(),
                first_name: values.first_name.trim(),
                last_name: values.last_name.trim(),
                email: values.email.trim(),
                password: values.password || "Password@123",
                role: values.role || "EMPLOYEE",
            });
            message.success(`User "${created.first_name} ${created.last_name}" created successfully!`);
            setCreateModalOpen(false);
            createForm.resetFields();
            loadUsers();
        } catch (err: any) {
            message.error(err.response?.data?.message || err.message || "Failed to create user");
        } finally {
            setCreateSubmitting(false);
        }
    };

    // Columns
    const columns: ColumnsType<UserListItem> = [
        {
            title: "Employee",
            key: "name",
            render: (_, record) => {
                const isCurrent = currentUser?.id === record.id;
                return (
                    <Space>
                        <Avatar
                            style={{
                                backgroundColor: isCurrent ? "#1677ff" : "#64748b",
                                fontWeight: 700,
                            }}
                        >
                            {record.first_name[0]}
                            {record.last_name[0]}
                        </Avatar>
                        <div>
                            <Text strong>
                                {record.first_name} {record.last_name}
                            </Text>
                            {isCurrent && (
                                <Tag color="blue" style={{ marginLeft: 6, fontSize: 10 }}>
                                    You
                                </Tag>
                            )}
                            <div style={{ fontSize: 12, color: "#64748b" }}>{record.email}</div>
                        </div>
                    </Space>
                );
            },
        },
        {
            title: "Employee ID",
            dataIndex: "employee_code",
            key: "code",
            width: 140,
            render: (code: string) => (
                <Tag style={{ fontFamily: "monospace", fontWeight: 600 }}>{code}</Tag>
            ),
        },
        {
            title: "Assigned Role",
            key: "role",
            width: 170,
            render: (_, record) => {
                const roleName = record.roles?.[0]?.name || "EMPLOYEE";
                const roleMeta = roleColors[roleName] || {
                    color: "default",
                    label: roleName,
                    icon: <UserOutlined />,
                };
                return (
                    <Tag icon={roleMeta.icon} color={roleMeta.color} style={{ padding: "2px 8px" }}>
                        {roleMeta.label}
                    </Tag>
                );
            },
        },
        {
            title: "Status",
            dataIndex: "is_active",
            key: "status",
            width: 120,
            render: (active: boolean, record) => (
                <Popconfirm
                    title={active ? "Suspend this account?" : "Reactivate this account?"}
                    onConfirm={() => handleStatusToggle(record, !active)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Switch
                        checked={active}
                        checkedChildren={<CheckCircleOutlined />}
                        unCheckedChildren={<StopOutlined />}
                        size="small"
                    />
                </Popconfirm>
            ),
        },
        {
            title: "Joined On",
            dataIndex: "created_at",
            key: "created_at",
            width: 130,
            render: (d: string) => <Text type="secondary">{new Date(d).toLocaleDateString()}</Text>,
        },
        {
            title: "Actions",
            key: "actions",
            width: 140,
            align: "right",
            render: (_, record) => (
                <Button
                    size="small"
                    icon={<KeyOutlined />}
                    onClick={() => handleOpenRoleModal(record)}
                >
                    Role
                </Button>
            ),
        },
    ];

    return (
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
            {/* Header */}
            <Row justify="space-between" align="middle">
                <Col>
                    <Title level={3} style={{ margin: 0 }}>
                        <TeamOutlined style={{ marginRight: 8, color: "#1677ff" }} />
                        User Roster & Access Control
                    </Title>
                    <Text type="secondary">
                        Manage employee directory, assign permissions, and oversee organizational governance.
                    </Text>
                </Col>
                <Col>
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={loadUsers} loading={isLoading}>
                            Refresh
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setCreateModalOpen(true)}
                        >
                            Add Employee
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Metrics */}
            <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                    <Card size="small" bordered={false} style={{ background: "#e6f4ff", borderColor: "#91caff" }}>
                        <Statistic
                            title={<Text strong style={{ color: "#0958d9" }}>Total Users</Text>}
                            value={stats.total}
                            prefix={<TeamOutlined style={{ color: "#1677ff" }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" bordered={false} style={{ background: "#f6ffed", borderColor: "#b7eb8f" }}>
                        <Statistic
                            title={<Text strong style={{ color: "#389e0d" }}>Active Accounts</Text>}
                            value={stats.active}
                            prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" bordered={false} style={{ background: "#e6fffb", borderColor: "#87e8de" }}>
                        <Statistic
                            title={<Text strong style={{ color: "#08979c" }}>Editors & Authors</Text>}
                            value={stats.editors}
                            prefix={<EditOutlined style={{ color: "#13c2c2" }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" bordered={false} style={{ background: "#fff0f6", borderColor: "#ffadd2" }}>
                        <Statistic
                            title={<Text strong style={{ color: "#c41d7f" }}>Administrators</Text>}
                            value={stats.admins}
                            prefix={<CrownOutlined style={{ color: "#eb2f96" }} />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card
                bordered={false}
                bodyStyle={{ padding: "14px 20px" }}
                style={{ borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
            >
                <Row justify="space-between" align="middle" gutter={[16, 12]}>
                    <Col xs={24} sm={12} md={10}>
                        <Input
                            placeholder="Search by name, employee code or email..."
                            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={12} sm={6} md={5}>
                        <Select
                            style={{ width: "100%" }}
                            value={roleFilter}
                            onChange={(val) => setRoleFilter(val)}
                        >
                            <Option value="ALL">All Roles</Option>
                            <Option value="SUPER_ADMIN">Super Admin</Option>
                            <Option value="HR_ADMIN">HR Admin</Option>
                            <Option value="TECH_ADMIN">Tech Admin</Option>
                            <Option value="EDITOR">Editor</Option>
                            <Option value="EMPLOYEE">Employee</Option>
                        </Select>
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                        <Select
                            style={{ width: "100%" }}
                            value={statusFilter}
                            onChange={(val) => setStatusFilter(val)}
                        >
                            <Option value="ALL">All Status</Option>
                            <Option value="ACTIVE">Active Only</Option>
                            <Option value="INACTIVE">Suspended</Option>
                        </Select>
                    </Col>
                </Row>
            </Card>

            {/* Users Table */}
            <Card
                bordered={false}
                bodyStyle={{ padding: 0 }}
                style={{ borderRadius: 10, overflow: "hidden" }}
            >
                <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    loading={isLoading}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* Add User Modal */}
            <Modal
                title={
                    <Space>
                        <UserOutlined style={{ color: "#1677ff" }} />
                        <span>Add New Employee</span>
                    </Space>
                }
                open={createModalOpen}
                onOk={handleCreateSubmit}
                onCancel={() => setCreateModalOpen(false)}
                okText="Create User"
                confirmLoading={createSubmitting}
                destroyOnClose
            >
                <Form
                    form={createForm}
                    layout="vertical"
                    initialValues={{ role: "EMPLOYEE" }}
                    style={{ marginTop: 16 }}
                >
                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item
                                label="First Name"
                                name="first_name"
                                rules={[{ required: true, message: "First name is required" }]}
                            >
                                <Input placeholder="e.g. Rahul" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Last Name"
                                name="last_name"
                                rules={[{ required: true, message: "Last name is required" }]}
                            >
                                <Input placeholder="e.g. Sharma" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Corporate Email"
                        name="email"
                        rules={[
                            { required: true, message: "Email is required" },
                            { type: "email", message: "Enter a valid email address" },
                        ]}
                    >
                        <Input placeholder="employee@company.com" />
                    </Form.Item>

                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item
                                label="Employee Code"
                                name="employee_code"
                                rules={[{ required: true, message: "Employee code required" }]}
                            >
                                <Input placeholder="e.g. EMP-204" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Role Assignment"
                                name="role"
                                rules={[{ required: true, message: "Please select a role" }]}
                            >
                                <Select>
                                    <Option value="EMPLOYEE">Employee (Portal Reader)</Option>
                                    <Option value="EDITOR">Editor (Author & Publisher)</Option>
                                    <Option value="HR_ADMIN">HR Admin (Reviewer & Approver)</Option>
                                    <Option value="TECH_ADMIN">Tech Admin (Reviewer & Approver)</Option>
                                    <Option value="SUPER_ADMIN">Super Admin (Full Governance)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Initial Password"
                        name="password"
                        tooltip="Defaults to 'Password@123' if left blank"
                    >
                        <Input.Password placeholder="Password@123" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Change Role Modal */}
            <Modal
                title={
                    <Space>
                        <KeyOutlined style={{ color: "#1677ff" }} />
                        <span>Change Role: {roleTargetUser?.first_name} {roleTargetUser?.last_name}</span>
                    </Space>
                }
                open={roleModalOpen}
                onOk={handleRoleSubmit}
                onCancel={() => setRoleModalOpen(false)}
                okText="Update Role"
                confirmLoading={roleSubmitting}
            >
                <div style={{ padding: "12px 0" }}>
                    <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
                        Assign an authorized access level for this employee in the company CMS and portal:
                    </Text>

                    <Select
                        value={selectedNewRole}
                        onChange={(val) => setSelectedNewRole(val)}
                        style={{ width: "100%", marginBottom: 16 }}
                    >
                        <Option value="EMPLOYEE">Employee — Reader on Portal</Option>
                        <Option value="EDITOR">Editor — Create & Publish Content</Option>
                        <Option value="HR_ADMIN">HR Admin — Review & Approve HR Content</Option>
                        <Option value="TECH_ADMIN">Tech Admin — Review & Approve Tech Content</Option>
                        <Option value="SUPER_ADMIN">Super Admin — Full Governance & Approvals</Option>
                    </Select>

                    <div style={{ backgroundColor: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                        <Text strong style={{ fontSize: 13, display: "block", marginBottom: 4 }}>
                            Role Responsibilities:
                        </Text>
                        {selectedNewRole === "SUPER_ADMIN" && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Full access to manage users, approvals queue, content revisions, media assets, categories, and events.
                            </Text>
                        )}
                        {selectedNewRole === "EDITOR" && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Can compose rich articles, upload media, submit drafts for review, and publish approved drafts live.
                            </Text>
                        )}
                        {selectedNewRole === "EMPLOYEE" && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Can browse, search, and read published articles and corporate events on the live company portal.
                            </Text>
                        )}
                        {(selectedNewRole === "HR_ADMIN" || selectedNewRole === "TECH_ADMIN") && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Acts as reviewer and approver in the Approvals Queue for team submissions.
                            </Text>
                        )}
                    </div>
                </div>
            </Modal>
        </Space>
    );
};

export default UserListPage;
