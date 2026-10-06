import { useState, useCallback, useEffect } from "react";
import type { EditorBlock } from "../types";

export interface UseUndoRedoReturn {
    blocks: EditorBlock[];
    setBlocks: (newBlocks: EditorBlock[] | ((prev: EditorBlock[]) => EditorBlock[]), recordHistory?: boolean) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    resetHistory: (initialBlocks: EditorBlock[]) => void;
}

export const useUndoRedo = (initialBlocks: EditorBlock[] = []): UseUndoRedoReturn => {
    const [past, setPast] = useState<EditorBlock[][]>([]);
    const [present, setPresent] = useState<EditorBlock[]>(initialBlocks);
    const [future, setFuture] = useState<EditorBlock[][]>([]);

    const canUndo = past.length > 0;
    const canRedo = future.length > 0;

    const undo = useCallback(() => {
        if (!canUndo) return;

        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        setPast(newPast);
        setFuture([present, ...future]);
        setPresent(previous);
    }, [canUndo, past, present, future]);

    const redo = useCallback(() => {
        if (!canRedo) return;

        const next = future[0];
        const newFuture = future.slice(1);

        setPast([...past, present]);
        setPresent(next);
        setFuture(newFuture);
    }, [canRedo, past, present, future]);

    const setBlocks = useCallback(
        (action: EditorBlock[] | ((prev: EditorBlock[]) => EditorBlock[]), recordHistory = true) => {
            setPresent((current) => {
                const next = typeof action === "function" ? action(current) : action;
                if (recordHistory) {
                    setPast((p) => [...p.slice(-25), current]); // cap history to last 25 steps
                    setFuture([]);
                }
                return next;
            });
        },
        []
    );

    const resetHistory = useCallback((newInitial: EditorBlock[]) => {
        setPast([]);
        setFuture([]);
        setPresent(newInitial);
    }, []);

    // Global keyboard listener for Ctrl+Z and Ctrl+Y / Ctrl+Shift+Z
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only capture if not inside an active native input or if command pressed
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
                if (e.shiftKey) {
                    e.preventDefault();
                    redo();
                } else {
                    e.preventDefault();
                    undo();
                }
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
                e.preventDefault();
                redo();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [undo, redo]);

    return {
        blocks: present,
        setBlocks,
        undo,
        redo,
        canUndo,
        canRedo,
        resetHistory,
    };
};
