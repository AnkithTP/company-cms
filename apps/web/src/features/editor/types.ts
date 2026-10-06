import type { BlockType, ContentType } from "../contents/content.types";

export interface EditorBlock {
    id: string;
    block_type: BlockType;
    block_order: number;
    content: Record<string, any>;
    style?: Record<string, any> | null;
}

export type BlockCategory = "TEXT" | "MEDIA" | "DESIGN" | "INTERACTIVE" | "ADVANCED";

export interface BlockDefinition {
    type: BlockType;
    label: string;
    description: string;
    icon: string;
    category: BlockCategory;
    defaultContent: () => Record<string, any>;
    defaultStyle?: () => Record<string, any>;
    slashAlias?: string[];
}

export interface ContentTemplate {
    id: string;
    name: string;
    description: string;
    contentType: ContentType;
    icon: string;
    blocks: () => Omit<EditorBlock, "id" | "block_order">[];
}

export type PreviewDevice = "desktop" | "tablet" | "mobile";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";
