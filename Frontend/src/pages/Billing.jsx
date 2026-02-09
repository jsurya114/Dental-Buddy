import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PatientListPanel from "../components/billing/PatientListPanel";

export default function Billing() {
    const navigate = useNavigate();

    const handleSelectPatient = (patient) => {
        navigate(`/app/billing/create/${patient._id}`);
    };

    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden bg-gray-50 border-t border-gray-200">
            {/* Full Width Patient List */}
            <div className="w-full max-w-4xl mx-auto h-full bg-white shadow-sm border-x border-gray-200">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-800">Billing & Invoices</h2>
                    <p className="text-sm text-gray-500">Select a patient to generate an invoice</p>
                </div>
                <div className="h-[calc(100%-80px)]">
                    <PatientListPanel
                        selectedPatientId={null}
                        onSelectPatient={handleSelectPatient}
                    />
                </div>
            </div>
        </div>
    );
}
