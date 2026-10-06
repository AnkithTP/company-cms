import React from "react";
import { Modal, Typography, Tag, Button, Avatar, Space } from "antd";
import {
    CalendarOutlined,
    ClockCircleOutlined,
    UserOutlined,
} from "@ant-design/icons";
import type { ContentBlock, ContentType } from "../../../features/contents/content.types";
import { getMediaUrl } from "../../../utils/media";
import { BlockRenderer } from "../../../features/editor/BlockRenderer";

const { Title, Text } = Typography;

interface BlogLivePreviewModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    slug?: string;
    contentType: ContentType;
    coverImageUrl?: string;
    blocks: ContentBlock[];
    authorName?: string;
}

export const BlogLivePreviewModal: React.FC<BlogLivePreviewModalProps> = ({
    open,
    onClose,
    title,
    contentType,
    coverImageUrl,
    blocks,
    authorName = "Company Author",
}) => {
    // Calculate estimated read time
    const totalWords = blocks.reduce((acc, block) => {
        const text =
            block.content?.text ||
            (Array.isArray(block.content?.items) ? block.content.items.join(" ") : "") ||
            "";
        return acc + text.toString().split(/\s+/).filter(Boolean).length;
    }, 0);
    const readTimeMinutes = Math.max(1, Math.ceil(totalWords / 200));

    return (
        <Modal
            open={open}
            onCancel={onClose}
            width={900}
            footer={[
                <Button key="close" type="primary" onClick={onClose}>
                    Close Preview
                </Button>,
            ]}
            title={
                <Space>
                    <Text strong>Live Webpage / Blog Post Preview</Text>
                    <Tag color="cyan">Portal View</Tag>
                </Space>
            }
        >
            <div
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: 12,
                    padding: "24px 32px",
                    maxWidth: 780,
                    margin: "0 auto",
                    fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                }}
            >
                {/* Cover Image */}
                {coverImageUrl && (
                    <div
                        style={{
                            width: "100%",
                            height: 320,
                            borderRadius: 12,
                            overflow: "hidden",
                            marginBottom: 28,
                            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                        }}
                    >
                        <img
                            src={getMediaUrl(coverImageUrl)}
                            alt="Cover"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    </div>
                )}

                {/* Meta details */}
                <div style={{ marginBottom: 16 }}>
                    <Tag color="blue" style={{ fontSize: 13, padding: "2px 10px", borderRadius: 12 }}>
                        {contentType.replace("_", " ")}
                    </Tag>
                </div>

                {/* Blog Title */}
                <Title
                    level={1}
                    style={{
                        fontSize: 34,
                        fontWeight: 800,
                        lineHeight: 1.25,
                        color: "#1a1a1a",
                        marginBottom: 16,
                    }}
                >
                    {title || "Untitled Blog Post"}
                </Title>

                {/* Author & Read Time Bar */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        paddingBottom: 20,
                        borderBottom: "1px solid #f0f0f0",
                        marginBottom: 32,
                    }}
                >
                    <Avatar
                        size={42}
                        icon={<UserOutlined />}
                        style={{ backgroundColor: "#1677ff" }}
                    />
                    <div>
                        <Text strong style={{ fontSize: 15, display: "block" }}>
                            {authorName}
                        </Text>
                        <Space size="middle" style={{ fontSize: 12, color: "#8c8c8c" }}>
                            <span>
                                <CalendarOutlined style={{ marginRight: 4 }} />
                                {new Date().toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </span>
                            <span>
                                <ClockCircleOutlined style={{ marginRight: 4 }} />
                                {readTimeMinutes} min read
                            </span>
                        </Space>
                    </div>
                </div>

                {/* Shared Blocks Content Renderer */}
                <BlockRenderer blocks={blocks} mode="preview" />
            </div>
        </Modal>
    );
};
