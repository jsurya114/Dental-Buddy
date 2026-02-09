import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axios";

// Fetch patients with pagination and search
export const fetchPatients = createAsyncThunk(
    "patients/fetchPatients",
    async ({ page = 1, limit = 20, search = "" } = {}, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/patients", {
                params: { page, limit, search }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch patients"
            );
        }
    }
);

// Get single patient
export const fetchPatientById = createAsyncThunk(
    "patients/fetchPatientById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/patients/${id}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch patient details"
            );
        }
    }
);

// Create patient
export const createPatient = createAsyncThunk(
    "patients/createPatient",
    async (patientData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/patients", patientData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to register patient"
            );
        }
    }
);

// Update patient
export const updatePatient = createAsyncThunk(
    "patients/updatePatient",
    async ({ id, patientData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/patients/${id}`, patientData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to update patient"
            );
        }
    }
);

// Deactivate patient
export const deactivatePatient = createAsyncThunk(
    "patients/deactivatePatient",
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.patch(`/patients/${id}/deactivate`);
            return id;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to deactivate patient"
            );
        }
    }
);

const initialState = {
    patients: [],
    currentPatient: null,
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 1
    },
    loading: false,
    error: null,
    successMessage: null
};

const patientSlice = createSlice({
    name: "patients",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        },
        clearCurrentPatient: (state) => {
            state.currentPatient = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Patients
            .addCase(fetchPatients.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPatients.fulfilled, (state, action) => {
                state.loading = false;
                state.patients = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchPatients.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Single Patient
            .addCase(fetchPatientById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPatientById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentPatient = action.payload;
            })
            .addCase(fetchPatientById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create Patient
            .addCase(createPatient.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(createPatient.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
            })
            .addCase(createPatient.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update Patient
            .addCase(updatePatient.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(updatePatient.fulfilled, (state, action) => {
                state.loading = false;
                state.currentPatient = action.payload.data;
                state.successMessage = action.payload.message;
            })
            .addCase(updatePatient.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Deactivate Patient
            .addCase(deactivatePatient.fulfilled, (state, action) => {
                state.patients = state.patients.filter(p => p._id !== action.payload);
                state.successMessage = "Patient deactivated successfully";
            });
    }
});

export const { clearError, clearSuccessMessage, clearCurrentPatient } = patientSlice.actions;
export default patientSlice.reducer;
