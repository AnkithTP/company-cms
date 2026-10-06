import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../store/store";
import type {
    Category,
    CreateCategoryRequest,
    UpdateCategoryRequest,
} from "./category.types";
import * as categoryService from "./category.service";

// ---------- Thunks ----------
export const fetchCategoryList = createAsyncThunk<
    Category[],
    void,
    { rejectValue: string }
>("categories/fetchList", async (_, { rejectWithValue }) => {
    try {
        return await categoryService.fetchCategories();
    } catch (err: any) {
        return rejectWithValue(
            err.response?.data?.message || "Failed to load categories"
        );
    }
});

export const createNewCategory = createAsyncThunk<
    Category,
    CreateCategoryRequest,
    { rejectValue: string }
>("categories/create", async (payload, { rejectWithValue }) => {
    try {
        return await categoryService.createCategory(payload);
    } catch (err: any) {
        return rejectWithValue(
            err.response?.data?.message || "Failed to create category"
        );
    }
});

export const updateExistingCategory = createAsyncThunk<
    Category,
    { id: string; data: UpdateCategoryRequest },
    { rejectValue: string }
>("categories/update", async ({ id, data }, { rejectWithValue }) => {
    try {
        return await categoryService.updateCategory(id, data);
    } catch (err: any) {
        return rejectWithValue(
            err.response?.data?.message || "Failed to update category"
        );
    }
});

export const deleteExistingCategory = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>("categories/delete", async (id, { rejectWithValue }) => {
    try {
        await categoryService.deleteCategory(id);
        return id;
    } catch (err: any) {
        return rejectWithValue(
            err.response?.data?.message || "Failed to delete category"
        );
    }
});

// ---------- State & Slice ----------
interface CategoryState {
    items: Category[];
    loading: boolean;
    actionLoading: boolean;
    error: string | null;
}

const initialState: CategoryState = {
    items: [],
    loading: false,
    actionLoading: false,
    error: null,
};

const categorySlice = createSlice({
    name: "categories",
    initialState,
    reducers: {
        clearCategoryError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // fetch
        builder
            .addCase(fetchCategoryList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategoryList.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchCategoryList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to load categories";
            });

        // create
        builder
            .addCase(createNewCategory.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })
            .addCase(createNewCategory.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.items.push(action.payload);
            })
            .addCase(createNewCategory.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload || "Failed to create category";
            });

        // update
        builder
            .addCase(updateExistingCategory.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })
            .addCase(updateExistingCategory.fulfilled, (state, action) => {
                state.actionLoading = false;
                const idx = state.items.findIndex((c) => c.id === action.payload.id);
                if (idx !== -1) {
                    state.items[idx] = action.payload;
                }
            })
            .addCase(updateExistingCategory.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload || "Failed to update category";
            });

        // delete
        builder
            .addCase(deleteExistingCategory.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })
            .addCase(deleteExistingCategory.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.items = state.items.filter((c) => c.id !== action.payload);
            })
            .addCase(deleteExistingCategory.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload || "Failed to delete category";
            });
    },
});

export const { clearCategoryError } = categorySlice.actions;

export const selectCategoryState = (state: RootState) => state.categories;
export const selectAllCategories = (state: RootState) => state.categories.items;
export const selectCategoryLoading = (state: RootState) => state.categories.loading;
export const selectCategoryActionLoading = (state: RootState) =>
    state.categories.actionLoading;

export default categorySlice.reducer;
