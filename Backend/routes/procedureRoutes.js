import express from "express";
import auth from "../middleware/authMiddleware.js";
import { can } from "../middleware/permissionMiddleware.js";
import {
    createProcedure,
    getProcedures,
    getProcedureById,
    updateProcedure,
    updateProcedureStatus,
    completeProcedure,
    getEligibleForBilling
} from "../controllers/procedureController.js";

import audit from "../middleware/auditMiddleware.js";

const router = express.Router();

// Get procedures (by caseSheetId or patientId query param)
router.get(
    "/",
    auth,
    can("CASE_PROCEDURE", "VIEW"),
    getProcedures
);

// Get billing eligible procedures
router.get(
    "/billing-eligible",
    auth,
    can("BILLING", "VIEW"),
    getEligibleForBilling
);

// Get single procedure by ID
router.get(
    "/:id",
    auth,
    can("CASE_PROCEDURE", "VIEW"),
    getProcedureById
);

// Create new procedure (status = PLANNED)
router.post(
    "/",
    auth,
    can("CASE_PROCEDURE", "CREATE"),
    audit("CREATE_PROCEDURE", "Procedure"),
    createProcedure
);

// Update procedure (name, tooth, notes - only non-locked)
router.patch(
    "/:id",
    auth,
    can("CASE_PROCEDURE", "EDIT"),
    audit("UPDATE_PROCEDURE", "Procedure"),
    updateProcedure
);

// Update procedure status (with transition validation)
router.patch(
    "/:id/status",
    auth,
    can("CASE_PROCEDURE", "EDIT"),
    audit("UPDATE_PROCEDURE_STATUS", "Procedure"),
    updateProcedureStatus
);

// Complete procedure (requires COMPLETE permission)
router.patch(
    "/:id/complete",
    auth,
    can("CASE_PROCEDURE", "COMPLETE"),
    audit("COMPLETE_PROCEDURE", "Procedure"),
    completeProcedure
);

export default router;
