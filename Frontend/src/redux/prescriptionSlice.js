import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axios";

// Async Thunks
export const fetchPrescriptions = createAsyncThunk(
    "prescriptions/fetchAll",
    async ({ patientId, caseSheetId }, { rejectWithValue }) => {
        try {
            const params = {};
            if (patientId) params.patientId = patientId;
            if (caseSheetId) params.caseSheetId = caseSheetId;

            const response = await axiosInstance.get("/prescriptions", { params });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch prescriptions");
        }
    }
);

export const createPrescription = createAsyncThunk(
    "prescriptions/create",
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/prescriptions", data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create prescription");
        }
    }
);

export const deletePrescription = createAsyncThunk(
    "prescriptions/delete",
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/prescriptions/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete prescription");
        }
    }
);

const prescriptionSlice = createSlice({
    name: "prescriptions",
    initialState: {
        list: [],
        loading: false,
        error: null,
        successMessage: null
    },
    reducers: {
        clearPrescriptionMessages: (state) => {
            state.error = null;
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchPrescriptions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPrescriptions.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchPrescriptions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create
            .addCase(createPrescription.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPrescription.fulfilled, (state, action) => {
                state.loading = false;
                state.list.unshift(action.payload); // Add to top
                state.successMessage = "Prescription created successfully";
            })
            .addCase(createPrescription.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete
            .addCase(deletePrescription.fulfilled, (state, action) => {
                state.list = state.list.filter(p => p._id !== action.payload);
                state.successMessage = "Prescription deleted";
            });
    }
});

export const { clearPrescriptionMessages } = prescriptionSlice.actions;
export default prescriptionSlice.reducer;
