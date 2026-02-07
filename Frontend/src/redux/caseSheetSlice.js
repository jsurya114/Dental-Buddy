import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axios";

// Fetch case sheet by patient ID
export const fetchCaseSheetByPatient = createAsyncThunk(
    "caseSheet/fetchByPatient",
    async (patientId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/case-sheets/patient/${patientId}`);
            return response.data.data;
        } catch (error) {
            if (error.response?.status === 404) {
                return null; // No case sheet exists yet
            }
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch case sheet"
            );
        }
    }
);

// Create new case sheet
export const createCaseSheet = createAsyncThunk(
    "caseSheet/create",
    async ({ patientId, personalHistory }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/case-sheets", {
                patientId,
                personalHistory
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to create case sheet"
            );
        }
    }
);

// Update a specific section
export const updateCaseSheetSection = createAsyncThunk(
    "caseSheet/updateSection",
    async ({ caseSheetId, sectionName, sectionData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(
                `/case-sheets/${caseSheetId}/section/${sectionName}`,
                sectionData
            );
            return {
                sectionName,
                data: response.data.data
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to update section"
            );
        }
    }
);

// Add treatment plan item
export const addTreatmentPlanItem = createAsyncThunk(
    "caseSheet/addTreatmentItem",
    async ({ caseSheetId, treatmentItem }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(
                `/case-sheets/${caseSheetId}/treatment-plan`,
                treatmentItem
            );
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to add treatment item"
            );
        }
    }
);

// Add procedure
export const addProcedure = createAsyncThunk(
    "caseSheet/addProcedure",
    async ({ caseSheetId, procedureData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(
                `/case-sheets/${caseSheetId}/procedures`,
                procedureData
            );
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to add procedure"
            );
        }
    }
);

// Fetch section permissions
export const fetchSectionPermissions = createAsyncThunk(
    "caseSheet/fetchPermissions",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/case-sheets/permissions");
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch permissions"
            );
        }
    }
);

const initialState = {
    currentCaseSheet: null,
    sectionPermissions: {},
    loading: false,
    sectionLoading: {},
    error: null,
    successMessage: null
};

const caseSheetSlice = createSlice({
    name: "caseSheet",
    initialState,
    reducers: {
        clearCaseSheet: (state) => {
            state.currentCaseSheet = null;
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
            .addCase(fetchCaseSheetByPatient.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCaseSheetByPatient.fulfilled, (state, action) => {
                state.loading = false;
                state.currentCaseSheet = action.payload;
            })
            .addCase(fetchCaseSheetByPatient.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create
            .addCase(createCaseSheet.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCaseSheet.fulfilled, (state, action) => {
                state.loading = false;
                state.currentCaseSheet = action.payload;
                state.successMessage = "Case sheet created successfully";
            })
            .addCase(createCaseSheet.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update section
            .addCase(updateCaseSheetSection.pending, (state, action) => {
                state.sectionLoading[action.meta.arg.sectionName] = true;
                state.error = null;
            })
            .addCase(updateCaseSheetSection.fulfilled, (state, action) => {
                state.sectionLoading[action.payload.sectionName] = false;
                // Merge the updated section data
                if (state.currentCaseSheet) {
                    Object.assign(state.currentCaseSheet, action.payload.data);
                }
                state.successMessage = "Section updated successfully";
            })
            .addCase(updateCaseSheetSection.rejected, (state, action) => {
                state.sectionLoading[action.meta.arg.sectionName] = false;
                state.error = action.payload;
            })

            // Add treatment plan item
            .addCase(addTreatmentPlanItem.fulfilled, (state, action) => {
                if (state.currentCaseSheet) {
                    state.currentCaseSheet.treatmentPlan = action.payload;
                }
                state.successMessage = "Treatment plan updated";
            })

            // Add procedure
            .addCase(addProcedure.fulfilled, (state, action) => {
                if (state.currentCaseSheet) {
                    state.currentCaseSheet.procedures = action.payload;
                }
                state.successMessage = "Procedure added";
            })

            // Fetch permissions
            .addCase(fetchSectionPermissions.fulfilled, (state, action) => {
                state.sectionPermissions = action.payload;
            });
    }
});

export const { clearCaseSheet, clearError, clearSuccessMessage } = caseSheetSlice.actions;
export default caseSheetSlice.reducer;
