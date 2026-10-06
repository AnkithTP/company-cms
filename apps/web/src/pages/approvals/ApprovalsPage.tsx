import React, { useEffect, useState } from "react";
import {
    Table,
    Tag,
    Button,
    Card,
    Typography,
    Space,
    Row,
    Col,
    Tabs,
    Statistic,
    Modal,
    Input,
    message,
    Popconfirm,
    Tooltip,
    Alert,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    CloudUploadOutlined,
    ClockCircleOutlined,
    ReloadOutlined,
    AuditOutlined,
    GlobalOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../hooks";
import * as contentService from "../../features/contents/content.service";
import type {
    Content,
    ContentType,
    ContentStatus,
    ContentBlock,
} from "../../features/contents/content.types";
import { BlogLivePreviewModal } from "../content/components/BlogLivePreviewModal";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const statusColors: Record<ContentStatus, string> = {
    DRAFT: "default",
    SUBMITTED: "blue",
    UNDER_REVIEW: "orange",
    APPROVED: "cyan",
    PUBLISHED: "green",
    ARCHIVED: "red",
};

const typeColors: Record<ContentType, string> = {
    ANNOUNCEMENT: "magenta",
    POLICY: "gold",
    ARTICLE: "geekblue",
    TECH_ARTICLE: "purple",
    EVENT: "lime",
};

export const ApprovalsPage: React.FC = () => {
    const navigate = useNavigate();
    const currentUser = useAppSelector((state) => state.auth.user);

    const [contents, setContents] = useState<Content[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("needs_approval");

    // Modal state for rejection
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    // Preview state
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewContent, setPreviewContent] = useState<Content | null>(null);
    const [previewBlocks, setPreviewBlocks] = useState<ContentBlock[]>([]);

    const loadApprovals = async () => {
        setIsLoading(true);
        try {
            // Fetch workflow content items
            const response = await contentService.fetchContents({
                limit: 100,
                sort: "updated_at",
                order: "DESC",
            });
            setContents(response.data || []);
        } catch {
            message.error("Failed to load approvals queue");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadApprovals();
    }, []);

    // Filter items based on active tab
    const submittedCount = contents.filter((c) => c.status === "SUBMITTED").length;
    const underReviewCount = contents.filter((c) => c.status === "UNDER_REVIEW").length;
    const approvedCount = contents.filter((c) => c.status === "APPROVED").length;

    const filteredContents = contents.filter((c) => {
        if (activeTab === "needs_approval") {
            return c.status === "SUBMITTED" || c.status === "UNDER_REVIEW";
        }
        if (activeTab === "ready_to_publish") {
            return c.status === "APPROVED";
        }
        if (activeTab === "published") {
            return c.status === "PUBLISHED";
        }
        return true;
    });

    const handleWorkflowAction = async (action: string, contentId: string, reason?: string) => {
        setActionLoading(true);
        try {
            if (action === "start-review") {
                await contentService.startReview(contentId);
                message.success("Review started for this content");
            } else if (action === "approve") {
                await contentService.approveContent(contentId);
                message.success("Content approved! It is now ready to publish.");
            } else if (action === "reject") {
                await contentService.rejectContent(contentId, reason || "Changes requested");
                message.success("Content rejected and returned to draft with feedback.");
            } else if (action === "publish") {
                await contentService.publishContent(contentId);
                message.success("Content published successfully! Now visible on the portal.");
            }
            await loadApprovals();
        } catch (err: any) {
            message.error(err.response?.data?.message || `Failed to perform ${action}`);
        } finally {
            setActionLoading(false);
        }
    };

    const openPreview = async (record: Content) => {
        setPreviewContent(record);
        try {
            const blocksRes = await contentService.fetchContentBlocks(record.id);
            setPreviewBlocks(blocksRes?.data || []);
        } catch {
            setPreviewBlocks([]);
        }
        setPreviewOpen(true);
    };

    const columns: ColumnsType<Content> = [
        {
            title: "Content Title",
            dataIndex: "title",
            key: "title",
            render: (text, record) => (
                <Space direction="vertical" size={2}>
                    <Button
                        type="link"
                        style={{ padding: 0, fontWeight: 600, fontSize: 15 }}
                        onClick={() => openPreview(record)}
                    >
                        {text}
                    </Button>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        slug: /{record.slug}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Type",
            dataIndex: "content_type",
            key: "content_type",
            width: 140,
            render: (type: ContentType) => (
                <Tag color={typeColors[type] || "default"}>
                    {type.replace("_", " ")}
                </Tag>
            ),
        },
        {
            title: "Author",
            key: "author",
            width: 160,
            render: (_, record) => {
                const isAuthor = currentUser?.id === record.author?.id;
                return (
                    <div>
                        <Text strong>
                            {record.author
                                ? `${record.author.first_name} ${record.author.last_name}`
                                : "Unknown"}
                        </Text>
                        {isAuthor && (
                            <div>
                                <Tag color="warning" style={{ fontSize: 11 }}>
                                    Your Submission
                                </Tag>
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: "Current Status",
            dataIndex: "status",
            key: "status",
            width: 140,
            render: (st: ContentStatus) => (
                <Tag color={statusColors[st] || "default"}>
                    {st.replace("_", " ")}
                </Tag>
            ),
        },
        {
            title: "Last Updated",
            dataIndex: "updated_at",
            key: "updated_at",
            width: 130,
            render: (d: string) => (
                <Text type="secondary">
                    {d ? new Date(d).toLocaleDateString() : "—"}
                </Text>
            ),
        },
        {
            title: "Review Actions",
            key: "actions",
            width: 280,
            render: (_, record) => {
                const isAuthor = currentUser?.id === record.author?.id;

                return (
                    <Space size="small" wrap>
                        <Tooltip title="Inspect full article preview">
                            <Button
                                size="small"
                                icon={<EyeOutlined />}
                                onClick={() => openPreview(record)}
                            >
                                Preview
                            </Button>
                        </Tooltip>

                        {/* Status: SUBMITTED -> Start Review */}
                        {record.status === "SUBMITTED" && (
                            isAuthor ? (
                                <Tooltip title="Authors cannot review their own content">
                                    <Button size="small" disabled>
                                        Start Review
                                    </Button>
                                </Tooltip>
                            ) : (
                                <Button
                                    size="small"
                                    type="primary"
                                    loading={actionLoading}
                                    onClick={() => handleWorkflowAction("start-review", record.id)}
                                >
                                    Start Review
                                </Button>
                            )
                        )}

                        {/* Status: UNDER_REVIEW -> Approve or Reject */}
                        {record.status === "UNDER_REVIEW" && (
                            isAuthor ? (
                                <Tooltip title="Authors cannot approve their own content">
                                    <Tag color="volcano">Awaiting Peer Review</Tag>
                                </Tooltip>
                            ) : (
                                <>
                                    <Popconfirm
                                        title="Approve this content?"
                                        description="Once approved, it can be published to the employee portal."
                                        onConfirm={() => handleWorkflowAction("approve", record.id)}
                                        okText="Yes, Approve"
                                        cancelText="Cancel"
                                    >
                                        <Button
                                            size="small"
                                            type="primary"
                                            style={{ backgroundColor: "#52c41a" }}
                                            icon={<CheckCircleOutlined />}
                                            loading={actionLoading}
                                        >
                                            Approve
                                        </Button>
                                    </Popconfirm>
                                    <Button
                                        size="small"
                                        danger
                                        icon={<CloseCircleOutlined />}
                                        loading={actionLoading}
                                        onClick={() => {
                                            setRejectTargetId(record.id);
                                            setRejectModalOpen(true);
                                        }}
                                    >
                                        Reject
                                    </Button>
                                </>
                            )
                        )}

                        {/* Status: APPROVED -> Publish */}
                        {record.status === "APPROVED" && (
                            <Popconfirm
                                title="Publish content live?"
                                description="This will publish this approved content directly to the live company portal."
                                onConfirm={() => handleWorkflowAction("publish", record.id)}
                                okText="Yes, Publish Live"
                                cancelText="Cancel"
                            >
                                <Button
                                    size="small"
                                    type="primary"
                                    style={{ background: "#52c41a", borderColor: "#52c41a" }}
                                    icon={<CloudUploadOutlined />}
                                    loading={actionLoading}
                                >
                                    Publish Live
                                </Button>
                            </Popconfirm>
                        )}

                        {/* Status: PUBLISHED -> View on Portal */}
                        {record.status === "PUBLISHED" && (
                            <Button
                                size="small"
                                icon={<GlobalOutlined />}
                                onClick={() => window.open(`/portal/article/${record.slug}`, "_blank")}
                            >
                                Live Portal
                            </Button>
                        )}

                        <Button
                            size="small"
                            type="text"
                            onClick={() => navigate(`/content/${record.id}`)}
                        >
                            Details
                        </Button>
                    </Space>
                );
            },
        },
    ];

    return (
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Row justify="space-between" align="middle">
                <Col>
                    <Title level={3} style={{ margin: 0 }}>
                        <AuditOutlined style={{ marginRight: 8, color: "#1677ff" }} />
                        Approvals & Review Queue
                    </Title>
                    <Text type="secondary">
                        Review, approve, and publish submissions before they go live on the company portal.
                    </Text>
                </Col>
                <Col>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={loadApprovals}
                        loading={isLoading}
                    >
                        Refresh Queue
                    </Button>
                </Col>
            </Row>

            {/* Quick Policy Notice */}
            <Alert
                type="info"
                showIcon
                message="Workflow Approval Policy"
                description="To maintain quality and compliance, content cannot be published until approved. Authors cannot approve or publish their own submissions."
                style={{ borderRadius: 8 }}
            />

            {/* Top Stat Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 8,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                            borderLeft: "4px solid #1677ff",
                        }}
                    >
                        <Statistic
                            title="Submitted (Awaiting Review)"
                            value={submittedCount}
                            valueStyle={{ color: "#1677ff", fontWeight: 700 }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 8,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                            borderLeft: "4px solid #fa8c16",
                        }}
                    >
                        <Statistic
                            title="Under Active Review"
                            value={underReviewCount}
                            valueStyle={{ color: "#fa8c16", fontWeight: 700 }}
                            prefix={<EyeOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 8,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                            borderLeft: "4px solid #52c41a",
                        }}
                    >
                        <Statistic
                            title="Approved (Ready to Publish)"
                            value={approvedCount}
                            valueStyle={{ color: "#52c41a", fontWeight: 700 }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Approvals Table with Tabs */}
            <Card style={{ borderRadius: 8 }}>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            key: "needs_approval",
                            label: `Needs Approval (${submittedCount + underReviewCount})`,
                        },
                        {
                            key: "ready_to_publish",
                            label: `Ready to Publish (${approvedCount})`,
                        },
                        {
                            key: "all",
                            label: `All Items (${contents.length})`,
                        },
                    ]}
                />

                <Table
                    columns={columns}
                    dataSource={filteredContents}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                />
            </Card>

            {/* Rejection Modal */}
            <Modal
                title="Reject Content Submission"
                open={rejectModalOpen}
                onOk={async () => {
                    if (!rejectReason.trim()) {
                        message.warning("Please provide a reason or constructive feedback");
                        return;
                    }
                    if (rejectTargetId) {
                        await handleWorkflowAction("reject", rejectTargetId, rejectReason.trim());
                    }
                    setRejectModalOpen(false);
                    setRejectReason("");
                    setRejectTargetId(null);
                }}
                onCancel={() => {
                    setRejectModalOpen(false);
                    setRejectReason("");
                    setRejectTargetId(null);
                }}
                confirmLoading={actionLoading}
                okText="Submit Rejection"
                okButtonProps={{ danger: true }}
            >
                <Paragraph type="secondary">
                    Please provide clear feedback explaining why this submission is being rejected and what changes the author should make before resubmitting:
                </Paragraph>
                <TextArea
                    rows={4}
                    placeholder="e.g. Please update the policy effective date and add the missing department contact details."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                />
            </Modal>

            {/* Blog Post Preview Modal */}
            {previewContent && (
                <BlogLivePreviewModal
                    open={previewOpen}
                    onClose={() => {
                        setPreviewOpen(false);
                        setPreviewContent(null);
                    }}
                    title={previewContent.title}
                    slug={previewContent.slug}
                    contentType={previewContent.content_type}
                    blocks={previewBlocks}
                    authorName={
                        previewContent.author
                            ? `${previewContent.author.first_name} ${previewContent.author.last_name}`
                            : "Company Author"
                    }
                />
            )}
        </Space>
    );
};

export default ApprovalsPage;
