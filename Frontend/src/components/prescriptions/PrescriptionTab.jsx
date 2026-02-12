import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCaseSheetByPatient } from "../../redux/caseSheetSlice";
import { fetchPrescriptions, deletePrescription } from "../../redux/prescriptionSlice.js";
import PrescriptionModal from "./PrescriptionModal";
import {
    Clipboard, Plus, Trash2, Printer, Pill, Calendar,
    Clock, AlertCircle, FileText, Stethoscope
} from "lucide-react";

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
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 ring-1 ring-orange-100">
                    <AlertCircle className="w-10 h-10 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">No Active Case Sheet</h3>
                <p className="text-gray-500 max-w-sm mt-2 mb-8 leading-relaxed">
                    Prescriptions must be linked to a clinical case sheet.
                    Create one to start prescribing medications.
                </p>
                <button
                    onClick={() => onSwitchTab && onSwitchTab("cases")}
                    className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2"
                >
                    <Clipboard className="w-5 h-5" />
                    Go to Case Sheet
                </button>
            </div>
        );
    }

    // 2️⃣ Case Sheet Exists -> Show Prescriptions
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-teal-50 to-white border border-teal-100 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm text-teal-600 ring-1 ring-teal-50">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">Active Case Sheet</p>
                        <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-lg text-gray-800">#{currentCaseSheet._id.slice(-6).toUpperCase()}</span>
                            <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded text-xs font-bold">Active</span>
                        </div>
                    </div>
                </div>
                <button
                    className="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2 active:scale-95"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus className="w-5 h-5" />
                    New Prescription
                </button>
            </div>

            {presLoading && prescriptions.length === 0 ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading history...</p>
                </div>
            ) : prescriptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <Pill className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">No prescriptions recorded yet.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {prescriptions.map((pres) => (
                        <div key={pres._id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-teal-100 transition-all group duration-300">
                            <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 border border-blue-100">
                                        <Stethoscope className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                            Dr. {pres.doctorId?.fullName || "Unknown"}
                                            {pres.doctorId?.specialization && (
                                                <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                    {pres.doctorId.specialization}
                                                </span>
                                            )}
                                        </h4>
                                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-3">
                                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(pres.createdAt).toLocaleDateString()}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(pres.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                        onClick={() => handleDelete(pres._id)}
                                        title="Delete"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        className="p-2.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
                                        title="Print"
                                    >
                                        <Printer className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-gray-100">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Medicine</th>
                                            <th className="px-4 py-3 text-left">Dosage</th>
                                            <th className="px-4 py-3 text-left">Freq</th>
                                            <th className="px-4 py-3 text-left">Duration</th>
                                            <th className="px-4 py-3 text-left">Instruction</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {pres.medicines.map((med, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-3 font-bold text-gray-800 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
                                                    {med.name}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 font-medium">{med.dosage}</td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-bold text-gray-700">{med.frequency}</span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">{med.duration}</td>
                                                <td className="px-4 py-3 text-gray-500 italic">{med.instruction}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {pres.notes && (
                                <div className="mt-5 bg-amber-50/50 p-4 rounded-xl text-sm border border-amber-100 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div className="text-amber-800">
                                        <span className="font-bold block mb-1 text-amber-900">Pharmacist Note</span>
                                        {pres.notes}
                                    </div>
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
