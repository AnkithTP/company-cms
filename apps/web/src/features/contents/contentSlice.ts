import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../store/store";
import type {
    Content,
    ContentListQuery,
    ContentListResponse,
    ContentDetailResponse,
    CreateContentRequest,
    UpdateContentRequest,
    EditorSaveRequest,
} from "./content.types";
import * as contentService from "./content.service";

// ---------- Thunks ----------
export const fetchContentList = createAsyncThunk<
    ContentListResponse,
    ContentListQuery,
    { rejectValue: string }
>("contents/fetchList", async (params, { rejectWithValue }) => {
    try {
        return await contentService.fetchContents(params);
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || "Failed to load contents");
    }
});

export const fetchContentDetail = createAsyncThunk<
    ContentDetailResponse,
    string,
    { rejectValue: string }
>("contents/fetchDetail", async (id, { rejectWithValue }) => {
    try {
        return await contentService.fetchContentById(id);
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || "Failed to load content");
    }
});

export const createNewContent = createAsyncThunk<
    ContentDetailResponse,
    CreateContentRequest,
    { rejectValue: string }
>("contents/create", async (payload, { rejectWithValue }) => {
    try {
        return await contentService.createContent(payload);
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || "Failed to create content");
    }
});

export const updateExistingContent = createAsyncThunk<
    ContentDetailResponse,
    { id: string; data: UpdateContentRequest },
    { rejectValue: string }
>("contents/update", async ({ id, data }, { rejectWithValue }) => {
    try {
        return await contentService.updateContent(id, data);
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || "Failed to update content");
    }
});

export const saveEditor = createAsyncThunk<
    ContentDetailResponse,
    { id: string; data: EditorSaveRequest },
    { rejectValue: string }
>("contents/saveEditor", async ({ id, data }, { rejectWithValue }) => {
    try {
        return await contentService.saveEditorContent(id, data);
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || "Failed to save editor content");
    }
});

// ---------- Slice ----------
interface ContentState {
    list: Content[];
    pagination: { page: number; limit: number; total: number; totalPages: number } | null;
    current: Content | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: ContentState = {
    list: [],
    pagination: null,
    current: null,
    isLoading: false,
    error: null,
};

const contentSlice = createSlice({
    name: "contents",
    initialState,
    reducers: {
        clearCurrent(state) {
            state.current = null;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchContentList.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchContentList.fulfilled, (state, action) => {
                state.isLoading = false;
                state.list = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchContentList.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchContentDetail.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchContentDetail.fulfilled, (state, action) => {
                state.isLoading = false;
                state.current = action.payload.data;
            })
            .addCase(fetchContentDetail.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(createNewContent.fulfilled, (state, action) => {
                // after creation, push to list (optimistic)
                state.list.unshift(action.payload.data);
            })
            .addCase(updateExistingContent.fulfilled, (state, action) => {
                if (state.current) state.current = action.payload.data;
                const idx = state.list.findIndex((c) => c.id === action.payload.data.id);
                if (idx >= 0) state.list[idx] = action.payload.data;
            })
            .addCase(saveEditor.fulfilled, (state, action) => {
                if (state.current) state.current = action.payload.data;
                const idx = state.list.findIndex((c) => c.id === action.payload.data.id);
                if (idx >= 0) state.list[idx] = action.payload.data;
            });
    },
});

export const { clearCurrent, clearError } = contentSlice.actions;
export const selectContentState = (state: RootState) => state.contents;
export default contentSlice.reducer;
