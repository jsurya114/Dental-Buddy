import express from "express";
import auth from "../middleware/authMiddleware.js";
import { can } from "../middleware/permissionMiddleware.js";
import audit from "../middleware/auditMiddleware.js";
import {
    createPatient,
    listPatients,
    getPatient,
    updatePatient,
    deactivatePatient,
    getToothChart,
    updateToothStatus
} from "../controllers/patientController.js";

const router = express.Router();


router.post(
    "/",
    auth,
    can("PATIENT", "CREATE"),
    audit("CREATE_PATIENT", "Patient"),
    createPatient
);


router.get(
    "/",
    auth,
    can("PATIENT", "VIEW"),
    listPatients
);


router.get(
    "/:id",
    auth,
    can("PATIENT", "VIEW"),
    getPatient
);


router.put(
    "/:id",
    auth,
    can("PATIENT", "EDIT"),
    audit("UPDATE_PATIENT", "Patient"),
    updatePatient
);


router.patch(
    "/:id/deactivate",
    auth,
    can("PATIENT", "DELETE"),
    audit("DEACTIVATE_PATIENT", "Patient"),
    deactivatePatient
);

// Tooth Chart Routes
router.get(
    "/:id/tooth-chart",
    auth,
    can("CASE_EXAM", "VIEW"), // Reusing existing permissions
    getToothChart
);

router.patch(
    "/:id/tooth/:toothNumber",
    auth,
    can("CASE_EXAM", "EDIT"),
    audit("UPDATE_TOOTH_STATUS", "Patient"),
    updateToothStatus
);

export default router;
