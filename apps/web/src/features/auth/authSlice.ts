import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import type { LoginRequest, LoginUser } from "./auth.types";

import { login, getMe } from "./auth.service";
import { storage } from "../../utils/storage";

interface AuthState {
    user: LoginUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: storage.getUser(),
    token: storage.getToken(),
    isAuthenticated: !!storage.getToken(),
    isLoading: false,
    error: null,
};

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (credentials: LoginRequest, { rejectWithValue }) => {
        try {
            const response = await login(credentials);

            storage.setToken(response.data.token);
            storage.setUser(response.data.user);

            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Login failed",
            );
        }
    },
);

export const fetchCurrentUser = createAsyncThunk(
    "auth/fetchCurrentUser",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getMe();
            storage.setUser(response.data);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch user profile",
            );
        }
    },
);

const authSlice = createSlice({
    name: "auth",

    initialState,

    reducers: {
        logout: (state) => {
            storage.removeToken();

            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
        },

        clearAuthError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })

            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;

                state.user = action.payload.data.user;
                state.token = action.payload.data.token;
                state.isAuthenticated = true;
            })

            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = (action.payload as string) || "Login failed";
            })

            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.user = action.payload.data;
                state.isAuthenticated = true;
            })

            .addCase(fetchCurrentUser.rejected, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                storage.removeToken();
            });
    },
});

export const { logout, clearAuthError } = authSlice.actions;

export default authSlice.reducer;
