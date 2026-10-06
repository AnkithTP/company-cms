import { useEffect, useState } from "react";
import {
    Alert,
    Card,
    Col,
    Empty,
    Row,
    Spin,
    Statistic,
    Table,
    Typography,
    Tag,
    List,
    Space,
    Button,
    Badge,
} from "antd";
import {
    FileTextOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CalendarOutlined,
    ReloadOutlined,
    InboxOutlined,
    AuditOutlined,
    RightOutlined,
    EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchDashboardSummary } from "../../features/dashboard/dashboardSlice";
import * as contentService from "../../features/contents/content.service";
import type { Content } from "../../features/contents/content.types";

const { Title, Text } = Typography;

const statusColorMap: Record<string, string> = {
    DRAFT: "default",
    SUBMITTED: "blue",
    UNDER_REVIEW: "orange",
    APPROVED: "cyan",
    PUBLISHED: "green",
    ARCHIVED: "purple",
};

const actionColorMap: Record<string, string> = {
    CREATE: "green",
    CONTENT_CREATED: "green",
    UPDATE: "blue",
    CONTENT_UPDATED: "blue",
    SUBMIT: "cyan",
    CONTENT_SUBMITTED: "cyan",
    START_REVIEW: "orange",
    APPROVE: "lime",
    CONTENT_APPROVED: "lime",
    REJECT: "red",
    CONTENT_REJECTED: "red",
    PUBLISH: "green",
    CONTENT_PUBLISHED: "green",
    ARCHIVE: "purple",
    CONTENT_ARCHIVED: "purple",
    LOGIN: "geekblue",
};

const DashboardPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { data, isLoading, error } = useAppSelector(
        (state) => state.dashboard,
    );

    const [pendingItems, setPendingItems] = useState<Content[]>([]);

    const loadData = () => {
        dispatch(fetchDashboardSummary());
        // Load pending approval items
        contentService
            .fetchContents({ limit: 10, sort: "updated_at", order: "DESC" })
            .then((res) => {
                const pending = (res.data || []).filter(
                    (c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW" || c.status === "APPROVED"
                );
                setPendingItems(pending);
            })
            .catch(() => {});
    };

    useEffect(() => {
        loadData();
    }, [dispatch]);

    if (isLoading && !data) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
                <Spin size="large" tip="Loading dashboard data..." />
            </div>
        );
    }

    if (error && !data) {
        return (
            <Alert
                type="error"
                message="Unable to Load Dashboard"
                description={error}
                action={
                    <Button size="small" type="primary" onClick={loadData}>
                        Retry
                    </Button>
                }
                showIcon
            />
        );
    }

    const contentSummary = data?.content;
    const statusEntries = Object.entries(contentSummary?.status || {});
    const typeEntries = Object.entries(contentSummary?.type || {});
    const pendingTotal =
        (contentSummary?.status?.SUBMITTED ?? 0) +
        (contentSummary?.status?.UNDER_REVIEW ?? 0);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div>
                    <Title level={3} style={{ margin: 0 }}>
                        Company Portal Dashboard
                    </Title>
                    <Text type="secondary">
                        Real-time overview of content, workflow statuses, and upcoming events.
                    </Text>
                </div>
                <Space>
                    <Button
                        type="primary"
                        icon={<AuditOutlined />}
                        onClick={() => navigate("/approvals")}
                    >
                        Approvals Queue {pendingTotal > 0 && `(${pendingTotal})`}
                    </Button>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={loadData}
                        loading={isLoading}
                    >
                        Refresh
                    </Button>
                </Space>
            </div>

            {/* Top Stat Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        bordered={false}
                        hoverable
                        onClick={() => navigate("/content")}
                        style={{
                            borderRadius: 8,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            background: "linear-gradient(135deg, #1677ff 0%, #0958d9 100%)",
                            color: "#fff",
                            cursor: "pointer",
                        }}
                    >
                        <Statistic
                            title={<span style={{ color: "rgba(255,255,255,0.85)" }}>Total Content</span>}
                            value={contentSummary?.total ?? 0}
                            valueStyle={{ color: "#fff", fontWeight: 700 }}
                            prefix={<FileTextOutlined style={{ color: "rgba(255,255,255,0.9)" }} />}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card
                        bordered={false}
                        hoverable
                        onClick={() => navigate("/content")}
                        style={{
                            borderRadius: 8,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            cursor: "pointer",
                        }}
                    >
                        <Statistic
                            title="Published Articles"
                            value={contentSummary?.status?.PUBLISHED ?? 0}
                            valueStyle={{ color: "#52c41a", fontWeight: 700 }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card
                        bordered={false}
                        hoverable
                        onClick={() => navigate("/approvals")}
                        style={{
                            borderRadius: 8,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            border: pendingTotal > 0 ? "1px solid #ffbb96" : "1px solid #f0f0f0",
                            backgroundColor: pendingTotal > 0 ? "#fff7e6" : "#ffffff",
                            cursor: "pointer",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <Statistic
                                title={
                                    <Space size={4}>
                                        <span>Pending Review</span>
                                        {pendingTotal > 0 && <Badge status="processing" color="#fa8c16" />}
                                    </Space>
                                }
                                value={pendingTotal}
                                valueStyle={{ color: "#fa8c16", fontWeight: 700 }}
                                prefix={<ClockCircleOutlined />}
                            />
                            <RightOutlined style={{ color: "#fa8c16", fontSize: 16, marginTop: 8 }} />
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card
                        bordered={false}
                        hoverable
                        onClick={() => navigate("/content")}
                        style={{
                            borderRadius: 8,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            cursor: "pointer",
                        }}
                    >
                        <Statistic
                            title="Drafts"
                            value={contentSummary?.status?.DRAFT ?? 0}
                            valueStyle={{ color: "#8c8c8c", fontWeight: 700 }}
                            prefix={<InboxOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Pending Approvals Quick-Action Banner */}
            {pendingItems.length > 0 && (
                <Card
                    title={
                        <Space>
                            <AuditOutlined style={{ color: "#fa8c16" }} />
                            <span>Action Required: Submissions Awaiting Approval</span>
                            <Tag color="orange">{pendingItems.length} Pending</Tag>
                        </Space>
                    }
                    extra={
                        <Button type="link" onClick={() => navigate("/approvals")}>
                            View Full Approvals Queue <RightOutlined />
                        </Button>
                    }
                    style={{ borderRadius: 8, borderLeft: "4px solid #fa8c16" }}
                >
                    <List
                        dataSource={pendingItems.slice(0, 4)}
                        renderItem={(item) => (
                            <List.Item
                                actions={[
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<EyeOutlined />}
                                        onClick={() => navigate("/approvals")}
                                    >
                                        Review & Approve
                                    </Button>,
                                ]}
                            >
                                <List.Item.Meta
                                    title={
                                        <Space>
                                            <Text strong style={{ fontSize: 15 }}>
                                                {item.title}
                                            </Text>
                                            <Tag color={statusColorMap[item.status] || "default"}>
                                                {item.status.replace("_", " ")}
                                            </Tag>
                                            <Tag color="blue">{item.content_type.replace("_", " ")}</Tag>
                                        </Space>
                                    }
                                    description={
                                        <Space split="•" style={{ color: "#8c8c8c", fontSize: 12 }}>
                                            <span>
                                                Author: {item.author?.first_name} {item.author?.last_name}
                                            </span>
                                            <span>
                                                Updated: {dayjs(item.updated_at).format("MMM DD, YYYY")}
                                            </span>
                                            <span>slug: /{item.slug}</span>
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </Card>
            )}

            {/* Workflow Status Breakdown */}
            <Card
                title="Workflow Status Breakdown"
                bordered={false}
                style={{ borderRadius: 8 }}
            >
                <Row gutter={[16, 16]}>
                    {statusEntries.map(([status, count]) => {
                        const isApprovalStatus = status === "SUBMITTED" || status === "UNDER_REVIEW" || status === "APPROVED";
                        return (
                            <Col xs={12} sm={8} md={4} key={status}>
                                <div
                                    onClick={() => navigate(isApprovalStatus ? "/approvals" : "/content")}
                                    style={{
                                        padding: "12px 16px",
                                        background: count > 0 && isApprovalStatus ? "#fffbe6" : "#fafafa",
                                        borderRadius: 6,
                                        border: count > 0 && isApprovalStatus ? "1px solid #ffe58f" : "1px solid #f0f0f0",
                                        textAlign: "center",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    <Tag color={statusColorMap[status] || "default"} style={{ marginBottom: 8 }}>
                                        {status.replace("_", " ")}
                                    </Tag>
                                    <div style={{ fontSize: 22, fontWeight: 700, color: "#262626" }}>
                                        {count}
                                    </div>
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            </Card>

            {/* Middle Section: Content by Type & Upcoming Events */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card
                        title="Content by Type"
                        bordered={false}
                        style={{ borderRadius: 8, height: "100%" }}
                    >
                        {typeEntries.length ? (
                            <List
                                dataSource={typeEntries}
                                renderItem={([contentType, count]) => (
                                    <List.Item
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            padding: "12px 0",
                                        }}
                                    >
                                        <Space>
                                            <FileTextOutlined style={{ color: "#1677ff" }} />
                                            <Text strong>{contentType.replace("_", " ")}</Text>
                                        </Space>
                                        <Tag color="blue" style={{ fontSize: 13, padding: "2px 8px" }}>
                                            {count} item{count !== 1 ? "s" : ""}
                                        </Tag>
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="No content data available" />
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card
                        title="Upcoming Events"
                        bordered={false}
                        style={{ borderRadius: 8, height: "100%" }}
                    >
                        {data?.upcomingEvents && data.upcomingEvents.length > 0 ? (
                            <List
                                dataSource={data.upcomingEvents}
                                renderItem={(event) => (
                                    <List.Item style={{ padding: "12px 0" }}>
                                        <List.Item.Meta
                                            avatar={
                                                <CalendarOutlined
                                                    style={{ fontSize: 24, color: "#722ed1" }}
                                                />
                                            }
                                            title={<Text strong>{event.title}</Text>}
                                            description={
                                                <Space split="•" style={{ color: "#8c8c8c", fontSize: 12 }}>
                                                    <span>{dayjs(event.event_date).format("MMM DD, YYYY")}</span>
                                                    {event.start_time && <span>{event.start_time}</span>}
                                                    {event.location && <span>{event.location}</span>}
                                                </Space>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty
                                description="No upcoming events scheduled"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Bottom Section: Recent Activity / Audit Log */}
            <Card
                title="Recent Activity"
                bordered={false}
                style={{ borderRadius: 8 }}
            >
                {data?.recentActivity && data.recentActivity.length > 0 ? (
                    <Table
                        dataSource={data.recentActivity}
                        rowKey="id"
                        pagination={false}
                        size="middle"
                        columns={[
                            {
                                title: "Action",
                                dataIndex: "action",
                                key: "action",
                                render: (action: string) => (
                                    <Tag color={actionColorMap[action] || "default"}>
                                        {action.replace(/_/g, " ")}
                                    </Tag>
                                ),
                            },
                            {
                                title: "Entity Type",
                                dataIndex: "entity_type",
                                key: "entity_type",
                                render: (type: string) => (
                                    <Text code>{type}</Text>
                                ),
                            },
                            {
                                title: "Entity ID",
                                dataIndex: "entity_id",
                                key: "entity_id",
                                render: (id: string | null) => (
                                    <Text type="secondary" ellipsis style={{ maxWidth: 140 }}>
                                        {id ? id.slice(0, 8) + "..." : "—"}
                                    </Text>
                                ),
                            },
                            {
                                title: "User",
                                key: "user",
                                render: (_, record) => {
                                    if (!record.user) {
                                        return <Text type="secondary">System</Text>;
                                    }
                                    return (
                                        <Space direction="vertical" size={0}>
                                            <Text strong>
                                                {record.user.first_name} {record.user.last_name}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {record.user.email}
                                            </Text>
                                        </Space>
                                    );
                                },
                            },
                            {
                                title: "Timestamp",
                                dataIndex: "created_at",
                                key: "created_at",
                                render: (date: string) => (
                                    <Text type="secondary">
                                        {dayjs(date).format("MMM DD, YYYY HH:mm")}
                                    </Text>
                                ),
                            },
                        ]}
                    />
                ) : (
                    <Empty
                        description="No recent activity logged"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                )}
            </Card>
        </div>
    );
};

export default DashboardPage;
