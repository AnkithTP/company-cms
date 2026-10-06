import React, { useState, useEffect, useRef } from "react";
import {
    FileTextOutlined,
    FontSizeOutlined,
    PictureOutlined,
    CommentOutlined,
    AlertOutlined,
    UnorderedListOutlined,
    TableOutlined,
    CompassOutlined,
    LineOutlined,
    VideoCameraOutlined,
    SplitCellsOutlined,
    MenuUnfoldOutlined,
    FilePdfOutlined,
    CodeOutlined,
} from "@ant-design/icons";
import { BLOCK_DEFINITIONS } from "./blocks/registry";
import type { BlockType } from "../contents/content.types";

interface SlashCommandProps {
    open: boolean;
    query: string;
    onClose: () => void;
    onSelectBlock: (type: BlockType) => void;
    position: { top: number; left: number };
}

const iconMap: Record<string, React.ReactNode> = {
    PARAGRAPH: <FileTextOutlined style={{ color: "#1677ff" }} />,
    HEADING: <FontSizeOutlined style={{ color: "#0284c7" }} />,
    IMAGE: <PictureOutlined style={{ color: "#10b981" }} />,
    QUOTE: <CommentOutlined style={{ color: "#8b5cf6" }} />,
    CALLOUT: <AlertOutlined style={{ color: "#f97316" }} />,
    LIST: <UnorderedListOutlined style={{ color: "#6366f1" }} />,
    TABLE: <TableOutlined style={{ color: "#06b6d4" }} />,
    BUTTON: <CompassOutlined style={{ color: "#2563eb" }} />,
    DIVIDER: <LineOutlined style={{ color: "#94a3b8" }} />,
    VIDEO: <VideoCameraOutlined style={{ color: "#f59e0b" }} />,
    COLUMNS: <SplitCellsOutlined style={{ color: "#0d9488" }} />,
    ACCORDION: <MenuUnfoldOutlined style={{ color: "#d97706" }} />,
    DOCUMENT: <FilePdfOutlined style={{ color: "#ef4444" }} />,
    CODE: <CodeOutlined style={{ color: "#334155" }} />,
};

export const SlashCommand: React.FC<SlashCommandProps> = ({
    open,
    query,
    onClose,
    onSelectBlock,
    position,
}) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const matches = BLOCK_DEFINITIONS.filter((b) => {
        if (!query) return true;
        const q = query.toLowerCase();
        return (
            b.type.toLowerCase().includes(q) ||
            b.label.toLowerCase().includes(q) ||
            (b.slashAlias && b.slashAlias.some((a) => a.toLowerCase().includes(q)))
        );
    });

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % Math.max(1, matches.length));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + matches.length) % Math.max(1, matches.length));
            } else if (e.key === "Enter") {
                if (matches[selectedIndex]) {
                    e.preventDefault();
                    onSelectBlock(matches[selectedIndex].type);
                    onClose();
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, selectedIndex, matches, onSelectBlock, onClose]);

    if (!open || matches.length === 0) return null;

    return (
        <div
            ref={containerRef}
            style={{
                position: "absolute",
                top: position.top + 28,
                left: position.left,
                width: 290,
                maxHeight: 280,
                overflowY: "auto",
                backgroundColor: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: 10,
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.12)",
                zIndex: 100,
                padding: 6,
            }}
        >
            <div style={{ padding: "6px 8px 4px 8px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
                BASIC BLOCKS
            </div>
            {matches.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                    <div
                        key={item.type}
                        onClick={() => {
                            onSelectBlock(item.type);
                            onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 10px",
                            borderRadius: 6,
                            cursor: "pointer",
                            backgroundColor: isSelected ? "#f0f7ff" : "transparent",
                            transition: "background-color 0.12s ease",
                        }}
                    >
                        <span style={{ fontSize: 18 }}>{iconMap[item.type] || <FileTextOutlined />}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: isSelected ? "#1677ff" : "#1e293b" }}>
                                {item.label}
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>
                                {item.description.slice(0, 38)}...
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
