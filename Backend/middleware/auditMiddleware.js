import AuditLog from "../models/AuditLog.js";

const audit = (action, entity) => (req, res, next) => {
    // We hook into the response 'finish' event to log after the request is processed
    res.on("finish", async () => {
        try {
            // Only log successful state-changing operations or critical failures if needed.
            // Requirement says "Every critical action is logged". 
            // We usually log if status is 2xx. For login/security, we might log 401s too?
            // The prompt snippet said: if (res.statusCode < 400).

            if (res.statusCode < 400) {
                const logData = {
                    userId: req.user ? req.user.userId : null,
                    action,
                    entity,
                    entityId: req.params.id || req.body._id || (res.locals && res.locals.entityId),
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"],
                    details: {
                        method: req.method,
                        url: req.originalUrl,
                        body: ["POST", "PUT", "PATCH"].includes(req.method) ? { ...req.body, password: undefined } : undefined
                    }
                };

                await AuditLog.create(logData);
            }
        } catch (error) {
            console.error("Audit logging failed:", error);
        }
    });
    next();
};

export default audit;
