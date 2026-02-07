import express from "express";
import auth from "../middleware/authMiddleware.js";
import { can } from "../middleware/permissionMiddleware.js";
import {
    getDailyCollection,
    getMonthlyRevenue,
    getOutstandingDues,
    getProcedureStats,
    getNewPatients
} from "../controllers/reportController.js";

const router = express.Router();

// Financial Reports
router.get(
    "/finance/daily",
    auth,
    can("REPORTS", "FINANCIAL"),
    getDailyCollection
);

router.get(
    "/finance/monthly",
    auth,
    can("REPORTS", "FINANCIAL"),
    getMonthlyRevenue
);

router.get(
    "/finance/outstanding",
    auth,
    can("REPORTS", "FINANCIAL"),
    getOutstandingDues
);

// Clinical Reports
router.get(
    "/clinical/procedures",
    auth,
    can("REPORTS", "CLINICAL"),
    getProcedureStats
);

// Operational/Admin Reports
router.get(
    "/operational/patients",
    auth,
    can("REPORTS", "ADMIN"),
    getNewPatients
);

export default router;
