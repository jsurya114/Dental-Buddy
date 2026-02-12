import { useNavigate } from "react-router-dom";
import { Pill, Users } from "lucide-react";

export default function Prescriptions() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-fade-in">
            <div className="w-20 h-20 bg-teal-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm ring-1 ring-teal-100">
                <Pill className="w-10 h-10 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-800">Prescriptions</h2>
            <p className="text-gray-500 mb-8 max-w-md text-lg leading-relaxed">
                Prescriptions are managed within patient profiles to ensure safety and accuracy.
                Select a patient to prescribe medication.
            </p>

            <button
                onClick={() => navigate("/app/patients")}
                className="px-8 py-3 bg-teal-600 text-white rounded-xl shadow-lg shadow-teal-600/20 hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-600/30 transition-all font-medium flex items-center gap-3 group"
            >
                <Users className="w-5 h-5" />
                <span>Go to Patient Directory</span>
            </button>
        </div>
    );
}
