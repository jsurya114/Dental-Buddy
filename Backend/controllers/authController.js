import bcrypt from "bcryptjs";
import ClinicAdmin from "../models/ClinicAdmin.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import { generateTokens, generateAccessToken } from "../utils/jwt.js";
import { SYSTEM_ROLE_PERMISSIONS } from "../constants/permissions.js";


export const login = async (req, res) => {
    try {
        const { loginId, password, roleCode } = req.body;

        if (!loginId || !password || !roleCode) {
            return res.status(400).json({
                success: false,
                message: "Login ID, password, and role are required."
            });
        }

        const role = await Role.findOne({
            code: roleCode.toUpperCase(),
            isActive: true
        });

        if (!role) {
            return res.status(400).json({
                success: false,
                message: "Invalid or inactive role."
            });
        }

        let user = null;
        let userRole = null;
        let isClinicAdmin = false;

        if (roleCode.toUpperCase() === "CLINIC_ADMIN") {
            user = await ClinicAdmin.findOne({ loginId, isActive: true });
            if (user) {
                userRole = user.role;
                isClinicAdmin = true;
            }
        }

        if (!user) {
            user = await User.findOne({ loginId, isActive: true });
            if (user) {
                userRole = user.roleCode;
            }
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials."
            });
        }


        if (!isClinicAdmin && user.lockUntil && user.lockUntil > Date.now()) {
            return res.status(403).json({
                success: false,
                message: "Account is temporarily locked. Please try again later."
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            // Handle Login Failures
            if (!isClinicAdmin) {
                user.loginAttempts += 1;
                if (user.loginAttempts >= 5) {
                    user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 mins
                    user.loginAttempts = 0; // Optional: reset attempts or keep max
                }
                await user.save();
            }

            return res.status(401).json({
                success: false,
                message: "Invalid credentials."
            });
        }

        // Reset Login Attempts on Success
        if (!isClinicAdmin) {
            user.loginAttempts = 0;
            user.lockUntil = undefined;
            user.lastLoginAt = new Date();
            await user.save();
        }

        if (userRole !== roleCode.toUpperCase()) {
            return res.status(403).json({
                success: false,
                message: "Role mismatch. Access denied."
            });
        }

        const tokenPayload = {
            userId: user._id,
            role: userRole,
            fullName: user.fullName || user.loginId
        };

        const { accessToken, refreshToken } = generateTokens(tokenPayload);

        // Cookies
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Must be true for SameSite=None
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        };

        res.cookie("jwt", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }); // 15 mins
        res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days

        let permissions = {};
        if (userRole === "CLINIC_ADMIN") {
            permissions = SYSTEM_ROLE_PERMISSIONS.CLINIC_ADMIN;
        } else {
            permissions = role.permissions || {};
        }

        const userResponse = {
            id: user._id,
            loginId: user.loginId,
            role: userRole,
            fullName: user.fullName || user.loginId,
            permissions
        };


        req.user = { userId: user._id };

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            user: userResponse
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Login failed. Please try again."
        });
    }
};


export const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "No refresh token provided."
            });
        }

        const jwt = await import("jsonwebtoken");
        const decoded = jwt.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const newAccessToken = generateAccessToken({
            userId: decoded.userId,
            role: decoded.role,
            fullName: decoded.fullName
        });

        return res.status(200).json({
            success: true,
            accessToken: newAccessToken
        });
    } catch (error) {
        console.error("Refresh token error:", error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token."
        });
    }
};

export const logout = async (req, res) => {
    try {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        };
        res.clearCookie("jwt", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Logged out successfully."
        });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({
            success: false,
            message: "Logout failed."
        });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const { userId, role } = req.user;

        let user = null;


        if (role === "CLINIC_ADMIN") {
            user = await ClinicAdmin.findById(userId).select("-password");
        }

        if (!user) {
            user = await User.findById(userId).select("-password");
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const userRole = user.role || user.roleCode;
        let permissions = {};
        if (userRole === "CLINIC_ADMIN") {
            permissions = SYSTEM_ROLE_PERMISSIONS.CLINIC_ADMIN;
        } else {
            const roleDoc = await Role.findOne({ code: userRole, isActive: true });
            permissions = roleDoc?.permissions || {};
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                loginId: user.loginId,
                role: userRole,
                fullName: user.fullName || user.loginId,
                permissions
            }
        });
    } catch (error) {
        console.error("Get current user error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user info."
        });
    }
};
