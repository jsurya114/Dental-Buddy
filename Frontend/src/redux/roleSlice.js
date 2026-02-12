import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axios";

// Fetch all roles
export const fetchRoles = createAsyncThunk(
    "roles/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/admin/roles");
            return response.data.roles;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch roles");
        }
    }
);

// Fetch single role
export const fetchRoleById = createAsyncThunk(
    "roles/fetchSingle",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/admin/roles/${id}`);
            return response.data.role;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch role");
        }
    }
);

// Create role
export const createRole = createAsyncThunk(
    "roles/create",
    async (roleData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/admin/roles", roleData);
            return response.data.role;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create role");
        }
    }
);

// Update role
export const updateRole = createAsyncThunk(
    "roles/update",
    async ({ id, roleData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/admin/roles/${id}`, roleData);
            return response.data.role;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update role");
        }
    }
);

// Delete role
export const deleteRole = createAsyncThunk(
    "roles/delete",
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/admin/roles/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete role");
        }
    }
);

// Toggle role status
export const toggleRole = createAsyncThunk(
    "roles/toggle",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/admin/roles/${id}/toggle`);
            return response.data.role;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to toggle role");
        }
    }
);

const initialState = {
    roles: [],
    currentRole: null,
    loading: false,
    error: null,
    success: null
};

const roleSlice = createSlice({
    name: "roles",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = null;
        },
        clearCurrentRole: (state) => {
            state.currentRole = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch roles
            .addCase(fetchRoles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRoles.fulfilled, (state, action) => {
                state.loading = false;
                state.roles = action.payload;
            })
            .addCase(fetchRoles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch single role
            .addCase(fetchRoleById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRoleById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentRole = action.payload;
            })
            .addCase(fetchRoleById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create role
            .addCase(createRole.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createRole.fulfilled, (state, action) => {
                state.loading = false;
                state.roles.push(action.payload);
                state.success = "Role created successfully";
            })
            .addCase(createRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update role
            .addCase(updateRole.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateRole.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.roles.findIndex(r => r._id === action.payload._id);
                if (index !== -1) {
                    state.roles[index] = action.payload;
                }
                state.success = "Role updated successfully";
            })
            .addCase(updateRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete role
            .addCase(deleteRole.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteRole.fulfilled, (state, action) => {
                state.loading = false;
                state.roles = state.roles.filter(r => r._id !== action.payload);
                state.success = "Role deleted successfully";
            })
            .addCase(deleteRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Toggle role
            .addCase(toggleRole.fulfilled, (state, action) => {
                const index = state.roles.findIndex(r => r._id === action.payload._id);
                if (index !== -1) {
                    state.roles[index] = action.payload;
                }
                state.success = `Role ${action.payload.isActive ? "enabled" : "disabled"} successfully`;
            });
    }
});

export const { clearError, clearSuccess, clearCurrentRole } = roleSlice.actions;
export default roleSlice.reducer;
