import express from "express";
import { login, refreshAccessToken, logout, getCurrentUser } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

import audit from "../middleware/auditMiddleware.js";

const router = express.Router();

router.post("/login", audit("LOGIN", "Auth"), login);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", authMiddleware, audit("LOGOUT", "Auth"), logout);

router.get("/me", authMiddleware, getCurrentUser);

export default router;
