import { useState } from "react";
import PatientListPanel from "./PatientListPanel";
import BillingWorkspace from "./BillingWorkspace";
import { User } from "lucide-react";

const BillingTab = () => {
    const [selectedPatient, setSelectedPatient] = useState(null);

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-sky-50/30 animate-in fade-in duration-500">
            {/* Left Panel: Patient List */}
            <PatientListPanel
                selectedPatientId={selectedPatient?._id}
                onSelectPatient={setSelectedPatient}
            />

            {/* Right Panel: Workspace */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {selectedPatient ? (
                    <BillingWorkspace patient={selectedPatient} />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-sky-300 p-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-sky-900/5 border border-sky-100">
                            <User className="w-10 h-10 text-sky-200" />
                        </div>
                        <h2 className="text-2xl font-bold text-sky-900 mb-2">No Patient Selected</h2>
                        <p className="text-sky-500/80 max-w-sm text-center font-medium">
                            Select a patient from the list on the left to view invoices, record payments, or generate new bills.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BillingTab;
