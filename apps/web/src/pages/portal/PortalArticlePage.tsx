import React, { useEffect, useState } from "react";
import {
    ArrowLeftOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    UserOutlined,
    AppstoreOutlined,
    ShareAltOutlined,
} from "@ant-design/icons";
import {
    Typography as AntTypography,
    Space as AntSpace,
    Tag as AntTag,
    Button as AntButton,
    Divider as AntDivider,
    Avatar as AntAvatar,
    Spin as AntSpin,
    Card as AntCard,
    Empty as AntEmpty,
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPortalContentBySlug } from "../../features/portal/portal.service";
import type { PortalContentItem } from "../../features/portal/portal.types";
import type { ContentType } from "../../features/contents/content.types";
import { getMediaUrl } from "../../utils/media";
import { useAppSelector } from "../../hooks/redux";
import { canAccessCms } from "../../utils/roles";
import { BlockRenderer } from "../../features/editor/BlockRenderer";

const { Title, Text } = AntTypography;

const typeColors: Record<ContentType, string> = {
    ANNOUNCEMENT: "magenta",
    POLICY: "gold",
    ARTICLE: "geekblue",
    TECH_ARTICLE: "purple",
    EVENT: "lime",
};

export const PortalArticlePage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.auth.user);
    const hasCmsAccess = canAccessCms(user);

    const [content, setContent] = useState<PortalContentItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        setIsLoading(true);
        fetchPortalContentBySlug(slug)
            .then((res) => {
                setContent(res.data);
                setError(null);
            })
            .catch((err) => {
                setError(err.response?.data?.message || "Published content not found");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [slug]);

    if (isLoading) {
        return (
            <div style={{ textAlign: "center", padding: "120px 20px", minHeight: "100vh", backgroundColor: "#fff" }}>
                <AntSpin size="large" tip="Loading published article..." />
            </div>
        );
    }

    if (error || !content) {
        return (
            <div style={{ padding: "80px 20px", minHeight: "100vh", backgroundColor: "#f8fafc", textAlign: "center" }}>
                <AntCard style={{ maxWidth: 600, margin: "0 auto", borderRadius: 12 }}>
                    <AntEmpty description={error || "Article not found or not published yet"} />
                    <AntButton type="primary" onClick={() => navigate("/portal")} style={{ marginTop: 16 }}>
                        Return to Company Portal
                    </AntButton>
                </AntCard>
            </div>
        );
    }

    // Read time calculation
    const totalWords = (content.blocks || []).reduce((acc, b) => {
        const text =
            b.content?.text ||
            (Array.isArray(b.content?.items) ? b.content.items.join(" ") : "") ||
            "";
        return acc + text.toString().split(/\s+/).filter(Boolean).length;
    }, 0);
    const readTimeMinutes = Math.max(1, Math.ceil(totalWords / 200));

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
            {/* Top Navigation Bar */}
            <div
                style={{
                    borderBottom: "1px solid #e2e8f0",
                    padding: "14px 32px",
                    position: "sticky",
                    top: 0,
                    backgroundColor: "#ffffff",
                    zIndex: 100,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                }}
            >
                <div
                    style={{
                        maxWidth: 860,
                        margin: "0 auto",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <AntButton
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate("/portal")}
                        style={{ fontWeight: 500 }}
                    >
                        Back to Portal
                    </AntButton>

                    <AntSpace size="middle">
                        <AntButton
                            size="small"
                            icon={<ShareAltOutlined />}
                            onClick={() => {
                                navigator.clipboard?.writeText(window.location.href);
                                alert("Link copied to clipboard!");
                            }}
                        >
                            Share
                        </AntButton>
                        {hasCmsAccess && (
                            <AntButton
                                size="small"
                                type="default"
                                icon={<AppstoreOutlined />}
                                onClick={() => navigate(`/content/${content.id}`)}
                            >
                                Edit in CMS
                            </AntButton>
                        )}
                    </AntSpace>
                </div>
            </div>

            {/* Article Container */}
            <div
                style={{
                    maxWidth: 780,
                    margin: "0 auto",
                    padding: "48px 24px 80px 24px",
                    fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                }}
            >
                {/* Cover Image */}
                {content.cover_image_url && (
                    <div
                        style={{
                            width: "100%",
                            height: 380,
                            borderRadius: 14,
                            overflow: "hidden",
                            marginBottom: 36,
                            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                        }}
                    >
                        <img
                            src={getMediaUrl(content.cover_image_url)}
                            alt="Cover"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    </div>
                )}

                {/* Categories & Type Tag */}
                <div style={{ marginBottom: 16 }}>
                    <AntTag
                        color={typeColors[content.content_type] || "blue"}
                        style={{ fontSize: 13, padding: "2px 10px", borderRadius: 12 }}
                    >
                        {content.content_type?.replace("_", " ")}
                    </AntTag>
                    {content.categories && content.categories.map((c) => (
                        <AntTag key={c.id} style={{ borderRadius: 12 }}>
                            {c.name}
                        </AntTag>
                    ))}
                </div>

                {/* Main Article Title */}
                <Title
                    level={1}
                    style={{
                        fontSize: 38,
                        fontWeight: 800,
                        lineHeight: 1.25,
                        color: "#0f172a",
                        marginBottom: 20,
                    }}
                >
                    {content.title}
                </Title>

                {/* Author Info Bar */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        paddingBottom: 24,
                        borderBottom: "1px solid #f1f5f9",
                        marginBottom: 36,
                    }}
                >
                    <AntAvatar
                        size={48}
                        icon={<UserOutlined />}
                        style={{ backgroundColor: "#1677ff", fontSize: 20 }}
                    />
                    <div>
                        <Text strong style={{ fontSize: 16, display: "block", color: "#1e293b" }}>
                            {content.author
                                ? `${content.author.first_name} ${content.author.last_name}`
                                : "Company Editorial"}
                        </Text>
                        <AntSpace split="•" style={{ color: "#64748b", fontSize: 13 }}>
                            <span>
                                <CalendarOutlined style={{ marginRight: 4 }} />
                                {new Date(content.published_at || content.created_at).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                            <span>
                                <ClockCircleOutlined style={{ marginRight: 4 }} />
                                {readTimeMinutes} min read
                            </span>
                        </AntSpace>
                    </div>
                </div>

                {/* Shared Content Blocks Renderer (Guarantees 100% visual parity with editor & preview) */}
                <BlockRenderer blocks={content.blocks || []} mode="published" />

                <AntDivider style={{ margin: "48px 0" }} />

                {/* Bottom Author Card */}
                <AntCard style={{ borderRadius: 12, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <AntAvatar size={56} icon={<UserOutlined />} style={{ backgroundColor: "#1677ff" }} />
                        <div>
                            <Text strong style={{ fontSize: 16, display: "block" }}>
                                {content.author
                                    ? `${content.author.first_name} ${content.author.last_name}`
                                    : "Company Contributor"}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 13 }}>
                                Published to Company Internal Portal on {new Date(content.published_at || content.created_at).toLocaleDateString()}
                            </Text>
                        </div>
                    </div>
                </AntCard>
            </div>
        </div>
    );
};

export default PortalArticlePage;
