import React, { useEffect, useState } from "react";
import { Table, Input, Select, Space, Tag, Button, Card, Typography, Row, Col } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, SearchOutlined, ReloadOutlined, GlobalOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../hooks";
import {
    fetchContentList,
    selectContentState,
} from "../../features/contents/contentSlice";
import type { Content, ContentType, ContentStatus } from "../../features/contents/content.types";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

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

const ContentListPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { list, pagination, isLoading } = useAppSelector(selectContentState);

    const [search, setSearch] = useState<string>("");
    const [contentType, setContentType] = useState<ContentType | undefined>(undefined);
    const [status, setStatus] = useState<ContentStatus | undefined>(undefined);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);

    const loadData = () => {
        dispatch(
            fetchContentList({
                ...(search ? { search } : {}),
                ...(contentType ? { content_type: contentType } : {}),
                ...(status ? { status } : {}),
                page,
                limit,
                sort: "created_at",
                order: "DESC",
            })
        );
    };

    useEffect(() => {
        loadData();
    }, [dispatch, search, contentType, status, page, limit]);

    const columns: ColumnsType<Content> = [
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            render: (text, record) => (
                <Space direction="vertical" size={2}>
                    <Button
                        type="link"
                        style={{ padding: 0, fontWeight: 600, fontSize: 15 }}
                        onClick={() => navigate(`/content/${record.id}`)}
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
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 130,
            render: (st: ContentStatus) => (
                <Tag color={statusColors[st] || "default"}>
                    {st.replace("_", " ")}
                </Tag>
            ),
        },
        {
            title: "Author",
            key: "author",
            width: 160,
            render: (_, record) => (
                record.author ? (
                    <Text>
                        {record.author.first_name} {record.author.last_name}
                    </Text>
                ) : (
                    <Text type="secondary">—</Text>
                )
            ),
        },
        {
            title: "Created At",
            dataIndex: "created_at",
            key: "created_at",
            width: 130,
            render: (d: string) => (
                <Text type="secondary">
                    {d ? new Date(d).toLocaleDateString() : "—"}
                </Text>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            width: 170,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="default"
                        size="small"
                        onClick={() => navigate(`/content/${record.id}`)}
                    >
                        View
                    </Button>
                    {record.status === "PUBLISHED" && (
                        <Button
                            type="link"
                            size="small"
                            icon={<GlobalOutlined />}
                            onClick={() => window.open(`/portal/article/${record.slug}`, "_blank")}
                            style={{ padding: 0 }}
                        >
                            Portal 🌐
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Row justify="space-between" align="middle">
                <Col>
                    <Title level={3} style={{ margin: 0 }}>Content Management</Title>
                    <Text type="secondary">
                        Create, review, approve and publish company content.
                    </Text>
                </Col>
                <Col>
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => loadData()}
                        >
                            Refresh
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate("/content/create")}
                        >
                            Create Content
                        </Button>
                    </Space>
                </Col>
            </Row>

            <Card style={{ borderRadius: 8 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={8} md={8}>
                        <Input
                            placeholder="Search title..."
                            prefix={<SearchOutlined />}
                            allowClear
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </Col>
                    <Col xs={24} sm={8} md={6}>
                        <Select
                            placeholder="Filter by Type"
                            allowClear
                            style={{ width: "100%" }}
                            value={contentType}
                            onChange={(val) => {
                                setContentType(val);
                                setPage(1);
                            }}
                        >
                            <Option value="ANNOUNCEMENT">Announcement</Option>
                            <Option value="POLICY">Policy</Option>
                            <Option value="ARTICLE">Article</Option>
                            <Option value="TECH_ARTICLE">Tech Article</Option>
                            <Option value="EVENT">Event</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={8} md={6}>
                        <Select
                            placeholder="Filter by Status"
                            allowClear
                            style={{ width: "100%" }}
                            value={status}
                            onChange={(val) => {
                                setStatus(val);
                                setPage(1);
                            }}
                        >
                            <Option value="DRAFT">Draft</Option>
                            <Option value="SUBMITTED">Submitted</Option>
                            <Option value="UNDER_REVIEW">Under Review</Option>
                            <Option value="APPROVED">Approved</Option>
                            <Option value="PUBLISHED">Published</Option>
                            <Option value="ARCHIVED">Archived</Option>
                        </Select>
                    </Col>
                </Row>
            </Card>

            <Card style={{ borderRadius: 8 }} bodyStyle={{ padding: 0 }}>
                <Table
                    columns={columns}
                    dataSource={list}
                    rowKey="id"
                    loading={isLoading}
                    pagination={
                        pagination
                            ? {
                                  current: page,
                                  pageSize: limit,
                                  total: pagination.total,
                                  showSizeChanger: true,
                                  onChange: (p, s) => {
                                      setPage(p);
                                      setLimit(s);
                                  },
                              }
                            : false
                    }
                />
            </Card>
        </Space>
    );
};

export default ContentListPage;
