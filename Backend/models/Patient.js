import mongoose from "mongoose";

/**
 * Patient Schema
 * 
 * The root entity for the EMR system.
 * All future modules (case sheets, billing, etc.) link to patientId.
 */
const patientSchema = new mongoose.Schema({
    patientId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    fullName: {
        type: String,
        required: [true, "Patient name is required"],
        trim: true,
        index: true
    },

    gender: {
        type: String,
        enum: ["Male", "Female", "Other"]
    },

    age: {
        type: Number,
        min: 0,
        max: 150
    },

    dob: {
        type: Date
    },

    phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
        index: true
    },

    email: {
        type: String,
        trim: true,
        lowercase: true
    },

    address: {
        type: String,
        trim: true
    },

    occupation: {
        type: String,
        trim: true
    },

    emergencyContact: {
        name: {
            type: String,
            trim: true
        },
        phone: {
            type: String,
            trim: true
        }
    },

    isActive: {
        type: Boolean,
        default: true,
        index: true
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});

// Compound index for duplicate detection
patientSchema.index({ phone: 1, fullName: 1 });

// Text search index
patientSchema.index({ fullName: "text", phone: "text", patientId: "text" });

/**
 * Generate next patient ID
 * Format: PAT-XXXXXX (e.g., PAT-000001)
 */
patientSchema.statics.generatePatientId = async function () {
    const lastPatient = await this.findOne({}, { patientId: 1 })
        .sort({ createdAt: -1 })
        .limit(1);

    let nextNumber = 1;

    if (lastPatient && lastPatient.patientId) {
        const match = lastPatient.patientId.match(/PAT-(\d+)/);
        if (match) {
            nextNumber = parseInt(match[1], 10) + 1;
        }
    }

    return `PAT-${String(nextNumber).padStart(6, "0")}`;
};

/**
 * Check for duplicate patient (same name + phone)
 */
patientSchema.statics.checkDuplicate = async function (fullName, phone, excludeId = null) {
    const query = {
        fullName: { $regex: new RegExp(`^${fullName}$`, "i") },
        phone: phone
    };

    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    const existing = await this.findOne(query);
    return !!existing;
};

export default mongoose.model("Patient", patientSchema);
