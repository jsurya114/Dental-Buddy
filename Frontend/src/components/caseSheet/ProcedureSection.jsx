import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePermissions } from "../../hooks/usePermission";
import {
    fetchProceduresByCaseSheet,
    createProcedure,
    updateProcedure,
    updateProcedureStatus,
    completeProcedure,
    clearSuccessMessage,
    clearError
} from "../../redux/procedureSlice";
import { Plus, Edit2, Play, CheckCircle2, XCircle, AlertCircle, Loader2, Save, X, Trash2, StickyNote, IndianRupee } from "lucide-react";

const COMMON_PROCEDURES = [
    "Scaling", "Polishing", "Filling", "Extraction",
    "Root Canal Treatment (RCT)", "Crown", "Bridge",
    "Implant", "Denture", "Whitening", "X-Ray", "Consultation"
];

const STATUS_CONFIG = {
    PLANNED: { icon: StickyNote, label: "Planned", color: "bg-gray-100 text-gray-600 border-gray-200", ring: "ring-gray-100" },
    IN_PROGRESS: { icon: Loader2, label: "In Progress", color: "bg-amber-50 text-amber-700 border-amber-100", ring: "ring-amber-100" },
    COMPLETED: { icon: CheckCircle2, label: "Completed", color: "bg-emerald-50 text-emerald-700 border-emerald-100", ring: "ring-emerald-100" },
    CANCELLED: { icon: XCircle, label: "Cancelled", color: "bg-red-50 text-red-700 border-red-100", ring: "ring-red-100" }
};

const ProcedureSection = ({ caseSheetId, patientId, autoFillTooth, onClearAutoFill }) => {
    const dispatch = useDispatch();
    const { can } = usePermissions();
    const { procedures, loading, actionLoading, error, successMessage } = useSelector(state => state.procedures);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedProcedure, setSelectedProcedure] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        toothNumber: "",
        notes: "",
        isBillable: true
    });

    // Handle Auto-fill from Tooth Chart
    useEffect(() => {
        if (autoFillTooth) {
            setFormData(prev => ({
                ...prev,
                toothNumber: autoFillTooth
            }));
            setShowAddModal(true);

            // Clear the trigger so it doesn't pop up again on re-render
            onClearAutoFill();
        }
    }, [autoFillTooth, onClearAutoFill]);

    useEffect(() => {
        if (caseSheetId) {
            dispatch(fetchProceduresByCaseSheet(caseSheetId));
        }
    }, [dispatch, caseSheetId]);

    // Clear messages
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => dispatch(clearSuccessMessage()), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, dispatch]);
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => dispatch(clearError()), 5000);
            return () => clearTimeout(timer);
        }
    }, [error, dispatch]);

    const resetForm = () => {
        setFormData({ name: "", toothNumber: "", notes: "", isBillable: true });
    };

    const handleAddProcedure = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        await dispatch(createProcedure({
            patientId,
            caseSheetId,
            name: formData.name,
            toothNumber: formData.toothNumber,
            notes: formData.notes,
            isBillable: formData.isBillable
        }));

        setShowAddModal(false);
        resetForm();
    };

    const handleEditProcedure = async (e) => {
        e.preventDefault();
        if (!selectedProcedure) return;

        await dispatch(updateProcedure({
            id: selectedProcedure._id,
            data: {
                name: formData.name,
                toothNumber: formData.toothNumber,
                notes: formData.notes,
                isBillable: formData.isBillable
            }
        }));

        setShowEditModal(false);
        setSelectedProcedure(null);
        resetForm();
    };

    const handleAction = async (id, action, status = null) => {
        if (action === "START") await dispatch(updateProcedureStatus({ id, status: "IN_PROGRESS" }));
        if (action === "COMPLETE") await dispatch(completeProcedure({ id }));
        if (action === "CANCEL") {
            if (window.confirm("Are you sure you want to cancel this procedure?")) {
                await dispatch(updateProcedureStatus({ id, status: "CANCELLED" }));
            }
        }
    };

    const openEditModal = (procedure) => {
        setSelectedProcedure(procedure);
        setFormData({
            name: procedure.name,
            toothNumber: procedure.toothNumber || "",
            notes: procedure.notes || "",
            isBillable: procedure.isBillable
        });
        setShowEditModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                        <Stethoscope className="w-5 h-5" />
                    </div>
                    Clinical Procedures
                    <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-bold">{procedures.length}</span>
                </h3>
                {can("CASE_PROCEDURE", "CREATE") && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-teal-600 text-white rounded-xl shadow-lg shadow-teal-600/20 hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-600/30 transition-all font-medium flex items-center gap-2 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Plan Procedure
                    </button>
                )}
            </div>

            {/* Notification Area */}
            {successMessage && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">{successMessage}</span>
                </div>
            )}

            {/* Procedures List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {procedures.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {procedures.map((procedure) => {
                            const status = STATUS_CONFIG[procedure.status] || STATUS_CONFIG.PLANNED;
                            const StatusIcon = status.icon;

                            return (
                                <div key={procedure._id} className={`p-5 hover:bg-gray-50/80 transition-all group ${procedure.status === "CANCELLED" ? "opacity-60 bg-gray-50/30" : ""}`}>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">

                                        {/* Left: Info */}
                                        <div className="flex items-start gap-3 sm:gap-4 overflow-hidden">
                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${procedure.status === 'COMPLETED' ? 'bg-emerald-100 border-emerald-200 text-emerald-600' : 'bg-white border-gray-200 text-gray-500'}`}>
                                                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                                    <h4 className="font-bold text-gray-800 text-sm sm:text-base truncate">{procedure.name}</h4>
                                                    {procedure.isBillable && (
                                                        <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shrink-0">
                                                            <IndianRupee className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Billable
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] sm:text-sm text-gray-500">
                                                    {procedure.toothNumber && (
                                                        <span className="bg-gray-100 px-1.5 rounded text-gray-700 font-mono font-bold">Tooth: {procedure.toothNumber}</span>
                                                    )}
                                                    {procedure.notes && (
                                                        <span className="truncate max-w-[150px] sm:max-w-xs italic">— {procedure.notes}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Status & Actions */}
                                        <div className="flex items-center gap-4 self-end sm:self-center">
                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${status.color}`}>
                                                <StatusIcon className={`w-3.5 h-3.5 ${procedure.status === 'IN_PROGRESS' ? 'animate-spin' : ''}`} />
                                                {status.label}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {procedure.status === "PLANNED" && (
                                                    <>
                                                        {can("CASE_PROCEDURE", "EDIT") && (
                                                            <button
                                                                onClick={() => openEditModal(procedure)}
                                                                className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {can("CASE_PROCEDURE", "EDIT") && (
                                                            <button
                                                                onClick={() => handleAction(procedure._id, "START")}
                                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Start Procedure"
                                                            >
                                                                <Play className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {can("CASE_PROCEDURE", "EDIT") && (
                                                            <button
                                                                onClick={() => handleAction(procedure._id, "CANCEL")}
                                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Cancel"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </>
                                                )}

                                                {procedure.status === "IN_PROGRESS" && can("CASE_PROCEDURE", "COMPLETE") && (
                                                    <button
                                                        onClick={() => handleAction(procedure._id, "COMPLETE")}
                                                        className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 shadow-sm flex items-center gap-1.5"
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Complete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Stethoscope className="w-8 h-8 text-gray-300" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-800">No procedures recorded</h4>
                        <p className="text-gray-500 max-w-sm mt-1">
                            Add procedures to track clinical treatments, progress, and billing status.
                        </p>
                    </div>
                )}
            </div>

            {/* Modal - Reused for Add & Edit */}
            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">
                                {showEditModal ? "Edit Procedure" : "Plan New Procedure"}
                            </h3>
                            <button
                                onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={showEditModal ? handleEditProcedure : handleAddProcedure} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Procedure Name</label>
                                <div className="relative">
                                    <input
                                        list="procedures-list"
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium text-gray-800"
                                        placeholder="Select or type..."
                                        required
                                        autoFocus
                                    />
                                    <datalist id="procedures-list">
                                        {COMMON_PROCEDURES.map(proc => <option key={proc} value={proc} />)}
                                    </datalist>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tooth Number</label>
                                <input
                                    type="text"
                                    value={formData.toothNumber}
                                    onChange={(e) => setFormData({ ...formData, toothNumber: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium"
                                    placeholder="e.g. 18, 24"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Clinical Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all resize-none"
                                    placeholder="Any specific observations..."
                                />
                            </div>

                            <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isBillable ? 'bg-teal-500 border-teal-500' : 'bg-white border-gray-300'}`}>
                                    {formData.isBillable && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={formData.isBillable}
                                    onChange={(e) => setFormData({ ...formData, isBillable: e.target.checked })}
                                    className="hidden"
                                />
                                <span className="text-sm font-semibold text-gray-700 select-none">Mark as Billable</span>
                            </label>

                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:from-teal-700 hover:to-cyan-700 transition-all flex items-center justify-center gap-2"
                            >
                                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {actionLoading ? "Saving..." : (showEditModal ? "Update Procedure" : "Save Procedure")}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper icon component for use in parent
export const Stethoscope = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);

export default ProcedureSection;
