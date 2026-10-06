import React, { useEffect, useState } from "react";
import { Modal, Upload, Button, Row, Col, Card, Typography, Spin, message, Empty, Tabs, Input } from "antd";
import { InboxOutlined, UploadOutlined, CheckCircleFilled } from "@ant-design/icons";
import { fetchAllMedia, uploadMediaFile } from "./media.service";
import type { MediaItem } from "./media.types";
import { getMediaUrl } from "../../utils/media";

const { Text } = Typography;
const { Dragger } = Upload;

interface MediaPickerModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (media: MediaItem) => void;
    allowedType?: "IMAGE" | "VIDEO" | "DOCUMENT";
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
    open,
    onClose,
    onSelect,
    allowedType = "IMAGE",
}) => {
    const [mediaList, setMediaList] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>("library");
    const [altText, setAltText] = useState<string>("");

    const loadMedia = async () => {
        setLoading(true);
        try {
            const data = await fetchAllMedia();
            const filtered = allowedType
                ? data.filter((m) => m.file_type === allowedType)
                : data;
            setMediaList(filtered);
        } catch {
            message.error("Failed to load media library");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            loadMedia();
            setSelectedId(null);
            setActiveTab("library");
        }
    }, [open]);

    const handleCustomUpload = async (options: any) => {
        const { file, onSuccess, onError } = options;
        setUploading(true);
        try {
            const uploaded = await uploadMediaFile(file as File, altText || file.name);
            message.success("Image uploaded successfully!");
            onSuccess(uploaded);
            setAltText("");
            await loadMedia();
            onSelect(uploaded);
            onClose();
        } catch (err: any) {
            onError(err);
            message.error(err.response?.data?.message || "Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleConfirmSelect = () => {
        const found = mediaList.find((m) => m.id === selectedId);
        if (found) {
            onSelect(found);
            onClose();
        }
    };

    return (
        <Modal
            title="Media Library & Image Uploader"
            open={open}
            onCancel={onClose}
            width={840}
            footer={
                activeTab === "library" ? (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Text type="secondary">
                            {selectedId ? "1 image selected" : "Click an image to select"}
                        </Text>
                        <div>
                            <Button onClick={onClose} style={{ marginRight: 8 }}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                disabled={!selectedId}
                                onClick={handleConfirmSelect}
                            >
                                Use Selected Image
                            </Button>
                        </div>
                    </div>
                ) : null
            }
        >
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    {
                        key: "library",
                        label: `Media Library (${mediaList.length})`,
                        children: (
                            <Spin spinning={loading}>
                                {mediaList.length === 0 ? (
                                    <Empty
                                        description="No images found in library. Upload your first picture!"
                                        style={{ margin: "40px 0" }}
                                    >
                                        <Button
                                            type="primary"
                                            icon={<UploadOutlined />}
                                            onClick={() => setActiveTab("upload")}
                                        >
                                            Upload Image Now
                                        </Button>
                                    </Empty>
                                ) : (
                                    <div style={{ maxHeight: 420, overflowY: "auto", padding: 4 }}>
                                        <Row gutter={[12, 12]}>
                                            {mediaList.map((item) => {
                                                const isSelected = item.id === selectedId;
                                                return (
                                                    <Col key={item.id} xs={12} sm={8} md={6}>
                                                        <Card
                                                            hoverable
                                                            onClick={() => setSelectedId(item.id)}
                                                            bodyStyle={{ padding: 8 }}
                                                            style={{
                                                                borderRadius: 8,
                                                                position: "relative",
                                                                border: isSelected
                                                                    ? "2px solid #1677ff"
                                                                    : "1px solid #f0f0f0",
                                                                backgroundColor: isSelected
                                                                    ? "#f0f7ff"
                                                                    : "#fff",
                                                            }}
                                                            cover={
                                                                <div
                                                                    style={{
                                                                        height: 120,
                                                                        overflow: "hidden",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        backgroundColor: "#fafafa",
                                                                    }}
                                                                >
                                                                    <img
                                                                        src={getMediaUrl(item.url)}
                                                                        alt={item.alt_text || item.original_name}
                                                                        style={{
                                                                            maxHeight: "100%",
                                                                            maxWidth: "100%",
                                                                            objectFit: "cover",
                                                                        }}
                                                                    />
                                                                </div>
                                                            }
                                                        >
                                                            {isSelected && (
                                                                <CheckCircleFilled
                                                                    style={{
                                                                        position: "absolute",
                                                                        top: 8,
                                                                        right: 8,
                                                                        color: "#1677ff",
                                                                        fontSize: 18,
                                                                        background: "#fff",
                                                                        borderRadius: "50%",
                                                                    }}
                                                                />
                                                            )}
                                                            <Text
                                                                ellipsis
                                                                style={{ fontSize: 12, display: "block" }}
                                                            >
                                                                {item.original_name}
                                                            </Text>
                                                            <Text
                                                                type="secondary"
                                                                style={{ fontSize: 11 }}
                                                            >
                                                                {(item.file_size / 1024).toFixed(1)} KB
                                                            </Text>
                                                        </Card>
                                                    </Col>
                                                );
                                            })}
                                        </Row>
                                    </div>
                                )}
                            </Spin>
                        ),
                    },
                    {
                        key: "upload",
                        label: "Upload New Picture",
                        children: (
                            <div style={{ padding: "16px 0" }}>
                                <div style={{ marginBottom: 16 }}>
                                    <Text strong>Alt Text / Description (Optional)</Text>
                                    <Input
                                        placeholder="Describe the image for accessibility"
                                        value={altText}
                                        onChange={(e) => setAltText(e.target.value)}
                                        style={{ marginTop: 6 }}
                                    />
                                </div>
                                <Dragger
                                    customRequest={handleCustomUpload}
                                    showUploadList={false}
                                    accept="image/*"
                                    disabled={uploading}
                                    style={{ padding: 24, borderRadius: 8 }}
                                >
                                    <p className="ant-upload-drag-icon">
                                        <InboxOutlined style={{ fontSize: 48, color: "#1677ff" }} />
                                    </p>
                                    <p className="ant-upload-text">
                                        Click or drag image file here to upload
                                    </p>
                                    <p className="ant-upload-hint">
                                        Supports JPG, PNG, WEBP, GIF up to 10MB
                                    </p>
                                </Dragger>
                            </div>
                        ),
                    },
                ]}
            />
        </Modal>
    );
};
