import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../api/axios";

// Async Thunks

// Fetch Illustrations
export const fetchIllustrations = createAsyncThunk(
    "illustrations/fetchIllustrations",
    async (type = "ALL", { rejectWithValue }) => {
        try {
            const response = await axios.get(`/illustrations?type=${type}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch illustrations");
        }
    }
);

// Upload Media (Image/Video)
export const uploadMedia = createAsyncThunk(
    "illustrations/uploadMedia",
    async ({ type, file, title }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append("type", type);
            formData.append("file", file);
            if (title) formData.append("title", title);

            const response = await axios.post("/illustrations", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to upload media");
        }
    }
);

// Add Embed
export const addEmbed = createAsyncThunk(
    "illustrations/addEmbed",
    async ({ type, embedUrl, title }, { rejectWithValue }) => {
        try {
            const response = await axios.post("/illustrations", {
                type,
                embedUrl,
                title
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to add embed");
        }
    }
);

// Delete Illustration
export const deleteIllustration = createAsyncThunk(
    "illustrations/deleteIllustration",
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`/illustrations/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete illustration");
        }
    }
);

const illustrationSlice = createSlice({
    name: "illustrations",
    initialState: {
        items: [],
        loading: false,
        error: null,
        filter: "ALL"
    },
    reducers: {
        setFilter: (state, action) => {
            state.filter = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchIllustrations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchIllustrations.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchIllustrations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Upload
            .addCase(uploadMedia.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadMedia.fulfilled, (state, action) => {
                state.loading = false;
                state.items.unshift(action.payload); // Add to top
            })
            .addCase(uploadMedia.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Embed
            .addCase(addEmbed.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addEmbed.fulfilled, (state, action) => {
                state.loading = false;
                state.items.unshift(action.payload); // Add to top
            })
            .addCase(addEmbed.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete
            .addCase(deleteIllustration.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteIllustration.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter(item => item._id !== action.payload);
            })
            .addCase(deleteIllustration.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { setFilter, clearError } = illustrationSlice.actions;
export default illustrationSlice.reducer;
