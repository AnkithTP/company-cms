import React from "react";
import { Typography, Divider as AntDivider, Alert, Collapse, Button, Space, Image as AntImage } from "antd";
import {
    FilePdfOutlined,
    DownloadOutlined,
    PlayCircleOutlined,
} from "@ant-design/icons";
import type { EditorBlock } from "./types";
import { getMediaUrl } from "../../utils/media";

const { Title, Paragraph, Text } = Typography;

export interface BlockRendererProps {
    blocks: EditorBlock[] | any[];
    mode?: "editor" | "preview" | "published";
    activeBlockId?: string | null;
    onSelectBlock?: (blockId: string) => void;
    renderBlockEditor?: (block: EditorBlock, index: number) => React.ReactNode;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
    blocks,
    mode = "published",
    activeBlockId,
    onSelectBlock,
    renderBlockEditor,
}) => {
    if (!blocks || blocks.length === 0) {
        if (mode === "preview" || mode === "published") {
            return (
                <div style={{ padding: "40px 0", textAlign: "center", color: "#94a3b8" }}>
                    <Text type="secondary">This document has no content blocks yet.</Text>
                </div>
            );
        }
    }

    const renderSingleBlock = (block: EditorBlock, index: number) => {
        // If in editor mode and a custom block editor component is provided, use it
        if (mode === "editor" && renderBlockEditor) {
            return renderBlockEditor(block, index);
        }

        const { block_type, content = {} } = block;

        switch (block_type) {
            case "HEADING": {
                const level = content.level || 2;
                const textAlign = content.align || "left";
                return (
                    <Title
                        level={level as any}
                        style={{
                            textAlign,
                            marginTop: level === 1 ? 0 : 28,
                            marginBottom: 16,
                            color: "#0f172a",
                            fontWeight: level <= 2 ? 700 : 600,
                            lineHeight: 1.25,
                        }}
                    >
                        {content.text || "Untitled Section"}
                    </Title>
                );
            }

            case "PARAGRAPH": {
                const textAlign = content.align || "left";
                const text = content.text || "";
                return (
                    <Paragraph
                        style={{
                            textAlign,
                            fontSize: 16,
                            lineHeight: 1.75,
                            color: "#334155",
                            marginBottom: 20,
                            whiteSpace: "pre-line",
                        }}
                    >
                        {text || "(Empty paragraph)"}
                    </Paragraph>
                );
            }

            case "QUOTE": {
                return (
                    <div
                        style={{
                            borderLeft: "4px solid #1677ff",
                            padding: "16px 24px",
                            margin: "24px 0",
                            backgroundColor: "#f8fafc",
                            borderRadius: "0 10px 10px 0",
                        }}
                    >
                        <Paragraph
                            style={{
                                fontStyle: "italic",
                                fontSize: 17,
                                lineHeight: 1.6,
                                color: "#1e293b",
                                margin: 0,
                            }}
                        >
                            "{content.text || "Quoted statement goes here..."}"
                        </Paragraph>
                        {(content.author || content.citation) && (
                            <div style={{ marginTop: 10, fontSize: 13, color: "#64748b" }}>
                                {content.author && <Text strong>{content.author}</Text>}
                                {content.citation && <span> — {content.citation}</span>}
                            </div>
                        )}
                    </div>
                );
            }

            case "CALLOUT": {
                const intent = content.intent || "info";
                const typeMap: Record<string, "info" | "warning" | "success" | "error"> = {
                    info: "info",
                    warning: "warning",
                    success: "success",
                    danger: "error",
                };
                return (
                    <Alert
                        message={content.title || "Note"}
                        description={content.text || ""}
                        type={typeMap[intent] || "info"}
                        showIcon
                        style={{ margin: "20px 0", borderRadius: 10, fontSize: 15 }}
                    />
                );
            }

            case "LIST": {
                const isNumbered = content.style === "numbered";
                const items: string[] = Array.isArray(content.items) ? content.items : [];
                const ListTag = isNumbered ? "ol" : "ul";
                return (
                    <ListTag
                        style={{
                            paddingLeft: 28,
                            margin: "16px 0 24px 0",
                            fontSize: 16,
                            lineHeight: 1.8,
                            color: "#334155",
                        }}
                    >
                        {items.map((item, idx) => (
                            <li key={idx} style={{ marginBottom: 6 }}>
                                {item}
                            </li>
                        ))}
                    </ListTag>
                );
            }

            case "IMAGE": {
                const align = content.align || "center";
                const alignmentStyle: React.CSSProperties =
                    align === "center"
                        ? { display: "flex", flexDirection: "column", alignItems: "center" }
                        : align === "right"
                          ? { display: "flex", flexDirection: "column", alignItems: "flex-end" }
                          : { display: "flex", flexDirection: "column", alignItems: "flex-start" };

                return (
                    <div style={{ margin: "28px 0", ...alignmentStyle }}>
                        {content.url ? (
                            <div style={{ maxWidth: "100%", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                                <AntImage
                                    src={getMediaUrl(content.url)}
                                    alt={content.alt || content.caption || "Article media"}
                                    style={{ maxHeight: 520, objectFit: "cover", width: "100%" }}
                                />
                            </div>
                        ) : (
                            <div style={{ padding: 40, background: "#f1f5f9", borderRadius: 8, textAlign: "center", width: "100%" }}>
                                <Text type="secondary">No image uploaded</Text>
                            </div>
                        )}
                        {content.caption && (
                            <Text type="secondary" style={{ fontSize: 13, marginTop: 8, fontStyle: "italic", textAlign: "center" }}>
                                {content.caption}
                            </Text>
                        )}
                    </div>
                );
            }

            case "GALLERY": {
                const images: { url: string; caption?: string }[] = Array.isArray(content.images) ? content.images : [];
                const cols = content.columns || 3;
                return (
                    <div style={{ margin: "28px 0" }}>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                                gap: 16,
                            }}
                        >
                            {images.map((img, i) => (
                                <div key={i} style={{ borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                                    <AntImage
                                        src={getMediaUrl(img.url)}
                                        alt={img.caption || `Gallery item ${i + 1}`}
                                        style={{ height: 180, width: "100%", objectFit: "cover" }}
                                    />
                                    {img.caption && (
                                        <div style={{ padding: "6px 8px", fontSize: 12, color: "#64748b", background: "#f8fafc" }}>
                                            {img.caption}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }

            case "VIDEO": {
                const url: string = content.url || "";
                const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
                const isVimeo = url.includes("vimeo.com");

                let embedUrl = url;
                if (isYouTube) {
                    const videoId = url.includes("v=")
                        ? url.split("v=")[1]?.split("&")[0]
                        : url.split("/").pop();
                    embedUrl = `https://www.youtube.com/embed/${videoId}`;
                } else if (isVimeo) {
                    const videoId = url.split("/").pop();
                    embedUrl = `https://player.vimeo.com/video/${videoId}`;
                }

                return (
                    <div style={{ margin: "28px 0" }}>
                        {url ? (
                            <div
                                style={{
                                    position: "relative",
                                    paddingBottom: "56.25%", // 16:9 aspect ratio
                                    height: 0,
                                    overflow: "hidden",
                                    borderRadius: 12,
                                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                                    backgroundColor: "#000",
                                }}
                            >
                                {isYouTube || isVimeo ? (
                                    <iframe
                                        src={embedUrl}
                                        title={content.caption || "Embedded Video"}
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            height: "100%",
                                            border: 0,
                                        }}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (
                                    <video
                                        src={getMediaUrl(url)}
                                        controls
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                )}
                            </div>
                        ) : (
                            <div style={{ padding: 40, background: "#f1f5f9", borderRadius: 8, textAlign: "center" }}>
                                <PlayCircleOutlined style={{ fontSize: 32, color: "#94a3b8", marginBottom: 8 }} />
                                <div><Text type="secondary">No video URL specified</Text></div>
                            </div>
                        )}
                        {content.caption && (
                            <Text type="secondary" style={{ fontSize: 13, marginTop: 8, display: "block", textAlign: "center" }}>
                                {content.caption}
                            </Text>
                        )}
                    </div>
                );
            }

            case "TABLE": {
                const headers: string[] = Array.isArray(content.headers) ? content.headers : [];
                const rows: string[][] = Array.isArray(content.rows) ? content.rows : [];

                return (
                    <div style={{ margin: "24px 0", overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                borderRadius: 8,
                                overflow: "hidden",
                                border: "1px solid #e2e8f0",
                                fontSize: 14,
                            }}
                        >
                            <thead>
                                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                                    {headers.map((h, i) => (
                                        <th key={i} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#1e293b" }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, rIdx) => (
                                    <tr
                                        key={rIdx}
                                        style={{
                                            borderBottom: "1px solid #f1f5f9",
                                            backgroundColor: rIdx % 2 === 0 ? "#ffffff" : "#fcfcfd",
                                        }}
                                    >
                                        {row.map((cell, cIdx) => (
                                            <td key={cIdx} style={{ padding: "12px 16px", color: "#334155" }}>
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            }

            case "BUTTON": {
                const variant = content.variant || "primary";
                const align = content.align || "left";
                return (
                    <div style={{ margin: "24px 0", textAlign: align as any }}>
                        <Button
                            type={variant === "primary" ? "primary" : variant === "secondary" ? "default" : "dashed"}
                            size="large"
                            href={content.url || "#"}
                            target={content.openInNewTab ? "_blank" : undefined}
                            rel="noopener noreferrer"
                            style={{ borderRadius: 8, fontWeight: 600, padding: "0 28px" }}
                        >
                            {content.text || "Click Here"}
                        </Button>
                    </div>
                );
            }

            case "DIVIDER": {
                const dividerStyle = content.style || "solid";
                return (
                    <AntDivider
                        dashed={dividerStyle === "dashed"}
                        style={{ margin: "32px 0", borderColor: "#cbd5e1" }}
                    />
                );
            }

            case "SPACER": {
                const height = content.height || 32;
                return <div style={{ height, width: "100%" }} />;
            }

            case "COLUMNS": {
                const columns: { title?: string; text?: string }[] = Array.isArray(content.columns) ? content.columns : [];
                return (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${Math.max(1, columns.length)}, 1fr)`,
                            gap: 24,
                            margin: "24px 0",
                        }}
                    >
                        {columns.map((col, i) => (
                            <div
                                key={i}
                                style={{
                                    backgroundColor: "#f8fafc",
                                    padding: "20px 24px",
                                    borderRadius: 10,
                                    border: "1px solid #e2e8f0",
                                }}
                            >
                                {col.title && (
                                    <Title level={4} style={{ marginTop: 0, marginBottom: 8, fontSize: 16 }}>
                                        {col.title}
                                    </Title>
                                )}
                                <Paragraph style={{ margin: 0, color: "#475569", fontSize: 14, lineHeight: 1.6 }}>
                                    {col.text || ""}
                                </Paragraph>
                            </div>
                        ))}
                    </div>
                );
            }

            case "ACCORDION": {
                const items: { question: string; answer: string }[] = Array.isArray(content.items) ? content.items : [];
                const collapseItems = items.map((it, i) => ({
                    key: String(i),
                    label: <span style={{ fontWeight: 600, color: "#1e293b" }}>{it.question}</span>,
                    children: <p style={{ margin: 0, color: "#475569", lineHeight: 1.7 }}>{it.answer}</p>,
                }));
                return (
                    <div style={{ margin: "24px 0" }}>
                        <Collapse items={collapseItems} bordered style={{ borderRadius: 8 }} />
                    </div>
                );
            }

            case "DOCUMENT": {
                return (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "16px 20px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: 10,
                            margin: "20px 0",
                        }}
                    >
                        <Space size="middle">
                            <FilePdfOutlined style={{ fontSize: 28, color: "#ef4444" }} />
                            <div>
                                <Text strong style={{ fontSize: 15, display: "block" }}>
                                    {content.fileName || "Company Document.pdf"}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {content.fileSize || "PDF File"}
                                </Text>
                            </div>
                        </Space>
                        {content.url && (
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                href={getMediaUrl(content.url)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Download
                            </Button>
                        )}
                    </div>
                );
            }

            case "CODE": {
                return (
                    <div
                        style={{
                            margin: "20px 0",
                            backgroundColor: "#0f172a",
                            color: "#e2e8f0",
                            borderRadius: 10,
                            overflow: "hidden",
                            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                        }}
                    >
                        {content.language && (
                            <div style={{ background: "#1e293b", padding: "6px 14px", fontSize: 11, color: "#94a3b8", textTransform: "uppercase" }}>
                                {content.language}
                            </div>
                        )}
                        <pre style={{ margin: 0, padding: 18, fontSize: 13, lineHeight: 1.6, overflowX: "auto" }}>
                            <code>{content.code || ""}</code>
                        </pre>
                    </div>
                );
            }

            default:
                return (
                    <Paragraph style={{ margin: "12px 0", color: "#64748b" }}>
                        {content.text || `[${block_type} block]`}
                    </Paragraph>
                );
        }
    };

    return (
        <div className="shared-cms-block-content" style={{ maxWidth: 820, margin: "0 auto" }}>
            {blocks.map((block, idx) => (
                <div
                    key={block.id || idx}
                    className={`block-wrapper ${activeBlockId === block.id ? "block-active" : ""}`}
                    onClick={() => onSelectBlock && block.id && onSelectBlock(block.id)}
                >
                    {renderSingleBlock(block, idx)}
                </div>
            ))}
        </div>
    );
};
