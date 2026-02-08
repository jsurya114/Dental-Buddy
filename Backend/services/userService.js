import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Role from "../models/Role.js";


export const validateRole = async (roleCode) => {
    const role = await Role.findOne({ code: roleCode, isActive: true });
    if (!role) {
        throw new Error("Invalid or inactive role");
    }
    return role;
};


export const createUser = async (userData) => {
    const { fullName, loginId, password, roleCode, isActive } = userData;


    await validateRole(roleCode);


    const existingUser = await User.findOne({ loginId });
    if (existingUser) {
        throw new Error("Login ID already exists");
    }


    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        fullName,
        loginId,
        password: hashedPassword,
        roleCode: roleCode.toUpperCase(),
        isActive: isActive !== undefined ? isActive : true
    });

    return {
        _id: user._id,
        fullName: user.fullName,
        loginId: user.loginId,
        roleCode: user.roleCode,
        isActive: user.isActive,
        createdAt: user.createdAt
    };
};


export const getAllUsers = async (filters = {}) => {
    let query = {};

    if (filters.isProfessional) {
        const professionalRoles = await Role.find({ isProfessional: true, isActive: true }).select("code");
        const roleCodes = professionalRoles.map(r => r.code);
        query.roleCode = { $in: roleCodes };
    }

    const users = await User.find(query)
        .select("-password")
        .sort({ createdAt: -1 });
    return users;
};


export const getUserById = async (id) => {
    const user = await User.findById(id).select("-password");
    if (!user) {
        throw new Error("User not found");
    }
    return user;
};


export const updateUser = async (id, updateData) => {
    const user = await User.findById(id);
    if (!user) {
        throw new Error("User not found");
    }

    const { fullName, loginId, password, roleCode, isActive } = updateData;


    if (roleCode && roleCode !== user.roleCode) {
        await validateRole(roleCode);
        user.roleCode = roleCode.toUpperCase();
    }


    if (loginId && loginId !== user.loginId) {
        const existingUser = await User.findOne({ loginId });
        if (existingUser) {
            throw new Error("Login ID already exists");
        }
        user.loginId = loginId;
    }

    // Update password if provided
    if (password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(password, salt);
    }

    if (fullName) user.fullName = fullName;
    if (isActive !== undefined) user.isActive = isActive;
    user.updatedAt = new Date();

    await user.save();

    return {
        _id: user._id,
        fullName: user.fullName,
        loginId: user.loginId,
        roleCode: user.roleCode,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
};


export const toggleUser = async (id) => {
    const user = await User.findById(id);
    if (!user) {
        throw new Error("User not found");
    }

    user.isActive = !user.isActive;
    user.updatedAt = new Date();
    await user.save();

    return {
        _id: user._id,
        fullName: user.fullName,
        loginId: user.loginId,
        roleCode: user.roleCode,
        isActive: user.isActive
    };
};

/**
 * Delete user (soft delete)
 */
export const deleteUser = async (id) => {
    const user = await User.findById(id);
    if (!user) {
        throw new Error("User not found");
    }

    await User.findByIdAndDelete(id);

    return { message: "User deleted permanently" };
};

/**
 * Find user by loginId (for auth)
 */
export const findUserByLoginId = async (loginId) => {
    return await User.findOne({ loginId, isActive: true });
};
