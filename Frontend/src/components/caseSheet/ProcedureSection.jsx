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

// Common dental procedures for quick selection
const COMMON_PROCEDURES = [
    "Scaling",
    "Polishing",
    "Filling",
    "Extraction",
    "Root Canal Treatment (RCT)",
    "Crown",
    "Bridge",
    "Implant",
    "Denture",
    "Whitening",
    "X-Ray",
    "Consultation"
];

const STATUS_CONFIG = {
    PLANNED: {
        color: "bg-blue-100 text-blue-700",
        icon: "📋",
        label: "Planned"
    },
    IN_PROGRESS: {
        color: "bg-yellow-100 text-yellow-700",
        icon: "⏳",
        label: "In Progress"
    },
    COMPLETED: {
        color: "bg-green-100 text-green-700",
        icon: "✓",
        label: "Completed"
    },
    CANCELLED: {
        color: "bg-gray-100 text-gray-500",
        icon: "✗",
        label: "Cancelled"
    }
};

const ProcedureSection = ({ caseSheetId, patientId }) => {
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

    useEffect(() => {
        if (caseSheetId) {
            dispatch(fetchProceduresByCaseSheet(caseSheetId));
        }
    }, [dispatch, caseSheetId]);

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

    const handleStartProcedure = async (procedure) => {
        await dispatch(updateProcedureStatus({ id: procedure._id, status: "IN_PROGRESS" }));
    };

    const handleCompleteProcedure = async (procedure) => {
        await dispatch(completeProcedure({ id: procedure._id }));
    };

    const handleCancelProcedure = async (procedure) => {
        if (window.confirm("Are you sure you want to cancel this procedure?")) {
            await dispatch(updateProcedureStatus({ id: procedure._id, status: "CANCELLED" }));
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
            <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Messages */}
            {successMessage && (
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <span>✓</span> {successMessage}
                </div>
            )}
            {error && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <span>✗</span> {error}
                </div>
            )}

            {/* Header with Add Button */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span>⚕️</span> Procedures
                    <span className="text-sm font-normal text-gray-500">({procedures.length})</span>
                </h3>
                {can("CASE_PROCEDURE", "CREATE") && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm"
                    >
                        + Add Procedure
                    </button>
                )}
            </div>

            {/* Procedures Table */}
            {procedures.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Procedure</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tooth</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Performed By</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {procedures.map((procedure) => {
                                const statusConfig = STATUS_CONFIG[procedure.status];
                                const isLocked = procedure.status === "COMPLETED" || procedure.status === "CANCELLED";

                                return (
                                    <tr
                                        key={procedure._id}
                                        className={`border-b border-gray-100 hover:bg-gray-50 ${procedure.status === "CANCELLED" ? "opacity-60" : ""}`}
                                    >
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-800">{procedure.name}</span>
                                                {procedure.status === "COMPLETED" && procedure.isBillable && (
                                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                                                        💰 Billable
                                                    </span>
                                                )}
                                            </div>
                                            {procedure.notes && (
                                                <p className="text-xs text-gray-500 mt-1">{procedure.notes}</p>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-gray-600">
                                            {procedure.toothNumber || "—"}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                                                {statusConfig.icon} {statusConfig.label}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-gray-600 text-sm">
                                            {procedure.performedBy?.fullName || "—"}
                                        </td>
                                        <td className="py-4 px-4 text-gray-600 text-sm">
                                            {procedure.performedAt
                                                ? new Date(procedure.performedAt).toLocaleDateString()
                                                : new Date(procedure.createdAt).toLocaleDateString()
                                            }
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex justify-end gap-2">
                                                {/* PLANNED actions */}
                                                {procedure.status === "PLANNED" && (
                                                    <>
                                                        {can("CASE_PROCEDURE", "EDIT") && (
                                                            <button
                                                                onClick={() => openEditModal(procedure)}
                                                                disabled={actionLoading}
                                                                className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                                                            >
                                                                Edit
                                                            </button>
                                                        )}
                                                        {can("CASE_PROCEDURE", "EDIT") && (
                                                            <button
                                                                onClick={() => handleStartProcedure(procedure)}
                                                                disabled={actionLoading}
                                                                className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                                                            >
                                                                ▶ Start
                                                            </button>
                                                        )}
                                                        {can("CASE_PROCEDURE", "EDIT") && (
                                                            <button
                                                                onClick={() => handleCancelProcedure(procedure)}
                                                                disabled={actionLoading}
                                                                className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </>
                                                )}

                                                {/* IN_PROGRESS actions */}
                                                {procedure.status === "IN_PROGRESS" && can("CASE_PROCEDURE", "COMPLETE") && (
                                                    <button
                                                        onClick={() => handleCompleteProcedure(procedure)}
                                                        disabled={actionLoading}
                                                        className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50"
                                                    >
                                                        ✓ Complete
                                                    </button>
                                                )}

                                                {/* COMPLETED - read only */}
                                                {procedure.status === "COMPLETED" && (
                                                    <span className="text-xs text-gray-400 italic">Read-only</span>
                                                )}

                                                {/* CANCELLED - greyed out */}
                                                {procedure.status === "CANCELLED" && (
                                                    <span className="text-xs text-gray-400 italic">Cancelled</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-3">⚕️</div>
                    <p>No procedures planned yet.</p>
                    {can("CASE_PROCEDURE", "CREATE") && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="mt-4 text-teal-600 hover:text-teal-700 font-medium"
                        >
                            + Add first procedure
                        </button>
                    )}
                </div>
            )}

            {/* Add Procedure Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Plan New Procedure</h3>
                        <form onSubmit={handleAddProcedure} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Procedure Name *
                                </label>
                                <input
                                    list="procedures-list"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    placeholder="Select or type procedure..."
                                    required
                                />
                                <datalist id="procedures-list">
                                    {COMMON_PROCEDURES.map(proc => (
                                        <option key={proc} value={proc} />
                                    ))}
                                </datalist>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tooth Number (FDI/Universal)
                                </label>
                                <input
                                    type="text"
                                    value={formData.toothNumber}
                                    onChange={(e) => setFormData({ ...formData, toothNumber: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    placeholder="e.g., 36, 21"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    placeholder="Additional notes..."
                                />
                            </div>

                            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isBillable}
                                    onChange={(e) => setFormData({ ...formData, isBillable: e.target.checked })}
                                    className="w-5 h-5 text-teal-500 rounded"
                                />
                                <span className="text-gray-700">Billable procedure</span>
                            </label>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowAddModal(false); resetForm(); }}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50"
                                >
                                    {actionLoading ? "Saving..." : "Plan Procedure"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Procedure Modal */}
            {showEditModal && selectedProcedure && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Procedure</h3>
                        <form onSubmit={handleEditProcedure} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Procedure Name *
                                </label>
                                <input
                                    list="procedures-list-edit"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    required
                                />
                                <datalist id="procedures-list-edit">
                                    {COMMON_PROCEDURES.map(proc => (
                                        <option key={proc} value={proc} />
                                    ))}
                                </datalist>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tooth Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.toothNumber}
                                    onChange={(e) => setFormData({ ...formData, toothNumber: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>

                            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isBillable}
                                    onChange={(e) => setFormData({ ...formData, isBillable: e.target.checked })}
                                    className="w-5 h-5 text-teal-500 rounded"
                                />
                                <span className="text-gray-700">Billable procedure</span>
                            </label>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowEditModal(false); setSelectedProcedure(null); resetForm(); }}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50"
                                >
                                    {actionLoading ? "Saving..." : "Update Procedure"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProcedureSection;
