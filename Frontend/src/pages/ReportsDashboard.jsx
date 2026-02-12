import { useState } from "react";
import { usePermissions } from "../hooks/usePermission";
import FinancialReports from "../components/reports/FinancialReports";
import ClinicalReports from "../components/reports/ClinicalReports";
import OperationalReports from "../components/reports/OperationalReports";
import { BadgeDollarSign, Stethoscope, Settings2, Lock, TrendingUp } from "lucide-react";

const ReportsDashboard = () => {
    const { can } = usePermissions();
    const [activeTab, setActiveTab] = useState("FINANCIAL");

    const tabs = [
        {
            id: "FINANCIAL",
            label: "Financial Reports",
            icon: BadgeDollarSign,
            permission: can("REPORTS", "FINANCIAL"),
            color: "text-blue-600 bg-blue-50"
        },
        {
            id: "CLINICAL",
            label: "Clinical Analytics",
            icon: Stethoscope,
            permission: can("REPORTS", "CLINICAL"),
            color: "text-teal-600 bg-teal-50"
        },
        {
            id: "OPERATIONAL",
            label: "Operational Metrics",
            icon: Settings2,
            permission: can("REPORTS", "ADMIN"),
            color: "text-indigo-600 bg-indigo-50"
        }
    ].filter(tab => tab.permission);

    // Set default tab if current is not accessible
    if (tabs.length > 0 && !tabs.find(t => t.id === activeTab)) {
        setActiveTab(tabs[0].id);
    }

    if (tabs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center bg-gray-50 m-8 rounded-3xl border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    <Lock className="w-10 h-10 text-gray-300" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Access Denied</h2>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                    You do not have permission to view analytics reports. Please contact your administrator.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 flex flex-col min-h-screen p-2">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-sky-950 tracking-tight">Analytics & Reports</h1>
                    <p className="text-sky-700/70 mt-1 text-lg font-medium">Insights into clinic performance</p>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white p-2 rounded-2xl shadow-xl shadow-sky-900/5 border border-sky-100 flex items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar-on-mobile">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${isActive
                                    ? "bg-gray-900 text-white shadow-md"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? "text-teal-400" : ""}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-6">
                    {activeTab === "FINANCIAL" && <FinancialReports />}
                    {activeTab === "CLINICAL" && <ClinicalReports />}
                    {activeTab === "OPERATIONAL" && <OperationalReports />}
                </div>
            </div>
        </div>
    );
};

export default ReportsDashboard;
