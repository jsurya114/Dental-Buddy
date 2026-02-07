import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axios";

// Async Thunk for login
export const loginClinicAdmin = createAsyncThunk(
    "clinicAdmin/login",
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/clinic-admin/login", credentials);
            const { accessToken, admin } = response.data;

            // Store token in localStorage
            localStorage.setItem("clinicAdminToken", accessToken);
            localStorage.setItem("clinicAdmin", JSON.stringify(admin));

            return { token: accessToken, admin };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Login failed"
            );
        }
    }
);

// Async Thunk for refreshing access token
export const refreshToken = createAsyncThunk(
    "clinicAdmin/refreshToken",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/clinic-admin/refresh-token");
            const { accessToken } = response.data;

            localStorage.setItem("clinicAdminToken", accessToken);

            return { token: accessToken };
        } catch (error) {
            // Clear storage on refresh failure
            localStorage.removeItem("clinicAdminToken");
            localStorage.removeItem("clinicAdmin");
            return rejectWithValue("Session expired. Please login again.");
        }
    }
);

// Initial state
const initialState = {
    admin: JSON.parse(localStorage.getItem("clinicAdmin")) || null,
    token: localStorage.getItem("clinicAdminToken") || null,
    isAuthenticated: !!localStorage.getItem("clinicAdminToken"),
    loading: false,
    error: null
};

// Slice
const clinicAdminSlice = createSlice({
    name: "clinicAdmin",
    initialState,
    reducers: {
        logout: (state) => {
            state.admin = null;
            state.token = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            localStorage.removeItem("clinicAdminToken");
            localStorage.removeItem("clinicAdmin");
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login cases
            .addCase(loginClinicAdmin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginClinicAdmin.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.token = action.payload.token;
                state.admin = action.payload.admin;
                state.error = null;
            })
            .addCase(loginClinicAdmin.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.token = null;
                state.admin = null;
                state.error = action.payload;
            })
            // Refresh token cases
            .addCase(refreshToken.fulfilled, (state, action) => {
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(refreshToken.rejected, (state) => {
                state.admin = null;
                state.token = null;
                state.isAuthenticated = false;
            });
    }
});

export const { logout, clearError } = clinicAdminSlice.actions;
export default clinicAdminSlice.reducer;
