import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axios";

// Fetch imaging by patient
export const fetchImagingByPatient = createAsyncThunk(
    "imaging/fetchByPatient",
    async (patientId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/imaging?patientId=${patientId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch imaging files"
            );
        }
    }
);

// Upload imaging file
export const uploadImaging = createAsyncThunk(
    "imaging/upload",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/imaging/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to upload file"
            );
        }
    }
);

// Fetch categories
export const fetchCategories = createAsyncThunk(
    "imaging/fetchCategories",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/imaging/categories");
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch categories"
            );
        }
    }
);

const initialState = {
    files: [],
    grouped: {},
    categories: [],
    loading: false,
    uploading: false,
    error: null,
    successMessage: null
};

const imagingSlice = createSlice({
    name: "imaging",
    initialState,
    reducers: {
        clearImaging: (state) => {
            state.files = [];
            state.grouped = {};
            state.error = null;
            state.successMessage = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch by patient
            .addCase(fetchImagingByPatient.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchImagingByPatient.fulfilled, (state, action) => {
                state.loading = false;
                state.files = action.payload.data;
                state.grouped = action.payload.grouped;
            })
            .addCase(fetchImagingByPatient.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Upload
            .addCase(uploadImaging.pending, (state) => {
                state.uploading = true;
                state.error = null;
            })
            .addCase(uploadImaging.fulfilled, (state, action) => {
                state.uploading = false;
                state.files.unshift(action.payload);
                // Update grouped
                const cat = action.payload.category;
                if (!state.grouped[cat]) state.grouped[cat] = [];
                state.grouped[cat].unshift(action.payload);
                state.successMessage = "File uploaded successfully";
            })
            .addCase(uploadImaging.rejected, (state, action) => {
                state.uploading = false;
                state.error = action.payload;
            })

            // Categories
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
            });
    }
});

export const { clearImaging, clearError, clearSuccessMessage } = imagingSlice.actions;
export default imagingSlice.reducer;
