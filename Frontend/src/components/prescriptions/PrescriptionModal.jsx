import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createPrescription } from "../../redux/prescriptionSlice.js";

const PrescriptionModal = ({ isOpen, onClose, patientId, caseSheetId, initialData = null }) => {
    const dispatch = useDispatch();

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

        const payload = {
            patientId,
            caseSheetId,
            medicines: validMedicines,
            notes
        };

        const result = await dispatch(createPrescription(payload));
        if (createPrescription.fulfilled.match(result)) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto pt-10 pb-10">
            <div className="bg-white rounded-2xl w-full max-w-4xl p-6 shadow-xl mx-4 my-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        {initialData ? "Edit Prescription" : "New Prescription"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Medicines Table */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-700">Medicines</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">
                                        <th className="px-2 py-2 w-1/4">Name</th>
                                        <th className="px-2 py-2 w-1/6">Dosage</th>
                                        <th className="px-2 py-2 w-1/6">Frequency</th>
                                        <th className="px-2 py-2 w-1/6">Duration</th>
                                        <th className="px-2 py-2 w-1/4">Instruction</th>
                                        <th className="px-2 py-2 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {medicines.map((med, index) => (
                                        <tr key={index} className="bg-white">
                                            <td className="p-2">
                                                <input
                                                    type="text"
                                                    value={med.name}
                                                    onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                                                    placeholder="Paracetamol"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-sm"
                                                    required={index === 0}
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="text"
                                                    value={med.dosage}
                                                    onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                                                    placeholder="500mg"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-sm"
                                                    required={index === 0}
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="text"
                                                    value={med.frequency}
                                                    onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)}
                                                    placeholder="1-0-1"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-sm"
                                                    required={index === 0}
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="text"
                                                    value={med.duration}
                                                    onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                                                    placeholder="5 days"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-sm"
                                                    required={index === 0}
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="text"
                                                    value={med.instruction}
                                                    onChange={(e) => handleMedicineChange(index, "instruction", e.target.value)}
                                                    placeholder="After food"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 text-sm"
                                                />
                                            </td>
                                            <td className="p-2 text-center">
                                                {medicines.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMedicineRow(index)}
                                                        className="text-red-400 hover:text-red-600"
                                                        title="Remove"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button
                            type="button"
                            onClick={addMedicineRow}
                            className="mt-3 text-sm text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1"
                        >
                            <span>+</span> Add Medicine
                        </button>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            placeholder="General instructions for the patient..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 shadow-md"
                        >
                            Save Prescription
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PrescriptionModal;
