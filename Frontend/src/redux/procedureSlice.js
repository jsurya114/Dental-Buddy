import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axios";

// Fetch procedures by case sheet ID
export const fetchProceduresByCaseSheet = createAsyncThunk(
    "procedures/fetchByCaseSheet",
    async (caseSheetId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/procedures?caseSheetId=${caseSheetId}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch procedures"
            );
        }
    }
);

// Fetch procedures by patient ID
export const fetchProceduresByPatient = createAsyncThunk(
    "procedures/fetchByPatient",
    async (patientId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/procedures?patientId=${patientId}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch procedures"
            );
        }
    }
);

// Create new procedure
export const createProcedure = createAsyncThunk(
    "procedures/create",
    async (procedureData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/procedures", procedureData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to create procedure"
            );
        }
    }
);

// Update procedure
export const updateProcedure = createAsyncThunk(
    "procedures/update",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/procedures/${id}`, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to update procedure"
            );
        }
    }
);

// Update procedure status
export const updateProcedureStatus = createAsyncThunk(
    "procedures/updateStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/procedures/${id}/status`, { status });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to update procedure status"
            );
        }
    }
);

// Complete procedure
export const completeProcedure = createAsyncThunk(
    "procedures/complete",
    async ({ id, notes }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/procedures/${id}/complete`, { notes });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to complete procedure"
            );
        }
    }
);

// Fetch billing eligible procedures
export const fetchBillingEligible = createAsyncThunk(
    "procedures/fetchBillingEligible",
    async (patientId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/procedures/billing-eligible?patientId=${patientId}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch billing eligible procedures"
            );
        }
    }
);

const initialState = {
    procedures: [],
    billingEligible: [],
    loading: false,
    actionLoading: false,
    error: null,
    successMessage: null
};

const procedureSlice = createSlice({
    name: "procedures",
    initialState,
    reducers: {
        clearProcedures: (state) => {
            state.procedures = [];
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
            // Fetch by case sheet
            .addCase(fetchProceduresByCaseSheet.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProceduresByCaseSheet.fulfilled, (state, action) => {
                state.loading = false;
                state.procedures = action.payload;
            })
            .addCase(fetchProceduresByCaseSheet.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch by patient
            .addCase(fetchProceduresByPatient.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProceduresByPatient.fulfilled, (state, action) => {
                state.loading = false;
                state.procedures = action.payload;
            })
            .addCase(fetchProceduresByPatient.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create
            .addCase(createProcedure.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })
            .addCase(createProcedure.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.procedures.unshift(action.payload);
                state.successMessage = "Procedure planned successfully";
            })
            .addCase(createProcedure.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })

            // Update
            .addCase(updateProcedure.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })
            .addCase(updateProcedure.fulfilled, (state, action) => {
                state.actionLoading = false;
                const index = state.procedures.findIndex(p => p._id === action.payload._id);
                if (index !== -1) {
                    state.procedures[index] = action.payload;
                }
                state.successMessage = "Procedure updated successfully";
            })
            .addCase(updateProcedure.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })

            // Update status
            .addCase(updateProcedureStatus.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })
            .addCase(updateProcedureStatus.fulfilled, (state, action) => {
                state.actionLoading = false;
                const index = state.procedures.findIndex(p => p._id === action.payload._id);
                if (index !== -1) {
                    state.procedures[index] = action.payload;
                }
                state.successMessage = `Procedure status updated to ${action.payload.status}`;
            })
            .addCase(updateProcedureStatus.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })

            // Complete
            .addCase(completeProcedure.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })
            .addCase(completeProcedure.fulfilled, (state, action) => {
                state.actionLoading = false;
                const index = state.procedures.findIndex(p => p._id === action.payload._id);
                if (index !== -1) {
                    state.procedures[index] = action.payload;
                }
                state.successMessage = "Procedure completed successfully";
            })
            .addCase(completeProcedure.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })

            // Billing eligible
            .addCase(fetchBillingEligible.fulfilled, (state, action) => {
                state.billingEligible = action.payload;
            });
    }
});

export const { clearProcedures, clearError, clearSuccessMessage } = procedureSlice.actions;
export default procedureSlice.reducer;
