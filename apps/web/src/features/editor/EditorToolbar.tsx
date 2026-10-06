import React from "react";
import { Space, Button, Tag, Tooltip, Dropdown } from "antd";
import {
    ArrowLeftOutlined,
    SaveOutlined,
    EyeOutlined,
    SendOutlined,
    CheckOutlined,
    CloseOutlined,
    HistoryOutlined,
    SettingOutlined,
    UndoOutlined,
    RedoOutlined,
    CheckCircleOutlined,
    CloudSyncOutlined,
    GlobalOutlined,
    DesktopOutlined,
    TabletOutlined,
    MobileOutlined,
} from "@ant-design/icons";
import type { ContentStatus, ContentType } from "../contents/content.types";
import type { AutosaveStatus, PreviewDevice } from "./types";

interface EditorToolbarProps {
    title: string;
    status: ContentStatus;
    contentType: ContentType;
    wordCount: number;
    readTimeMinutes: number;
    autosaveStatus: AutosaveStatus;
    canUndo: boolean;
    canRedo: boolean;
    sidebarOpen: boolean;
    isSaving: boolean;
    isSubmitting: boolean;
    userRole: string; // "SUPER_ADMIN" | "HR_ADMIN" | "TECH_ADMIN" | "EDITOR" | "EMPLOYEE"
    onBack: () => void;
    onSaveDraft: () => void;
    onSubmitForReview?: () => void;
    onApprove?: () => void;
    onReject?: () => void;
    onPublish?: () => void;
    onToggleSidebar: () => void;
    onOpenRevisions: () => void;
    onOpenPreview: (device: PreviewDevice) => void;
    onUndo: () => void;
    onRedo: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
    title,
    status,
    contentType,
    wordCount,
    readTimeMinutes,
    autosaveStatus,
    canUndo,
    canRedo,
    sidebarOpen,
    isSaving,
    isSubmitting,
    userRole,
    onBack,
    onSaveDraft,
    onSubmitForReview,
    onApprove,
    onReject,
    onPublish,
    onToggleSidebar,
    onOpenRevisions,
    onOpenPreview,
    onUndo,
    onRedo,
}) => {
    const isSuperAdmin = userRole === "SUPER_ADMIN";
    const isAdmin = isSuperAdmin || userRole.includes("ADMIN");
    const isApprover = isAdmin; // Admins act as approvers/publishers
    const isEditor = userRole === "EDITOR" || isAdmin;

    const statusBadgeColor: Record<ContentStatus, string> = {
        DRAFT: "default",
        SUBMITTED: "blue",
        UNDER_REVIEW: "orange",
        APPROVED: "cyan",
        PUBLISHED: "green",
        ARCHIVED: "purple",
    };

    const previewMenu = {
        items: [
            {
                key: "desktop",
                icon: <DesktopOutlined />,
                label: "Desktop View (1200px)",
                onClick: () => onOpenPreview("desktop"),
            },
            {
                key: "tablet",
                icon: <TabletOutlined />,
                label: "Tablet View (768px)",
                onClick: () => onOpenPreview("tablet"),
            },
            {
                key: "mobile",
                icon: <MobileOutlined />,
                label: "Mobile View (375px)",
                onClick: () => onOpenPreview("mobile"),
            },
        ],
    };

    return (
        <header
            style={{
                height: 56,
                padding: "0 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#ffffff",
                borderBottom: "1px solid #e2e8f0",
                position: "sticky",
                top: 0,
                zIndex: 80,
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}
        >
            {/* Left Area: Navigation, Status, Word Count */}
            <Space size="middle" align="center">
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={onBack}
                    style={{ fontWeight: 500 }}
                >
                    Back
                </Button>

                <Tag color={statusBadgeColor[status] || "default"} style={{ fontWeight: 600 }}>
                    {status}
                </Tag>

                <Tag color="geekblue" style={{ textTransform: "capitalize", fontWeight: 500 }}>
                    {contentType.toLowerCase().replace("_", " ")}
                </Tag>

                <span style={{ fontSize: 12, color: "#64748b", display: "none" }} className="editor-metrics">
                    {wordCount} words • {readTimeMinutes} min read
                </span>
            </Space>

            {/* Center Area: Title & Autosave Feedback */}
            <div style={{ textAlign: "center", display: "flex", alignItems: "center", gap: 10 }}>
                <span
                    style={{
                        maxWidth: 240,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#0f172a",
                    }}
                >
                    {title || "Untitled Document"}
                </span>

                {autosaveStatus === "saving" && (
                    <Tag icon={<CloudSyncOutlined spin />} color="processing" style={{ borderRadius: 12, fontSize: 11 }}>
                        Saving...
                    </Tag>
                )}
                {autosaveStatus === "saved" && (
                    <Tag icon={<CheckCircleOutlined />} color="success" style={{ borderRadius: 12, fontSize: 11 }}>
                        Saved
                    </Tag>
                )}
            </div>

            {/* Right Area: Actions, Undo/Redo, Settings & Publish Flow */}
            <Space size="small" align="center">
                {/* Undo / Redo */}
                <Tooltip title="Undo (Ctrl+Z)">
                    <Button
                        type="text"
                        icon={<UndoOutlined />}
                        disabled={!canUndo}
                        onClick={onUndo}
                    />
                </Tooltip>
                <Tooltip title="Redo (Ctrl+Y)">
                    <Button
                        type="text"
                        icon={<RedoOutlined />}
                        disabled={!canRedo}
                        onClick={onRedo}
                    />
                </Tooltip>

                {/* Revisions History */}
                <Tooltip title="Revision History">
                    <Button
                        type="text"
                        icon={<HistoryOutlined />}
                        onClick={onOpenRevisions}
                    />
                </Tooltip>

                {/* Responsive Preview Dropdown */}
                <Dropdown menu={previewMenu} placement="bottomRight">
                    <Button icon={<EyeOutlined />}>
                        Preview
                    </Button>
                </Dropdown>

                {/* Document Settings Sidebar Toggle */}
                <Tooltip title="Toggle Document Settings">
                    <Button
                        type={sidebarOpen ? "primary" : "default"}
                        icon={<SettingOutlined />}
                        onClick={onToggleSidebar}
                    />
                </Tooltip>

                {/* Primary Save Draft Action */}
                <Button
                    icon={<SaveOutlined />}
                    onClick={onSaveDraft}
                    loading={isSaving}
                >
                    Save Draft
                </Button>

                {/* Role-Sensitive Workflow Action Buttons */}

                {/* 1. Editor Submit for Review */}
                {isEditor && status === "DRAFT" && onSubmitForReview && (
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={onSubmitForReview}
                        loading={isSubmitting}
                        style={{ backgroundColor: "#2563eb", borderColor: "#2563eb" }}
                    >
                        Submit for Review
                    </Button>
                )}

                {/* 2. Approver / Reviewer Approve & Reject */}
                {isApprover && (status === "SUBMITTED" || status === "UNDER_REVIEW") && (
                    <>
                        {onReject && (
                            <Button danger icon={<CloseOutlined />} onClick={onReject}>
                                Reject
                            </Button>
                        )}
                        {onApprove && (
                            <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                onClick={onApprove}
                                style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
                            >
                                Approve
                            </Button>
                        )}
                    </>
                )}

                {/* 3. Admin Direct Publishing or Scheduled Live Launch */}
                {isAdmin && (status === "APPROVED" || status === "DRAFT" || status === "UNDER_REVIEW") && onPublish && (
                    <Button
                        type="primary"
                        icon={<GlobalOutlined />}
                        onClick={onPublish}
                        loading={isSubmitting}
                        style={{
                            background: "linear-gradient(135deg, #1677ff 0%, #0050b3 100%)",
                            borderColor: "#1677ff",
                            fontWeight: 600,
                        }}
                    >
                        Publish Live
                    </Button>
                )}
            </Space>
        </header>
    );
};
