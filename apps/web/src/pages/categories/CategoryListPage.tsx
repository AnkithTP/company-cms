import React, { useEffect, useMemo, useState } from "react";
import {
    Table,
    Card,
    Typography,
    Button,
    Space,
    Input,
    Tag,
    Modal,
    Form,
    Select,
    Switch,
    Popconfirm,
    message,
    Row,
    Col,
    Statistic,
    Tooltip,
    Badge,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
    FolderOutlined,
    FolderOpenOutlined,
    EditOutlined,
    DeleteOutlined,
    ApartmentOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    StopOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../hooks";
import {
    fetchCategoryList,
    createNewCategory,
    updateExistingCategory,
    deleteExistingCategory,
    selectAllCategories,
    selectCategoryLoading,
    selectCategoryActionLoading,
} from "../../features/categories/categorySlice";
import type { Category, CreateCategoryRequest } from "../../features/categories/category.types";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Utility to generate URL-safe slug from title
const generateSlug = (text: string) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

interface CategoryTreeItem extends Category {
    key: string;
    children?: CategoryTreeItem[];
}

const CategoryListPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const categories = useAppSelector(selectAllCategories);
    const loading = useAppSelector(selectCategoryLoading);
    const actionLoading = useAppSelector(selectCategoryActionLoading);

    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [targetParentId, setTargetParentId] = useState<string | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        dispatch(fetchCategoryList());
    }, [dispatch]);

    // Build hierarchical tree structure for Ant Design Table
    const treeData = useMemo(() => {
        // First filter by search text and status
        const filtered = categories.filter((cat) => {
            const matchesSearch =
                !searchText ||
                cat.name.toLowerCase().includes(searchText.toLowerCase()) ||
                cat.slug.toLowerCase().includes(searchText.toLowerCase()) ||
                (cat.description &&
                    cat.description.toLowerCase().includes(searchText.toLowerCase()));

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && cat.is_active) ||
                (statusFilter === "INACTIVE" && !cat.is_active);

            return matchesSearch && matchesStatus;
        });

        // Map items by id
        const itemMap = new Map<string, CategoryTreeItem>();
        filtered.forEach((cat) => {
            itemMap.set(cat.id, {
                ...cat,
                key: cat.id,
                children: undefined,
            });
        });

        const roots: CategoryTreeItem[] = [];

        // Build hierarchy: assign children to parents
        itemMap.forEach((item) => {
            if (item.parent_id && itemMap.has(item.parent_id)) {
                const parent = itemMap.get(item.parent_id)!;
                if (!parent.children) {
                    parent.children = [];
                }
                parent.children.push(item);
            } else {
                roots.push(item);
            }
        });

        return roots;
    }, [categories, searchText, statusFilter]);

    // Stats calculations
    const stats = useMemo(() => {
        const total = categories.length;
        const roots = categories.filter((c) => !c.parent_id).length;
        const subs = categories.filter((c) => !!c.parent_id).length;
        const active = categories.filter((c) => c.is_active).length;
        const totalArticles = categories.reduce(
            (acc, curr) => acc + (curr.contents?.length || 0),
            0
        );
        return { total, roots, subs, active, totalArticles };
    }, [categories]);

    // Open Modal for Create or Edit
    const handleOpenModal = (categoryToEdit?: Category, presetParentId?: string) => {
        setTargetParentId(presetParentId || null);
        if (categoryToEdit) {
            setEditingCategory(categoryToEdit);
            form.setFieldsValue({
                name: categoryToEdit.name,
                slug: categoryToEdit.slug,
                parent_id: categoryToEdit.parent_id || null,
                description: categoryToEdit.description || "",
                is_active: categoryToEdit.is_active,
            });
        } else {
            setEditingCategory(null);
            form.resetFields();
            form.setFieldsValue({
                parent_id: presetParentId || null,
                is_active: true,
            });
        }
        setModalOpen(true);
    };

    // Auto slug sync when typing category name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editingCategory) {
            const generated = generateSlug(e.target.value);
            form.setFieldsValue({ slug: generated });
        }
    };

    // Submit form (Create / Update)
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload: CreateCategoryRequest = {
                name: values.name.trim(),
                slug: values.slug.trim(),
                parent_id: values.parent_id || null,
                description: values.description ? values.description.trim() : null,
                is_active: values.is_active ?? true,
            };

            if (editingCategory) {
                await dispatch(
                    updateExistingCategory({ id: editingCategory.id, data: payload })
                ).unwrap();
                message.success(`Category "${payload.name}" updated successfully`);
            } else {
                await dispatch(createNewCategory(payload)).unwrap();
                message.success(`Category "${payload.name}" created successfully`);
            }

            setModalOpen(false);
            dispatch(fetchCategoryList());
        } catch (err: any) {
            if (err?.message) {
                message.error(err.message);
            }
        }
    };

    // Delete category
    const handleDelete = async (id: string, name: string) => {
        try {
            await dispatch(deleteExistingCategory(id)).unwrap();
            message.success(`Category "${name}" removed successfully`);
            dispatch(fetchCategoryList());
        } catch (err: any) {
            message.error(err || "Failed to delete category");
        }
    };

    // Columns
    const columns: ColumnsType<CategoryTreeItem> = [
        {
            title: "Category Name",
            dataIndex: "name",
            key: "name",
            width: 320,
            render: (name: string, record) => {
                const isRoot = !record.parent_id;
                return (
                    <Space>
                        {isRoot ? (
                            <FolderOpenOutlined style={{ color: "#1677ff", fontSize: 16 }} />
                        ) : (
                            <FolderOutlined style={{ color: "#722ed1", fontSize: 14 }} />
                        )}
                        <Text strong={isRoot} style={{ fontSize: isRoot ? 14 : 13 }}>
                            {name}
                        </Text>
                        {isRoot ? (
                            <Tag color="blue" style={{ fontSize: 11, padding: "0 6px" }}>
                                Major Category
                            </Tag>
                        ) : (
                            <Tag color="purple" style={{ fontSize: 11, padding: "0 6px" }}>
                                Subcategory
                            </Tag>
                        )}
                    </Space>
                );
            },
        },
        {
            title: "Slug",
            dataIndex: "slug",
            key: "slug",
            width: 180,
            render: (slug: string) => (
                <Tag color="geekblue" style={{ fontFamily: "monospace" }}>
                    /{slug}
                </Tag>
            ),
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
            render: (desc: string) => (
                <Text type="secondary">{desc || "—"}</Text>
            ),
        },
        {
            title: "Articles",
            key: "articles_count",
            width: 120,
            align: "center",
            render: (_, record) => {
                const count = record.contents?.length || 0;
                return (
                    <Badge
                        count={count}
                        showZero
                        style={{
                            backgroundColor: count > 0 ? "#52c41a" : "#d9d9d9",
                        }}
                    />
                );
            },
        },
        {
            title: "Status",
            dataIndex: "is_active",
            key: "is_active",
            width: 110,
            align: "center",
            render: (active: boolean) =>
                active ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                        Active
                    </Tag>
                ) : (
                    <Tag icon={<StopOutlined />} color="default">
                        Inactive
                    </Tag>
                ),
        },
        {
            title: "Actions",
            key: "actions",
            width: 220,
            align: "right",
            render: (_, record) => {
                const articleCount = record.contents?.length || 0;
                const hasSubcategories = (record.children?.length || 0) > 0;

                return (
                    <Space size="small">
                        {/* Add subcategory button only on root categories */}
                        {!record.parent_id && (
                            <Tooltip title={`Add subcategory under "${record.name}"`}>
                                <Button
                                    size="small"
                                    type="dashed"
                                    icon={<ApartmentOutlined />}
                                    onClick={() => handleOpenModal(undefined, record.id)}
                                >
                                    + Add Subcategory
                                </Button>
                            </Tooltip>
                        )}
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleOpenModal(record)}
                        >
                            Edit
                        </Button>
                        <Popconfirm
                            title={`Delete category "${record.name}"?`}
                            description={
                                hasSubcategories
                                    ? "Cannot delete: this category has subcategories. Remove them first."
                                    : articleCount > 0
                                    ? `Warning: ${articleCount} article(s) are attached to this category.`
                                    : "Are you sure you want to delete this category?"
                            }
                            okText="Yes, Delete"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true, disabled: hasSubcategories }}
                            onConfirm={() => handleDelete(record.id, record.name)}
                        >
                            <Button
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                disabled={hasSubcategories}
                            />
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];

    // Filter root categories for parent dropdown (exclude the one currently being edited)
    const availableParents = categories.filter((c) => {
        if (!c.parent_id) {
            if (editingCategory && c.id === editingCategory.id) {
                return false;
            }
            return true;
        }
        return false;
    });

    return (
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
            {/* Header section */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 4 }}>
                <Col>
                    <Title level={3} style={{ margin: 0 }}>
                        <FolderOpenOutlined style={{ marginRight: 8, color: "#1677ff" }} />
                        Category Management
                    </Title>
                    <Text type="secondary">
                        Organize content with hierarchical categories for publication and portal discovery.
                    </Text>
                </Col>
                <Col>
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => dispatch(fetchCategoryList())}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => handleOpenModal()}
                        >
                            Add Category
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Stats Row */}
            <Row gutter={[16, 16]}>
                <Col xs={12} sm={6} md={6}>
                    <Card size="small" bordered={false} style={{ background: "#f6ffed", borderColor: "#b7eb8f" }}>
                        <Statistic
                            title={<Text strong style={{ color: "#389e0d" }}>Total Categories</Text>}
                            value={stats.total}
                            prefix={<FolderOutlined style={{ color: "#52c41a" }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6} md={6}>
                    <Card size="small" bordered={false} style={{ background: "#e6f4ff", borderColor: "#91caff" }}>
                        <Statistic
                            title={<Text strong style={{ color: "#0958d9" }}>Root Topics</Text>}
                            value={stats.roots}
                            prefix={<FolderOpenOutlined style={{ color: "#1677ff" }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6} md={6}>
                    <Card size="small" bordered={false} style={{ background: "#f9f0ff", borderColor: "#d3adf7" }}>
                        <Statistic
                            title={<Text strong style={{ color: "#531dab" }}>Subcategories</Text>}
                            value={stats.subs}
                            prefix={<ApartmentOutlined style={{ color: "#722ed1" }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6} md={6}>
                    <Card size="small" bordered={false} style={{ background: "#fff7e6", borderColor: "#ffd591" }}>
                        <Statistic
                            title={<Text strong style={{ color: "#d46b08" }}>Articles Tagged</Text>}
                            value={stats.totalArticles}
                            prefix={<FileTextOutlined style={{ color: "#fa8c16" }} />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filter and Table Card */}
            <Card
                bordered={false}
                bodyStyle={{ padding: "16px 20px" }}
                style={{ borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            >
                <Row justify="space-between" align="middle" style={{ marginBottom: 16 }} gutter={[12, 12]}>
                    <Col xs={24} sm={12} md={10}>
                        <Input
                            placeholder="Search categories by name, slug or description..."
                            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Select
                            style={{ width: "100%" }}
                            value={statusFilter}
                            onChange={(val) => setStatusFilter(val)}
                        >
                            <Option value="ALL">All Statuses</Option>
                            <Option value="ACTIVE">Active Only</Option>
                            <Option value="INACTIVE">Inactive Only</Option>
                        </Select>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={treeData}
                    loading={loading}
                    pagination={false}
                    rowKey="id"
                    defaultExpandAllRows
                    locale={{
                        emptyText: "No categories found. Click '+ Add Category' to create one.",
                    }}
                />
            </Card>

            {/* Create / Edit Category Modal */}
            <Modal
                title={
                    <Space>
                        <FolderOpenOutlined style={{ color: "#1677ff" }} />
                        <span>
                            {editingCategory
                                ? "Edit Category"
                                : targetParentId
                                ? `Add Subcategory under "${categories.find((c) => c.id === targetParentId)?.name || "Major Category"}"`
                                : "Create Major Category"}
                        </span>
                    </Space>
                }
                open={modalOpen}
                onOk={handleSubmit}
                onCancel={() => setModalOpen(false)}
                okText={
                    editingCategory
                        ? "Save Changes"
                        : targetParentId
                        ? "Create Subcategory"
                        : "Create Major Category"
                }
                confirmLoading={actionLoading}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ is_active: true }}
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        label="Category Name"
                        name="name"
                        rules={[
                            { required: true, message: "Category name is required" },
                            { min: 2, message: "Name must be at least 2 characters" },
                            { max: 100, message: "Name cannot exceed 100 characters" },
                        ]}
                    >
                        <Input
                            placeholder="e.g. Engineering & Tech"
                            onChange={handleNameChange}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Slug (URL identifier)"
                        name="slug"
                        tooltip="Auto-generated lowercase identifier used in links and filters"
                        rules={[
                            { required: true, message: "Slug is required" },
                            {
                                pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                                message:
                                    "Slug must contain lowercase alphanumeric characters and single hyphens (e.g. tech-blog)",
                            },
                        ]}
                    >
                        <Input placeholder="e.g. engineering-tech" />
                    </Form.Item>

                    <Form.Item
                        label="Parent Category (Optional)"
                        name="parent_id"
                        tooltip="Leave blank to create a top-level category, or select an existing category to nest it as a subcategory"
                    >
                        <Select placeholder="None (Root Category)" allowClear>
                            {availableParents.map((parent) => (
                                <Option key={parent.id} value={parent.id}>
                                    📁 {parent.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ max: 500, message: "Description cannot exceed 500 characters" }]}
                    >
                        <TextArea
                            rows={3}
                            placeholder="Describe what kind of content belongs in this category..."
                            showCount
                            maxLength={500}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Active Status"
                        name="is_active"
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>
                </Form>
            </Modal>
        </Space>
    );
};

export default CategoryListPage;
