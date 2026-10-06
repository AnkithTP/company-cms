import { useState, useEffect, useRef, useCallback } from "react";
import type { AutosaveStatus, EditorBlock } from "../types";

export interface DraftBackupPayload {
    title: string;
    slug: string;
    coverImageUrl?: string;
    excerpt?: string;
    blocks: EditorBlock[];
    savedAt: string;
}

export interface UseAutosaveProps {
    contentId?: string | null;
    title: string;
    slug: string;
    coverImageUrl?: string;
    excerpt?: string;
    blocks: EditorBlock[];
    onSaveToServer?: () => Promise<boolean>;
    enabled?: boolean;
}

export const useAutosave = ({
    contentId,
    title,
    slug,
    coverImageUrl,
    excerpt,
    blocks,
    onSaveToServer,
    enabled = true,
}: UseAutosaveProps) => {
    const [status, setStatus] = useState<AutosaveStatus>("idle");
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

    const storageKey = `company_cms_draft_${contentId || "new_article"}`;
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isInitialMount = useRef<boolean>(true);

    // Save to local storage for crash recovery
    const saveToLocalStorage = useCallback(() => {
        try {
            const payload: DraftBackupPayload = {
                title,
                slug,
                coverImageUrl,
                excerpt,
                blocks,
                savedAt: new Date().toISOString(),
            };
            localStorage.setItem(storageKey, JSON.stringify(payload));
        } catch {
            // Ignore storage quotas
        }
    }, [storageKey, title, slug, coverImageUrl, excerpt, blocks]);

    // Check if there is a local draft stored
    const getLocalDraft = useCallback((): DraftBackupPayload | null => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }, [storageKey]);

    const clearLocalDraft = useCallback(() => {
        try {
            localStorage.removeItem(storageKey);
        } catch {
            // Ignore
        }
    }, [storageKey]);

    // Debounced autosave effect
    useEffect(() => {
        if (!enabled) return;

        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        setHasUnsavedChanges(true);
        saveToLocalStorage();

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Only autosave to server if title exists and onSaveToServer is provided
        if (title.trim() && onSaveToServer) {
            setStatus("saving");
            timerRef.current = setTimeout(async () => {
                try {
                    const success = await onSaveToServer();
                    if (success) {
                        setStatus("saved");
                        setLastSavedAt(new Date());
                        setHasUnsavedChanges(false);
                    } else {
                        setStatus("error");
                    }
                } catch {
                    setStatus("error");
                }
            }, 3500); // 3.5s debounce
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [title, slug, coverImageUrl, excerpt, blocks, enabled, onSaveToServer, saveToLocalStorage]);

    return {
        autosaveStatus: status,
        lastSavedAt,
        hasUnsavedChanges,
        getLocalDraft,
        clearLocalDraft,
    };
};
