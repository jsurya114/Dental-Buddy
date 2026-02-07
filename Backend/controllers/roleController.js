import Role from "../models/Role.js";
import { ALL_RESOURCES, ALL_ACTIONS, RESOURCE_LABELS, ACTION_LABELS } from "../constants/permissions.js";

export const createRole = async (req, res) => {
    try {
        const { displayName, code, description, icon, permissions } = req.body;

        if (!displayName || !code) {
            return res.status(400).json({
                success: false,
                message: "Display name and code are required."
            });
        }

        const exists = await Role.findOne({ code: code.toUpperCase() });
        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Role with this code already exists."
            });
        }

        const role = await Role.create({
            displayName,
            code: code.toUpperCase(),
            description: description || "",
            icon: icon || "🔐",
            permissions: permissions || {}
        });

        return res.status(201).json({
            success: true,
            message: "Role created successfully.",
            role
        });
    } catch (error) {
        console.error("Create role error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create role."
        });
    }
};

export const getRoles = async (req, res) => {
    try {
        const roles = await Role.find().sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            roles
        });
    } catch (error) {
        console.error("Get roles error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch roles."
        });
    }
};

export const getRoleById = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found."
            });
        }
        return res.status(200).json({
            success: true,
            role
        });
    } catch (error) {
        console.error("Get role error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch role."
        });
    }
};

export const updateRole = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found."
            });
        }

        if (role.isSystemRole) {
            return res.status(403).json({
                success: false,
                message: "System role cannot be edited."
            });
        }

        const { displayName, code, description, icon, isActive, permissions } = req.body;

        if (code && code.toUpperCase() !== role.code) {
            const exists = await Role.findOne({ code: code.toUpperCase() });
            if (exists) {
                return res.status(400).json({
                    success: false,
                    message: "Role with this code already exists."
                });
            }
        }

        if (displayName) role.displayName = displayName;
        if (code) role.code = code.toUpperCase();
        if (description !== undefined) role.description = description;
        if (icon) role.icon = icon;
        if (isActive !== undefined) role.isActive = isActive;
        if (permissions !== undefined) role.permissions = permissions;
        role.updatedAt = new Date();

        await role.save();

        return res.status(200).json({
            success: true,
            message: "Role updated successfully.",
            role
        });
    } catch (error) {
        console.error("Update role error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update role."
        });
    }
};


export const toggleRole = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found."
            });
        }

        if (role.isSystemRole) {
            return res.status(403).json({
                success: false,
                message: "System role cannot be disabled."
            });
        }

        role.isActive = !role.isActive;
        role.updatedAt = new Date();
        await role.save();

        return res.status(200).json({
            success: true,
            message: `Role ${role.isActive ? "enabled" : "disabled"} successfully.`,
            role
        });
    } catch (error) {
        console.error("Toggle role error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to toggle role."
        });
    }
};

export const deleteRole = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found."
            });
        }

        if (role.isSystemRole) {
            return res.status(403).json({
                success: false,
                message: "System role cannot be deleted."
            });
        }

        role.isActive = false;
        role.updatedAt = new Date();
        await role.save();

        return res.status(200).json({
            success: true,
            message: "Role deleted successfully."
        });
    } catch (error) {
        console.error("Delete role error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete role."
        });
    }
};

export const getPermissionMetadata = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            resources: ALL_RESOURCES,
            actions: ALL_ACTIONS,
            resourceLabels: RESOURCE_LABELS,
            actionLabels: ACTION_LABELS
        });
    } catch (error) {
        console.error("Get permission metadata error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch permission metadata."
        });
    }
};

export const getRolePermissions = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found."
            });
        }

        return res.status(200).json({
            success: true,
            roleCode: role.code,
            permissions: role.permissions
        });
    } catch (error) {
        console.error("Get role permissions error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch role permissions."
        });
    }
};

export const updateRolePermissions = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found."
            });
        }

        if (role.isSystemRole) {
            return res.status(403).json({
                success: false,
                message: "System role permissions cannot be modified."
            });
        }

        const { permissions } = req.body;
        if (!permissions || typeof permissions !== "object") {
            return res.status(400).json({
                success: false,
                message: "Permissions object is required."
            });
        }

        // Validate permissions structure
        for (const resource of Object.keys(permissions)) {
            if (!ALL_RESOURCES.includes(resource)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid resource: ${resource}`
                });
            }
            if (!Array.isArray(permissions[resource])) {
                return res.status(400).json({
                    success: false,
                    message: `Permissions for ${resource} must be an array.`
                });
            }
            for (const action of permissions[resource]) {
                if (!ALL_ACTIONS.includes(action)) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid action: ${action} for resource ${resource}`
                    });
                }
            }
        }

        role.permissions = permissions;
        role.updatedAt = new Date();
        await role.save();

        return res.status(200).json({
            success: true,
            message: "Permissions updated successfully.",
            permissions: role.permissions
        });
    } catch (error) {
        console.error("Update role permissions error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update role permissions."
        });
    }
};

