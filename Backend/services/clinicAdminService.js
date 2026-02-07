import bcrypt from "bcryptjs";
import ClinicAdmin from "../models/ClinicAdmin.js";
export const findByLoginId = async (loginId) => {
    return await ClinicAdmin.findOne({ loginId });
};

export const validatePassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};


export const updateLastLogin = async (adminId) => {
    return await ClinicAdmin.findByIdAndUpdate(
        adminId,
        { lastLoginAt: new Date() },
        { new: true }
    );
};
