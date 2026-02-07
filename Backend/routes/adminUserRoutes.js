import express from "express";
import {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    toggleUser,
    deleteUser
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import audit from "../middleware/auditMiddleware.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware(["CLINIC_ADMIN"]));

router.post("/", audit("CREATE_USER", "User"), createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", audit("UPDATE_USER", "User"), updateUser);
router.patch("/:id/toggle", audit("TOGGLE_USER", "User"), toggleUser);
router.delete("/:id", audit("DELETE_USER", "User"), deleteUser);

export default router;
