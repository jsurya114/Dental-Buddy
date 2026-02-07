import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axios";

// Helper to format date
const formatDate = (date) => {
    return date ? new Date(date).toISOString().split('T')[0] : "";
};

// Fetch appointments
export const fetchAppointments = createAsyncThunk(
    "appointments/fetchAll",
    async ({ date, doctorId }, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            if (date) params.append("date", formatDate(date));
            if (doctorId) params.append("doctorId", doctorId);

            const response = await axiosInstance.get(`/appointments?${params.toString()}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch appointments");
        }
    }
);

// Create appointment
export const createAppointment = createAsyncThunk(
    "appointments/create",
    async (appointmentData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/appointments", appointmentData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create appointment");
        }
    }
);

// Update status
export const updateAppointmentStatus = createAsyncThunk(
    "appointments/updateStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/appointments/${id}/status`, { status });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update status");
        }
    }
);

// Update details
export const updateAppointment = createAsyncThunk(
    "appointments/update",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/appointments/${id}`, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update appointment");
        }
    }
);

// Cancel appointment
export const cancelAppointment = createAsyncThunk(
    "appointments/cancel",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/appointments/${id}/cancel`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to cancel appointment");
        }
    }
);

const initialState = {
    list: [],
    loading: false,
    error: null,
    successMessage: null
};

const appointmentSlice = createSlice({
    name: "appointments",
    initialState,
    reducers: {
        clearAppointmentMessages: (state) => {
            state.error = null;
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch
        builder
            .addCase(fetchAppointments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAppointments.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchAppointments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Create
        builder
            .addCase(createAppointment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createAppointment.fulfilled, (state, action) => {
                state.loading = false;
                state.list.push(action.payload);
                state.successMessage = "Appointment booked successfully";
            })
            .addCase(createAppointment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Update Status
        builder
            .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
                const index = state.list.findIndex(apt => apt._id === action.payload._id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
                state.successMessage = "Status updated";
            })
            .addCase(updateAppointmentStatus.rejected, (state, action) => {
                state.error = action.payload;
            });

        // Update Details
        builder
            .addCase(updateAppointment.fulfilled, (state, action) => {
                const index = state.list.findIndex(apt => apt._id === action.payload._id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
                state.successMessage = "Appointment updated";
            })
            .addCase(updateAppointment.rejected, (state, action) => {
                state.error = action.payload;
            });

        // Cancel
        builder
            .addCase(cancelAppointment.fulfilled, (state, action) => {
                const index = state.list.findIndex(apt => apt._id === action.payload._id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
                state.successMessage = "Appointment cancelled";
            })
            .addCase(cancelAppointment.rejected, (state, action) => {
                state.error = action.payload;
            });
    }
});

export const { clearAppointmentMessages } = appointmentSlice.actions;
export default appointmentSlice.reducer;
