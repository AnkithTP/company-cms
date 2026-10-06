import React, { useState, useEffect } from "react";
import { Modal, List, Typography, Button, Tag, Space, Spin, Popconfirm, message, Divider } from "antd";
import { HistoryOutlined, UndoOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import * as contentService from "../contents/content.service";

const { Text, Title } = Typography;

interface RevisionsModalProps {
    open: boolean;
    onClose: () => void;
    contentId: string | null | undefined;
    onRestored: (newContent: any) => void;
}

export const RevisionsModal: React.FC<RevisionsModalProps> = ({
    open,
    onClose,
    contentId,
    onRestored,
}) => {
    const [revisions, setRevisions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [restoringId, setRestoringId] = useState<string | null>(null);
    const [selectedRevision, setSelectedRevision] = useState<any | null>(null);

    const loadRevisions = async () => {
        if (!contentId) return;
        setIsLoading(true);
        try {
            const res = await contentService.fetchRevisions(contentId);
            setRevisions(res.data || []);
            if (res.data && res.data.length > 0) {
                setSelectedRevision(res.data[0]);
            }
        } catch {
            message.error("Failed to load revision history");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (open && contentId) {
            loadRevisions();
        }
    }, [open, contentId]);

    const handleRestore = async (revisionId: string) => {
        if (!contentId) return;
        setRestoringId(revisionId);
        try {
            const res = await contentService.restoreRevision(contentId, revisionId);
            message.success("Revision restored successfully!");
            onRestored(res.data);
            onClose();
        } catch {
            message.error("Failed to restore revision");
        } finally {
            setRestoringId(null);
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={760}
            title={
                <Space>
                    <HistoryOutlined style={{ color: "#1677ff", fontSize: 18 }} />
                    <Text strong style={{ fontSize: 16 }}>
                        Document Revision History
                    </Text>
                </Space>
            }
        >
            {isLoading ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <Spin tip="Loading historical revisions..." />
                </div>
            ) : revisions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                    No revision snapshots recorded yet. Save draft changes to generate revisions.
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, maxHeight: 480 }}>
                    {/* Left list of versions */}
                    <div style={{ overflowY: "auto", borderRight: "1px solid #e2e8f0", paddingRight: 12 }}>
                        <List
                            dataSource={revisions}
                            renderItem={(rev) => {
                                const isSelected = selectedRevision?.id === rev.id;
                                return (
                                    <div
                                        onClick={() => setSelectedRevision(rev)}
                                        style={{
                                            padding: "10px 12px",
                                            borderRadius: 8,
                                            marginBottom: 8,
                                            cursor: "pointer",
                                            backgroundColor: isSelected ? "#f0f7ff" : "#f8fafc",
                                            border: isSelected ? "1px solid #1677ff" : "1px solid #e2e8f0",
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Tag color={isSelected ? "blue" : "default"}>
                                                v{rev.version_number}
                                            </Tag>
                                            <span style={{ fontSize: 12, color: "#64748b" }}>
                                                {dayjs(rev.created_at).format("MMM D, HH:mm")}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: "#1e293b", marginTop: 4 }}>
                                            {rev.title || "Untitled draft"}
                                        </div>
                                    </div>
                                );
                            }}
                        />
                    </div>

                    {/* Right detail view of selected version */}
                    <div style={{ overflowY: "auto", paddingLeft: 8 }}>
                        {selectedRevision ? (
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                    <div>
                                        <Title level={4} style={{ margin: 0 }}>
                                            Version {selectedRevision.version_number}
                                        </Title>
                                        <span style={{ fontSize: 12, color: "#64748b" }}>
                                            Saved on {dayjs(selectedRevision.created_at).format("MMMM D, YYYY at h:mm A")}
                                        </span>
                                    </div>
                                    <Popconfirm
                                        title="Restore this revision?"
                                        description="This will roll back current editor content to this version."
                                        okText="Yes, Restore"
                                        cancelText="Cancel"
                                        onConfirm={() => handleRestore(selectedRevision.id)}
                                    >
                                        <Button
                                            type="primary"
                                            icon={<UndoOutlined />}
                                            loading={restoringId === selectedRevision.id}
                                        >
                                            Restore
                                        </Button>
                                    </Popconfirm>
                                </div>

                                <Divider style={{ margin: "12px 0" }} />

                                <div style={{ marginBottom: 12 }}>
                                    <Text strong style={{ fontSize: 13, color: "#475569" }}>
                                        Document Title:
                                    </Text>
                                    <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
                                        {selectedRevision.title}
                                    </div>
                                </div>

                                <div>
                                    <Text strong style={{ fontSize: 13, color: "#475569" }}>
                                        Snapshot Blocks ({(selectedRevision.blocks || []).length}):
                                    </Text>
                                    <div style={{ marginTop: 8 }}>
                                        {(selectedRevision.blocks || []).map((b: any, i: number) => (
                                            <div
                                                key={i}
                                                style={{
                                                    padding: "8px 12px",
                                                    backgroundColor: "#f8fafc",
                                                    borderRadius: 6,
                                                    marginBottom: 6,
                                                    fontSize: 13,
                                                    border: "1px solid #f1f5f9",
                                                }}
                                            >
                                                <Tag color="cyan" style={{ fontSize: 11 }}>{b.block_type}</Tag>
                                                <span>{b.content?.text?.slice(0, 75) || b.content?.title || "(media/element content)"}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ color: "#94a3b8", textAlign: "center", paddingTop: 80 }}>
                                Select a revision from the left to view details
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Modal>
    );
};
