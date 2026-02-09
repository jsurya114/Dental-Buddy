/**
 * Menu Configuration - Permission-driven navigation items
 * 
 * Each menu item has:
 * - label: Display text
 * - path: Route path (relative to /app/)
 * - icon: Emoji icon for the menu
 * - module: Permission module (null = always visible)
 * - action: Permission action (typically "VIEW")
 */
export const menuConfig = [
    {
        label: "Dashboard",
        path: "dashboard",
        icon: "🏠",
        module: null, // Always visible
        action: null
    },
    {
        label: "Patients",
        path: "patients",
        icon: "🏥",
        module: "PATIENT",
        action: "VIEW"
    },
    {
        label: "Appointments",
        path: "appointments",
        icon: "📅",
        module: "APPOINTMENT",
        action: "VIEW"
    },
    {
        label: "Illustrations",
        path: "illustrations",
        icon: "🎨",
        module: "ILLUSTRATION",
        action: "VIEW"
    },
    {
        label: "Dental Assistant",
        path: "assistant",
        icon: "🤖",
        module: null, // Open to all (or restrict if needed)
        action: null
    },
    // Case Sheets & Prescriptions are accessed via Patient Profile ONLY.
    {
        label: "Billing",
        path: "billing",
        icon: "💰",
        module: "BILLING",
        action: "VIEW",
        allowedRoles: ["CLINIC_ADMIN"] // Redirects to Patients
    },
    {
        path: "imaging",
        label: "Imaging",
        icon: "🔬",
        module: "IMAGING",
        action: "VIEW"
    },
    {
        path: "reports",
        label: "Analytics",
        icon: "📊",
        module: "REPORTS",
        action: ["FINANCIAL", "CLINICAL", "ADMIN"],
        allowedRoles: ["CLINIC_ADMIN", "BILLING_STAFF"]
    },
    // Admin-only items
    {
        label: "Manage Roles",
        path: "roles",
        icon: "🛡️",
        module: "ROLE_MANAGEMENT",
        action: "VIEW"
    },
    {
        label: "Manage Users",
        path: "users",
        icon: "👥",
        module: "USER_MANAGEMENT",
        action: "VIEW"
    }
];

export default menuConfig;
