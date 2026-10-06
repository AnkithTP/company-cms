import React, { useEffect, useState } from "react";
import { Spin, Card, Empty, Button, message } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { ContentEditor } from "../../features/editor/ContentEditor";
import * as contentService from "../../features/contents/content.service";

export const ContentDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [content, setContent] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadContent = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const res = await contentService.fetchContentById(id);
            const blocksRes = await contentService.fetchContentBlocks(id).catch(() => ({ data: [] }));

            const fullContent = {
                ...res.data,
                ContentBlocks: blocksRes.data || (res.data as any).ContentBlocks || [],
            };
            setContent(fullContent);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to load document");
            message.error("Failed to load document");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadContent();
    }, [id]);

    if (isLoading) {
        return (
            <div style={{ textAlign: "center", padding: "140px 20px", minHeight: "80vh" }}>
                <Spin size="large" tip="Loading Gutenberg editor..." />
            </div>
        );
    }

    if (error || !content) {
        return (
            <div style={{ padding: "60px 20px", textAlign: "center" }}>
                <Card style={{ maxWidth: 500, margin: "0 auto", borderRadius: 12 }}>
                    <Empty description={error || "Document not found"} />
                    <Button type="primary" onClick={() => navigate("/content")} style={{ marginTop: 16 }}>
                        Return to Content List
                    </Button>
                </Card>
            </div>
        );
    }

    return <ContentEditor initialContent={content} mode="edit" />;
};

export default ContentDetailPage;
