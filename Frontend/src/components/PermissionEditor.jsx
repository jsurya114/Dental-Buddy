import { useState, useEffect } from "react";

// Permission constants (synced with backend)
const RESOURCES = [
    "PATIENT",
    "APPOINTMENT",
    // Case Sheet Section-Level Permissions
    "CASE_PERSONAL",
    "CASE_MEDICAL",
    "CASE_EXAM",
    "CASE_DIAGNOSIS",
    "CASE_TREATMENT",
    "CASE_PROCEDURE",
    "CASE_NOTES",
    "BILLING",
    "PRESCRIPTION",
    "IMAGING",
    "REPORTS",
    "USER_MANAGEMENT",
    "ROLE_MANAGEMENT"
];

const ACTIONS = ["VIEW", "CREATE", "EDIT", "DELETE"];

const RESOURCE_LABELS = {
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
    BILLING: "Billing & Payments",
    PRESCRIPTION: "Prescriptions",
    IMAGING: "Imaging & X-rays",
    REPORTS: "Reports & Analytics",
    USER_MANAGEMENT: "User Management",
    ROLE_MANAGEMENT: "Role Management"
};

const ACTION_LABELS = {
    VIEW: "View",
    CREATE: "Create",
    EDIT: "Edit",
    DELETE: "Delete"
};

const PermissionEditor = ({ permissions = {}, onChange, disabled = false }) => {
    const [localPermissions, setLocalPermissions] = useState({});

    // Initialize permissions on mount
    useEffect(() => {
        const initialized = {};
        RESOURCES.forEach(resource => {
            initialized[resource] = permissions[resource] || [];
        });
        setLocalPermissions(initialized);
    }, [permissions]);

    const handleToggle = (resource, action) => {
        if (disabled) return;

        const currentActions = localPermissions[resource] || [];
        let newActions;

        if (currentActions.includes(action)) {
            newActions = currentActions.filter(a => a !== action);
        } else {
            newActions = [...currentActions, action];
        }

        const newPermissions = {
            ...localPermissions,
            [resource]: newActions
        };

        setLocalPermissions(newPermissions);
        onChange && onChange(newPermissions);
    };

    const handleSelectAll = (resource) => {
        if (disabled) return;

        const currentActions = localPermissions[resource] || [];
        const hasAll = ACTIONS.every(a => currentActions.includes(a));

        const newPermissions = {
            ...localPermissions,
            [resource]: hasAll ? [] : [...ACTIONS]
        };

        setLocalPermissions(newPermissions);
        onChange && onChange(newPermissions);
    };

    const handleSelectAllForAction = (action) => {
        if (disabled) return;

        const hasAll = RESOURCES.every(
            r => (localPermissions[r] || []).includes(action)
        );

        const newPermissions = {};
        RESOURCES.forEach(resource => {
            const current = localPermissions[resource] || [];
            if (hasAll) {
                newPermissions[resource] = current.filter(a => a !== action);
            } else {
                newPermissions[resource] = current.includes(action)
                    ? current
                    : [...current, action];
            }
        });

        setLocalPermissions(newPermissions);
        onChange && onChange(newPermissions);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                            Resource
                        </th>
                        {ACTIONS.map(action => (
                            <th key={action} className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">
                                <div className="flex flex-col items-center gap-1">
                                    <span>{ACTION_LABELS[action]}</span>
                                    {!disabled && (
                                        <button
                                            type="button"
                                            onClick={() => handleSelectAllForAction(action)}
                                            className="text-xs text-teal-600 hover:text-teal-700"
                                        >
                                            all
                                        </button>
                                    )}
                                </div>
                            </th>
                        ))}
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">
                            All
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {RESOURCES.map((resource, idx) => {
                        const resourcePermissions = localPermissions[resource] || [];
                        const hasAll = ACTIONS.every(a => resourcePermissions.includes(a));

                        return (
                            <tr key={resource} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-800 border-b">
                                    {RESOURCE_LABELS[resource]}
                                </td>
                                {ACTIONS.map(action => {
                                    const isChecked = resourcePermissions.includes(action);
                                    return (
                                        <td key={action} className="px-4 py-3 text-center border-b">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleToggle(resource, action)}
                                                disabled={disabled}
                                                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 disabled:opacity-50"
                                            />
                                        </td>
                                    );
                                })}
                                <td className="px-4 py-3 text-center border-b">
                                    <button
                                        type="button"
                                        onClick={() => handleSelectAll(resource)}
                                        disabled={disabled}
                                        className={`px-2 py-1 text-xs rounded ${hasAll
                                            ? "bg-teal-100 text-teal-700"
                                            : "bg-gray-100 text-gray-600"
                                            } hover:bg-teal-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {hasAll ? "Clear" : "All"}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default PermissionEditor;
