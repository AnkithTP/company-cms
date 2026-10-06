import React, { useState } from "react";
import { Modal, Radio, Tag, Space, Typography } from "antd";
import { DesktopOutlined, TabletOutlined, MobileOutlined } from "@ant-design/icons";
import type { PreviewDevice, EditorBlock } from "./types";
import type { ContentType } from "../contents/content.types";
import { BlockRenderer } from "./BlockRenderer";
import { getMediaUrl } from "../../utils/media";

const { Title, Text, Paragraph } = Typography;

interface ResponsivePreviewModalProps {
    open: boolean;
    initialDevice?: PreviewDevice;
    onClose: () => void;
    title: string;
    excerpt?: string;
    coverImageUrl?: string;
    contentType: ContentType;
    authorName?: string;
    blocks: EditorBlock[];
}

export const ResponsivePreviewModal: React.FC<ResponsivePreviewModalProps> = ({
    open,
    initialDevice = "desktop",
    onClose,
    title,
    excerpt,
    coverImageUrl,
    contentType,
    authorName = "Company Author",
    blocks,
}) => {
    const [device, setDevice] = useState<PreviewDevice>(initialDevice);

    const viewportWidths: Record<PreviewDevice, string | number> = {
        desktop: "100%",
        tablet: 768,
        mobile: 375,
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width="95vw"
            style={{ top: 20 }}
            styles={{ body: { height: "86vh", overflowY: "auto", backgroundColor: "#f1f5f9", padding: 0 } }}
            title={
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: 32 }}>
                    <Space size="middle">
                        <Text strong style={{ fontSize: 16 }}>Live Portal Preview</Text>
                        <Tag color="cyan">Published View</Tag>
                    </Space>
                    <Radio.Group
                        value={device}
                        onChange={(e) => setDevice(e.target.value)}
                        buttonStyle="solid"
                        size="small"
                    >
                        <Radio.Button value="desktop">
                            <DesktopOutlined /> Desktop
                        </Radio.Button>
                        <Radio.Button value="tablet">
                            <TabletOutlined /> Tablet
                        </Radio.Button>
                        <Radio.Button value="mobile">
                            <MobileOutlined /> Mobile
                        </Radio.Button>
                    </Radio.Group>
                </div>
            }
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "32px 16px",
                    minHeight: "100%",
                    transition: "all 0.3s ease",
                }}
            >
                <div
                    style={{
                        width: viewportWidths[device],
                        maxWidth: "100%",
                        backgroundColor: "#ffffff",
                        borderRadius: device === "desktop" ? 0 : 16,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                        padding: device === "mobile" ? "24px 20px" : "40px 48px",
                        transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                        border: device !== "desktop" ? "8px solid #0f172a" : "none",
                    }}
                >
                    {/* Cover image */}
                    {coverImageUrl && (
                        <div
                            style={{
                                width: "100%",
                                height: device === "mobile" ? 180 : 320,
                                borderRadius: 12,
                                overflow: "hidden",
                                marginBottom: 24,
                            }}
                        >
                            <img
                                src={getMediaUrl(coverImageUrl)}
                                alt="Cover"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        </div>
                    )}

                    {/* Metadata */}
                    <div style={{ marginBottom: 12 }}>
                        <Tag color="blue">{contentType.replace("_", " ")}</Tag>
                        <Text type="secondary" style={{ fontSize: 13, marginLeft: 8 }}>
                            By {authorName} • Just now
                        </Text>
                    </div>

                    {/* Title */}
                    <Title level={1} style={{ fontSize: device === "mobile" ? 24 : 36, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>
                        {title || "Untitled Document"}
                    </Title>

                    {/* Excerpt */}
                    {excerpt && (
                        <Paragraph style={{ fontSize: 17, color: "#64748b", fontStyle: "italic", marginBottom: 32 }}>
                            {excerpt}
                        </Paragraph>
                    )}

                    <div style={{ borderBottom: "1px solid #f1f5f9", marginBottom: 28 }} />

                    {/* Shared Block Renderer in Preview Mode */}
                    <BlockRenderer blocks={blocks} mode="preview" />
                </div>
            </div>
        </Modal>
    );
};
