import { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";

const TOOTH_STATUSES = [
    { value: "HEALTHY", label: "Healthy", color: "bg-white", text: "text-gray-600" },
    { value: "DECAY", label: "Decay / Carious", color: "bg-rose-500", text: "text-white" },
    { value: "FILLED", label: "Filled / Restored", color: "bg-blue-500", text: "text-white" },
    { value: "RCTS", label: "Root Canal Treated", color: "bg-purple-500", text: "text-white" },
    { value: "CROWN", label: "Crown / Cap", color: "bg-amber-400", text: "text-white" },
    { value: "MISSING", label: "Missing / Extracted", color: "bg-gray-400", text: "text-white" },
    { value: "IMPLANT", label: "Implant", color: "bg-emerald-500", text: "text-white" },
    { value: "EXTRACTION_PLANNED", label: "Planned Extraction", color: "bg-orange-500", text: "text-white" },
    { value: "IN_TREATMENT", label: "In Treatment", color: "bg-teal-500", text: "text-white" }
];

const ToothUpdateModal = ({ isOpen, onClose, onSave, toothNumber, currentData }) => {
    const [status, setStatus] = useState("HEALTHY");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (currentData) {
            setStatus(currentData.status || "HEALTHY");
            setNotes(currentData.notes || "");
        } else {
            setStatus("HEALTHY");
            setNotes("");
        }
    }, [currentData, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-sky-950/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-sky-100 overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-sky-50 px-8 py-6 flex items-center justify-between border-b border-sky-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-sky-100 text-xl font-black text-sky-600">
                            {toothNumber}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-sky-950">Update Tooth Status</h3>
                            <p className="text-sky-600/70 text-sm font-medium">FDI Notation System</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-sky-400 hover:text-sky-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-8">
                    {/* Status Grid */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-sky-600 uppercase tracking-widest ml-1">Condition</label>
                        <div className="grid grid-cols-2 gap-3">
                            {TOOTH_STATUSES.map((item) => (
                                <button
                                    key={item.value}
                                    onClick={() => setStatus(item.value)}
                                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${status === item.value
                                            ? "border-sky-500 bg-sky-50"
                                            : "border-gray-50 bg-white hover:border-sky-100 hover:bg-sky-50/30"
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded-full border border-gray-100 ${item.color}`}></div>
                                    <span className={`text-sm font-bold ${status === item.value ? "text-sky-900" : "text-gray-600"}`}>
                                        {item.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-sky-600 uppercase tracking-widest ml-1">Clinical Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add specific details about this tooth..."
                            className="w-full h-32 px-5 py-4 bg-sky-50/50 border border-sky-100 rounded-[1.5rem] text-sky-900 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-300 transition-all resize-none placeholder-sky-300 font-medium"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-sky-50/50 border-t border-sky-100 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-sky-600 font-bold hover:bg-white rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(toothNumber, { status, notes })}
                        className="px-8 py-3 bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-600/20 hover:bg-sky-700 hover:shadow-xl hover:shadow-sky-600/30 transition-all flex items-center gap-2 active:scale-95"
                    >
                        <Save className="w-5 h-5" />
                        Save Record
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ToothUpdateModal;
