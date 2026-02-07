import mongoose from "mongoose";

const CATEGORIES = [
    "XRAY",
    "INTRAORAL_PHOTO",
    "CT_SCAN",
    "LAB_REPORT",
    "PRESCRIPTION",
    "CONSENT_FORM",
    "REFERRAL",
    "OTHER"
];

const imagingSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
        index: true
    },

    caseSheetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CaseSheet"
    },

    procedureId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Procedure"
    },

    category: {
        type: String,
        enum: CATEGORIES,
        required: true,
        index: true
    },

    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        default: ""
    },

    fileKey: {
        type: String,
        required: true // stored filename in uploads directory
    },

    originalName: {
        type: String,
        required: true
    },

    fileType: {
        type: String,
        required: true // MIME type
    },

    fileSize: {
        type: Number,
        required: true // bytes
    },

    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    uploadedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});



// Static method to get categories
imagingSchema.statics.getCategories = function () {
    return CATEGORIES;
};

// Virtual for checking if file is an image
imagingSchema.virtual("isImage").get(function () {
    return this.fileType?.startsWith("image/");
});

// Virtual for checking if file is a PDF
imagingSchema.virtual("isPdf").get(function () {
    return this.fileType === "application/pdf";
});

// Ensure virtuals in JSON
imagingSchema.set("toJSON", { virtuals: true });
imagingSchema.set("toObject", { virtuals: true });

export { CATEGORIES };
export default mongoose.model("Imaging", imagingSchema);
