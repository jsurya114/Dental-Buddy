import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axios";

// Check Session Thunk (for persistent login)
export const checkSession = createAsyncThunk(
    "auth/checkSession",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/auth/me");
            return response.data;
        } catch (error) {
            return rejectWithValue(null);
        }
    }
);

// Login thunk
export const loginUser = createAsyncThunk(
    "auth/login",
    async ({ loginId, password, roleCode }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/auth/login", {
                loginId,
                password,
                roleCode
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Login failed"
            );
        }
    }
);

// Refresh token thunk (Optional now if handled by httpOnly cookie auto-send, but might be needed for manual refresh if access token short lived)
export const refreshToken = createAsyncThunk(
    "auth/refreshToken",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/auth/refresh-token");
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Token refresh failed"
            );
        }
    }
);

// Logout thunk
export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await axiosInstance.post("/auth/logout");
            return null;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Logout failed"
            );
        }
    }
);

const initialState = {
    user: null,
    // accessToken: null, // No longer stored in state if we rely on cookies? Or keep for memory only?
    // Maintaining accessToken in memory is fine for Axios interceptor injection if we did that.
    // But since we moved to cookies, we might not need it if the cookie is sent automatically.
    // However, the cookie is HttpOnly, so JS cannot read it. 
    // If the backend expects Bearer header, we NEED the token. 
    // But the backend `authMiddleware` I wrote CHECKS COOKIES. 
    // So we don't need the token in Redux state for requests!
    isAuthenticated: false,
    loading: true, // Start true to check session
    error: null
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        // We might not need setToken anymore if we rely on cookies
        setToken: (state, action) => {
            // state.accessToken = action.payload; 
            // We can keep this if needed but we rely on cookies mostly.
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
            state.loading = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Check Session
            .addCase(checkSession.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkSession.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
            })
            .addCase(checkSession.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
            })

            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Refresh token (if used)
            .addCase(refreshToken.fulfilled, (state, action) => {
                // state.accessToken = action.payload.accessToken;
                state.isAuthenticated = true;
            })
            .addCase(refreshToken.rejected, (state) => {
                state.user = null;
                state.isAuthenticated = false;
            })

            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
            });
    }
});

export const { clearError, setToken, logout } = authSlice.actions;
export default authSlice.reducer;
