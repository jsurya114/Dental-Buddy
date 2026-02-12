import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createPrescription } from "../../redux/prescriptionSlice.js";
import { X, Plus, Trash2, Pill, Save, Loader2, AlertCircle } from "lucide-react";

const PrescriptionModal = ({ isOpen, onClose, patientId, caseSheetId, initialData = null }) => {
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [medicines, setMedicines] = useState([
        { name: "", dosage: "", frequency: "", duration: "", instruction: "" }
    ]);
    const [notes, setNotes] = useState("");

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen && !initialData) {
            setMedicines([{ name: "", dosage: "", frequency: "", duration: "", instruction: "" }]);
            setNotes("");
        }
    }, [isOpen, initialData]);

    const handleMedicineChange = (index, field, value) => {
        const newMedicines = [...medicines];
        newMedicines[index][field] = value;
        setMedicines(newMedicines);
    };

    const addMedicineRow = () => {
        setMedicines([...medicines, { name: "", dosage: "", frequency: "", duration: "", instruction: "" }]);
    };

    const removeMedicineRow = (index) => {
        if (medicines.length > 1) {
            const newMedicines = medicines.filter((_, i) => i !== index);
            setMedicines(newMedicines);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: Remove empty rows
        const validMedicines = medicines.filter(m => m.name.trim() !== "");

        if (validMedicines.length === 0) {
            alert("Please add at least one medicine.");
            return;
        }

        setIsSubmitting(true);
        const payload = {
            patientId,
            caseSheetId,
            medicines: validMedicines,
            notes
        };

        const result = await dispatch(createPrescription(payload));
        setIsSubmitting(false);

        if (createPrescription.fulfilled.match(result)) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto px-4 py-8 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                                <Pill className="w-6 h-6" />
                            </div>
                            {initialData ? "Edit Prescription" : "New Prescription"}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1 ml-12">Add medications for the patient</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form Content - Scrollable */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Medicines Table */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Medications</h3>
                                <button
                                    type="button"
                                    onClick={addMedicineRow}
                                    className="text-sm font-bold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" /> Add Item
                                </button>
                            </div>

                            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                                            <th className="px-4 py-3 w-[25%]">Medicine Name *</th>
                                            <th className="px-4 py-3 w-[15%]">Dosage</th>
                                            <th className="px-4 py-3 w-[15%]">Frequency</th>
                                            <th className="px-4 py-3 w-[15%]">Duration</th>
                                            <th className="px-4 py-3 w-[25%]">Instruction</th>
                                            <th className="px-4 py-3 w-[5%]"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {medicines.map((med, index) => (
                                            <tr key={index} className="group hover:bg-gray-50/50 transition-colors">
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        value={med.name}
                                                        onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                                                        placeholder="e.g. Paracetamol"
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm font-medium"
                                                        required={index === 0}
                                                        autoFocus={index === medicines.length - 1 && medicines.length > 1}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        value={med.dosage}
                                                        onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                                                        placeholder="500mg"
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm"
                                                        required={index === 0}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        value={med.frequency}
                                                        onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)}
                                                        placeholder="1-0-1"
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm"
                                                        required={index === 0}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        value={med.duration}
                                                        onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                                                        placeholder="5 days"
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm"
                                                        required={index === 0}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        value={med.instruction}
                                                        onChange={(e) => handleMedicineChange(index, "instruction", e.target.value)}
                                                        placeholder="After food"
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm"
                                                    />
                                                </td>
                                                <td className="p-2 text-center">
                                                    {medicines.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeMedicineRow(index)}
                                                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Remove Row"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100/50">
                            <label className="flex items-center gap-2 text-sm font-bold text-amber-800 mb-2">
                                <AlertCircle className="w-4 h-4" /> Additional Notes (Optional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows="3"
                                className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm resize-none placeholder-amber-300"
                                placeholder="Dietary restrictions, refill instructions, etc."
                            />
                        </div>

                    </form>
                </div>

                {/* Footer with Actions */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-8 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isSubmitting ? "Issuing..." : "Issue Prescription"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrescriptionModal;
