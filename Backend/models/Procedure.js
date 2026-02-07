import mongoose from "mongoose";

const procedureSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
        index: true
    },

    caseSheetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CaseSheet",
        required: true,
        index: true
    },

    name: {
        type: String,
        required: true
    },

    toothNumber: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        enum: ["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
        default: "PLANNED"
    },

    notes: {
        type: String,
        default: ""
    },

    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    performedAt: {
        type: Date
    },

    isBillable: {
        type: Boolean,
        default: true
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    // Link to invoice when procedure is billed
    invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Invoice",
        default: null
    }
}, {
    timestamps: true
});



// Static method to get allowed status transitions
procedureSchema.statics.getAllowedTransitions = function () {
    return {
        PLANNED: ["IN_PROGRESS", "CANCELLED"],
        IN_PROGRESS: ["COMPLETED"],
        COMPLETED: [],
        CANCELLED: []
    };
};

// Instance method to check if transition is valid
procedureSchema.methods.canTransitionTo = function (newStatus) {
    const transitions = this.constructor.getAllowedTransitions();
    return transitions[this.status]?.includes(newStatus) || false;
};

// Instance method to check if procedure is locked (completed or cancelled)
procedureSchema.methods.isLocked = function () {
    return this.status === "COMPLETED" || this.status === "CANCELLED";
};

export default mongoose.model("Procedure", procedureSchema);
