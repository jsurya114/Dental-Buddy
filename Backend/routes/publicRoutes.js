import express from "express";
import { getActiveRoles, getRoleByCode } from "../controllers/publicController.js";
import { getUsers } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes - no auth required
router.get("/roles", getActiveRoles);
router.get("/roles/:code", getRoleByCode);

// Authenticated users can list other users (e.g. for selection dropdowns)
router.get("/users", authMiddleware, getUsers);

export default router;
