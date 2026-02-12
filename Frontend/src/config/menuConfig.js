export const menuConfig = [
    {
        label: "Dashboard",
        path: "dashboard",
        icon: "LayoutDashboard",
        module: null,
        action: null
    },
    {
        label: "Patients",
        path: "patients",
        icon: "Users",
        module: "PATIENT",
        action: "VIEW"
    },
    {
        label: "Appointments",
        path: "appointments",
        icon: "Calendar",
        module: "APPOINTMENT",
        action: "VIEW"
    },
    {
        label: "Illustrations",
        path: "illustrations",
        icon: "Image",
        module: "ILLUSTRATION",
        action: "VIEW"
    },
    {
        label: "Dental Assistant",
        path: "assistant",
        icon: "Bot",
        module: null,
        action: null
    },
    {
        label: "Billing",
        path: "billing",
        icon: "Receipt",
        module: "BILLING",
        action: "VIEW",
        allowedRoles: ["CLINIC_ADMIN"]
    },
    {
        path: "imaging",
        label: "Imaging",
        icon: "Microscope",
        module: "IMAGING",
        action: "VIEW"
    },
    {
        path: "reports",
        label: "Analytics",
        icon: "BarChart3",
        module: "REPORTS",
        action: ["FINANCIAL", "CLINICAL", "ADMIN"],
        allowedRoles: ["CLINIC_ADMIN", "BILLING_STAFF"]
    },
    {
        label: "Manage Roles",
        path: "roles",
        icon: "Shield",
        module: "ROLE_MANAGEMENT",
        action: "VIEW"
    },
    {
        label: "Manage Users",
        path: "users",
        icon: "UserCog",
        module: "USER_MANAGEMENT",
        action: "VIEW"
    }
];

export default menuConfig;
