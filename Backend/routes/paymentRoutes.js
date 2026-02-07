import express from "express";
import auth from "../middleware/authMiddleware.js";
import { can } from "../middleware/permissionMiddleware.js";
import {
    addPayment,
    getPaymentsByInvoice
} from "../controllers/paymentController.js";

import audit from "../middleware/auditMiddleware.js";

const router = express.Router();

// Get payments for an invoice
router.get(
    "/",
    auth,
    can("PAYMENT", "VIEW"),
    getPaymentsByInvoice
);

// Add payment to invoice
router.post(
    "/",
    auth,
    can("PAYMENT", "CREATE"),
    audit("ADD_PAYMENT", "Payment"),
    addPayment
);

export default router;
