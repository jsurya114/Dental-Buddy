import mongoose from "mongoose";

const caseSheetSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
        index: true
    },

    // Section A: Patient Basic Details
    sectionA: {
        opNumber: { type: String },
        name: { type: String },
        age: { type: Number },
        gender: { type: String },
        maritalStatus: { type: String },
        phone: { type: String },
        address: { type: String },
        referredBy: { type: String },
        visitDate: { type: Date, default: Date.now },
        dentistName: { type: String }
    },

    // Section 1: Personal History
    personalHistory: {
        chiefComplaint: { type: String, default: "" },
        habits: { type: String, default: "" },
        pastDentalHistory: { type: String, default: "" }
    },

    // Section 2: Medical History
    medicalHistory: {
        diabetes: { type: Boolean, default: false },
        hypertension: { type: Boolean, default: false },
        asthma: { type: Boolean, default: false },
        allergies: { type: String, default: "" },
        medications: { type: String, default: "" },
        pregnancyStatus: { type: String, default: "" }
    },

    // Section 3: Dental Examination
    dentalExamination: {
        toothChart: { type: mongoose.Schema.Types.Mixed, default: {} },
        findings: { type: String, default: "" }
    },

    // Section 4: Diagnosis
    diagnosis: { type: String, default: "" },

    // Section 5: Treatment Plan
    treatmentPlan: [{
        procedure: { type: String, required: true },
        tooth: { type: String, default: "" },
        status: {
            type: String,
            enum: ["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
            default: "PLANNED"
        },
        estimatedCost: { type: Number, default: 0 },
        notes: { type: String, default: "" }
    }],

    // Section 6: Procedures (Completed work)
    procedures: [{
        name: { type: String, required: true },
        tooth: { type: String, default: "" },
        date: { type: Date, default: Date.now },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        notes: { type: String, default: "" },
        cost: { type: Number, default: 0 }
    }],

    // Section 7: Notes & Follow-ups
    notes: { type: String, default: "" },

    // Metadata
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



// Generate case sheet number
caseSheetSchema.statics.generateCaseNumber = async function (patientId) {
    const count = await this.countDocuments({ patientId });
    return `CS-${count + 1}`;
};

export default mongoose.model("CaseSheet", caseSheetSchema);
