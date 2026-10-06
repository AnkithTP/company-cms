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
    Tag,
    Modal,
    Form,
    DatePicker,
    TimePicker,
    message,
    Empty,
    Spin,
    Statistic,
    Tooltip,
} from "antd";
import {
    CalendarOutlined,
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
    EnvironmentOutlined,
    VideoCameraOutlined,
    UserOutlined,
    GlobalOutlined,
    ClockCircleOutlined,
    EditOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import * as eventService from "../../features/events/event.service";
import * as contentService from "../../features/contents/content.service";
import type { Content } from "../../features/contents/content.types";
import type { EventDetail } from "../../features/events/event.types";

const { Title, Text } = Typography;
const { Option } = Select;

const EventListPage: React.FC = () => {
    const navigate = useNavigate();

    const [events, setEvents] = useState<Content[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [formatFilter, setFormatFilter] = useState<string>("ALL");

    // Modal state for Scheduling
    const [modalOpen, setModalOpen] = useState(false);
    const [editingContent, setEditingContent] = useState<Content | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const loadEvents = async () => {
        setIsLoading(true);
        try {
            const data = await eventService.fetchAllEvents();
            setEvents(data || []);
        } catch {
            message.error("Failed to load corporate events");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, []);

    // Filter events
    const filteredEvents = useMemo(() => {
        return events.filter((item: any) => {
            const ev = item.eventDetails as EventDetail | undefined;
            const matchesSearch =
                !searchTerm ||
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (ev?.location && ev.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (ev?.organizer && ev.organizer.toLowerCase().includes(searchTerm.toLowerCase()));

            const isVirtual = !!ev?.meeting_url;
            const matchesFormat =
                formatFilter === "ALL" ||
                (formatFilter === "VIRTUAL" && isVirtual) ||
                (formatFilter === "IN_PERSON" && !isVirtual && !!ev?.location);

            return matchesSearch && matchesFormat;
        });
    }, [events, searchTerm, formatFilter]);

    // Stats
    const stats = useMemo(() => {
        const total = events.length;
        const upcoming = events.filter((item: any) => {
            const ev = item.eventDetails;
            if (!ev?.event_date) return false;
            return dayjs(ev.event_date).isAfter(dayjs().subtract(1, "day"));
        }).length;
        const virtual = events.filter((item: any) => !!item.eventDetails?.meeting_url).length;
        const inPerson = events.filter(
            (item: any) => !item.eventDetails?.meeting_url && !!item.eventDetails?.location
        ).length;

        return { total, upcoming, virtual, inPerson };
    }, [events]);

    // Open Modal to Schedule / Edit Details
    const handleOpenModal = (contentItem?: Content) => {
        if (contentItem) {
            setEditingContent(contentItem);
            const ev = (contentItem as any).eventDetails as EventDetail | undefined;
            form.setFieldsValue({
                title: contentItem.title,
                slug: contentItem.slug,
                event_date: ev?.event_date ? dayjs(ev.event_date) : undefined,
                start_time: ev?.start_time ? dayjs(ev.start_time, "HH:mm:ss") : undefined,
                end_time: ev?.end_time ? dayjs(ev.end_time, "HH:mm:ss") : undefined,
                location: ev?.location || "",
                meeting_url: ev?.meeting_url || "",
                organizer: ev?.organizer || "",
                registration_url: ev?.registration_url || "",
            });
        } else {
            setEditingContent(null);
            form.resetFields();
            form.setFieldsValue({
                event_date: dayjs().add(2, "day"),
                start_time: dayjs("10:00:00", "HH:mm:ss"),
                end_time: dayjs("11:30:00", "HH:mm:ss"),
            });
        }
        setModalOpen(true);
    };

    // Submit Event
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            let contentId = editingContent?.id;

            // 1. If new event, create Content record first with content_type="EVENT"
            if (!contentId) {
                const created = await contentService.createContent({
                    title: values.title.trim(),
                    slug: (
                        values.slug ||
                        values.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                    ).trim(),
                    content_type: "EVENT",
                    expires_at: values.event_date ? values.event_date.toISOString() : null,
                });
                contentId = created.data.id;
            }

            // 2. Save Event scheduling details
            await eventService.saveEventDetails(contentId, {
                event_date: values.event_date.format("YYYY-MM-DD"),
                start_time: values.start_time.format("HH:mm:ss"),
                end_time: values.end_time ? values.end_time.format("HH:mm:ss") : null,
                location: values.location ? values.location.trim() : null,
                meeting_url: values.meeting_url ? values.meeting_url.trim() : null,
                organizer: values.organizer ? values.organizer.trim() : null,
                registration_url: values.registration_url ? values.registration_url.trim() : null,
            });

            message.success(
                editingContent
                    ? "Event schedule updated successfully!"
                    : "Event created! You can now add agenda blocks or submit for review."
            );
            setModalOpen(false);
            loadEvents();
        } catch (err: any) {
            message.error(err.response?.data?.message || err.message || "Failed to save event");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
            {/* Header */}
            <Row justify="space-between" align="middle">
                <Col>
                    <Title level={3} style={{ margin: 0 }}>
                        <CalendarOutlined style={{ marginRight: 8, color: "#1677ff" }} />
                        Corporate Events & Summits
                    </Title>
                    <Text type="secondary">
                        Schedule and publish town halls, workshops, team offsites, and webinars.
                    </Text>
                </Col>
                <Col>
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={loadEvents} loading={isLoading}>
                            Refresh
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => handleOpenModal()}
                        >
                            Schedule Event
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Metrics */}
            <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                    <Card size="small" bordered={false} style={{ background: "#e6f4ff", borderColor: "#91caff" }}>
                        <Statistic
                            title={<Text strong style={{ color: "#0958d9" }}>Total Events</Text>}
                            value={stats.total}
                            prefix={<CalendarOutlined style={{ color: "#1677ff" }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" bordered={false} style={{ background: "#f6ffed", borderColor: "#b7eb8f" }}>
                        <Statistic
                            title={<Text strong style={{ color: "#389e0d" }}>Upcoming</Text>}
                            value={stats.upcoming}
                            prefix={<ClockCircleOutlined style={{ color: "#52c41a" }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" bordered={false} style={{ background: "#f9f0ff", borderColor: "#d3adf7" }}>
                        <Statistic
                            title={<Text strong style={{ color: "#531dab" }}>Virtual Webinars</Text>}
                            value={stats.virtual}
                            prefix={<VideoCameraOutlined style={{ color: "#722ed1" }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" bordered={false} style={{ background: "#fff7e6", borderColor: "#ffd591" }}>
                        <Statistic
                            title={<Text strong style={{ color: "#d46b08" }}>In-Person / Hybrid</Text>}
                            value={stats.inPerson}
                            prefix={<EnvironmentOutlined style={{ color: "#fa8c16" }} />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Search and Filters */}
            <Card
                bordered={false}
                bodyStyle={{ padding: "14px 20px" }}
                style={{ borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
            >
                <Row justify="space-between" align="middle" gutter={[16, 12]}>
                    <Col xs={24} sm={14} md={10}>
                        <Input
                            placeholder="Search by event title, location, or organizer..."
                            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={10} md={6}>
                        <Select
                            style={{ width: "100%" }}
                            value={formatFilter}
                            onChange={(val) => setFormatFilter(val)}
                        >
                            <Option value="ALL">All Event Formats</Option>
                            <Option value="VIRTUAL">Virtual / Online Only</Option>
                            <Option value="IN_PERSON">In-Person Only</Option>
                        </Select>
                    </Col>
                </Row>
            </Card>

            {/* Event Cards Grid */}
            {isLoading ? (
                <div style={{ textAlign: "center", padding: 80 }}>
                    <Spin size="large" tip="Loading corporate events..." />
                </div>
            ) : filteredEvents.length === 0 ? (
                <Card style={{ textAlign: "center", padding: 60, borderRadius: 12 }}>
                    <Empty
                        description="No scheduled corporate events found"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => handleOpenModal()}
                        >
                            Schedule First Event
                        </Button>
                    </Empty>
                </Card>
            ) : (
                <Row gutter={[20, 20]}>
                    {filteredEvents.map((item: any) => {
                        const ev = item.eventDetails as EventDetail | undefined;
                        const eventDate = ev?.event_date ? dayjs(ev.event_date) : null;
                        const isVirtual = !!ev?.meeting_url;

                        return (
                            <Col key={item.id} xs={24} md={12} lg={8}>
                                <Card
                                    hoverable
                                    style={{
                                        borderRadius: 12,
                                        border: "1px solid #e2e8f0",
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                    bodyStyle={{
                                        display: "flex",
                                        flexDirection: "column",
                                        flex: 1,
                                        padding: 20,
                                    }}
                                >
                                    {/* Date & Format Header */}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                                        <div
                                            style={{
                                                backgroundColor: "#eff6ff",
                                                border: "1px solid #bfdbfe",
                                                borderRadius: 8,
                                                padding: "6px 12px",
                                                textAlign: "center",
                                                minWidth: 64,
                                            }}
                                        >
                                            <div style={{ fontSize: 11, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase" }}>
                                                {eventDate ? eventDate.format("MMM") : "TBD"}
                                            </div>
                                            <div style={{ fontSize: 20, fontWeight: 800, color: "#1e3a8a", lineHeight: 1 }}>
                                                {eventDate ? eventDate.format("DD") : "—"}
                                            </div>
                                        </div>

                                        <Space>
                                            {isVirtual ? (
                                                <Tag icon={<VideoCameraOutlined />} color="purple">
                                                    Virtual
                                                </Tag>
                                            ) : (
                                                <Tag icon={<EnvironmentOutlined />} color="cyan">
                                                    In-Person
                                                </Tag>
                                            )}
                                            <Tag color={item.status === "PUBLISHED" ? "green" : item.status === "APPROVED" ? "blue" : "orange"}>
                                                {item.status}
                                            </Tag>
                                        </Space>
                                    </div>

                                    {/* Title */}
                                    <Title
                                        level={4}
                                        ellipsis={{ rows: 2 }}
                                        style={{ margin: "0 0 10px 0", fontSize: 18 }}
                                    >
                                        {item.title}
                                    </Title>

                                    {/* Schedule Details */}
                                    <Space direction="vertical" size={6} style={{ width: "100%", marginBottom: 16, flex: 1 }}>
                                        {ev?.start_time && (
                                            <Space style={{ color: "#475569", fontSize: 13 }}>
                                                <ClockCircleOutlined style={{ color: "#94a3b8" }} />
                                                <span>
                                                    {ev.start_time.slice(0, 5)} {ev.end_time ? `– ${ev.end_time.slice(0, 5)}` : ""}
                                                </span>
                                            </Space>
                                        )}
                                        {ev?.location && (
                                            <Space style={{ color: "#475569", fontSize: 13 }}>
                                                <EnvironmentOutlined style={{ color: "#94a3b8" }} />
                                                <Text ellipsis style={{ maxWidth: 220 }}>{ev.location}</Text>
                                            </Space>
                                        )}
                                        {ev?.organizer && (
                                            <Space style={{ color: "#475569", fontSize: 13 }}>
                                                <UserOutlined style={{ color: "#94a3b8" }} />
                                                <span>Organized by {ev.organizer}</span>
                                            </Space>
                                        )}
                                    </Space>

                                    {/* Footer Actions */}
                                    <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Space>
                                            <Button
                                                size="small"
                                                icon={<EditOutlined />}
                                                onClick={() => handleOpenModal(item)}
                                            >
                                                Schedule
                                            </Button>
                                            <Button
                                                size="small"
                                                onClick={() => navigate(`/content/${item.id}`)}
                                            >
                                                Agenda & Blocks
                                            </Button>
                                        </Space>

                                        {item.status === "PUBLISHED" && (
                                            <Tooltip title="View Live on Portal">
                                                <Button
                                                    size="small"
                                                    type="link"
                                                    icon={<GlobalOutlined />}
                                                    onClick={() => window.open(`/portal/article/${item.slug}`, "_blank")}
                                                >
                                                    Portal
                                                </Button>
                                            </Tooltip>
                                        )}
                                    </div>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}

            {/* Schedule / Edit Event Modal */}
            <Modal
                title={
                    <Space>
                        <CalendarOutlined style={{ color: "#1677ff" }} />
                        <span>{editingContent ? `Event Schedule: ${editingContent.title}` : "Schedule New Corporate Event"}</span>
                    </Space>
                }
                open={modalOpen}
                onOk={handleSubmit}
                onCancel={() => setModalOpen(false)}
                okText={editingContent ? "Save Schedule" : "Create Event"}
                confirmLoading={submitting}
                width={560}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    style={{ marginTop: 16 }}
                >
                    {!editingContent && (
                        <>
                            <Form.Item
                                label="Event Title"
                                name="title"
                                rules={[{ required: true, message: "Please enter event title" }]}
                            >
                                <Input placeholder="e.g. Annual Company Town Hall 2026" />
                            </Form.Item>

                            <Form.Item
                                label="URL Slug"
                                name="slug"
                                tooltip="Auto-generated URL identifier for employees"
                            >
                                <Input placeholder="e.g. annual-company-townhall-2026" />
                            </Form.Item>
                        </>
                    )}

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Event Date"
                                name="event_date"
                                rules={[{ required: true, message: "Please select event date" }]}
                            >
                                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                label="Start Time"
                                name="start_time"
                                rules={[{ required: true, message: "Start time required" }]}
                            >
                                <TimePicker format="HH:mm" style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="End Time" name="end_time">
                                <TimePicker format="HH:mm" style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Physical Location" name="location">
                        <Input placeholder="e.g. Main Auditorium, 4th Floor, HQ Campus" />
                    </Form.Item>

                    <Form.Item
                        label="Virtual Meeting Link (Zoom, Teams, Google Meet)"
                        name="meeting_url"
                        tooltip="If provided, this event will be tagged as Virtual / Hybrid"
                    >
                        <Input placeholder="https://meet.google.com/... or https://teams.microsoft.com/..." />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Organizer / Department" name="organizer">
                                <Input placeholder="e.g. People & Culture Team" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Registration / RSVP URL" name="registration_url">
                                <Input placeholder="https://forms.gle/..." />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </Space>
    );
};

export default EventListPage;
