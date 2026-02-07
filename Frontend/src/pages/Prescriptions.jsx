import { useNavigate } from "react-router-dom";

export default function Prescriptions() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4 text-3xl shadow-sm text-teal-600">
                💊
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Prescriptions</h2>
            <p className="text-gray-500 mb-6 max-w-md">
                Prescriptions are created as part of a patient’s case sheet.
                Please select a patient to view or manage prescriptions.
            </p>

            <button
                onClick={() => navigate("/app/patients")}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 transition-colors font-medium flex items-center gap-2"
            >
                <span>👥</span> Go to Patients
            </button>
        </div>
    );
}
