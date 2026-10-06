import React from "react";
import { Space, Button, Tooltip, Dropdown, Select, Divider } from "antd";
import {
    ArrowUpOutlined,
    ArrowDownOutlined,
    CopyOutlined,
    DeleteOutlined,
    AlignLeftOutlined,
    AlignCenterOutlined,
    AlignRightOutlined,
    MoreOutlined,
    SwapOutlined,
    PlusOutlined,
    HolderOutlined,
} from "@ant-design/icons";
import type { EditorBlock } from "./types";
import type { BlockType } from "../contents/content.types";

interface BlockToolbarProps {
    block: EditorBlock;
    onUpdateContent: (content: Record<string, any>) => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onTransform: (newType: BlockType) => void;
    onAddBlockAfter: () => void;
    canMoveUp: boolean;
    canMoveDown: boolean;
}

export const BlockToolbar: React.FC<BlockToolbarProps> = ({
    block,
    onUpdateContent,
    onMoveUp,
    onMoveDown,
    onDuplicate,
    onDelete,
    onTransform,
    onAddBlockAfter,
    canMoveUp,
    canMoveDown,
}) => {
    const { block_type, content = {} } = block;

    const transformMenu = {
        items: [
            { key: "PARAGRAPH", label: "Convert to Paragraph" },
            { key: "HEADING", label: "Convert to Heading" },
            { key: "QUOTE", label: "Convert to Quote" },
            { key: "CALLOUT", label: "Convert to Callout" },
            { key: "LIST", label: "Convert to List" },
            { key: "CODE", label: "Convert to Code" },
        ].filter((it) => it.key !== block_type),
        onClick: ({ key }: { key: string }) => onTransform(key as BlockType),
    };

    const moreActionsMenu = {
        items: [
            { key: "add-after", icon: <PlusOutlined />, label: "Insert Block Below" },
            { key: "duplicate", icon: <CopyOutlined />, label: "Duplicate Block" },
            { type: "divider" as const },
            { key: "delete", icon: <DeleteOutlined />, label: "Delete Block", danger: true },
        ],
        onClick: ({ key }: { key: string }) => {
            if (key === "add-after") onAddBlockAfter();
            if (key === "duplicate") onDuplicate();
            if (key === "delete") onDelete();
        },
    };

    return (
        <div
            className="gutenberg-block-toolbar"
            style={{
                position: "absolute",
                top: -42,
                left: 0,
                zIndex: 40,
                display: "inline-flex",
                alignItems: "center",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
                padding: "2px 6px",
                height: 38,
            }}
        >
            <Space size={4} align="center">
                {/* Drag Grip Indicator */}
                <Tooltip title="Drag to reorder block">
                    <span className="drag-handle" style={{ cursor: "grab", padding: "0 4px", color: "#94a3b8" }}>
                        <HolderOutlined />
                    </span>
                </Tooltip>

                {/* Transform Block Dropdown */}
                <Dropdown menu={transformMenu} trigger={["click"]}>
                    <Button size="small" type="text" icon={<SwapOutlined />} style={{ fontSize: 12, fontWeight: 500 }}>
                        {block_type}
                    </Button>
                </Dropdown>

                {/* Move Controls */}
                <Tooltip title="Move Up">
                    <Button
                        size="small"
                        type="text"
                        icon={<ArrowUpOutlined />}
                        disabled={!canMoveUp}
                        onClick={onMoveUp}
                    />
                </Tooltip>
                <Tooltip title="Move Down">
                    <Button
                        size="small"
                        type="text"
                        icon={<ArrowDownOutlined />}
                        disabled={!canMoveDown}
                        onClick={onMoveDown}
                    />
                </Tooltip>

                <Divider orientation="vertical" style={{ margin: "0 4px", height: 18 }} />

                {/* --- Contextual Controls: Heading --- */}
                {block_type === "HEADING" && (
                    <Select
                        size="small"
                        value={content.level || 2}
                        onChange={(val) => onUpdateContent({ ...content, level: val })}
                        style={{ width: 68 }}
                        options={[
                            { value: 1, label: "H1" },
                            { value: 2, label: "H2" },
                            { value: 3, label: "H3" },
                            { value: 4, label: "H4" },
                        ]}
                    />
                )}

                {/* --- Contextual Controls: Alignment --- */}
                {(block_type === "HEADING" || block_type === "PARAGRAPH" || block_type === "IMAGE" || block_type === "BUTTON") && (
                    <Space orientation="horizontal" size={2}>
                        <Tooltip title="Align Left">
                            <Button
                                size="small"
                                type={content.align === "left" || !content.align ? "primary" : "text"}
                                icon={<AlignLeftOutlined />}
                                onClick={() => onUpdateContent({ ...content, align: "left" })}
                            />
                        </Tooltip>
                        <Tooltip title="Align Center">
                            <Button
                                size="small"
                                type={content.align === "center" ? "primary" : "text"}
                                icon={<AlignCenterOutlined />}
                                onClick={() => onUpdateContent({ ...content, align: "center" })}
                            />
                        </Tooltip>
                        <Tooltip title="Align Right">
                            <Button
                                size="small"
                                type={content.align === "right" ? "primary" : "text"}
                                icon={<AlignRightOutlined />}
                                onClick={() => onUpdateContent({ ...content, align: "right" })}
                            />
                        </Tooltip>
                    </Space>
                )}

                {/* --- Contextual Controls: Callout Intent --- */}
                {block_type === "CALLOUT" && (
                    <Select
                        size="small"
                        value={content.intent || "info"}
                        onChange={(val) => onUpdateContent({ ...content, intent: val })}
                        style={{ width: 95 }}
                        options={[
                            { value: "info", label: "Info" },
                            { value: "warning", label: "Warning" },
                            { value: "success", label: "Success" },
                            { value: "danger", label: "Danger" },
                        ]}
                    />
                )}

                {/* --- Contextual Controls: List Style --- */}
                {block_type === "LIST" && (
                    <Select
                        size="small"
                        value={content.style || "bullet"}
                        onChange={(val) => onUpdateContent({ ...content, style: val })}
                        style={{ width: 105 }}
                        options={[
                            { value: "bullet", label: "• Bullet" },
                            { value: "numbered", label: "1. Numbered" },
                        ]}
                    />
                )}

                {/* --- Contextual Controls: Table Tools --- */}
                {block_type === "TABLE" && (
                    <Space size={2}>
                        <Tooltip title="Add Row">
                            <Button
                                size="small"
                                type="text"
                                onClick={() => {
                                    const rows = Array.isArray(content.rows) ? [...content.rows] : [];
                                    const colCount = content.headers?.length || 2;
                                    rows.push(Array(colCount).fill("New detail"));
                                    onUpdateContent({ ...content, rows });
                                }}
                            >
                                +Row
                            </Button>
                        </Tooltip>
                        <Tooltip title="Add Column">
                            <Button
                                size="small"
                                type="text"
                                onClick={() => {
                                    const headers = Array.isArray(content.headers) ? [...content.headers] : [];
                                    const rows = Array.isArray(content.rows) ? content.rows.map((r: string[]) => [...r, "Data"]) : [];
                                    headers.push(`Column ${headers.length + 1}`);
                                    onUpdateContent({ ...content, headers, rows });
                                }}
                            >
                                +Col
                            </Button>
                        </Tooltip>
                    </Space>
                )}

                <Divider orientation="vertical" style={{ margin: "0 4px", height: 18 }} />

                {/* Duplicate */}
                <Tooltip title="Duplicate">
                    <Button size="small" type="text" icon={<CopyOutlined />} onClick={onDuplicate} />
                </Tooltip>

                {/* Delete */}
                <Tooltip title="Delete">
                    <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={onDelete} />
                </Tooltip>

                {/* More Secondary Options */}
                <Dropdown menu={moreActionsMenu} trigger={["click"]}>
                    <Button size="small" type="text" icon={<MoreOutlined />} />
                </Dropdown>
            </Space>
        </div>
    );
};
