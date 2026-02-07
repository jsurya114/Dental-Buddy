import mongoose from "mongoose";

const clinicAdminSchema = new mongoose.Schema({
    loginId: {
        type: String,
        required: [true, "Login ID is required"],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    role: {
        type: String,
        default: "CLINIC_ADMIN",
        immutable: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLoginAt: {
        type: Date,
        default: null
    }
});



const ClinicAdmin = mongoose.model("ClinicAdmin", clinicAdminSchema);

export default ClinicAdmin;
