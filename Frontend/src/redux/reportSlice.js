import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axios";

// Helper to format dates
const formatDate = (date) => {
    return date ? new Date(date).toISOString().split('T')[0] : "";
};

// Financial Reports
export const fetchDailyCollection = createAsyncThunk(
    "reports/fetchDailyCollection",
    async (date, { rejectWithValue }) => {
        try {
            const dateStr = formatDate(date);
            const response = await axiosInstance.get(`/reports/finance/daily?date=${dateStr}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch report");
        }
    }
);

export const fetchMonthlyRevenue = createAsyncThunk(
    "reports/fetchMonthlyRevenue",
    async (year, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/reports/finance/monthly?year=${year}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch report");
        }
    }
);

export const fetchOutstandingDues = createAsyncThunk(
    "reports/fetchOutstandingDues",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/reports/finance/outstanding");
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch report");
        }
    }
);

// Clinical Reports
export const fetchProcedureStats = createAsyncThunk(
    "reports/fetchProcedureStats",
    async ({ start, end }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(
                `/reports/clinical/procedures?from=${formatDate(start)}&to=${formatDate(end)}`
            );
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch report");
        }
    }
);

// Operational Reports
export const fetchNewPatients = createAsyncThunk(
    "reports/fetchNewPatients",
    async (year, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/reports/operational/patients?year=${year}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch report");
        }
    }
);

const initialState = {
    dailyCollection: { data: null, loading: false, error: null },
    monthlyRevenue: { data: [], loading: false, error: null },
    outstandingDues: { data: null, loading: false, error: null },
    procedureStats: { data: [], loading: false, error: null },
    newPatients: { data: [], loading: false, error: null },
};

const reportSlice = createSlice({
    name: "reports",
    initialState,
    reducers: {
        clearReportErrors: (state) => {
            state.dailyCollection.error = null;
            state.monthlyRevenue.error = null;
            state.outstandingDues.error = null;
            state.procedureStats.error = null;
            state.newPatients.error = null;
        }
    },
    extraReducers: (builder) => {
        // Daily Collection
        builder
            .addCase(fetchDailyCollection.pending, (state) => {
                state.dailyCollection.loading = true;
                state.dailyCollection.error = null;
            })
            .addCase(fetchDailyCollection.fulfilled, (state, action) => {
                state.dailyCollection.loading = false;
                state.dailyCollection.data = action.payload;
            })
            .addCase(fetchDailyCollection.rejected, (state, action) => {
                state.dailyCollection.loading = false;
                state.dailyCollection.error = action.payload;
            });

        // Monthly Revenue
        builder
            .addCase(fetchMonthlyRevenue.pending, (state) => {
                state.monthlyRevenue.loading = true;
                state.monthlyRevenue.error = null;
            })
            .addCase(fetchMonthlyRevenue.fulfilled, (state, action) => {
                state.monthlyRevenue.loading = false;
                state.monthlyRevenue.data = action.payload;
            })
            .addCase(fetchMonthlyRevenue.rejected, (state, action) => {
                state.monthlyRevenue.loading = false;
                state.monthlyRevenue.error = action.payload;
            });

        // Outstanding Dues
        builder
            .addCase(fetchOutstandingDues.pending, (state) => {
                state.outstandingDues.loading = true;
                state.outstandingDues.error = null;
            })
            .addCase(fetchOutstandingDues.fulfilled, (state, action) => {
                state.outstandingDues.loading = false;
                state.outstandingDues.data = action.payload;
            })
            .addCase(fetchOutstandingDues.rejected, (state, action) => {
                state.outstandingDues.loading = false;
                state.outstandingDues.error = action.payload;
            });

        // Procedure Stats
        builder
            .addCase(fetchProcedureStats.pending, (state) => {
                state.procedureStats.loading = true;
                state.procedureStats.error = null;
            })
            .addCase(fetchProcedureStats.fulfilled, (state, action) => {
                state.procedureStats.loading = false;
                state.procedureStats.data = action.payload;
            })
            .addCase(fetchProcedureStats.rejected, (state, action) => {
                state.procedureStats.loading = false;
                state.procedureStats.error = action.payload;
            });

        // New Patients
        builder
            .addCase(fetchNewPatients.pending, (state) => {
                state.newPatients.loading = true;
                state.newPatients.error = null;
            })
            .addCase(fetchNewPatients.fulfilled, (state, action) => {
                state.newPatients.loading = false;
                state.newPatients.data = action.payload;
            })
            .addCase(fetchNewPatients.rejected, (state, action) => {
                state.newPatients.loading = false;
                state.newPatients.error = action.payload;
            });
    }
});

export const { clearReportErrors } = reportSlice.actions;
export default reportSlice.reducer;
