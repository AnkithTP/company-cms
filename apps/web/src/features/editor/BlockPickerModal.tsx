import React, { useState, useMemo } from "react";
import { Modal, Input, Typography, Tag, Tabs, Card, Row, Col } from "antd";
import {
    SearchOutlined,
    FileTextOutlined,
    FontSizeOutlined,
    PictureOutlined,
    AppstoreOutlined,
    VideoCameraOutlined,
    CommentOutlined,
    AlertOutlined,
    UnorderedListOutlined,
    TableOutlined,
    LineOutlined,
    ColumnHeightOutlined,
    CompassOutlined,
    SplitCellsOutlined,
    MenuUnfoldOutlined,
    FilePdfOutlined,
    CodeOutlined,
    LayoutOutlined,
} from "@ant-design/icons";
import { BLOCK_DEFINITIONS, CONTENT_TEMPLATES } from "./blocks/registry";
import type { ContentTemplate } from "./types";
import type { BlockType } from "../contents/content.types";

const { Text } = Typography;

const iconMap: Record<string, React.ReactNode> = {
    FileTextOutlined: <FileTextOutlined style={{ fontSize: 22, color: "#1677ff" }} />,
    FontSizeOutlined: <FontSizeOutlined style={{ fontSize: 22, color: "#0284c7" }} />,
    PictureOutlined: <PictureOutlined style={{ fontSize: 22, color: "#10b981" }} />,
    AppstoreOutlined: <AppstoreOutlined style={{ fontSize: 22, color: "#059669" }} />,
    VideoCameraOutlined: <VideoCameraOutlined style={{ fontSize: 22, color: "#f59e0b" }} />,
    CommentOutlined: <CommentOutlined style={{ fontSize: 22, color: "#8b5cf6" }} />,
    AlertOutlined: <AlertOutlined style={{ fontSize: 22, color: "#f97316" }} />,
    UnorderedListOutlined: <UnorderedListOutlined style={{ fontSize: 22, color: "#6366f1" }} />,
    TableOutlined: <TableOutlined style={{ fontSize: 22, color: "#06b6d4" }} />,
    LineOutlined: <LineOutlined style={{ fontSize: 22, color: "#94a3b8" }} />,
    ColumnHeightOutlined: <ColumnHeightOutlined style={{ fontSize: 22, color: "#64748b" }} />,
    CompassOutlined: <CompassOutlined style={{ fontSize: 22, color: "#2563eb" }} />,
    SplitCellsOutlined: <SplitCellsOutlined style={{ fontSize: 22, color: "#0d9488" }} />,
    MenuUnfoldOutlined: <MenuUnfoldOutlined style={{ fontSize: 22, color: "#d97706" }} />,
    FilePdfOutlined: <FilePdfOutlined style={{ fontSize: 22, color: "#ef4444" }} />,
    CodeOutlined: <CodeOutlined style={{ fontSize: 22, color: "#334155" }} />,
};

interface BlockPickerModalProps {
    open: boolean;
    onClose: () => void;
    onSelectBlock: (type: BlockType) => void;
    onSelectTemplate?: (template: ContentTemplate) => void;
    targetIndex?: number | null;
}

export const BlockPickerModal: React.FC<BlockPickerModalProps> = ({
    open,
    onClose,
    onSelectBlock,
    onSelectTemplate,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

    const categories: { key: string; label: string }[] = [
        { key: "ALL", label: "All Blocks" },
        { key: "TEXT", label: "Text" },
        { key: "MEDIA", label: "Media" },
        { key: "DESIGN", label: "Design & Layout" },
        { key: "INTERACTIVE", label: "Interactive" },
    ];

    const filteredBlocks = useMemo(() => {
        return BLOCK_DEFINITIONS.filter((b) => {
            const matchesCategory = selectedCategory === "ALL" || b.category === selectedCategory;
            const query = searchTerm.toLowerCase().trim();
            if (!query) return matchesCategory;

            const matchesQuery =
                b.label.toLowerCase().includes(query) ||
                b.description.toLowerCase().includes(query) ||
                (b.slashAlias && b.slashAlias.some((a) => a.toLowerCase().includes(query)));

            return matchesCategory && matchesQuery;
        });
    }, [selectedCategory, searchTerm]);

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={680}
            title={
                <div style={{ paddingBottom: 8 }}>
                    <Text strong style={{ fontSize: 18 }}>
                        Add a Block
                    </Text>
                    <div style={{ fontSize: 13, color: "#64748b", fontWeight: 400 }}>
                        Select a content element or full document template to insert
                    </div>
                </div>
            }
            styles={{ body: { maxHeight: "72vh", overflowY: "auto", padding: "12px 20px" } }}
        >
            <Input
                placeholder="Search blocks (e.g. heading, image, callout, quote, table)..."
                prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                size="large"
                style={{ borderRadius: 8, marginBottom: 16 }}
                allowClear
            />

            <Tabs
                defaultActiveKey="blocks"
                items={[
                    {
                        key: "blocks",
                        label: <span><AppstoreOutlined /> Content Blocks</span>,
                        children: (
                            <div>
                                {/* Category Pills */}
                                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 8 }}>
                                    {categories.map((cat) => (
                                        <Tag.CheckableTag
                                            key={cat.key}
                                            checked={selectedCategory === cat.key}
                                            onChange={() => setSelectedCategory(cat.key)}
                                            style={{
                                                padding: "4px 14px",
                                                borderRadius: 16,
                                                fontSize: 13,
                                                cursor: "pointer",
                                            }}
                                        >
                                            {cat.label}
                                        </Tag.CheckableTag>
                                    ))}
                                </div>

                                {/* Blocks Grid */}
                                <Row gutter={[12, 12]} style={{ marginTop: 8 }}>
                                    {filteredBlocks.map((block) => (
                                        <Col key={block.type} xs={24} sm={12}>
                                            <div
                                                onClick={() => {
                                                    onSelectBlock(block.type);
                                                    onClose();
                                                }}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    gap: 12,
                                                    padding: 14,
                                                    borderRadius: 10,
                                                    border: "1px solid #e2e8f0",
                                                    cursor: "pointer",
                                                    transition: "all 0.18s ease",
                                                    backgroundColor: "#ffffff",
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = "#1677ff";
                                                    e.currentTarget.style.backgroundColor = "#f0f7ff";
                                                    e.currentTarget.style.transform = "translateY(-1px)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = "#e2e8f0";
                                                    e.currentTarget.style.backgroundColor = "#ffffff";
                                                    e.currentTarget.style.transform = "none";
                                                }}
                                            >
                                                <div style={{ marginTop: 2 }}>{iconMap[block.icon] || <FileTextOutlined style={{ fontSize: 20 }} />}</div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>
                                                        {block.label}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, lineHeight: 1.4 }}>
                                                        {block.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>

                                {filteredBlocks.length === 0 && (
                                    <div style={{ padding: "32px 0", textAlign: "center", color: "#94a3b8" }}>
                                        No blocks match your search query "{searchTerm}"
                                    </div>
                                )}
                            </div>
                        ),
                    },
                    {
                        key: "templates",
                        label: <span><LayoutOutlined /> Content Templates</span>,
                        children: (
                            <Row gutter={[14, 14]}>
                                {CONTENT_TEMPLATES.map((tmpl) => (
                                    <Col key={tmpl.id} xs={24}>
                                        <Card
                                            hoverable
                                            onClick={() => {
                                                if (onSelectTemplate) {
                                                    onSelectTemplate(tmpl);
                                                    onClose();
                                                }
                                            }}
                                            style={{ borderRadius: 10, borderColor: "#cbd5e1" }}
                                            bodyStyle={{ padding: "16px 20px" }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <div>
                                                    <Text strong style={{ fontSize: 15, color: "#0f172a" }}>
                                                        {tmpl.name}
                                                    </Text>
                                                    <Tag color="blue" style={{ marginLeft: 10 }}>
                                                        {tmpl.contentType}
                                                    </Tag>
                                                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                                                        {tmpl.description}
                                                    </div>
                                                </div>
                                                <Tag color="cyan">Insert Template</Tag>
                                            </div>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        ),
                    },
                ]}
            />
        </Modal>
    );
};
