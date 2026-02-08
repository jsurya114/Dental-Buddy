import AuditLog from "../models/AuditLog.js";

const audit = (action, entity) => (req, res, next) => {
    res.on("finish", async () => {
        try {
          

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
