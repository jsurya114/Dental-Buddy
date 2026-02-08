import express from "express";
import auth from "../middleware/authMiddleware.js";
import { can } from "../middleware/permissionMiddleware.js";
import {
    getEligibleProcedures,
    createInvoice,
    getInvoices,
    getInvoiceById,
    toggleDoctorPaymentStatus
} from "../controllers/invoiceController.js";

import audit from "../middleware/auditMiddleware.js";

const router = express.Router();

// Get eligible procedures for billing
router.get(
    "/eligible-procedures",
    auth,
    can("BILLING", "VIEW"),
    getEligibleProcedures
);

// Get invoices by patient
router.get(
    "/",
    auth,
    can("BILLING", "VIEW"),
    getInvoices
);

// Get single invoice with details
router.get(
    "/:id",
    auth,
    can("BILLING", "VIEW"),
    getInvoiceById
);

// Create new invoice
router.post(
    "/",
    auth,
    can("BILLING", "CREATE"),
    audit("CREATE_INVOICE", "Invoice"),
    createInvoice
);

// Toggle doctor payment status
// Toggle doctor payment status
router.patch(
    "/:id/toggle-doctor-payment",
    auth,
    can("BILLING", "CREATE"),
    toggleDoctorPaymentStatus
);


export default router;
