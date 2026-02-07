import express from "express";
import { login, getDashboard, refreshAccessToken, logoutAdmin } from "../controllers/clinicAdminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();


router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);


router.get(
    "/dashboard",
    authMiddleware,
    roleMiddleware(["CLINIC_ADMIN"]),
    getDashboard
);

router.post(
    "/logout",
    authMiddleware,
    logoutAdmin
);

export default router;
