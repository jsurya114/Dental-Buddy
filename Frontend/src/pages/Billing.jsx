import { useState } from "react";
import PatientListPanel from "../components/billing/PatientListPanel";
import BillingWorkspace from "../components/billing/BillingWorkspace";

export default function Billing() {
    const [selectedPatient, setSelectedPatient] = useState(null);

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50 border-t border-gray-200">
            {/* Left Panel: Patient List */}
            <div className="w-1/3 min-w-[320px] max-w-md h-full border-r border-gray-200 bg-white">
                <PatientListPanel
                    selectedPatientId={selectedPatient?._id}
                    onSelectPatient={setSelectedPatient}
                />
            </div>

            {/* Right Panel: Billing Workspace */}
            <div className="flex-1 h-full overflow-hidden bg-gray-50">
                {selectedPatient ? (
                    <BillingWorkspace patient={selectedPatient} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl shadow-inner">
                            🧾
                        </div>
                        <h3 className="text-xl font-semibold text-gray-600">No Patient Selected</h3>
                        <p className="max-w-sm text-center mt-2 text-sm text-gray-500">
                            Select a patient from the list on the left to view their billing details and create invoices.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
