import express from "express";
import auth from "../middleware/authMiddleware.js";
import { can } from "../middleware/permissionMiddleware.js";
import {
    addPayment,
    getPayments
} from "../controllers/paymentController.js";

import audit from "../middleware/auditMiddleware.js";

const router = express.Router();

// Get payments (by invoiceId or patientId)
router.get(
    "/",
    auth,
    can("PAYMENT", "VIEW"),
    getPayments
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
