import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false // Might be null for login failures or system actions
    },
    action: {
        type: String,
        required: true
    },
    entity: {
        type: String,
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    details: {
        type: Object, // Extra metadata
        required: false
    },
    ipAddress: String,
    userAgent: String,

    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: '90d' } // Auto-delete after 90 days (optional, good for maintenance)
    }
});

export default mongoose.model("AuditLog", auditLogSchema);
