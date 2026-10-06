import React, { useEffect, useState } from "react";
import {
    Typography,
    Space,
    Tag,
    Button,
    Row,
    Col,
    Card,
    Input,
    Spin,
    Avatar,
    Empty,
    Pagination,
} from "antd";
import {
    SearchOutlined,
    ClockCircleOutlined,
    UserOutlined,
    AppstoreOutlined,
    FileTextOutlined,
    LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { fetchPortalContents } from "../../features/portal/portal.service";
import * as categoryService from "../../features/categories/category.service";
import type { Category } from "../../features/categories/category.types";
import type { PortalContentItem } from "../../features/portal/portal.types";
import type { ContentType } from "../../features/contents/content.types";
import { getMediaUrl } from "../../utils/media";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { logout } from "../../features/auth/authSlice";
import { canAccessCms } from "../../utils/roles";

const { Title, Text, Paragraph } = Typography;

const typeColors: Record<ContentType, string> = {
    ANNOUNCEMENT: "magenta",
    POLICY: "gold",
    ARTICLE: "geekblue",
    TECH_ARTICLE: "purple",
    EVENT: "lime",
};

const filterTabs: { key: string; label: string; type?: ContentType }[] = [
    { key: "ALL", label: "All Updates" },
    { key: "ANNOUNCEMENT", label: "Announcements", type: "ANNOUNCEMENT" },
    { key: "POLICY", label: "HR & Policies", type: "POLICY" },
    { key: "ARTICLE", label: "News & Articles", type: "ARTICLE" },
    { key: "TECH_ARTICLE", label: "Tech Articles", type: "TECH_ARTICLE" },
    { key: "EVENT", label: "Events", type: "EVENT" },
];

export const PortalFeedPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const hasCmsAccess = canAccessCms(user);

    const [contents, setContents] = useState<PortalContentItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("ALL");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login", { replace: true });
    };

    useEffect(() => {
        categoryService
            .fetchCategories()
            .then((cats) => setCategories(cats.filter((c) => c.is_active)))
            .catch(() => {});
    }, []);

    const loadPortalData = async () => {
        setIsLoading(true);
        try {
            const selectedType = filterTabs.find((t) => t.key === activeTab)?.type;
            const res = await fetchPortalContents({
                search: searchTerm ? searchTerm : undefined,
                content_type: selectedType,
                category_id: selectedCategoryId || undefined,
                page,
                limit: 9,
            });
            setContents(res.data || []);
            setTotal(res.pagination?.total || 0);
        } catch {
            setContents([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPortalData();
    }, [activeTab, selectedCategoryId, page]);

    const handleSearch = () => {
        setPage(1);
        loadPortalData();
    };

    const getFirstImage = (item: PortalContentItem): string | undefined => {
        const imageBlock = item.blocks?.find((b) => b.block_type === "IMAGE" && b.content?.url);
        return imageBlock?.content?.url;
    };

    const getFirstParagraph = (item: PortalContentItem): string => {
        const paragraphBlock = item.blocks?.find((b) => b.block_type === "PARAGRAPH" && b.content?.text);
        return paragraphBlock?.content?.text?.slice(0, 140) || "Read this complete company update on the portal.";
    };

    const calculateReadTime = (item: PortalContentItem): number => {
        const totalWords = (item.blocks || []).reduce((acc, b) => {
            const text = b.content?.text || "";
            return acc + text.toString().split(/\s+/).filter(Boolean).length;
        }, 0);
        return Math.max(1, Math.ceil(totalWords / 200));
    };

    const featuredArticle = contents.length > 0 && page === 1 && activeTab === "ALL" && !searchTerm ? contents[0] : null;
    const gridArticles = featuredArticle ? contents.slice(1) : contents;

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", paddingBottom: 60 }}>
            {/* Top Employee Portal Header */}
            <div
                style={{
                    backgroundColor: "#ffffff",
                    borderBottom: "1px solid #e2e8f0",
                    padding: "16px 32px",
                    position: "sticky",
                    top: 0,
                    zIndex: 90,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                }}
            >
                <div
                    style={{
                        maxWidth: 1200,
                        margin: "0 auto",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Space align="center" size="middle">
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 8,
                                background: "linear-gradient(135deg, #1677ff 0%, #0958d9 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: 18,
                            }}
                        >
                            C
                        </div>
                        <div>
                            <Text strong style={{ fontSize: 17, color: "#0f172a", display: "block" }}>
                                Company Portal
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Internal News, Policies & Knowledge
                            </Text>
                        </div>
                    </Space>

                    <Space size="middle">
                        <Input
                            placeholder="Search published articles..."
                            prefix={<SearchOutlined />}
                            allowClear
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onPressEnter={handleSearch}
                            style={{ width: 260, borderRadius: 8 }}
                        />

                        {user && (
                            <Space size="small">
                                <Avatar
                                    size="small"
                                    icon={<UserOutlined />}
                                    style={{ backgroundColor: "#1677ff" }}
                                />
                                <Text strong style={{ fontSize: 13 }}>
                                    {user.first_name} {user.last_name}
                                </Text>
                                <Tag color={hasCmsAccess ? "blue" : "cyan"}>
                                    {user.roles?.[0] || "EMPLOYEE"}
                                </Tag>
                            </Space>
                        )}

                        {hasCmsAccess && (
                            <Button
                                type="default"
                                icon={<AppstoreOutlined />}
                                onClick={() => navigate("/")}
                                style={{ borderRadius: 8 }}
                            >
                                Admin CMS
                            </Button>
                        )}

                        <Button
                            icon={<LogoutOutlined />}
                            onClick={handleLogout}
                            style={{ borderRadius: 8 }}
                        >
                            Logout
                        </Button>
                    </Space>
                </div>
            </div>

            {/* Main Portal Canvas */}
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
                {/* Category Pills Filter Bar */}
                <div
                    style={{
                        display: "flex",
                        gap: 10,
                        overflowX: "auto",
                        paddingBottom: 20,
                        marginBottom: 16,
                    }}
                >
                    {filterTabs.map((tab) => {
                        const isSelected = activeTab === tab.key;
                        return (
                            <Button
                                key={tab.key}
                                type={isSelected ? "primary" : "default"}
                                onClick={() => {
                                    setActiveTab(tab.key);
                                    setPage(1);
                                }}
                                style={{
                                    borderRadius: 20,
                                    fontWeight: isSelected ? 600 : 400,
                                    borderColor: isSelected ? "#1677ff" : "#cbd5e1",
                                }}
                            >
                                {tab.label}
                            </Button>
                        );
                    })}
                </div>

                {/* Topic / Taxonomy Filter Pills */}
                {categories.length > 0 && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            flexWrap: "wrap",
                            marginBottom: 28,
                            padding: "10px 16px",
                            backgroundColor: "#f8fafc",
                            borderRadius: 10,
                            border: "1px solid #e2e8f0",
                        }}
                    >
                        <Text strong style={{ fontSize: 13, color: "#64748b", marginRight: 6 }}>
                            Browse Topics:
                        </Text>
                        <Tag.CheckableTag
                            checked={selectedCategoryId === null}
                            onChange={() => {
                                setSelectedCategoryId(null);
                                setPage(1);
                            }}
                            style={{
                                borderRadius: 16,
                                padding: "4px 12px",
                                fontSize: 13,
                                cursor: "pointer",
                            }}
                        >
                            All Topics
                        </Tag.CheckableTag>
                        {categories.map((cat) => (
                            <Tag.CheckableTag
                                key={cat.id}
                                checked={selectedCategoryId === cat.id}
                                onChange={(checked) => {
                                    setSelectedCategoryId(checked ? cat.id : null);
                                    setPage(1);
                                }}
                                style={{
                                    borderRadius: 16,
                                    padding: "4px 12px",
                                    fontSize: 13,
                                    cursor: "pointer",
                                }}
                            >
                                📁 {cat.name}
                            </Tag.CheckableTag>
                        ))}
                    </div>
                )}

                {isLoading ? (
                    <div style={{ textAlign: "center", padding: 80 }}>
                        <Spin size="large" tip="Loading published company updates..." />
                    </div>
                ) : contents.length === 0 ? (
                    <Card style={{ textAlign: "center", padding: 60, borderRadius: 12 }}>
                        <Empty
                            description="No published content found in this category"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        >
                            <Button type="primary" onClick={() => navigate("/content")}>
                                View Content in CMS
                            </Button>
                        </Empty>
                    </Card>
                ) : (
                    <>
                        {/* Hero Featured Article Card */}
                        {featuredArticle && (
                            <Card
                                hoverable
                                onClick={() => navigate(`/portal/article/${featuredArticle.slug}`)}
                                style={{
                                    borderRadius: 16,
                                    overflow: "hidden",
                                    marginBottom: 36,
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                                    border: "1px solid #e2e8f0",
                                }}
                                bodyStyle={{ padding: 0 }}
                            >
                                <Row>
                                    <Col xs={24} md={13}>
                                        <div
                                            style={{
                                                height: 340,
                                                overflow: "hidden",
                                                backgroundColor: "#0f172a",
                                            }}
                                        >
                                            {getFirstImage(featuredArticle) ? (
                                                <img
                                                    src={getMediaUrl(getFirstImage(featuredArticle))}
                                                    alt={featuredArticle.title}
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        height: "100%",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                                                        color: "#fff",
                                                    }}
                                                >
                                                    <FileTextOutlined style={{ fontSize: 64, opacity: 0.3 }} />
                                                </div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col xs={24} md={11} style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "32px 36px" }}>
                                        <Space style={{ marginBottom: 12 }} wrap>
                                            <Tag color={typeColors[featuredArticle.content_type] || "default"}>
                                                {featuredArticle.content_type.replace("_", " ")}
                                            </Tag>
                                            <Tag color="cyan">Featured Post</Tag>
                                            {featuredArticle.categories?.map((cat) => (
                                                <Tag key={cat.id} color="blue">
                                                    📁 {cat.name}
                                                </Tag>
                                            ))}
                                        </Space>
                                        <Title level={2} style={{ margin: "0 0 14px 0", lineHeight: 1.3, color: "#0f172a" }}>
                                            {featuredArticle.title}
                                        </Title>
                                        <Paragraph style={{ color: "#475569", fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>
                                            {getFirstParagraph(featuredArticle)}
                                        </Paragraph>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#1677ff" }} />
                                            <div>
                                                <Text strong style={{ fontSize: 14, display: "block" }}>
                                                    {featuredArticle.author?.first_name} {featuredArticle.author?.last_name}
                                                </Text>
                                                <Space split="•" style={{ color: "#64748b", fontSize: 12 }}>
                                                    <span>{new Date(featuredArticle.published_at || featuredArticle.created_at).toLocaleDateString()}</span>
                                                    <span>{calculateReadTime(featuredArticle)} min read</span>
                                                </Space>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>
                        )}

                        {/* Responsive Article Grid */}
                        <Row gutter={[24, 24]}>
                            {gridArticles.map((item) => {
                                const coverImg = getFirstImage(item);
                                const readTime = calculateReadTime(item);

                                return (
                                    <Col key={item.id} xs={24} sm={12} md={8}>
                                        <Card
                                            hoverable
                                            onClick={() => navigate(`/portal/article/${item.slug}`)}
                                            style={{
                                                borderRadius: 12,
                                                overflow: "hidden",
                                                height: "100%",
                                                display: "flex",
                                                flexDirection: "column",
                                                boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                                                border: "1px solid #e2e8f0",
                                            }}
                                            bodyStyle={{
                                                display: "flex",
                                                flexDirection: "column",
                                                flex: 1,
                                                padding: 20,
                                            }}
                                            cover={
                                                <div
                                                    style={{
                                                        height: 180,
                                                        overflow: "hidden",
                                                        backgroundColor: "#f1f5f9",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    {coverImg ? (
                                                        <img
                                                            src={getMediaUrl(coverImg)}
                                                            alt={item.title}
                                                            style={{
                                                                width: "100%",
                                                                height: "100%",
                                                                objectFit: "cover",
                                                            }}
                                                        />
                                                    ) : (
                                                        <FileTextOutlined style={{ fontSize: 40, color: "#94a3b8" }} />
                                                    )}
                                                </div>
                                            }
                                        >
                                            <div style={{ marginBottom: 8 }}>
                                                <Space size={4} wrap>
                                                    <Tag color={typeColors[item.content_type] || "default"}>
                                                        {item.content_type.replace("_", " ")}
                                                    </Tag>
                                                    {item.categories?.map((cat) => (
                                                        <Tag key={cat.id} color="blue" style={{ fontSize: 11 }}>
                                                            {cat.name}
                                                        </Tag>
                                                    ))}
                                                </Space>
                                            </div>

                                            <Title
                                                level={4}
                                                ellipsis={{ rows: 2 }}
                                                style={{
                                                    margin: "0 0 8px 0",
                                                    fontSize: 18,
                                                    fontWeight: 700,
                                                    color: "#0f172a",
                                                }}
                                            >
                                                {item.title}
                                            </Title>

                                            <Paragraph
                                                ellipsis={{ rows: 2 }}
                                                style={{
                                                    color: "#64748b",
                                                    fontSize: 14,
                                                    lineHeight: 1.6,
                                                    marginBottom: 16,
                                                    flex: 1,
                                                }}
                                            >
                                                {getFirstParagraph(item)}
                                            </Paragraph>

                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    paddingTop: 12,
                                                    borderTop: "1px solid #f1f5f9",
                                                }}
                                            >
                                                <Space size={8}>
                                                    <Avatar size="small" icon={<UserOutlined />} />
                                                    <Text style={{ fontSize: 13, color: "#334155" }}>
                                                        {item.author?.first_name} {item.author?.last_name}
                                                    </Text>
                                                </Space>
                                                <Space style={{ fontSize: 12, color: "#94a3b8" }}>
                                                    <ClockCircleOutlined />
                                                    <span>{readTime}m</span>
                                                </Space>
                                            </div>
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>

                        {/* Pagination */}
                        {total > 9 && (
                            <div style={{ textAlign: "center", marginTop: 40 }}>
                                <Pagination
                                    current={page}
                                    pageSize={9}
                                    total={total}
                                    onChange={(p) => setPage(p)}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PortalFeedPage;
