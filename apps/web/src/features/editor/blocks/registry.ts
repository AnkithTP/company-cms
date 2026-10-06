import type { BlockDefinition, ContentTemplate } from "../types";

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
    // --- TEXT BLOCKS ---
    {
        type: "PARAGRAPH",
        label: "Paragraph",
        description: "Start writing with plain or formatted rich text.",
        icon: "FileTextOutlined",
        category: "TEXT",
        slashAlias: ["p", "para", "text"],
        defaultContent: () => ({ text: "", align: "left" }),
    },
    {
        type: "HEADING",
        label: "Heading",
        description: "Introduce new sections and organize document hierarchy.",
        icon: "FontSizeOutlined",
        category: "TEXT",
        slashAlias: ["h", "h1", "h2", "h3", "h4", "header"],
        defaultContent: () => ({ level: 2, text: "", align: "left" }),
    },
    {
        type: "QUOTE",
        label: "Quote",
        description: "Give quoted text visual emphasis and cite speakers.",
        icon: "CommentOutlined",
        category: "TEXT",
        slashAlias: ["q", "blockquote", "cite"],
        defaultContent: () => ({ text: "", author: "", citation: "" }),
    },
    {
        type: "CALLOUT",
        label: "Callout Banner",
        description: "Highlight important tips, warnings, or announcements.",
        icon: "AlertOutlined",
        category: "TEXT",
        slashAlias: ["alert", "note", "tip", "warning", "info"],
        defaultContent: () => ({
            intent: "info", // "info" | "warning" | "success" | "danger"
            title: "Important Notice",
            text: "Add key policy details or team updates here.",
        }),
    },
    {
        type: "LIST",
        label: "List",
        description: "Create an unordered bullet list or ordered numbered list.",
        icon: "UnorderedListOutlined",
        category: "TEXT",
        slashAlias: ["ul", "ol", "bullet", "checklist"],
        defaultContent: () => ({
            style: "bullet", // "bullet" | "numbered"
            items: ["Key takeaway or first requirement", "Second detail or recommendation"],
        }),
    },
    {
        type: "CODE",
        label: "Code Block",
        description: "Display code snippets or configuration syntax.",
        icon: "CodeOutlined",
        category: "TEXT",
        slashAlias: ["code", "pre", "syntax"],
        defaultContent: () => ({ code: "// Enter configuration or code snippet here\n", language: "javascript" }),
    },

    // --- MEDIA BLOCKS ---
    {
        type: "IMAGE",
        label: "Image",
        description: "Insert a photo, diagram, or illustration from media library.",
        icon: "PictureOutlined",
        category: "MEDIA",
        slashAlias: ["img", "photo", "pic"],
        defaultContent: () => ({
            url: "",
            caption: "",
            alt: "",
            align: "center", // "left" | "center" | "right" | "full"
        }),
    },
    {
        type: "GALLERY",
        label: "Image Gallery",
        description: "Showcase multiple photos in an elegant responsive grid.",
        icon: "AppstoreOutlined",
        category: "MEDIA",
        slashAlias: ["gallery", "photos", "grid"],
        defaultContent: () => ({
            images: [],
            columns: 3,
            layout: "grid", // "grid" | "masonry"
        }),
    },
    {
        type: "VIDEO",
        label: "Video",
        description: "Embed YouTube, Vimeo, or company internal MP4 video.",
        icon: "VideoCameraOutlined",
        category: "MEDIA",
        slashAlias: ["vid", "youtube", "vimeo"],
        defaultContent: () => ({
            url: "",
            caption: "",
            autoplay: false,
        }),
    },
    {
        type: "DOCUMENT",
        label: "File / Document",
        description: "Attach downloadable PDF, DOCX, or spreadsheet resources.",
        icon: "FilePdfOutlined",
        category: "MEDIA",
        slashAlias: ["pdf", "file", "download", "attachment"],
        defaultContent: () => ({
            url: "",
            fileName: "Company_Handbook.pdf",
            fileSize: "1.4 MB",
        }),
    },

    // --- DESIGN & LAYOUT BLOCKS ---
    {
        type: "DIVIDER",
        label: "Divider",
        description: "Visually separate thematic sections with a subtle divider line.",
        icon: "LineOutlined",
        category: "DESIGN",
        slashAlias: ["hr", "line", "sep"],
        defaultContent: () => ({ style: "solid" }), // "solid" | "dashed" | "dots"
    },
    {
        type: "SPACER",
        label: "Spacer",
        description: "Add custom vertical spacing between content sections.",
        icon: "ColumnHeightOutlined",
        category: "DESIGN",
        slashAlias: ["space", "gap"],
        defaultContent: () => ({ height: 32 }),
    },
    {
        type: "BUTTON",
        label: "Button CTA",
        description: "Prompts users with an action or link to an internal portal resource.",
        icon: "CompassOutlined",
        category: "DESIGN",
        slashAlias: ["btn", "cta", "link"],
        defaultContent: () => ({
            text: "Read Full Document",
            url: "/portal",
            variant: "primary", // "primary" | "secondary" | "outline"
            align: "left",
            openInNewTab: false,
        }),
    },
    {
        type: "COLUMNS",
        label: "2 Columns Layout",
        description: "Place content side-by-side in balanced columns.",
        icon: "SplitCellsOutlined",
        category: "DESIGN",
        slashAlias: ["cols", "grid2", "split"],
        defaultContent: () => ({
            columns: [
                {
                    title: "Left Column",
                    text: "Add left side details, bullet points, or instructions.",
                },
                {
                    title: "Right Column",
                    text: "Add right side summary, metrics, or complementary notes.",
                },
            ],
        }),
    },

    // --- INTERACTIVE BLOCKS ---
    {
        type: "TABLE",
        label: "Table",
        description: "Display structured tabular data with headers, rows, and columns.",
        icon: "TableOutlined",
        category: "INTERACTIVE",
        slashAlias: ["table", "sheet", "grid"],
        defaultContent: () => ({
            headers: ["Feature / Item", "Department", "Timeline", "Status"],
            rows: [
                ["Platform Upgrade", "Engineering", "Q4 2026", "In Progress"],
                ["Policy Review", "HR", "Immediate", "Active"],
            ],
        }),
    },
    {
        type: "ACCORDION",
        label: "Accordion / FAQ",
        description: "Create collapsible sections for FAQs and policy guidelines.",
        icon: "MenuUnfoldOutlined",
        category: "INTERACTIVE",
        slashAlias: ["faq", "accordion", "collapse", "dropdown"],
        defaultContent: () => ({
            items: [
                {
                    question: "Who is eligible for this company update?",
                    answer: "All full-time and contract team members across all regional offices.",
                },
                {
                    question: "Where can I submit further questions?",
                    answer: "Please reach out to the internal HR and People Operations portal desk.",
                },
            ],
        }),
    },
];

export const getBlockDefinition = (type: string): BlockDefinition => {
    const found = BLOCK_DEFINITIONS.find((b) => b.type === type);
    if (found) return found;
    return BLOCK_DEFINITIONS[0]; // fallback to paragraph
};

export const CONTENT_TEMPLATES: ContentTemplate[] = [
    {
        id: "company-announcement",
        name: "Company Announcement",
        description: "Executive townhall recap, strategic milestones, and office news.",
        contentType: "ANNOUNCEMENT",
        icon: "NotificationOutlined",
        blocks: () => [
            {
                block_type: "HEADING",
                content: { level: 1, text: "Company Milestone: Q4 2026 Strategic Update", align: "left" },
            },
            {
                block_type: "CALLOUT",
                content: {
                    intent: "success",
                    title: "Important Milestone",
                    text: "We are thrilled to celebrate our new cross-department initiative and enterprise milestones.",
                },
            },
            {
                block_type: "PARAGRAPH",
                content: {
                    text: "Over the past quarter, teams across engineering, human resources, and business operations have collaborated to achieve outstanding results. Today, we are proud to share our accomplishments and roadmap ahead.",
                    align: "left",
                },
            },
            {
                block_type: "QUOTE",
                content: {
                    text: "Great things in business are never done by one person. They're done by a team of people.",
                    author: "Leadership Team",
                    citation: "All-Hands Meeting 2026",
                },
            },
            {
                block_type: "DIVIDER",
                content: { style: "solid" },
            },
            {
                block_type: "HEADING",
                content: { level: 2, text: "Key Objectives & Timeline", align: "left" },
            },
            {
                block_type: "LIST",
                content: {
                    style: "bullet",
                    items: [
                        "Complete rollout of the new enterprise knowledge portal across all regional branches.",
                        "Host virtual enablement sessions for team leaders and staff members.",
                        "Gather feedback and continuous improvement suggestions via the HR portal.",
                    ],
                },
            },
        ],
    },
    {
        id: "hr-policy",
        name: "HR & Workplace Policy",
        description: "Leave guidelines, benefits, health & wellness, and workplace standards.",
        contentType: "POLICY",
        icon: "SafetyCertificateOutlined",
        blocks: () => [
            {
                block_type: "HEADING",
                content: { level: 1, text: "Company Leave & Flexible Working Policy (2026)", align: "left" },
            },
            {
                block_type: "CALLOUT",
                content: {
                    intent: "info",
                    title: "Policy Scope & Eligibility",
                    text: "Effective October 1, 2026. This policy applies to all global permanent employees.",
                },
            },
            {
                block_type: "PARAGRAPH",
                content: {
                    text: "Our company is committed to fostering an inclusive, healthy, and flexible work environment. This policy outlines our standards for personal time off, medical leave, and hybrid workplace expectations.",
                    align: "left",
                },
            },
            {
                block_type: "HEADING",
                content: { level: 2, text: "Policy Highlights", align: "left" },
            },
            {
                block_type: "TABLE",
                content: {
                    headers: ["Leave Category", "Annual Entitlement", "Advance Notice Required"],
                    rows: [
                        ["Paid Time Off (PTO)", "24 Days", "2 Business Days"],
                        ["Wellness / Sick Leave", "12 Days", "Same-Day Notification"],
                        ["Parental Leave", "16 Weeks Paid", "30 Days Notice"],
                    ],
                },
            },
            {
                block_type: "DIVIDER",
                content: { style: "dashed" },
            },
            {
                block_type: "ACCORDION",
                content: {
                    items: [
                        {
                            question: "How do I request extended time off?",
                            answer: "Submit your request through the HR portal at least two weeks before your requested leave start date.",
                        },
                        {
                            question: "Can unused leave days be rolled over into the next fiscal year?",
                            answer: "Up to 5 days of PTO may be rolled over into the first quarter of the following year with managerial approval.",
                        },
                    ],
                },
            },
        ],
    },
    {
        id: "tech-article",
        name: "Technology & Engineering Update",
        description: "Engineering design docs, platform releases, and best practices.",
        contentType: "TECH_ARTICLE",
        icon: "CodeOutlined",
        blocks: () => [
            {
                block_type: "HEADING",
                content: { level: 1, text: "Architectural Overview: Modernizing Internal Content Delivery", align: "left" },
            },
            {
                block_type: "PARAGRAPH",
                content: {
                    text: "In this technical deep-dive, we explore the architectural design patterns adopted for our high-performance internal CMS, including headless API design, role-based security, and extensible block systems.",
                    align: "left",
                },
            },
            {
                block_type: "HEADING",
                content: { level: 2, text: "Architecture Principles", align: "left" },
            },
            {
                block_type: "LIST",
                content: {
                    style: "numbered",
                    items: [
                        "Stateless authentication backed by encrypted JWT tokens.",
                        "Strict role-based permissions verified at database repository boundaries.",
                        "JSONB structured block serialization for limitless extensibility.",
                    ],
                },
            },
            {
                block_type: "CODE",
                content: {
                    code: "// Example Content Block Schema\nconst block = {\n  id: 'uuid-v4',\n  block_type: 'HEADING',\n  content: { level: 2, text: 'System Architecture' },\n  style: { align: 'left' }\n};",
                    language: "typescript",
                },
            },
        ],
    },
];
