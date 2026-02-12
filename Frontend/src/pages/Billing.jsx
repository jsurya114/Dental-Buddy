import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PatientListPanel from "../components/billing/PatientListPanel";
import { Receipt, CreditCard, Search } from "lucide-react";

export default function Billing() {
    const navigate = useNavigate();

    const handleSelectPatient = (patient) => {
        navigate(`/app/billing/create/${patient._id}`);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-sky-950 tracking-tight">Billing & Invoices</h1>
                    <p className="text-sky-700/80 mt-1 text-lg">Manage patient accounts and generate invoices</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white px-5 py-3 rounded-2xl border border-sky-100 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-sky-500 font-bold uppercase tracking-wider">Total Invoiced</p>
                            <p className="text-xl font-bold text-sky-900">$12,450</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="flex-1 bg-white rounded-[2.5rem] shadow-xl shadow-sky-900/5 border border-sky-100 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-sky-100 bg-sky-50/50 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-sky-900">Select Patient</h2>
                        <p className="text-sm text-sky-600 font-medium">Choose a patient to view billing history or create invoice</p>
                    </div>
                    {/* Search is handled inside PatientListPanel usually, but if not we could add here */}
                </div>

                <div className="flex-1 overflow-hidden relative">
                    <PatientListPanel
                        selectedPatientId={null}
                        onSelectPatient={handleSelectPatient}
                    />
                </div>
            </div>
        </div>
    );
}
