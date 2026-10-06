import React, { useState, useEffect, useMemo } from "react";
import { message, Modal, Input, Form, Alert, Button, Space } from "antd";
import { useNavigate } from "react-router-dom";

import type { ContentStatus, ContentType, BlockType } from "../contents/content.types";
import type { Category } from "../categories/category.types";
import type { EditorBlock, PreviewDevice, ContentTemplate } from "./types";
import { getBlockDefinition } from "./blocks/registry";
import { useUndoRedo } from "./hooks/useUndoRedo";
import { useAutosave } from "./hooks/useAutosave";
import { EditorToolbar } from "./EditorToolbar";
import { EditorCanvas } from "./EditorCanvas";
import { EditorSidebar } from "./EditorSidebar";
import { BlockPickerModal } from "./BlockPickerModal";
import { ResponsivePreviewModal } from "./ResponsivePreviewModal";
import { RevisionsModal } from "./RevisionsModal";
import { MediaPickerModal } from "../media/MediaPickerModal";
import type { MediaItem } from "../media/media.types";
import * as contentService from "../contents/content.service";
import * as categoryService from "../categories/category.service";
import { useAppSelector } from "../../hooks";

interface ContentEditorProps {
    initialContent?: any | null;
    mode?: "create" | "edit";
    onSuccess?: () => void;
}

const generateSlug = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/--+/g, "-")
        .trim();
};

const generateId = (): string => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return "blk_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

export const ContentEditor: React.FC<ContentEditorProps> = ({
    initialContent = null,
    mode = "create",
}) => {
    const navigate = useNavigate();
    const currentUser = useAppSelector((state) => state.auth.user);
    const userRole = currentUser?.roles?.[0] || "EDITOR";

    const contentId = initialContent?.id || null;

    // --- Core Document State ---
    const [title, setTitle] = useState(initialContent?.title || "");
    const [slug, setSlug] = useState(initialContent?.slug || "");
    const [excerpt, setExcerpt] = useState(initialContent?.excerpt || "");
    const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>(
        initialContent?.cover_image_url || undefined
    );
    const [contentType, setContentType] = useState<ContentType>(
        initialContent?.content_type || "ANNOUNCEMENT"
    );
    const [status, setStatus] = useState<ContentStatus>(
        initialContent?.status || "DRAFT"
    );
    const [visibility, setVisibility] = useState<string>("ALL");
    const [expiresAt, setExpiresAt] = useState<string | null>(
        initialContent?.expires_at || null
    );

    // --- SEO State ---
    const [seoTitle, setSeoTitle] = useState(initialContent?.title || "");
    const [seoDescription, setSeoDescription] = useState(initialContent?.excerpt || "");

    // --- Taxonomy State ---
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
        initialContent?.categories?.map((c: any) => c.id) || []
    );
    const [tags, setTags] = useState<string[]>(["Update", "Enterprise"]);

    // --- Blocks & Undo/Redo ---
    const initialBlocks: EditorBlock[] = useMemo(() => {
        if (initialContent?.ContentBlocks && initialContent.ContentBlocks.length > 0) {
            return initialContent.ContentBlocks.map((b: any, i: number) => ({
                id: b.id || generateId(),
                block_type: b.block_type,
                block_order: b.block_order ?? i + 1,
                content: b.content || {},
                style: b.style || null,
            }));
        }
        return [
            {
                id: generateId(),
                block_type: "HEADING",
                block_order: 1,
                content: { level: 2, text: "", align: "left" },
            },
            {
                id: generateId(),
                block_type: "PARAGRAPH",
                block_order: 2,
                content: { text: "", align: "left" },
            },
        ];
    }, [initialContent]);

    const { blocks, setBlocks, undo, redo, canUndo, canRedo, resetHistory } = useUndoRedo(initialBlocks);

    // --- UI Modals & State ---
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [blockPickerOpen, setBlockPickerOpen] = useState(false);
    const [blockPickerIndex, setBlockPickerIndex] = useState<number | undefined>(undefined);

    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [mediaTargetBlockId, setMediaTargetBlockId] = useState<string | null>(null);

    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");

    const [revisionsModalOpen, setRevisionsModalOpen] = useState(false);

    // Dynamic Category Creation Modal
    const [createCategoryModalOpen, setCreateCategoryModalOpen] = useState(false);
    const [categoryForm] = Form.useForm();

    // Reject Reason Modal
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    // Local Draft Recovery Notice
    const [recoveredDraft, setRecoveredDraft] = useState<any | null>(null);

    // Auto-generate slug when title changes (if in create mode or slug matches previous slug)
    const handleUpdateTitle = (newTitle: string) => {
        setTitle(newTitle);
        if (mode === "create" || !slug) {
            setSlug(generateSlug(newTitle));
            setSeoTitle(newTitle);
        }
    };

    // Load available categories
    useEffect(() => {
        categoryService
            .fetchCategories()
            .then((cats) => setCategories(cats.filter((c) => c.is_active)))
            .catch(() => {});
    }, []);

    // Check for local draft backup in create mode
    useEffect(() => {
        if (mode === "create") {
            try {
                const stored = localStorage.getItem("company_cms_draft_new_article");
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed.title && parsed.title.trim()) {
                        setRecoveredDraft(parsed);
                    }
                }
            } catch {
                // Ignore
            }
        }
    }, [mode]);

    // Word count & reading time calculation
    const wordCount = useMemo(() => {
        return blocks.reduce((acc, b) => {
            const text = b.content?.text || (Array.isArray(b.content?.items) ? b.content.items.join(" ") : "") || "";
            return acc + text.toString().split(/\s+/).filter(Boolean).length;
        }, 0);
    }, [blocks]);

    const readTimeMinutes = useMemo(() => Math.max(1, Math.ceil(wordCount / 200)), [wordCount]);

    const selectedBlock = useMemo(() => {
        return blocks.find((b) => b.id === selectedBlockId) || null;
    }, [blocks, selectedBlockId]);

    // Save implementation (handles both Create and Edit)
    const handleSave = async (silent = false): Promise<boolean> => {
        if (!title.trim()) {
            if (!silent) message.error("Please provide a document title before saving");
            return false;
        }

        setIsSaving(true);
        try {
            const formattedBlocks = blocks.map((b, index) => ({
                id: b.id.includes("-") && b.id.length === 36 ? b.id : undefined,
                block_type: b.block_type,
                block_order: index + 1,
                content: b.content,
                style: b.style || null,
            }));

            if (contentId) {
                // Existing Content: Save editor content
                await contentService.saveEditorContent(contentId, {
                    title,
                    slug: slug || generateSlug(title),
                    content_type: contentType,
                    expires_at: expiresAt,
                    blocks: formattedBlocks,
                    category_ids: selectedCategoryIds,
                });

                // Update metadata if needed
                await contentService.updateContent(contentId, {
                    title,
                    slug: slug || generateSlug(title),
                    content_type: contentType,
                    expires_at: expiresAt,
                });
            } else {
                // New Content: Create content
                const created = await contentService.createContent({
                    title,
                    slug: slug || generateSlug(title) || `content-${Date.now()}`,
                    content_type: contentType,
                    expires_at: expiresAt,
                    category_ids: selectedCategoryIds,
                    blocks: formattedBlocks,
                });

                // Clear temporary local storage draft
                localStorage.removeItem("company_cms_draft_new_article");

                if (!silent) {
                    message.success("Content draft created successfully!");
                    navigate(`/content/${created.data.id}`, { replace: true });
                    return true;
                }
            }

            if (!silent) message.success("Document saved successfully!");
            return true;
        } catch (err: any) {
            if (!silent) {
                message.error(err.response?.data?.message || "Failed to save document");
            }
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    // Autosave hook
    const { autosaveStatus, clearLocalDraft } = useAutosave({
        contentId,
        title,
        slug,
        coverImageUrl,
        excerpt,
        blocks,
        onSaveToServer: contentId ? () => handleSave(true) : undefined,
        enabled: Boolean(contentId && title.trim()),
    });

    // --- Block Manipulation ---
    const handleInsertBlock = (type: BlockType, targetIndex?: number) => {
        const def = getBlockDefinition(type);
        const newBlock: EditorBlock = {
            id: generateId(),
            block_type: type,
            block_order: (targetIndex ?? blocks.length) + 1,
            content: def.defaultContent(),
            style: def.defaultStyle ? def.defaultStyle() : null,
        };

        setBlocks((prev) => {
            const next = [...prev];
            if (typeof targetIndex === "number") {
                next.splice(targetIndex, 0, newBlock);
            } else {
                next.push(newBlock);
            }
            return next;
        });

        setSelectedBlockId(newBlock.id);
    };

    const handleSelectTemplate = (template: ContentTemplate) => {
        const templateBlocks = template.blocks().map((b, i) => ({
            ...b,
            id: generateId(),
            block_order: i + 1,
        }));
        setBlocks(templateBlocks);
        setContentType(template.contentType);
        message.success(`Applied template: ${template.name}`);
    };

    const handleUpdateBlockContent = (id: string, content: Record<string, any>) => {
        setBlocks((prev) =>
            prev.map((b) => (b.id === id ? { ...b, content } : b))
        );
    };

    const handleMoveBlock = (fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= blocks.length) return;
        setBlocks((prev) => {
            const next = [...prev];
            const [moved] = next.splice(fromIndex, 1);
            next.splice(toIndex, 0, moved);
            return next;
        });
    };

    const handleDuplicateBlock = (id: string) => {
        const idx = blocks.findIndex((b) => b.id === id);
        if (idx === -1) return;
        const source = blocks[idx];
        const duplicated: EditorBlock = {
            id: generateId(),
            block_type: source.block_type,
            block_order: idx + 2,
            content: JSON.parse(JSON.stringify(source.content)),
            style: source.style ? JSON.parse(JSON.stringify(source.style)) : null,
        };
        setBlocks((prev) => {
            const next = [...prev];
            next.splice(idx + 1, 0, duplicated);
            return next;
        });
        setSelectedBlockId(duplicated.id);
    };

    const handleDeleteBlock = (id: string) => {
        setBlocks((prev) => prev.filter((b) => b.id !== id));
        if (selectedBlockId === id) setSelectedBlockId(null);
    };

    const handleTransformBlock = (id: string, newType: BlockType) => {
        const def = getBlockDefinition(newType);
        setBlocks((prev) =>
            prev.map((b) => {
                if (b.id === id) {
                    return {
                        ...b,
                        block_type: newType,
                        content: {
                            ...def.defaultContent(),
                            text: b.content?.text || b.content?.title || "",
                        },
                    };
                }
                return b;
            })
        );
    };

    // --- Media Picker Handler ---
    const handleMediaSelected = (media: MediaItem) => {
        if (mediaTargetBlockId) {
            handleUpdateBlockContent(mediaTargetBlockId, {
                ...selectedBlock?.content,
                url: media.url,
                caption: media.alt_text || media.file_name,
                alt: media.alt_text || media.file_name,
            });
            setMediaTargetBlockId(null);
        } else {
            // Target is Document Cover Image
            setCoverImageUrl(media.url);
        }
        setMediaPickerOpen(false);
    };

    // --- Workflow Actions ---
    const handleSubmitForReview = async () => {
        if (!contentId) {
            const saved = await handleSave();
            if (!saved) return;
        }
        setIsSubmitting(true);
        try {
            await contentService.submitContent(contentId!);
            setStatus("SUBMITTED");
            message.success("Document submitted for review successfully!");
        } catch (err: any) {
            message.error(err.response?.data?.message || "Failed to submit for review");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApprove = async () => {
        if (!contentId) return;
        try {
            await contentService.approveContent(contentId);
            setStatus("APPROVED");
            message.success("Document approved!");
        } catch (err: any) {
            message.error(err.response?.data?.message || "Approval failed");
        }
    };

    const handleReject = async () => {
        if (!contentId || !rejectReason.trim()) {
            message.error("Please state the reason for rejecting or requesting changes");
            return;
        }
        try {
            await contentService.rejectContent(contentId, rejectReason);
            setStatus("DRAFT");
            setRejectModalOpen(false);
            setRejectReason("");
            message.info("Document rejected with feedback sent to author");
        } catch (err: any) {
            message.error(err.response?.data?.message || "Rejection failed");
        }
    };

    const handlePublish = async () => {
        if (!contentId) {
            const saved = await handleSave();
            if (!saved) return;
        }
        setIsSubmitting(true);
        try {
            await contentService.publishContent(contentId!);
            setStatus("PUBLISHED");
            message.success("Article published live to the company portal!");
        } catch (err: any) {
            message.error(err.response?.data?.message || "Publishing failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Dynamic Inline Category Creation ---
    const handleCreateCategory = async (values: any) => {
        try {
            const res = await categoryService.createCategory({
                name: values.name,
                slug: values.slug || generateSlug(values.name),
                description: values.description,
            });
            message.success("Category created!");
            setCategories((prev) => [...prev, res]);
            setSelectedCategoryIds((prev) => [...prev, res.id]);
            setCreateCategoryModalOpen(false);
            categoryForm.resetFields();
        } catch (err: any) {
            message.error(err.response?.data?.message || "Failed to create category");
        }
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", display: "flex", flexDirection: "column" }}>
            {/* Local Draft Recovery Notification */}
            {recoveredDraft && (
                <Alert
                    message="Unsaved Local Draft Detected"
                    description={
                        <Space>
                            <span>Found an unsaved draft from your previous session: "{recoveredDraft.title}".</span>
                            <Button
                                size="small"
                                type="primary"
                                onClick={() => {
                                    setTitle(recoveredDraft.title);
                                    setSlug(recoveredDraft.slug);
                                    setExcerpt(recoveredDraft.excerpt || "");
                                    setCoverImageUrl(recoveredDraft.coverImageUrl);
                                    if (recoveredDraft.blocks && recoveredDraft.blocks.length > 0) {
                                        setBlocks(recoveredDraft.blocks);
                                    }
                                    setRecoveredDraft(null);
                                    message.success("Restored local draft!");
                                }}
                            >
                                Restore Draft
                            </Button>
                            <Button
                                size="small"
                                onClick={() => {
                                    clearLocalDraft();
                                    setRecoveredDraft(null);
                                }}
                            >
                                Discard
                            </Button>
                        </Space>
                    }
                    type="info"
                    showIcon
                    closable
                    onClose={() => setRecoveredDraft(null)}
                    style={{ margin: "12px 24px 0 24px", borderRadius: 8 }}
                />
            )}

            {/* A. TOP EDITOR TOOLBAR */}
            <EditorToolbar
                title={title}
                status={status}
                contentType={contentType}
                wordCount={wordCount}
                readTimeMinutes={readTimeMinutes}
                autosaveStatus={autosaveStatus}
                canUndo={canUndo}
                canRedo={canRedo}
                sidebarOpen={sidebarOpen}
                isSaving={isSaving}
                isSubmitting={isSubmitting}
                userRole={userRole}
                onBack={() => navigate("/content")}
                onSaveDraft={() => handleSave()}
                onSubmitForReview={handleSubmitForReview}
                onApprove={handleApprove}
                onReject={() => setRejectModalOpen(true)}
                onPublish={handlePublish}
                onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
                onOpenRevisions={() => setRevisionsModalOpen(true)}
                onOpenPreview={(device) => {
                    setPreviewDevice(device);
                    setPreviewModalOpen(true);
                }}
                onUndo={undo}
                onRedo={redo}
            />

            {/* B & C. MAIN WORKSPACE CONTAINER */}
            <div style={{ display: "flex", flex: 1, position: "relative" }}>
                {/* B. MAIN CONTENT CANVAS */}
                <EditorCanvas
                    title={title}
                    onUpdateTitle={handleUpdateTitle}
                    excerpt={excerpt}
                    onUpdateExcerpt={setExcerpt}
                    coverImageUrl={coverImageUrl}
                    onOpenMediaPicker={() => {
                        setMediaTargetBlockId(null);
                        setMediaPickerOpen(true);
                    }}
                    onRemoveCover={() => setCoverImageUrl(undefined)}
                    blocks={blocks}
                    selectedBlockId={selectedBlockId}
                    onSelectBlock={setSelectedBlockId}
                    onUpdateBlockContent={handleUpdateBlockContent}
                    onMoveBlock={handleMoveBlock}
                    onDuplicateBlock={handleDuplicateBlock}
                    onDeleteBlock={handleDeleteBlock}
                    onTransformBlock={handleTransformBlock}
                    onInsertBlock={handleInsertBlock}
                    onOpenBlockPicker={(targetIdx) => {
                        setBlockPickerIndex(targetIdx);
                        setBlockPickerOpen(true);
                    }}
                    onSelectMediaForBlock={(blockId) => {
                        setMediaTargetBlockId(blockId);
                        setMediaPickerOpen(true);
                    }}
                />

                {/* C. RIGHT SETTINGS SIDEBAR */}
                <EditorSidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    status={status}
                    authorName={initialContent?.author?.first_name ? `${initialContent.author.first_name} ${initialContent.author.last_name}` : `${currentUser?.first_name} ${currentUser?.last_name}`}
                    visibility={visibility}
                    onUpdateVisibility={setVisibility}
                    expiresAt={expiresAt}
                    onUpdateExpiresAt={setExpiresAt}
                    contentType={contentType}
                    onUpdateContentType={setContentType}
                    categories={categories}
                    selectedCategoryIds={selectedCategoryIds}
                    onUpdateCategoryIds={setSelectedCategoryIds}
                    onOpenCreateCategory={() => setCreateCategoryModalOpen(true)}
                    tags={tags}
                    onUpdateTags={setTags}
                    coverImageUrl={coverImageUrl}
                    onOpenMediaPicker={() => {
                        setMediaTargetBlockId(null);
                        setMediaPickerOpen(true);
                    }}
                    onRemoveCoverImage={() => setCoverImageUrl(undefined)}
                    slug={slug}
                    onUpdateSlug={setSlug}
                    seoTitle={seoTitle}
                    onUpdateSeoTitle={setSeoTitle}
                    seoDescription={seoDescription}
                    onUpdateSeoDescription={setSeoDescription}
                    selectedBlock={selectedBlock}
                    onUpdateSelectedBlockContent={(c) => {
                        if (selectedBlockId) handleUpdateBlockContent(selectedBlockId, c);
                    }}
                />
            </div>

            {/* Block Inserter Picker Modal */}
            <BlockPickerModal
                open={blockPickerOpen}
                onClose={() => setBlockPickerOpen(false)}
                onSelectBlock={(type) => handleInsertBlock(type, blockPickerIndex)}
                onSelectTemplate={handleSelectTemplate}
                targetIndex={blockPickerIndex}
            />

            {/* Media Picker Modal */}
            <MediaPickerModal
                open={mediaPickerOpen}
                onClose={() => {
                    setMediaPickerOpen(false);
                    setMediaTargetBlockId(null);
                }}
                onSelect={handleMediaSelected}
            />

            {/* Responsive Live Preview Modal */}
            <ResponsivePreviewModal
                open={previewModalOpen}
                initialDevice={previewDevice}
                onClose={() => setPreviewModalOpen(false)}
                title={title}
                excerpt={excerpt}
                coverImageUrl={coverImageUrl}
                contentType={contentType}
                authorName={initialContent?.author?.first_name ? `${initialContent.author.first_name} ${initialContent.author.last_name}` : `${currentUser?.first_name} ${currentUser?.last_name}`}
                blocks={blocks}
            />

            {/* Revisions History Modal */}
            <RevisionsModal
                open={revisionsModalOpen}
                onClose={() => setRevisionsModalOpen(false)}
                contentId={contentId}
                onRestored={(restoredContent) => {
                    if (restoredContent.title) setTitle(restoredContent.title);
                    if (restoredContent.blocks) {
                        const formatted = restoredContent.blocks.map((b: any, i: number) => ({
                            id: b.id || generateId(),
                            block_type: b.block_type,
                            block_order: b.block_order ?? i + 1,
                            content: b.content || {},
                            style: b.style || null,
                        }));
                        resetHistory(formatted);
                    }
                }}
            />

            {/* Inline Dynamic Category Creation Modal */}
            <Modal
                open={createCategoryModalOpen}
                title="Create New Category"
                onCancel={() => setCreateCategoryModalOpen(false)}
                onOk={() => categoryForm.submit()}
                destroyOnClose
            >
                <Form form={categoryForm} layout="vertical" onFinish={handleCreateCategory}>
                    <Form.Item name="name" label="Category Name" rules={[{ required: true, message: "Please enter category name" }]}>
                        <Input placeholder="e.g. Health & Safety" />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea placeholder="Optional category description..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Reject Content Modal */}
            <Modal
                open={rejectModalOpen}
                title="Reject or Request Changes"
                onCancel={() => {
                    setRejectModalOpen(false);
                    setRejectReason("");
                }}
                onOk={handleReject}
                okText="Submit Feedback"
                okButtonProps={{ danger: true }}
            >
                <Input.TextArea
                    rows={4}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Describe what changes are needed before this document can be approved..."
                />
            </Modal>
        </div>
    );
};
