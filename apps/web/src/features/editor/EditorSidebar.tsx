import React, { useState } from "react";
import {
    Tabs,
    Typography,
    Input,
    Select,
    DatePicker,
    Button,
    Space,
    Tag,
    Divider,
    Switch,
} from "antd";
import {
    PictureOutlined,
    CloseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { Category } from "../categories/category.types";
import type { ContentStatus, ContentType } from "../contents/content.types";
import type { EditorBlock } from "./types";
import { getMediaUrl } from "../../utils/media";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface EditorSidebarProps {
    open: boolean;
    onClose: () => void;
    status: ContentStatus;
    authorName?: string;
    visibility: string;
    onUpdateVisibility: (vis: string) => void;
    expiresAt: string | null;
    onUpdateExpiresAt: (date: string | null) => void;
    contentType: ContentType;
    onUpdateContentType: (type: ContentType) => void;
    categories: Category[];
    selectedCategoryIds: string[];
    onUpdateCategoryIds: (ids: string[]) => void;
    onOpenCreateCategory: () => void;
    tags: string[];
    onUpdateTags: (tags: string[]) => void;
    coverImageUrl?: string;
    onOpenMediaPicker: () => void;
    onRemoveCoverImage: () => void;
    slug: string;
    onUpdateSlug: (slug: string) => void;
    seoTitle: string;
    onUpdateSeoTitle: (title: string) => void;
    seoDescription: string;
    onUpdateSeoDescription: (desc: string) => void;
    selectedBlock: EditorBlock | null;
    onUpdateSelectedBlockContent: (content: Record<string, any>) => void;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
    open,
    onClose,
    status,
    authorName = "Current User",
    visibility,
    onUpdateVisibility,
    expiresAt,
    onUpdateExpiresAt,
    contentType,
    onUpdateContentType,
    categories,
    selectedCategoryIds,
    onUpdateCategoryIds,
    onOpenCreateCategory,
    tags,
    onUpdateTags,
    coverImageUrl,
    onOpenMediaPicker,
    onRemoveCoverImage,
    slug,
    onUpdateSlug,
    seoTitle,
    onUpdateSeoTitle,
    seoDescription,
    onUpdateSeoDescription,
    selectedBlock,
    onUpdateSelectedBlockContent,
}) => {
    const [tagInput, setTagInput] = useState("");
    const [activeTab, setActiveTab] = useState("document");

    if (!open) return null;

    const handleAddTag = () => {
        const val = tagInput.trim();
        if (val && !tags.includes(val)) {
            onUpdateTags([...tags, val]);
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        onUpdateTags(tags.filter((t) => t !== tagToRemove));
    };

    return (
        <aside
            style={{
                width: 340,
                borderLeft: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                height: "calc(100vh - 56px)",
                position: "sticky",
                top: 56,
                overflowY: "auto",
                zIndex: 70,
                boxShadow: "-2px 0 8px rgba(0,0,0,0.02)",
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: "14px 16px",
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Text strong style={{ fontSize: 14 }}>
                    Settings
                </Text>
                <Button type="text" size="small" icon={<CloseOutlined />} onClick={onClose} />
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                tabBarStyle={{ padding: "0 16px", marginBottom: 0 }}
                items={[
                    {
                        key: "document",
                        label: "Document",
                        children: (
                            <div style={{ padding: 18 }}>
                                {/* Status & Author */}
                                <div style={{ marginBottom: 16 }}>
                                    <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                                        Document Status
                                    </Text>
                                    <Tag color="blue" style={{ marginTop: 4, fontWeight: 600 }}>
                                        {status}
                                    </Tag>
                                </div>

                                {/* Content Type */}
                                <div style={{ marginBottom: 16 }}>
                                    <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                                        Content Type
                                    </Text>
                                    <Select
                                        value={contentType}
                                        onChange={onUpdateContentType}
                                        style={{ width: "100%" }}
                                        options={[
                                            { value: "ANNOUNCEMENT", label: "📢 Announcement" },
                                            { value: "ARTICLE", label: "📰 News Article" },
                                            { value: "POLICY", label: "📋 HR Policy" },
                                            { value: "TECH_ARTICLE", label: "💻 Tech Article" },
                                            { value: "EVENT", label: "📅 Event" },
                                        ]}
                                    />
                                </div>

                                <div style={{ marginBottom: 16 }}>
                                    <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                                        Author
                                    </Text>
                                    <Text strong style={{ fontSize: 14 }}>
                                        {authorName}
                                    </Text>
                                </div>

                                {/* Visibility */}
                                <div style={{ marginBottom: 16 }}>
                                    <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                                        Audience Visibility
                                    </Text>
                                    <Select
                                        value={visibility}
                                        onChange={onUpdateVisibility}
                                        style={{ width: "100%" }}
                                        options={[
                                            { value: "ALL", label: "🌐 All Employees" },
                                            { value: "DEPARTMENT", label: "🏢 My Department Only" },
                                            { value: "MANAGERS", label: "🛡️ Managers & Admins" },
                                            { value: "PRIVATE", label: "🔒 Private / Draft Only" },
                                        ]}
                                    />
                                </div>

                                {/* Expiration Date */}
                                <div style={{ marginBottom: 16 }}>
                                    <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                                        Automatic Expiration Date
                                    </Text>
                                    <DatePicker
                                        style={{ width: "100%" }}
                                        value={expiresAt ? dayjs(expiresAt) : null}
                                        onChange={(d) => onUpdateExpiresAt(d ? d.toISOString() : null)}
                                        showTime
                                        placeholder="No expiration date"
                                    />
                                </div>

                                <Divider style={{ margin: "16px 0" }} />

                                {/* Categories & Taxonomy */}
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                        <Text strong style={{ fontSize: 13 }}>
                                            Categories
                                        </Text>
                                        <Button type="link" size="small" onClick={onOpenCreateCategory} style={{ padding: 0 }}>
                                            + New
                                        </Button>
                                    </div>
                                    <Select
                                        mode="multiple"
                                        placeholder="Select categories"
                                        style={{ width: "100%" }}
                                        value={selectedCategoryIds}
                                        onChange={onUpdateCategoryIds}
                                    >
                                        {categories.map((c) => (
                                            <Option key={c.id} value={c.id}>
                                                {c.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>

                                {/* Tags */}
                                <div style={{ marginBottom: 16 }}>
                                    <Text strong style={{ fontSize: 13, display: "block", marginBottom: 6 }}>
                                        Content Tags
                                    </Text>
                                    <Space.Compact style={{ width: "100%", marginBottom: 8 }}>
                                        <Input
                                            placeholder="Add tag (e.g. Leave, Q4, Remote)..."
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onPressEnter={handleAddTag}
                                        />
                                        <Button type="primary" onClick={handleAddTag}>
                                            Add
                                        </Button>
                                    </Space.Compact>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                        {tags.map((t) => (
                                            <Tag key={t} closable onClose={() => handleRemoveTag(t)}>
                                                {t}
                                            </Tag>
                                        ))}
                                    </div>
                                </div>

                                <Divider style={{ margin: "16px 0" }} />

                                {/* Featured / Cover Image */}
                                <div>
                                    <Text strong style={{ fontSize: 13, display: "block", marginBottom: 8 }}>
                                        Featured Cover Image
                                    </Text>
                                    {coverImageUrl ? (
                                        <div>
                                            <div style={{ borderRadius: 8, overflow: "hidden", marginBottom: 8, height: 130 }}>
                                                <img
                                                    src={getMediaUrl(coverImageUrl)}
                                                    alt="Cover"
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                />
                                            </div>
                                            <Space>
                                                <Button size="small" onClick={onOpenMediaPicker}>
                                                    Replace
                                                </Button>
                                                <Button size="small" danger onClick={onRemoveCoverImage}>
                                                    Remove
                                                </Button>
                                            </Space>
                                        </div>
                                    ) : (
                                        <Button icon={<PictureOutlined />} onClick={onOpenMediaPicker} block>
                                            Select Cover Image
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: "seo",
                        label: "SEO",
                        children: (
                            <div style={{ padding: 18 }}>
                                <Text strong style={{ fontSize: 13, display: "block", marginBottom: 4 }}>
                                    URL Slug
                                </Text>
                                <Input
                                    value={slug}
                                    onChange={(e) => onUpdateSlug(e.target.value)}
                                    placeholder="url-slug"
                                    style={{ marginBottom: 16 }}
                                />

                                <Text strong style={{ fontSize: 13, display: "block", marginBottom: 4 }}>
                                    Search Title
                                </Text>
                                <Input
                                    value={seoTitle}
                                    onChange={(e) => onUpdateSeoTitle(e.target.value)}
                                    placeholder="Custom title for internal search"
                                    maxLength={60}
                                    style={{ marginBottom: 16 }}
                                />

                                <Text strong style={{ fontSize: 13, display: "block", marginBottom: 4 }}>
                                    Search Meta Description
                                </Text>
                                <TextArea
                                    value={seoDescription}
                                    onChange={(e) => onUpdateSeoDescription(e.target.value)}
                                    placeholder="Brief summary displayed in search snippets..."
                                    rows={3}
                                    maxLength={160}
                                    style={{ marginBottom: 16 }}
                                />

                                <Divider style={{ margin: "16px 0" }} />

                                {/* Search Preview Snippet */}
                                <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                                    <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
                                        Search Result Preview
                                    </Text>
                                    <div style={{ color: "#1a0dab", fontSize: 15, fontWeight: 600, marginTop: 4 }}>
                                        {seoTitle || "Welcome to Our Company Portal"}
                                    </div>
                                    <div style={{ color: "#006621", fontSize: 12 }}>
                                        company.portal/{slug || "new-article"}
                                    </div>
                                    <div style={{ color: "#545454", fontSize: 12, marginTop: 4 }}>
                                        {seoDescription || "Read latest company announcements, HR policies, updates, and events directly on the company portal."}
                                    </div>
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: "block",
                        label: "Block",
                        children: (
                            <div style={{ padding: 18 }}>
                                {selectedBlock ? (
                                    <div>
                                        <Tag color="cyan" style={{ marginBottom: 12, fontWeight: 600 }}>
                                            {selectedBlock.block_type} BLOCK
                                        </Tag>

                                        {selectedBlock.block_type === "IMAGE" && (
                                            <div>
                                                <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                                                    Alt Text (Accessibility)
                                                </Text>
                                                <Input
                                                    value={selectedBlock.content.alt || ""}
                                                    onChange={(e) =>
                                                        onUpdateSelectedBlockContent({ ...selectedBlock.content, alt: e.target.value })
                                                    }
                                                    placeholder="Describe the image content..."
                                                    style={{ marginBottom: 12 }}
                                                />

                                                <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                                                    Image Caption
                                                </Text>
                                                <Input
                                                    value={selectedBlock.content.caption || ""}
                                                    onChange={(e) =>
                                                        onUpdateSelectedBlockContent({ ...selectedBlock.content, caption: e.target.value })
                                                    }
                                                    placeholder="Optional caption..."
                                                />
                                            </div>
                                        )}

                                        {selectedBlock.block_type === "BUTTON" && (
                                            <div>
                                                <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                                                    Button Text
                                                </Text>
                                                <Input
                                                    value={selectedBlock.content.text || ""}
                                                    onChange={(e) =>
                                                        onUpdateSelectedBlockContent({ ...selectedBlock.content, text: e.target.value })
                                                    }
                                                    style={{ marginBottom: 12 }}
                                                />

                                                <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                                                    Target URL
                                                </Text>
                                                <Input
                                                    value={selectedBlock.content.url || ""}
                                                    onChange={(e) =>
                                                        onUpdateSelectedBlockContent({ ...selectedBlock.content, url: e.target.value })
                                                    }
                                                    placeholder="https://..."
                                                    style={{ marginBottom: 12 }}
                                                />

                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <Text style={{ fontSize: 13 }}>Open in new tab</Text>
                                                    <Switch
                                                        checked={selectedBlock.content.openInNewTab}
                                                        onChange={(checked) =>
                                                            onUpdateSelectedBlockContent({ ...selectedBlock.content, openInNewTab: checked })
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {selectedBlock.block_type === "QUOTE" && (
                                            <div>
                                                <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                                                    Speaker / Author
                                                </Text>
                                                <Input
                                                    value={selectedBlock.content.author || ""}
                                                    onChange={(e) =>
                                                        onUpdateSelectedBlockContent({ ...selectedBlock.content, author: e.target.value })
                                                    }
                                                    placeholder="e.g. Satya Nadella"
                                                    style={{ marginBottom: 12 }}
                                                />

                                                <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                                                    Citation / Source
                                                </Text>
                                                <Input
                                                    value={selectedBlock.content.citation || ""}
                                                    onChange={(e) =>
                                                        onUpdateSelectedBlockContent({ ...selectedBlock.content, citation: e.target.value })
                                                    }
                                                    placeholder="e.g. Q4 Townhall"
                                                />
                                            </div>
                                        )}

                                        {selectedBlock.block_type === "CALLOUT" && (
                                            <div>
                                                <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                                                    Callout Title
                                                </Text>
                                                <Input
                                                    value={selectedBlock.content.title || ""}
                                                    onChange={(e) =>
                                                        onUpdateSelectedBlockContent({ ...selectedBlock.content, title: e.target.value })
                                                    }
                                                />
                                            </div>
                                        )}

                                        {selectedBlock.block_type !== "IMAGE" &&
                                            selectedBlock.block_type !== "BUTTON" &&
                                            selectedBlock.block_type !== "QUOTE" &&
                                            selectedBlock.block_type !== "CALLOUT" && (
                                                <div style={{ color: "#94a3b8", fontSize: 13 }}>
                                                    Use the floating block toolbar directly on the canvas to configure this block.
                                                </div>
                                            )}
                                    </div>
                                ) : (
                                    <div style={{ color: "#94a3b8", textAlign: "center", paddingTop: 40, fontSize: 13 }}>
                                        Click any block on the canvas to inspect its settings.
                                    </div>
                                )}
                            </div>
                        ),
                    },
                ]}
            />
        </aside>
    );
};
