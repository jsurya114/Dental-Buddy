import Role from "../models/Role.js";
export const getActiveRoles = async (req, res) => {
    try {
        const roles = await Role.find({ isActive: true })
            .select("displayName code icon description -_id")
            .sort({ createdAt: 1 });

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

export const getRoleByCode = async (req, res) => {
    try {
        const code = req.params.code.toUpperCase().replace(/-/g, "_");

        const role = await Role.findOne({ code, isActive: true })
            .select("displayName code icon description -_id");

        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found or inactive."
            });
        }

        return res.status(200).json({
            success: true,
            role
        });
    } catch (error) {
        console.error("Get role by code error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch role."
        });
    }
};
