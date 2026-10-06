import React, { useEffect, useState, useMemo } from "react";
import {
    Card,
    Typography,
    Button,
    Space,
    Input,
    Select,
    Row,
    Col,
    Upload,
    message,
    Modal,
    Drawer,
    Tag,
    Popconfirm,
    Empty,
    Spin,
    Segmented,
    Table,
    Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
    InboxOutlined,
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
    PictureOutlined,
    FileTextOutlined,
    CopyOutlined,
    DeleteOutlined,
    EyeOutlined,
    AppstoreOutlined,
    BarsOutlined,
    DownloadOutlined,
} from "@ant-design/icons";
import * as mediaService from "../../features/media/media.service";
import type { MediaItem } from "../../features/media/media.types";
import { getMediaUrl } from "../../utils/media";

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { Option } = Select;

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const MediaListPage: React.FC = () => {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("ALL");
    const [inspectItem, setInspectItem] = useState<MediaItem | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadAltText, setUploadAltText] = useState("");

    const loadMedia = async () => {
        setIsLoading(true);
        try {
            const data = await mediaService.fetchAllMedia();
            setMediaItems(data || []);
        } catch {
            message.error("Failed to load media files");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMedia();
    }, []);

    // Filtered media
    const filteredMedia = useMemo(() => {
        return mediaItems.filter((item) => {
            const matchesSearch =
                !searchTerm ||
                item.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.alt_text && item.alt_text.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesType =
                typeFilter === "ALL" ||
                (typeFilter === "IMAGE" && item.mime_type.startsWith("image/")) ||
                (typeFilter === "DOCUMENT" &&
                    (item.mime_type.includes("pdf") ||
                        item.mime_type.includes("doc") ||
                        item.mime_type.includes("text") ||
                        item.mime_type.includes("officedocument"))) ||
                (typeFilter === "VIDEO" && item.mime_type.startsWith("video/"));

            return matchesSearch && matchesType;
        });
    }, [mediaItems, searchTerm, typeFilter]);

    // Copy direct URL
    const handleCopyUrl = (item: MediaItem) => {
        const fullUrl = getMediaUrl(item.url);
        navigator.clipboard?.writeText(fullUrl);
        message.success("Direct media URL copied to clipboard!");
    };

    // Delete item
    const handleDelete = async (id: string, name: string) => {
        try {
            await mediaService.deleteMediaItem(id);
            message.success(`"${name}" deleted successfully`);
            setMediaItems((prev) => prev.filter((m) => m.id !== id));
            if (inspectItem?.id === id) {
                setInspectItem(null);
            }
        } catch (err: any) {
            message.error(err.response?.data?.message || "Failed to delete asset");
        }
    };

    // Handle Upload File
    const handleCustomUpload = async (options: any) => {
        const { file, onSuccess, onError } = options;
        setUploading(true);
        try {
            const uploaded = await mediaService.uploadMediaFile(file, uploadAltText.trim() || undefined);
            message.success(`Uploaded "${file.name}" successfully!`);
            setMediaItems((prev) => [uploaded, ...prev]);
            setUploadAltText("");
            setUploadModalOpen(false);
            onSuccess(uploaded);
        } catch (err: any) {
            message.error(err.response?.data?.message || "Failed to upload file");
            onError(err);
        } finally {
            setUploading(false);
        }
    };

    // Table Columns
    const columns: ColumnsType<MediaItem> = [
        {
            title: "Asset",
            key: "preview",
            width: 80,
            render: (_, record) => {
                const isImg = record.mime_type.startsWith("image/");
                return (
                    <div
                        style={{
                            width: 50,
                            height: 50,
                            borderRadius: 6,
                            overflow: "hidden",
                            backgroundColor: "#f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                        }}
                        onClick={() => setInspectItem(record)}
                    >
                        {isImg ? (
                            <img
                                src={getMediaUrl(record.url)}
                                alt={record.original_name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        ) : (
                            <FileTextOutlined style={{ fontSize: 24, color: "#64748b" }} />
                        )}
                    </div>
                );
            },
        },
        {
            title: "File Name",
            dataIndex: "original_name",
            key: "name",
            render: (text: string, record) => (
                <div>
                    <Text strong style={{ cursor: "pointer" }} onClick={() => setInspectItem(record)}>
                        {text}
                    </Text>
                    {record.alt_text && (
                        <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Alt: {record.alt_text}
                            </Text>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: "MIME Type",
            dataIndex: "mime_type",
            key: "mime",
            width: 140,
            render: (mime: string) => <Tag color="geekblue">{mime}</Tag>,
        },
        {
            title: "Size",
            dataIndex: "file_size",
            key: "size",
            width: 100,
            render: (size: number) => <Text type="secondary">{formatFileSize(size)}</Text>,
        },
        {
            title: "Uploaded Date",
            dataIndex: "created_at",
            key: "date",
            width: 150,
            render: (d: string) => <Text type="secondary">{new Date(d).toLocaleDateString()}</Text>,
        },
        {
            title: "Actions",
            key: "actions",
            width: 150,
            align: "right",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View & Inspect Details">
                        <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => setInspectItem(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Copy Direct URL">
                        <Button
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => handleCopyUrl(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title={`Delete asset "${record.original_name}"?`}
                        onConfirm={() => handleDelete(record.id, record.original_name)}
                        okText="Yes, Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                    >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
            {/* Header */}
            <Row justify="space-between" align="middle">
                <Col>
                    <Title level={3} style={{ margin: 0 }}>
                        <PictureOutlined style={{ marginRight: 8, color: "#1677ff" }} />
                        Media & Digital Assets
                    </Title>
                    <Text type="secondary">
                        Upload, manage, and inspect all photography, documents, and creative assets.
                    </Text>
                </Col>
                <Col>
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={loadMedia} loading={isLoading}>
                            Refresh
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setUploadModalOpen(true)}
                        >
                            Upload Asset
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Filter and View Toggle Bar */}
            <Card
                bordered={false}
                bodyStyle={{ padding: "14px 20px" }}
                style={{ borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
            >
                <Row justify="space-between" align="middle" gutter={[16, 12]}>
                    <Col xs={24} sm={10} md={8}>
                        <Input
                            placeholder="Search by file name or alt text..."
                            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={12} sm={8} md={6}>
                        <Select
                            style={{ width: "100%" }}
                            value={typeFilter}
                            onChange={(val) => setTypeFilter(val)}
                        >
                            <Option value="ALL">All Media Types</Option>
                            <Option value="IMAGE">Images Only (PNG, JPG, WebP)</Option>
                            <Option value="DOCUMENT">Documents & PDFs</Option>
                            <Option value="VIDEO">Videos</Option>
                        </Select>
                    </Col>
                    <Col xs={12} sm={6} md={4} style={{ textAlign: "right" }}>
                        <Segmented
                            value={viewMode}
                            onChange={(val) => setViewMode(val as "grid" | "table")}
                            options={[
                                { value: "grid", icon: <AppstoreOutlined /> },
                                { value: "table", icon: <BarsOutlined /> },
                            ]}
                        />
                    </Col>
                </Row>
            </Card>

            {/* Content Area: Grid vs Table */}
            {isLoading ? (
                <div style={{ textAlign: "center", padding: 80 }}>
                    <Spin size="large" tip="Loading media gallery..." />
                </div>
            ) : filteredMedia.length === 0 ? (
                <Card style={{ textAlign: "center", padding: 60, borderRadius: 12 }}>
                    <Empty
                        description="No media files found"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setUploadModalOpen(true)}
                        >
                            Upload Your First Asset
                        </Button>
                    </Empty>
                </Card>
            ) : viewMode === "grid" ? (
                <Row gutter={[16, 16]}>
                    {filteredMedia.map((item) => {
                        const isImg = item.mime_type.startsWith("image/");
                        return (
                            <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
                                <Card
                                    hoverable
                                    style={{
                                        borderRadius: 10,
                                        overflow: "hidden",
                                        border: "1px solid #e2e8f0",
                                    }}
                                    bodyStyle={{ padding: "12px 14px" }}
                                    cover={
                                        <div
                                            style={{
                                                height: 160,
                                                backgroundColor: "#f8fafc",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                overflow: "hidden",
                                                position: "relative",
                                                cursor: "pointer",
                                            }}
                                            onClick={() => setInspectItem(item)}
                                        >
                                            {isImg ? (
                                                <img
                                                    src={getMediaUrl(item.url)}
                                                    alt={item.original_name}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            ) : (
                                                <FileTextOutlined style={{ fontSize: 48, color: "#94a3b8" }} />
                                            )}
                                            <Tag
                                                color="rgba(0,0,0,0.65)"
                                                style={{
                                                    position: "absolute",
                                                    bottom: 8,
                                                    right: 8,
                                                    color: "#fff",
                                                    border: "none",
                                                    fontSize: 11,
                                                }}
                                            >
                                                {formatFileSize(item.file_size)}
                                            </Tag>
                                        </div>
                                    }
                                >
                                    <div style={{ marginBottom: 6 }}>
                                        <Text
                                            strong
                                            ellipsis={{ tooltip: item.original_name }}
                                            style={{ display: "block", fontSize: 13 }}
                                        >
                                            {item.original_name}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </Text>
                                    </div>

                                    <Row justify="space-between" align="middle" style={{ marginTop: 8 }}>
                                        <Space size={4}>
                                            <Tooltip title="Inspect">
                                                <Button
                                                    size="small"
                                                    type="text"
                                                    icon={<EyeOutlined />}
                                                    onClick={() => setInspectItem(item)}
                                                />
                                            </Tooltip>
                                            <Tooltip title="Copy Link">
                                                <Button
                                                    size="small"
                                                    type="text"
                                                    icon={<CopyOutlined />}
                                                    onClick={() => handleCopyUrl(item)}
                                                />
                                            </Tooltip>
                                        </Space>
                                        <Popconfirm
                                            title={`Delete "${item.original_name}"?`}
                                            onConfirm={() => handleDelete(item.id, item.original_name)}
                                            okText="Yes"
                                            cancelText="No"
                                            okButtonProps={{ danger: true }}
                                        >
                                            <Button
                                                size="small"
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                            />
                                        </Popconfirm>
                                    </Row>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            ) : (
                <Card
                    bordered={false}
                    bodyStyle={{ padding: 0 }}
                    style={{ borderRadius: 10, overflow: "hidden" }}
                >
                    <Table
                        columns={columns}
                        dataSource={filteredMedia}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                    />
                </Card>
            )}

            {/* Upload Modal */}
            <Modal
                title={
                    <Space>
                        <PictureOutlined style={{ color: "#1677ff" }} />
                        <span>Upload Digital Asset</span>
                    </Space>
                }
                open={uploadModalOpen}
                onCancel={() => {
                    setUploadModalOpen(false);
                    setUploadAltText("");
                }}
                footer={null}
                destroyOnClose
            >
                <div style={{ padding: "12px 0" }}>
                    <div style={{ marginBottom: 16 }}>
                        <Text strong>Alt Text / Description (Optional)</Text>
                        <Input
                            placeholder="e.g. Executive headshot of CEO or Bangalore campus main entrance"
                            value={uploadAltText}
                            onChange={(e) => setUploadAltText(e.target.value)}
                            style={{ marginTop: 6 }}
                        />
                    </div>

                    <Dragger
                        customRequest={handleCustomUpload}
                        showUploadList={false}
                        multiple={false}
                        accept="image/*,.pdf,.doc,.docx"
                        disabled={uploading}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined style={{ fontSize: 48, color: "#1677ff" }} />
                        </p>
                        <p className="ant-upload-text" style={{ fontWeight: 600 }}>
                            Click or drag file to this area to upload
                        </p>
                        <p className="ant-upload-hint" style={{ color: "#64748b", fontSize: 13 }}>
                            Support for PNG, JPG, WebP, SVG, and PDF documents up to 25MB.
                        </p>
                    </Dragger>

                    {uploading && (
                        <div style={{ textAlign: "center", marginTop: 16 }}>
                            <Spin tip="Uploading file to storage..." />
                        </div>
                    )}
                </div>
            </Modal>

            {/* Asset Detail & Inspection Drawer */}
            <Drawer
                title="Asset Details & Inspector"
                placement="right"
                width={420}
                onClose={() => setInspectItem(null)}
                open={!!inspectItem}
            >
                {inspectItem && (
                    <Space direction="vertical" orientation="vertical" style={{ width: "100%" }} size="middle">
                        {/* Preview Box */}
                        <div
                            style={{
                                width: "100%",
                                maxHeight: 260,
                                backgroundColor: "#f8fafc",
                                borderRadius: 8,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                                border: "1px solid #e2e8f0",
                            }}
                        >
                            {inspectItem.mime_type.startsWith("image/") ? (
                                <img
                                    src={getMediaUrl(inspectItem.url)}
                                    alt={inspectItem.original_name}
                                    style={{ maxWidth: "100%", maxHeight: 260, objectFit: "contain" }}
                                />
                            ) : (
                                <FileTextOutlined style={{ fontSize: 64, color: "#94a3b8" }} />
                            )}
                        </div>

                        {/* Direct URL Box */}
                        <div>
                            <Text strong style={{ fontSize: 13 }}>Direct URL</Text>
                            <Input.Search
                                readOnly
                                value={getMediaUrl(inspectItem.url)}
                                enterButton={<Button icon={<CopyOutlined />}>Copy</Button>}
                                onSearch={() => handleCopyUrl(inspectItem)}
                                style={{ marginTop: 6 }}
                            />
                        </div>

                        {/* Metadata Details */}
                        <div style={{ backgroundColor: "#f8fafc", padding: 14, borderRadius: 8 }}>
                            <Space direction="vertical" style={{ width: "100%" }} size="small">
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>File Name:</Text>
                                    <div><Text strong>{inspectItem.original_name}</Text></div>
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>File Size:</Text>
                                    <div><Text strong>{formatFileSize(inspectItem.file_size)}</Text></div>
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>MIME Type:</Text>
                                    <div><Tag color="blue">{inspectItem.mime_type}</Tag></div>
                                </div>
                                {inspectItem.alt_text && (
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>Alt Text:</Text>
                                        <div><Text>{inspectItem.alt_text}</Text></div>
                                    </div>
                                )}
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Uploaded On:</Text>
                                    <div><Text strong>{new Date(inspectItem.created_at).toLocaleString()}</Text></div>
                                </div>
                            </Space>
                        </div>

                        {/* Action buttons */}
                        <Space style={{ width: "100%", marginTop: 12 }}>
                            <Button
                                block
                                icon={<DownloadOutlined />}
                                href={getMediaUrl(inspectItem.url)}
                                target="_blank"
                                download
                            >
                                Open File
                            </Button>
                            <Popconfirm
                                title={`Delete "${inspectItem.original_name}"?`}
                                onConfirm={() => handleDelete(inspectItem.id, inspectItem.original_name)}
                                okText="Yes, Delete"
                                cancelText="Cancel"
                                okButtonProps={{ danger: true }}
                            >
                                <Button block danger icon={<DeleteOutlined />}>
                                    Delete
                                </Button>
                            </Popconfirm>
                        </Space>
                    </Space>
                )}
            </Drawer>
        </Space>
    );
};

export default MediaListPage;
