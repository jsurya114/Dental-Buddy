
export const RESOURCES = {
    PATIENT: "PATIENT",
    APPOINTMENT: "APPOINTMENT",
    // Case Sheet Section-Level Permissions
    CASE_PERSONAL: "CASE_PERSONAL",
    CASE_MEDICAL: "CASE_MEDICAL",
    CASE_EXAM: "CASE_EXAM",
    CASE_DIAGNOSIS: "CASE_DIAGNOSIS",
    CASE_TREATMENT: "CASE_TREATMENT",
    CASE_PROCEDURE: "CASE_PROCEDURE",
    CASE_NOTES: "CASE_NOTES",
    BILLING: "BILLING",
    PAYMENT: "PAYMENT",
    PRESCRIPTION: "PRESCRIPTION",
    IMAGING: "IMAGING",
    REPORTS: "REPORTS",
    USER_MANAGEMENT: "USER_MANAGEMENT",
    ROLE_MANAGEMENT: "ROLE_MANAGEMENT"
};

export const ACTIONS = {
    VIEW: "VIEW",
    CREATE: "CREATE",
    EDIT: "EDIT",
    DELETE: "DELETE",
    COMPLETE: "COMPLETE",
    // Report specific actions
    FINANCIAL: "FINANCIAL",
    CLINICAL: "CLINICAL",
    ADMIN: "ADMIN"
};


export const ALL_RESOURCES = Object.values(RESOURCES);


export const ALL_ACTIONS = Object.values(ACTIONS);


export const SYSTEM_ROLE_PERMISSIONS = {
    CLINIC_ADMIN: {
        PATIENT: ["VIEW", "CREATE", "EDIT", "DELETE"],
        APPOINTMENT: ["VIEW", "CREATE", "EDIT", "DELETE"],
        // Case Sheet Section Permissions
        CASE_PERSONAL: ["VIEW", "CREATE", "EDIT", "DELETE"],
        CASE_MEDICAL: ["VIEW", "CREATE", "EDIT", "DELETE"],
        CASE_EXAM: ["VIEW", "CREATE", "EDIT", "DELETE"],
        CASE_DIAGNOSIS: ["VIEW", "CREATE", "EDIT", "DELETE"],
        CASE_TREATMENT: ["VIEW", "CREATE", "EDIT", "DELETE"],
        CASE_PROCEDURE: ["VIEW", "CREATE", "EDIT", "DELETE", "COMPLETE"],
        CASE_NOTES: ["VIEW", "CREATE", "EDIT", "DELETE"],
        BILLING: ["VIEW", "CREATE", "EDIT", "DELETE"],
        PAYMENT: ["VIEW", "CREATE"],
        PRESCRIPTION: ["VIEW", "CREATE", "EDIT", "DELETE"],
        IMAGING: ["VIEW", "CREATE", "EDIT", "DELETE"],
        REPORTS: ["FINANCIAL", "CLINICAL", "ADMIN"],
        USER_MANAGEMENT: ["VIEW", "CREATE", "EDIT", "DELETE"],
        ROLE_MANAGEMENT: ["VIEW", "CREATE", "EDIT", "DELETE"]
    }
};


export const RESOURCE_LABELS = {
    PATIENT: "Patient Records",
    APPOINTMENT: "Appointments",
    // Case Sheet Sections
    CASE_PERSONAL: "Case Sheet - Personal History",
    CASE_MEDICAL: "Case Sheet - Medical History",
    CASE_EXAM: "Case Sheet - Dental Examination",
    CASE_DIAGNOSIS: "Case Sheet - Diagnosis",
    CASE_TREATMENT: "Case Sheet - Treatment Plan",
    CASE_PROCEDURE: "Case Sheet - Procedures",
    CASE_NOTES: "Case Sheet - Notes",
    BILLING: "Billing & Invoices",
    PAYMENT: "Payments",
    PRESCRIPTION: "Prescriptions",
    IMAGING: "Imaging & X-rays",
    REPORTS: "Reports & Analytics",
    USER_MANAGEMENT: "User Management",
    ROLE_MANAGEMENT: "Role Management"
};


export const ACTION_LABELS = {
    VIEW: "View",
    CREATE: "Create",
    EDIT: "Edit",
    DELETE: "Delete",
    FINANCIAL: "Financial Reports",
    CLINICAL: "Clinical Reports",
    ADMIN: "Admin Reports"
};

export default {
    RESOURCES,
    ACTIONS,
    ALL_RESOURCES,
    ALL_ACTIONS,
    SYSTEM_ROLE_PERMISSIONS,
    RESOURCE_LABELS,
    ACTION_LABELS
};
