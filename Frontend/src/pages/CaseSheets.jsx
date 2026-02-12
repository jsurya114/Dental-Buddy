import { useNavigate } from "react-router-dom";
import { ClipboardList, Users } from "lucide-react";

export default function CaseSheets() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-sky-50 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-sky-900/5 ring-1 ring-sky-100 group">
                <ClipboardList className="w-12 h-12 text-sky-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-sky-950 tracking-tight">Patient Case Sheets</h2>
            <p className="text-sky-700/80 mb-10 max-w-md text-lg leading-relaxed font-medium">
                Case sheets are securely linked to patient profiles.
                Please select a patient to view or manage their clinical notes.
            </p>

            <button
                onClick={() => navigate("/app/patients")}
                className="px-8 py-4 bg-sky-600 text-white rounded-2xl shadow-lg shadow-sky-600/20 hover:bg-sky-700 hover:shadow-xl hover:shadow-sky-600/30 transition-all font-bold flex items-center gap-3 group active:scale-95"
            >
                <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Go to Patient Directory</span>
            </button>
        </div>
    );
}
