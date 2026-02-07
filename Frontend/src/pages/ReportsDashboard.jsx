import { useState } from "react";
import { usePermissions } from "../hooks/usePermission";
import FinancialReports from "../components/reports/FinancialReports";
import ClinicalReports from "../components/reports/ClinicalReports";
import OperationalReports from "../components/reports/OperationalReports";

const ReportsDashboard = () => {
    const { can } = usePermissions();
    const [activeTab, setActiveTab] = useState("FINANCIAL");

    const tabs = [
        {
            id: "FINANCIAL",
            label: "Financial",
            icon: "💰",
            permission: can("REPORTS", "FINANCIAL")
        },
        {
            id: "CLINICAL",
            label: "Clinical",
            icon: "🩺",
            permission: can("REPORTS", "CLINICAL")
        },
        {
            id: "OPERATIONAL",
            label: "Operational",
            icon: "⚙️",
            permission: can("REPORTS", "ADMIN")
        }
    ].filter(tab => tab.permission);

    // Set default tab if current is not accessible
    if (tabs.length > 0 && !tabs.find(t => t.id === activeTab)) {
        setActiveTab(tabs[0].id);
    }

    if (tabs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <div className="text-4xl mb-4">🚫</div>
                <h2 className="text-xl font-bold text-gray-800">Access Denied</h2>
                <p className="text-gray-500">You do not have permission to view reports.</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Analytics & Reports</h1>
                    <p className="text-teal-600">Insights and performance metrics</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-100">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id
                                ? "bg-teal-50 text-teal-700 shadow-sm border border-teal-100"
                                : "text-gray-500 hover:bg-gray-50"
                            }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[500px]">
                {activeTab === "FINANCIAL" && <FinancialReports />}
                {activeTab === "CLINICAL" && <ClinicalReports />}
                {activeTab === "OPERATIONAL" && <OperationalReports />}
            </div>
        </div>
    );
};

export default ReportsDashboard;
