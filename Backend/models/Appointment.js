import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
        index: true
    },

    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    appointmentDate: {
        type: Date,
        required: true,
        index: true
    },

    durationMinutes: {
        type: Number,
        default: 30
    },

    status: {
        type: String,
        enum: [
            "BOOKED",
            "CHECKED_IN",
            "IN_TREATMENT",
            "COMPLETED",
            "CANCELLED",
            "NO_SHOW"
        ],
        default: "BOOKED"
    },

    reason: String,


    caseSheetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CaseSheet"
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});



export default mongoose.model("Appointment", appointmentSchema);
