import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        unique: true
    },

    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
        index: true
    },

    caseSheetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CaseSheet",
        required: false
    },

    // Ad-hoc/Standalone Billing Fields
    treatmentDetails: {
        treatmentName: String, // from dropdown
        description: String
    },

    itemizedCharges: {
        treatmentCharges: { type: Number, default: 0 },
        doctorCharges: { type: Number, default: 0 },
        labCharges: { type: Number, default: 0 },
        otherCharges: { type: Number, default: 0 }
    },

    // Legacy/CaseSheet Context
    procedures: [{
        procedureId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Procedure"
        },
        name: String,
        toothNumber: String,
        amount: {
            type: Number,
            default: 0
        }
    }],

    subtotal: {
        type: Number,
        default: 0
    },

    discount: {
        type: Number,
        default: 0
    },

    discountType: {
        type: String,
        enum: ["FIXED", "PERCENTAGE"],
        default: "FIXED"
    },

    tax: {
        type: Number,
        default: 0
    },

    totalAmount: {
        type: Number,
        default: 0
    },

    paidAmount: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        enum: ["UNPAID", "PARTIALLY_PAID", "PAID"],
        default: "UNPAID"
    },

    notes: {
        type: String,
        default: ""
    },

    isDoctorPaid: {
        type: Boolean,
        default: false
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});




// Pre-save hook to generate invoice number
invoiceSchema.pre("save", async function () {
    if (this.isNew && !this.invoiceNumber) {
        const count = await this.constructor.countDocuments();
        const year = new Date().getFullYear();
        this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(5, "0")}`;
    }
});

// Virtual for remaining balance
invoiceSchema.virtual("balance").get(function () {
    return this.totalAmount - this.paidAmount;
});

// Method to update payment status
invoiceSchema.methods.updatePaymentStatus = function () {
    if (this.paidAmount >= this.totalAmount) {
        this.status = "PAID";
    } else if (this.paidAmount > 0) {
        this.status = "PARTIALLY_PAID";
    } else {
        this.status = "UNPAID";
    }
};

// Method to check if fully paid
invoiceSchema.methods.isFullyPaid = function () {
    return this.status === "PAID";
};

// Ensure virtuals are included in JSON
invoiceSchema.set("toJSON", { virtuals: true });
invoiceSchema.set("toObject", { virtuals: true });

export default mongoose.model("Invoice", invoiceSchema);
