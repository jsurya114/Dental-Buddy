import express from "express";
import {
    createRole,
    getRoles,
    getRoleById,
    updateRole,
    toggleRole,
    deleteRole,
    getPermissionMetadata,
    getRolePermissions,
    updateRolePermissions
} from "../controllers/roleController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import audit from "../middleware/auditMiddleware.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware(["CLINIC_ADMIN"]));


router.get("/permissions/metadata", getPermissionMetadata);


router.post("/", audit("CREATE_ROLE", "Role"), createRole);
router.get("/", getRoles);
router.get("/:id", getRoleById);
router.put("/:id", audit("UPDATE_ROLE", "Role"), updateRole);
router.patch("/:id/toggle", audit("TOGGLE_ROLE", "Role"), toggleRole);
router.delete("/:id", audit("DELETE_ROLE", "Role"), deleteRole);

router.get("/:id/permissions", getRolePermissions);
router.put("/:id/permissions", audit("UPDATE_ROLE_PERMISSIONS", "Role"), updateRolePermissions);

export default router;
