import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Invoice",
        required: true,
        index: true
    },

    amount: {
        type: Number,
        required: true,
        min: [0.01, "Payment amount must be greater than 0"]
    },

    mode: {
        type: String,
        enum: ["CASH", "CARD", "UPI", "BANK_TRANSFER", "CHEQUE"],
        required: true
    },

    reference: {
        type: String,
        default: ""
    },

    notes: {
        type: String,
        default: ""
    },

    receivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    receivedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});



export default mongoose.model("Payment", paymentSchema);
