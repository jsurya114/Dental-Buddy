import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axios";

// Fetch eligible procedures for billing
export const fetchEligibleProcedures = createAsyncThunk(
    "billing/fetchEligible",
    async (patientId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/invoices/eligible-procedures?patientId=${patientId}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch eligible procedures"
            );
        }
    }
);

// Create invoice
export const createInvoice = createAsyncThunk(
    "billing/createInvoice",
    async (invoiceData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/invoices", invoiceData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to create invoice"
            );
        }
    }
);

// Fetch invoices by patient
export const fetchInvoices = createAsyncThunk(
    "billing/fetchInvoices",
    async (patientId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/invoices?patientId=${patientId}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch invoices"
            );
        }
    }
);

// Fetch single invoice with payments
export const fetchInvoiceById = createAsyncThunk(
    "billing/fetchInvoiceById",
    async (invoiceId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/invoices/${invoiceId}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch invoice"
            );
        }
    }
);

// Add payment
export const addPayment = createAsyncThunk(
    "billing/addPayment",
    async (paymentData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/payments", paymentData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to add payment"
            );
        }
    }
);

// Fetch payments by patient
export const fetchPayments = createAsyncThunk(
    "billing/fetchPayments",
    async (patientId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/payments?patientId=${patientId}`);
            return response.data.data.payments;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch payments"
            );
        }
    }
);

// Toggle Doctor Payment Status
export const toggleDoctorPayment = createAsyncThunk(
    "billing/toggleDoctorPayment",
    async (invoiceId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/invoices/${invoiceId}/toggle-doctor-payment`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to update status"
            );
        }
    }
);

const initialState = {
    eligibleProcedures: [],
    invoices: [],
    payments: [],
    currentInvoice: null,
    loading: false,
    actionLoading: false,
    error: null,
    successMessage: null
};

const billingSlice = createSlice({
    name: "billing",
    initialState,
    reducers: {
        clearBilling: (state) => {
            state.eligibleProcedures = [];
            state.invoices = [];
            state.payments = [];
            state.currentInvoice = null;
            state.error = null;
            state.successMessage = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        },
        clearCurrentInvoice: (state) => {
            state.currentInvoice = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch eligible procedures
            .addCase(fetchEligibleProcedures.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEligibleProcedures.fulfilled, (state, action) => {
                state.loading = false;
                state.eligibleProcedures = action.payload;
            })
            .addCase(fetchEligibleProcedures.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create invoice
            .addCase(createInvoice.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })
            .addCase(createInvoice.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.invoices.unshift(action.payload);
                state.eligibleProcedures = []; // Clear eligible after invoice
                state.successMessage = `Invoice ${action.payload.invoiceNumber} created successfully`;
            })
            .addCase(createInvoice.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })

            // Fetch invoices
            .addCase(fetchInvoices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInvoices.fulfilled, (state, action) => {
                state.loading = false;
                state.invoices = action.payload;
            })
            .addCase(fetchInvoices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch payments
            .addCase(fetchPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPayments.fulfilled, (state, action) => {
                state.loading = false;
                state.payments = action.payload;
            })
            .addCase(fetchPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch invoice by ID
            .addCase(fetchInvoiceById.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })
            .addCase(fetchInvoiceById.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.currentInvoice = action.payload;
            })
            .addCase(fetchInvoiceById.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })

            // Add payment
            .addCase(addPayment.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })
            .addCase(addPayment.fulfilled, (state, action) => {
                state.actionLoading = false;
                // Update invoice in list
                const { invoice, payment } = action.payload;
                const index = state.invoices.findIndex(inv => inv._id === invoice._id);
                if (index !== -1) {
                    state.invoices[index] = {
                        ...state.invoices[index],
                        paidAmount: invoice.paidAmount,
                        status: invoice.status
                    };
                }

                // Add to payments list
                if (payment) {
                    // Add invoice number to payment for display since it might not be populated in response
                    const paymentWithInvoice = {
                        ...payment,
                        invoiceId: {
                            _id: invoice._id,
                            invoiceNumber: invoice.invoiceNumber
                        }
                    };
                    state.payments.unshift(paymentWithInvoice);
                }

                // Update current invoice if viewing
                if (state.currentInvoice && state.currentInvoice._id === invoice._id) {
                    state.currentInvoice.paidAmount = invoice.paidAmount;
                    state.currentInvoice.status = invoice.status;
                    state.currentInvoice.payments = state.currentInvoice.payments || [];
                    state.currentInvoice.payments.unshift(payment);
                }
                state.successMessage = `Payment of ₹${payment.amount} recorded`;
            })
            .addCase(addPayment.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })

            // Toggle Doctor Payment
            .addCase(toggleDoctorPayment.fulfilled, (state, action) => {
                const { _id, isDoctorPaid } = action.payload;
                const index = state.invoices.findIndex(inv => inv._id === _id);
                if (index !== -1) {
                    state.invoices[index].isDoctorPaid = isDoctorPaid;
                }
                if (state.currentInvoice && state.currentInvoice._id === _id) {
                    state.currentInvoice.isDoctorPaid = isDoctorPaid;
                }
            });
    }
});

export const { clearBilling, clearError, clearSuccessMessage, clearCurrentInvoice } = billingSlice.actions;
export default billingSlice.reducer;
