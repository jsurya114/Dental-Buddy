import express from "express";
import auth from "../middleware/authMiddleware.js";
import { can } from "../middleware/permissionMiddleware.js";
import {
    createCaseSheet,
    getCaseSheet,
    getCaseSheetByPatient,
    updateSection,
    addTreatmentPlanItem,
    addProcedure,
    getSectionPermissions
} from "../controllers/caseSheetController.js";

import audit from "../middleware/auditMiddleware.js";

const router = express.Router();

// Get current user's section permissions
router.get(
    "/permissions",
    auth,
    getSectionPermissions
);

// Create new case sheet (requires CASE_PERSONAL.CREATE)
router.post(
    "/",
    auth,
    can("CASE_PERSONAL", "CREATE"),
    audit("CREATE_CASESHEET", "CaseSheet"),
    createCaseSheet
);

// Get case sheet by patient ID
router.get(
    "/patient/:patientId",
    auth,
    getCaseSheetByPatient
);

// Get case sheet by ID
router.get(
    "/:id",
    auth,
    getCaseSheet
);

// Update specific section (permission checked in controller)
router.patch(
    "/:id/section/:sectionName",
    auth,
    audit("UPDATE_CASESHEET_SECTION", "CaseSheet"),
    updateSection
);

// Add treatment plan item
router.post(
    "/:id/treatment-plan",
    auth,
    can("CASE_TREATMENT", "EDIT"),
    audit("ADD_TREATMENT_PLAN", "CaseSheet"),
    addTreatmentPlanItem
);

// Add procedure record
router.post(
    "/:id/procedures",
    auth,
    can("CASE_PROCEDURE", "CREATE"),
    audit("ADD_PROCEDURE_TO_CASESHEET", "CaseSheet"),
    addProcedure
);

export default router;
