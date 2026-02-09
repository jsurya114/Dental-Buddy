import mongoose from "mongoose";

const illustrationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["IMAGE", "VIDEO", "EMBED"],
        required: true
    },
    title: {
        type: String,
        trim: true
    },
    // For IMAGE/VIDEO: relative path in uploads/
    // For EMBED: full URL or iframe source
    source: {
        type: String,
        required: true
    },
    // For EMBED: original user-provided URL
    originalUrl: {
        type: String
    },
    thumbnail: {
        type: String // Optional thumbnail path
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Illustration = mongoose.model("Illustration", illustrationSchema);

export default Illustration;
