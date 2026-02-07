import Role from "../models/Role.js";
import User from "../models/User.js";
import ClinicAdmin from "../models/ClinicAdmin.js";

export const can = (resource, action) => {
    return async (req, res, next) => {
        try {
            const { userId, role: roleCode } = req.user;

            if (!roleCode) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. No role assigned."
                });
            }

            if (roleCode === "CLINIC_ADMIN") {
                return next();
            }
            const role = await Role.findOne({ code: roleCode, isActive: true });

            if (!role) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Invalid or inactive role."
                });
            }

            if (!role.hasPermission(resource, action)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. You don't have ${action} permission for ${resource}.`
                });
            }

            // Permission granted
            next();
        } catch (error) {
            console.error("Permission check error:", error);
            return res.status(500).json({
                success: false,
                message: "Permission check failed."
            });
        }
    };
};

export const getPermissionsForRole = async (roleCode) => {
    if (roleCode === "CLINIC_ADMIN") {
        const { SYSTEM_ROLE_PERMISSIONS } = await import("../constants/permissions.js");
        return SYSTEM_ROLE_PERMISSIONS.CLINIC_ADMIN;
    }

    const role = await Role.findOne({ code: roleCode, isActive: true });
    return role?.permissions || {};
};

export default { can, getPermissionsForRole };
