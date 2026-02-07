import { generateTokens } from "../utils/jwt.js";
import * as clinicAdminService from "../services/clinicAdminService.js";


export const login = async (req, res) => {
    try {
        const { loginId, password } = req.body;

  
        if (!loginId || !password) {
            return res.status(400).json({
                success: false,
                message: "Login ID and password are required."
            });
        }

        const admin = await clinicAdminService.findByLoginId(loginId);

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials."
            });
        }

  
        if (!admin.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account is deactivated. Contact support."
            });
        }


        const isValidPassword = await clinicAdminService.validatePassword(password, admin.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials."
            });
        }


        await clinicAdminService.updateLastLogin(admin._id);

       
        const tokenPayload = {
            userId: admin._id,
            role: admin.role
        };

        const { accessToken, refreshToken } = generateTokens(tokenPayload);

        
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            accessToken,
            admin: {
                id: admin._id,
                loginId: admin.loginId,
                role: admin.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};


export const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token not found."
            });
        }

        // Verify refresh token
        const { verifyRefreshToken, generateAccessToken } = await import("../utils/jwt.js");
        const decoded = verifyRefreshToken(refreshToken);

      
        const newAccessToken = generateAccessToken({
            userId: decoded.userId,
            role: decoded.role
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


export const logoutAdmin = async (req, res) => {
    try {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully."
        });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};


export const getDashboard = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Welcome Clinic Admin",
            role: req.user.role,
            userId: req.user.userId
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};
