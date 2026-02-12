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
        <div className="overflow-x-auto custom-scrollbar no-scrollbar-on-mobile -mx-4 sm:mx-0">
            <table className="w-full border-collapse min-w-[600px]">
                <thead>
                    <tr className="bg-sky-50/50">
                        <th className="px-6 py-4 text-left text-xs font-black text-sky-900 uppercase tracking-widest border-b border-sky-100">
                            Resource Name
                        </th>
                        {ACTIONS.map(action => (
                            <th key={action} className="px-4 py-4 text-center text-xs font-black text-sky-900 uppercase tracking-widest border-b border-sky-100">
                                <div className="flex flex-col items-center gap-1">
                                    <span>{ACTION_LABELS[action]}</span>
                                    {!disabled && (
                                        <button
                                            type="button"
                                            onClick={() => handleSelectAllForAction(action)}
                                            className="text-[10px] text-sky-500 hover:text-sky-700 font-bold hover:underline"
                                        >
                                            SET ALL
                                        </button>
                                    )}
                                </div>
                            </th>
                        ))}
                        <th className="px-6 py-4 text-center text-xs font-black text-sky-900 uppercase tracking-widest border-b border-sky-100">
                            ROW
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {RESOURCES.map((resource, idx) => {
                        const resourcePermissions = localPermissions[resource] || [];
                        const hasAll = ACTIONS.every(a => resourcePermissions.includes(a));

                        return (
                            <tr key={resource} className={idx % 2 === 0 ? "bg-white" : "bg-sky-50/20"}>
                                <td className="px-4 py-3 text-sm font-medium text-sky-900 border-b border-sky-50">
                                    {RESOURCE_LABELS[resource]}
                                </td>
                                {ACTIONS.map(action => {
                                    const isChecked = resourcePermissions.includes(action);
                                    return (
                                        <td key={action} className="px-4 py-3 text-center border-b border-sky-50">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleToggle(resource, action)}
                                                disabled={disabled}
                                                className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500 disabled:opacity-50 accent-sky-600"
                                            />
                                        </td>
                                    );
                                })}
                                <td className="px-4 py-3 text-center border-b border-sky-50">
                                    <button
                                        type="button"
                                        onClick={() => handleSelectAll(resource)}
                                        disabled={disabled}
                                        className={`px-2 py-1 text-xs rounded transition-colors ${hasAll
                                            ? "bg-sky-100 text-sky-700"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            } hover:bg-sky-200 disabled:opacity-50 disabled:cursor-not-allowed`}
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
