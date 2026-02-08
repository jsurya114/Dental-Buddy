import mongoose from "mongoose";
import { ALL_RESOURCES } from "../constants/permissions.js";

// Create dynamic permissions schema based on resources
const permissionsSchema = {};
ALL_RESOURCES.forEach(resource => {
    permissionsSchema[resource] = {
        type: [String],
        enum: ["VIEW", "CREATE", "EDIT", "DELETE"],
        default: []
    };
});

const roleSchema = new mongoose.Schema({
    displayName: {
        type: String,
        required: [true, "Role display name is required"],
        trim: true
    },
    code: {
        type: String,
        required: [true, "Role code is required"],
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    icon: {
        type: String,
        default: "🔐"
    },
    permissions: {
        type: permissionsSchema,
        default: () => {
            const defaultPerms = {};
            ALL_RESOURCES.forEach(r => defaultPerms[r] = []);
            return defaultPerms;
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isProfessional: {
        type: Boolean,
        default: false
    },
    isSystemRole: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: null
    }
});

// Method to check if role has a specific permission
roleSchema.methods.hasPermission = function (resource, action) {
    if (!this.permissions || !this.permissions[resource]) {
        return false;
    }
    return this.permissions[resource].includes(action);
};

const Role = mongoose.model("Role", roleSchema);

export default Role;
