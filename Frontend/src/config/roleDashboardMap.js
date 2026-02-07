

export const roleDashboardMap = {
    // Admin
    CLINIC_ADMIN: "/app/admin/dashboard",

    // Doctor-type roles (all share doctor dashboard)
    DOCTOR: "/app/doctor/dashboard",
    INTERN_DOCTOR: "/app/doctor/dashboard",
    CONSULTANT: "/app/doctor/dashboard",
    SURGEON: "/app/doctor/dashboard",
    DENTAL_SURGEON: "/app/doctor/dashboard",

    // Front desk
    RECEPTIONIST: "/app/reception/dashboard",
    FRONT_DESK: "/app/reception/dashboard",

    // Finance
    BILLING: "/app/billing/dashboard",
    ACCOUNTANT: "/app/billing/dashboard",

    // Assistants (share reception for now)
    ASSISTANT: "/app/reception/dashboard",
    NURSE: "/app/reception/dashboard"
};

// Default fallback dashboard
export const DEFAULT_DASHBOARD = "/app/common/dashboard";

export const getDashboardRoute = (roleCode) => {
    if (!roleCode) return DEFAULT_DASHBOARD;

    // Normalize to uppercase
    const normalizedRole = roleCode.toUpperCase();

    return roleDashboardMap[normalizedRole] || DEFAULT_DASHBOARD;
};

export default {
    roleDashboardMap,
    DEFAULT_DASHBOARD,
    getDashboardRoute
};
