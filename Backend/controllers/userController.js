import * as userService from "../services/userService.js";
export const createUser = async (req, res) => {
    try {
        const { fullName, loginId, password, roleCode, isActive } = req.body;

        if (!fullName || !loginId || !password || !roleCode) {
            return res.status(400).json({
                success: false,
                message: "Full name, login ID, password, and role are required."
            });
        }

        const user = await userService.createUser({
            fullName,
            loginId,
            password,
            roleCode,
            isActive
        });

        return res.status(201).json({
            success: true,
            message: "User created successfully.",
            user
        });
    } catch (error) {
        console.error("Create user error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to create user."
        });
    }
};

export const getUsers = async (req, res) => {
    try {
        const filters = {
            isProfessional: req.query.isProfessional === "true",
            status: req.query.status // 'active', 'inactive', 'all'
        };
        const users = await userService.getAllUsers(filters);
        users.sort((a, b) => a.fullName.localeCompare(b.fullName));
        return res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.error("Get users error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch users."
        });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error("Get user error:", error);
        return res.status(404).json({
            success: false,
            message: error.message || "User not found."
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: "User updated successfully.",
            user
        });
    } catch (error) {
        console.error("Update user error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update user."
        });
    }
};

export const toggleUser = async (req, res) => {
    try {
        const user = await userService.toggleUser(req.params.id);
        return res.status(200).json({
            success: true,
            message: `User ${user.isActive ? "activated" : "deactivated"} successfully.`,
            user
        });
    } catch (error) {
        console.error("Toggle user error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to toggle user."
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        return res.status(200).json({
            success: true,
            message: "User deleted successfully."
        });
    } catch (error) {
        console.error("Delete user error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to delete user."
        });
    }
};
