import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axios";

// Fetch all users
export const fetchUsers = createAsyncThunk(
    "users/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/public/users");
            return response.data.users;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch users");
        }
    }
);

// Fetch professional users
export const fetchProfessionalUsers = createAsyncThunk(
    "users/fetchProfessional",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/public/users?isProfessional=true");
            return response.data.users;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch professional users");
        }
    }
);

// Create user
export const createUser = createAsyncThunk(
    "users/create",
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/admin/users", userData);
            return response.data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create user");
        }
    }
);

// Update user
export const updateUser = createAsyncThunk(
    "users/update",
    async ({ id, userData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/admin/users/${id}`, userData);
            return response.data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update user");
        }
    }
);

// Toggle user status
export const toggleUser = createAsyncThunk(
    "users/toggle",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/admin/users/${id}/toggle`);
            return response.data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to toggle user");
        }
    }
);

// Delete user
export const deleteUser = createAsyncThunk(
    "users/delete",
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/admin/users/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete user");
        }
    }
);

const initialState = {
    users: [],
    professionalUsers: [],
    loading: false,
    error: null,
    success: null
};

const userSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch users
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create user
            .addCase(createUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users.unshift(action.payload);
                state.success = "User created successfully";
            })
            .addCase(createUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update user
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.users.findIndex(u => u._id === action.payload._id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
                state.success = "User updated successfully";
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Toggle user
            .addCase(toggleUser.fulfilled, (state, action) => {
                const index = state.users.findIndex(u => u._id === action.payload._id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
            })
            // Delete user
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter(u => u._id !== action.payload);
                state.success = "User deleted successfully";
            })
            // Fetch professional users
            .addCase(fetchProfessionalUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProfessionalUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.professionalUsers = action.payload;
            })
            .addCase(fetchProfessionalUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, clearSuccess } = userSlice.actions;
export default userSlice.reducer;
