import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCaseSheetByPatient } from "../../redux/caseSheetSlice";

const PrescriptionTab = ({ patientId, onSwitchTab }) => {
    const dispatch = useDispatch();
    const { currentCaseSheet, loading } = useSelector(state => state.caseSheet);

    useEffect(() => {
        if (patientId) {
            dispatch(fetchCaseSheetByPatient(patientId));
        }
    }, [dispatch, patientId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    // 1️⃣ No case sheet found (or not active) -> Show Empty State
    if (!currentCaseSheet) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 text-3xl">
                    ⚠️
                </div>
                <h3 className="text-lg font-bold text-gray-800">No Active Case Sheet</h3>
                <p className="text-gray-500 max-w-sm mt-2 mb-6">
                    Prescriptions are created as part of a case sheet.
                    Create a case sheet to start prescribing.
                </p>
                <button
                    onClick={() => onSwitchTab && onSwitchTab("cases")}
                    className="px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors shadow-sm"
                >
                    Target Case Sheet
                </button>
            </div>
        );
    }

    // 2️⃣ Case Sheet Exists -> Show Prescriptions (Placeholder for now as module is not fully built)
    return (
        <div className="space-y-6">
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="bg-white p-2 rounded-lg text-xl shadow-sm">📋</span>
                    <div>
                        <p className="text-sm text-teal-600 font-medium">Linked Case Sheet</p>
                        <p className="font-bold text-teal-900">#{currentCaseSheet._id.slice(-6).toUpperCase()}</p>
                    </div>
                </div>
                <button
                    className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors"
                    onClick={() => alert("New Prescription Modal would open here")}
                >
                    + New Prescription
                </button>
            </div>

            <div className="flex flex-col items-center justify-center h-48 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500">No prescriptions found for this case sheet.</p>
            </div>
        </div>
    );
};

export default PrescriptionTab;
