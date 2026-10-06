import React, { useState } from "react";
import { Button, Input, Space, Typography } from "antd";
import {
    PlusOutlined,
    PictureOutlined,
    CloseOutlined,
    CameraOutlined,
} from "@ant-design/icons";
import type { EditorBlock } from "./types";
import type { BlockType } from "../contents/content.types";
import { BlockToolbar } from "./BlockToolbar";
import { SlashCommand } from "./SlashCommand";
import { getMediaUrl } from "../../utils/media";

const { TextArea } = Input;
const { Text } = Typography;

interface EditorCanvasProps {
    title: string;
    onUpdateTitle: (title: string) => void;
    excerpt: string;
    onUpdateExcerpt: (excerpt: string) => void;
    coverImageUrl?: string;
    onOpenMediaPicker: () => void;
    onRemoveCover: () => void;
    blocks: EditorBlock[];
    selectedBlockId: string | null;
    onSelectBlock: (id: string | null) => void;
    onUpdateBlockContent: (id: string, content: Record<string, any>) => void;
    onMoveBlock: (fromIndex: number, toIndex: number) => void;
    onDuplicateBlock: (id: string) => void;
    onDeleteBlock: (id: string) => void;
    onTransformBlock: (id: string, newType: BlockType) => void;
    onInsertBlock: (type: BlockType, targetIndex?: number) => void;
    onOpenBlockPicker: (targetIndex?: number) => void;
    onSelectMediaForBlock?: (blockId: string) => void;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
    title,
    onUpdateTitle,
    excerpt,
    onUpdateExcerpt,
    coverImageUrl,
    onOpenMediaPicker,
    onRemoveCover,
    blocks,
    selectedBlockId,
    onSelectBlock,
    onUpdateBlockContent,
    onMoveBlock,
    onDuplicateBlock,
    onDeleteBlock,
    onTransformBlock,
    onInsertBlock,
    onOpenBlockPicker,
    onSelectMediaForBlock,
}) => {
    const [slashState, setSlashState] = useState<{
        open: boolean;
        query: string;
        blockId: string;
        position: { top: number; left: number };
    }>({
        open: false,
        query: "",
        blockId: "",
        position: { top: 0, left: 0 },
    });

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [hoverInsertIndex, setHoverInsertIndex] = useState<number | null>(null);

    // Drag and drop handlers
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== targetIndex) {
            onMoveBlock(draggedIndex, targetIndex);
        }
        setDraggedIndex(null);
    };

    // Slash command trigger
    const handleTextKeyDown = (
        e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>,
        block: EditorBlock,
        index: number
    ) => {
        if (e.key === "Enter" && !e.shiftKey && block.block_type === "PARAGRAPH") {
            e.preventDefault();
            onInsertBlock("PARAGRAPH", index + 1);
        }
    };

    const handleTextChange = (
        textVal: string,
        block: EditorBlock,
        targetElement: HTMLElement
    ) => {
        onUpdateBlockContent(block.id, { ...block.content, text: textVal });

        // Check if slash command should open
        if (textVal.startsWith("/")) {
            const rect = targetElement.getBoundingClientRect();
            setSlashState({
                open: true,
                query: textVal.slice(1),
                blockId: block.id,
                position: { top: rect.bottom + window.scrollY, left: rect.left + window.scrollX },
            });
        } else if (slashState.open) {
            setSlashState((prev) => ({ ...prev, open: false }));
        }
    };

    return (
        <div
            className="gutenberg-canvas-container"
            style={{
                flex: 1,
                minHeight: "calc(100vh - 56px)",
                backgroundColor: "#ffffff",
                padding: "36px 40px 140px 40px",
                overflowY: "auto",
            }}
            onClick={(e) => {
                // If clicked on canvas background, deselect block
                if (e.target === e.currentTarget) {
                    onSelectBlock(null);
                }
            }}
        >
            <div style={{ maxWidth: 840, margin: "0 auto", position: "relative" }}>
                {/* 1. Cover Image Banner */}
                {coverImageUrl ? (
                    <div
                        style={{
                            position: "relative",
                            width: "100%",
                            height: 280,
                            borderRadius: 12,
                            overflow: "hidden",
                            marginBottom: 28,
                            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                        }}
                    >
                        <img
                            src={getMediaUrl(coverImageUrl)}
                            alt="Cover Banner"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                bottom: 12,
                                right: 12,
                                display: "flex",
                                gap: 8,
                                background: "rgba(0, 0, 0, 0.55)",
                                padding: "6px 10px",
                                borderRadius: 8,
                                backdropFilter: "blur(4px)",
                            }}
                        >
                            <Button size="small" type="primary" ghost icon={<CameraOutlined />} onClick={onOpenMediaPicker}>
                                Change Cover
                            </Button>
                            <Button size="small" danger icon={<CloseOutlined />} onClick={onRemoveCover}>
                                Remove
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div style={{ marginBottom: 20 }}>
                        <Button
                            type="dashed"
                            icon={<PictureOutlined />}
                            onClick={onOpenMediaPicker}
                            style={{
                                color: "#64748b",
                                borderColor: "#cbd5e1",
                                borderRadius: 8,
                                fontSize: 13,
                            }}
                        >
                            Add Cover Image
                        </Button>
                    </div>
                )}

                {/* 2. Document Title Input */}
                <TextArea
                    value={title}
                    onChange={(e) => onUpdateTitle(e.target.value)}
                    placeholder="Add title..."
                    autoSize={{ minRows: 1, maxRows: 3 }}
                    style={{
                        fontSize: 36,
                        fontWeight: 700,
                        color: "#0f172a",
                        border: "none",
                        boxShadow: "none",
                        padding: 0,
                        lineHeight: 1.25,
                        marginBottom: 12,
                        resize: "none",
                    }}
                />

                {/* 3. Document Excerpt / Summary */}
                <TextArea
                    value={excerpt}
                    onChange={(e) => onUpdateExcerpt(e.target.value)}
                    placeholder="Write a brief excerpt or summary for this publication..."
                    autoSize={{ minRows: 1, maxRows: 2 }}
                    style={{
                        fontSize: 16,
                        color: "#64748b",
                        border: "none",
                        boxShadow: "none",
                        padding: 0,
                        lineHeight: 1.5,
                        marginBottom: 32,
                        resize: "none",
                    }}
                />

                <div style={{ borderBottom: "1px solid #f1f5f9", marginBottom: 32 }} />

                {/* 4. Blocks Canvas List */}
                <div className="gutenberg-blocks-list" style={{ minHeight: 200 }}>
                    {blocks.map((block, index) => {
                        const isSelected = selectedBlockId === block.id;

                        return (
                            <React.Fragment key={block.id}>
                                {/* In-Between Insert Button (appears on hover) */}
                                <div
                                    onMouseEnter={() => setHoverInsertIndex(index)}
                                    onMouseLeave={() => setHoverInsertIndex(null)}
                                    style={{
                                        height: 16,
                                        position: "relative",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "-8px 0",
                                        zIndex: 10,
                                    }}
                                >
                                    {hoverInsertIndex === index && (
                                        <Button
                                            size="small"
                                            shape="circle"
                                            icon={<PlusOutlined style={{ fontSize: 11 }} />}
                                            type="primary"
                                            onClick={() => onOpenBlockPicker(index)}
                                            style={{
                                                boxShadow: "0 2px 8px rgba(22, 119, 255, 0.35)",
                                                transform: "scale(0.85)",
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Main Block Element */}
                                <div
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, index)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectBlock(block.id);
                                    }}
                                    style={{
                                        position: "relative",
                                        padding: "10px 14px",
                                        borderRadius: 8,
                                        margin: "6px 0",
                                        border: isSelected ? "1.5px solid #1677ff" : "1.5px solid transparent",
                                        boxShadow: isSelected ? "0 0 0 3px rgba(22, 119, 255, 0.12)" : "none",
                                        transition: "all 0.15s ease",
                                        backgroundColor: isSelected ? "#fcfdff" : "transparent",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.border = "1.5px dashed #cbd5e1";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.border = "1.5px solid transparent";
                                        }
                                    }}
                                >
                                    {/* Contextual Floating Block Toolbar */}
                                    {isSelected && (
                                        <BlockToolbar
                                            block={block}
                                            onUpdateContent={(c) => onUpdateBlockContent(block.id, c)}
                                            onMoveUp={() => onMoveBlock(index, index - 1)}
                                            onMoveDown={() => onMoveBlock(index, index + 1)}
                                            onDuplicate={() => onDuplicateBlock(block.id)}
                                            onDelete={() => onDeleteBlock(block.id)}
                                            onTransform={(newType) => onTransformBlock(block.id, newType)}
                                            onAddBlockAfter={() => onInsertBlock("PARAGRAPH", index + 1)}
                                            canMoveUp={index > 0}
                                            canMoveDown={index < blocks.length - 1}
                                        />
                                    )}

                                    {/* Render Block Content Based on Type */}
                                    {block.block_type === "HEADING" && (
                                        <Input
                                            value={block.content.text || ""}
                                            onChange={(e) =>
                                                onUpdateBlockContent(block.id, { ...block.content, text: e.target.value })
                                            }
                                            placeholder="Heading..."
                                            style={{
                                                fontSize:
                                                    block.content.level === 1 ? 28 : block.content.level === 3 ? 20 : 24,
                                                fontWeight: 700,
                                                color: "#0f172a",
                                                border: "none",
                                                boxShadow: "none",
                                                padding: 0,
                                                textAlign: block.content.align || "left",
                                            }}
                                        />
                                    )}

                                    {block.block_type === "PARAGRAPH" && (
                                        <TextArea
                                            value={block.content.text || ""}
                                            onChange={(e) => handleTextChange(e.target.value, block, e.target)}
                                            onKeyDown={(e) => handleTextKeyDown(e, block, index)}
                                            placeholder="Type '/' for commands or start writing..."
                                            autoSize={{ minRows: 1 }}
                                            style={{
                                                fontSize: 16,
                                                lineHeight: 1.75,
                                                color: "#334155",
                                                border: "none",
                                                boxShadow: "none",
                                                padding: 0,
                                                textAlign: block.content.align || "left",
                                                resize: "none",
                                            }}
                                        />
                                    )}

                                    {block.block_type === "QUOTE" && (
                                        <div style={{ borderLeft: "4px solid #1677ff", paddingLeft: 16 }}>
                                            <TextArea
                                                value={block.content.text || ""}
                                                onChange={(e) =>
                                                    onUpdateBlockContent(block.id, { ...block.content, text: e.target.value })
                                                }
                                                placeholder="Write a notable quote..."
                                                autoSize={{ minRows: 1 }}
                                                style={{
                                                    fontSize: 17,
                                                    fontStyle: "italic",
                                                    color: "#1e293b",
                                                    border: "none",
                                                    boxShadow: "none",
                                                    padding: 0,
                                                }}
                                            />
                                            <Input
                                                value={block.content.author || ""}
                                                onChange={(e) =>
                                                    onUpdateBlockContent(block.id, { ...block.content, author: e.target.value })
                                                }
                                                placeholder="Speaker / Citation"
                                                style={{ fontSize: 13, border: "none", boxShadow: "none", padding: 0, color: "#64748b", marginTop: 4 }}
                                            />
                                        </div>
                                    )}

                                    {block.block_type === "CALLOUT" && (
                                        <div
                                            style={{
                                                backgroundColor:
                                                    block.content.intent === "success"
                                                        ? "#f0fdf4"
                                                        : block.content.intent === "warning"
                                                          ? "#fffbeb"
                                                          : block.content.intent === "danger"
                                                            ? "#fef2f2"
                                                            : "#eff6ff",
                                                border: `1px solid ${
                                                    block.content.intent === "success"
                                                        ? "#bbf7d0"
                                                        : block.content.intent === "warning"
                                                          ? "#fde68a"
                                                          : block.content.intent === "danger"
                                                            ? "#fecaca"
                                                            : "#bfdbfe"
                                                }`,
                                                borderRadius: 8,
                                                padding: 14,
                                            }}
                                        >
                                            <Input
                                                value={block.content.title || ""}
                                                onChange={(e) =>
                                                    onUpdateBlockContent(block.id, { ...block.content, title: e.target.value })
                                                }
                                                placeholder="Callout Title..."
                                                style={{ fontWeight: 600, fontSize: 14, border: "none", boxShadow: "none", padding: 0, marginBottom: 4 }}
                                            />
                                            <TextArea
                                                value={block.content.text || ""}
                                                onChange={(e) =>
                                                    onUpdateBlockContent(block.id, { ...block.content, text: e.target.value })
                                                }
                                                placeholder="Callout description / details..."
                                                autoSize={{ minRows: 1 }}
                                                style={{ fontSize: 13, border: "none", boxShadow: "none", padding: 0, color: "#334155" }}
                                            />
                                        </div>
                                    )}

                                    {block.block_type === "IMAGE" && (
                                        <div style={{ textAlign: block.content.align || "center" }}>
                                            {block.content.url ? (
                                                <div>
                                                    <div style={{ borderRadius: 10, overflow: "hidden", display: "inline-block", maxWidth: "100%" }}>
                                                        <img
                                                            src={getMediaUrl(block.content.url)}
                                                            alt="Block Media"
                                                            style={{ maxHeight: 380, objectFit: "cover", width: "100%" }}
                                                        />
                                                    </div>
                                                    <Input
                                                        value={block.content.caption || ""}
                                                        onChange={(e) =>
                                                            onUpdateBlockContent(block.id, { ...block.content, caption: e.target.value })
                                                        }
                                                        placeholder="Add caption..."
                                                        style={{ textAlign: "center", fontSize: 12, color: "#64748b", border: "none", boxShadow: "none", marginTop: 4 }}
                                                    />
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() => onSelectMediaForBlock && onSelectMediaForBlock(block.id)}
                                                    style={{
                                                        padding: 32,
                                                        border: "2px dashed #cbd5e1",
                                                        borderRadius: 10,
                                                        cursor: "pointer",
                                                        textAlign: "center",
                                                        backgroundColor: "#f8fafc",
                                                    }}
                                                >
                                                    <PictureOutlined style={{ fontSize: 32, color: "#1677ff", marginBottom: 8 }} />
                                                    <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>
                                                        Select or Upload Image
                                                    </div>
                                                    <div style={{ fontSize: 12, color: "#64748b" }}>
                                                        Choose from company media library or upload new asset
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {block.block_type === "LIST" && (
                                        <div>
                                            {(block.content.items || []).map((item: string, i: number) => (
                                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                                    <span style={{ color: "#64748b" }}>
                                                        {block.content.style === "numbered" ? `${i + 1}.` : "•"}
                                                    </span>
                                                    <Input
                                                        value={item}
                                                        onChange={(e) => {
                                                            const newItems = [...block.content.items];
                                                            newItems[i] = e.target.value;
                                                            onUpdateBlockContent(block.id, { ...block.content, items: newItems });
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                e.preventDefault();
                                                                const newItems = [...block.content.items];
                                                                newItems.splice(i + 1, 0, "");
                                                                onUpdateBlockContent(block.id, { ...block.content, items: newItems });
                                                            }
                                                        }}
                                                        placeholder="List item..."
                                                        style={{ border: "none", boxShadow: "none", padding: 0, fontSize: 15 }}
                                                    />
                                                </div>
                                            ))}
                                            <Button
                                                size="small"
                                                type="link"
                                                onClick={() => {
                                                    const items = [...(block.content.items || []), ""];
                                                    onUpdateBlockContent(block.id, { ...block.content, items });
                                                }}
                                                style={{ padding: 0, fontSize: 12 }}
                                            >
                                                + Add Item
                                            </Button>
                                        </div>
                                    )}

                                    {block.block_type === "DIVIDER" && (
                                        <div style={{ padding: "8px 0" }}>
                                            <div
                                                style={{
                                                    borderTop: `1px ${block.content.style || "solid"} #cbd5e1`,
                                                    width: "100%",
                                                }}
                                            />
                                        </div>
                                    )}

                                    {block.block_type === "BUTTON" && (
                                        <div style={{ textAlign: block.content.align || "left" }}>
                                            <Button
                                                type={block.content.variant === "primary" ? "primary" : "default"}
                                                size="large"
                                                style={{ borderRadius: 8, fontWeight: 600 }}
                                            >
                                                {block.content.text || "Click Here"}
                                            </Button>
                                        </div>
                                    )}

                                    {block.block_type === "TABLE" && (
                                        <div style={{ overflowX: "auto" }}>
                                            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #e2e8f0" }}>
                                                <thead>
                                                    <tr style={{ background: "#f8fafc" }}>
                                                        {(block.content.headers || []).map((h: string, hIdx: number) => (
                                                            <th key={hIdx} style={{ padding: "8px 12px", border: "1px solid #e2e8f0" }}>
                                                                <Input
                                                                    value={h}
                                                                    onChange={(e) => {
                                                                        const headers = [...block.content.headers];
                                                                        headers[hIdx] = e.target.value;
                                                                        onUpdateBlockContent(block.id, { ...block.content, headers });
                                                                    }}
                                                                    style={{ border: "none", boxShadow: "none", fontWeight: 600, padding: 0 }}
                                                                />
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(block.content.rows || []).map((row: string[], rIdx: number) => (
                                                        <tr key={rIdx}>
                                                            {row.map((cell: string, cIdx: number) => (
                                                                <td key={cIdx} style={{ padding: "8px 12px", border: "1px solid #e2e8f0" }}>
                                                                    <Input
                                                                        value={cell}
                                                                        onChange={(e) => {
                                                                            const rows = block.content.rows.map((r: string[]) => [...r]);
                                                                            rows[rIdx][cIdx] = e.target.value;
                                                                            onUpdateBlockContent(block.id, { ...block.content, rows });
                                                                        }}
                                                                        style={{ border: "none", boxShadow: "none", padding: 0 }}
                                                                    />
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {block.block_type === "CODE" && (
                                        <div style={{ background: "#0f172a", borderRadius: 8, padding: 12 }}>
                                            <TextArea
                                                value={block.content.code || ""}
                                                onChange={(e) =>
                                                    onUpdateBlockContent(block.id, { ...block.content, code: e.target.value })
                                                }
                                                placeholder="// Enter code here..."
                                                autoSize={{ minRows: 2 }}
                                                style={{
                                                    fontFamily: "monospace",
                                                    backgroundColor: "transparent",
                                                    color: "#f8fafc",
                                                    border: "none",
                                                    boxShadow: "none",
                                                    padding: 0,
                                                }}
                                            />
                                        </div>
                                    )}

                                    {block.block_type !== "HEADING" &&
                                        block.block_type !== "PARAGRAPH" &&
                                        block.block_type !== "QUOTE" &&
                                        block.block_type !== "CALLOUT" &&
                                        block.block_type !== "IMAGE" &&
                                        block.block_type !== "LIST" &&
                                        block.block_type !== "DIVIDER" &&
                                        block.block_type !== "BUTTON" &&
                                        block.block_type !== "TABLE" &&
                                        block.block_type !== "CODE" && (
                                            <div style={{ padding: 12, backgroundColor: "#f8fafc", borderRadius: 8 }}>
                                                <Text strong>{block.block_type} Block</Text>
                                                <div style={{ fontSize: 12, color: "#64748b" }}>
                                                    Configure settings in the right sidebar.
                                                </div>
                                            </div>
                                        )}
                                </div>
                            </React.Fragment>
                        );
                    })}

                    {/* Bottom Inserter Button / Click to start typing */}
                    <div
                        onClick={() => {
                            if (blocks.length === 0 || blocks[blocks.length - 1].block_type !== "PARAGRAPH") {
                                onInsertBlock("PARAGRAPH");
                            }
                        }}
                        style={{
                            marginTop: 18,
                            padding: "16px 0",
                            cursor: "text",
                            color: "#94a3b8",
                            fontSize: 15,
                        }}
                    >
                        <Space>
                            <Button
                                shape="circle"
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenBlockPicker();
                                }}
                            />
                            <span>Click here or press '+' to add a block...</span>
                        </Space>
                    </div>
                </div>

                {/* Floating Slash Command Menu */}
                <SlashCommand
                    open={slashState.open}
                    query={slashState.query}
                    onClose={() => setSlashState((prev) => ({ ...prev, open: false }))}
                    position={slashState.position}
                    onSelectBlock={(newType) => {
                        if (slashState.blockId) {
                            onTransformBlock(slashState.blockId, newType);
                        } else {
                            onInsertBlock(newType);
                        }
                    }}
                />
            </div>
        </div>
    );
};
