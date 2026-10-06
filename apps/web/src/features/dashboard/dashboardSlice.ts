import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { getDashboardSummary } from "./dashboard.service";

import type { DashboardSummary } from "./dashboard.types";

interface DashboardState {
    data: DashboardSummary | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: DashboardState = {
    data: null,
    isLoading: false,
    error: null,
};

export const fetchDashboardSummary = createAsyncThunk(
    "dashboard/fetchSummary",
    async (_, { rejectWithValue }) => {
        try {
            return await getDashboardSummary();
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to load dashboard",
            );
        }
    },
);

const dashboardSlice = createSlice({
    name: "dashboard",

    initialState,

    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardSummary.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })

            .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })

            .addCase(fetchDashboardSummary.rejected, (state, action) => {
                state.isLoading = false;

                state.error =
                    (action.payload as string) || "Failed to load dashboard";
            });
    },
});

export default dashboardSlice.reducer;
