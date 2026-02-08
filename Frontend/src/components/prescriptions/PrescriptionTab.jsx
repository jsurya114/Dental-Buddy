import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCaseSheetByPatient } from "../../redux/caseSheetSlice";
import { fetchPrescriptions, deletePrescription } from "../../redux/prescriptionSlice.js";
import PrescriptionModal from "./PrescriptionModal";

const PrescriptionTab = ({ patientId, onSwitchTab }) => {
    const dispatch = useDispatch();
    const { currentCaseSheet, loading: caseLoading } = useSelector(state => state.caseSheet);
    const { list: prescriptions, loading: presLoading } = useSelector(state => state.prescriptions);

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (patientId) {
            dispatch(fetchCaseSheetByPatient(patientId));
        }
    }, [dispatch, patientId]);

    // Fetch prescriptions when case sheet is loaded
    useEffect(() => {
        if (currentCaseSheet) {
            dispatch(fetchPrescriptions({ caseSheetId: currentCaseSheet._id }));
        }
    }, [dispatch, currentCaseSheet]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this prescription?")) {
            await dispatch(deletePrescription(id));
        }
    };

    if (caseLoading) {
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

    // 2️⃣ Case Sheet Exists -> Show Prescriptions
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
                    className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors shadow-sm font-medium"
                    onClick={() => setIsModalOpen(true)}
                >
                    + New Prescription
                </button>
            </div>

            {presLoading && prescriptions.length === 0 ? (
                <div className="text-center py-10 text-gray-500">Loading prescriptions...</div>
            ) : prescriptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No prescriptions found for this case sheet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {prescriptions.map((pres) => (
                        <div key={pres._id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
                                <div>
                                    <h4 className="font-bold text-gray-800 text-lg">
                                        Dr. {pres.doctorId?.fullName || "Unknown"}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                        {new Date(pres.createdAt).toLocaleDateString()} • {new Date(pres.createdAt).toLocaleTimeString()}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        onClick={() => handleDelete(pres._id)}
                                    >
                                        🗑️
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                                        🖨️
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-xs text-gray-500 bg-gray-50 uppercase text-left">
                                        <tr>
                                            <th className="px-3 py-2 rounded-l-lg">Medicine</th>
                                            <th className="px-3 py-2">Dosage</th>
                                            <th className="px-3 py-2">Freq</th>
                                            <th className="px-3 py-2">Duration</th>
                                            <th className="px-3 py-2 rounded-r-lg">Instruction</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {pres.medicines.map((med, idx) => (
                                            <tr key={idx}>
                                                <td className="px-3 py-2 font-medium text-gray-800">{med.name}</td>
                                                <td className="px-3 py-2 text-gray-600">{med.dosage}</td>
                                                <td className="px-3 py-2 text-gray-600">{med.frequency}</td>
                                                <td className="px-3 py-2 text-gray-600">{med.duration}</td>
                                                <td className="px-3 py-2 text-gray-500 italic">{med.instruction}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {pres.notes && (
                                <div className="mt-4 bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800 border border-yellow-100">
                                    <span className="font-semibold">Note:</span> {pres.notes}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <PrescriptionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                patientId={patientId}
                caseSheetId={currentCaseSheet._id}
            />
        </div>
    );
};

export default PrescriptionTab;
