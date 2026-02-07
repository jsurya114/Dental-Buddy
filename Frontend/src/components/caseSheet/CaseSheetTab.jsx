import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePermissions } from "../../hooks/usePermission";
import {
    fetchCaseSheetByPatient,
    createCaseSheet,
    updateCaseSheetSection,
    clearSuccessMessage,
    clearError
} from "../../redux/caseSheetSlice";
import ProcedureSection from "./ProcedureSection";

// Section configuration
const SECTIONS = [
    { id: "personal-history", key: "personalHistory", label: "Personal History", icon: "📝", permission: "CASE_PERSONAL" },
    { id: "medical-history", key: "medicalHistory", label: "Medical History", icon: "🏥", permission: "CASE_MEDICAL" },
    { id: "dental-examination", key: "dentalExamination", label: "Dental Examination", icon: "🦷", permission: "CASE_EXAM" },
    { id: "diagnosis", key: "diagnosis", label: "Diagnosis", icon: "🔍", permission: "CASE_DIAGNOSIS" },
    { id: "treatment-plan", key: "treatmentPlan", label: "Treatment Plan", icon: "📋", permission: "CASE_TREATMENT" },
    { id: "procedures", key: "procedures", label: "Procedures", icon: "⚕️", permission: "CASE_PROCEDURE" },
    { id: "notes", key: "notes", label: "Notes", icon: "📝", permission: "CASE_NOTES" }
];

const CaseSheetTab = ({ patientId }) => {
    const dispatch = useDispatch();
    const { can } = usePermissions();
    const { currentCaseSheet, loading, error, successMessage, sectionLoading } = useSelector(state => state.caseSheet);
    const [activeSection, setActiveSection] = useState("personal-history");
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (patientId) {
            dispatch(fetchCaseSheetByPatient(patientId));
        }
    }, [dispatch, patientId]);

    useEffect(() => {
        if (currentCaseSheet) {
            setFormData(currentCaseSheet);
        }
    }, [currentCaseSheet]);

    useEffect(() => {
        if (successMessage) {
            setTimeout(() => dispatch(clearSuccessMessage()), 3000);
        }
    }, [successMessage, dispatch]);

    const handleCreateCaseSheet = async () => {
        await dispatch(createCaseSheet({ patientId, personalHistory: {} }));
    };

    const handleSaveSection = async (sectionId) => {
        const section = SECTIONS.find(s => s.id === sectionId);
        if (!section) return;

        await dispatch(updateCaseSheetSection({
            caseSheetId: currentCaseSheet._id,
            sectionName: sectionId,
            sectionData: formData[section.key]
        }));
        setEditMode(false);
    };

    const updateFormData = (sectionKey, field, value) => {
        setFormData(prev => ({
            ...prev,
            [sectionKey]: {
                ...prev[sectionKey],
                [field]: value
            }
        }));
    };

    // Get visible sections based on permissions
    const visibleSections = SECTIONS.filter(section => can(section.permission, "VIEW"));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    // No case sheet exists - show create button
    if (!currentCaseSheet) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-4 text-3xl">
                    📋
                </div>
                <h3 className="text-lg font-bold text-gray-800">No Case Sheet Found</h3>
                <p className="text-gray-500 max-w-sm mt-2 mb-6">
                    Create a case sheet to start documenting this patient's dental records.
                </p>
                {can("CASE_PERSONAL", "CREATE") && (
                    <button
                        onClick={handleCreateCaseSheet}
                        className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                    >
                        + Create Case Sheet
                    </button>
                )}
            </div>
        );
    }

    const currentSectionConfig = SECTIONS.find(s => s.id === activeSection);
    const canEditCurrentSection = currentSectionConfig && can(currentSectionConfig.permission, "EDIT");

    return (
        <div className="space-y-6">
            {/* Success/Error Messages */}
            {successMessage && (
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl">
                    ✓ {successMessage}
                </div>
            )}
            {error && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl">
                    ✗ {error}
                </div>
            )}

            {/* Section Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {visibleSections.map(section => (
                    <button
                        key={section.id}
                        onClick={() => {
                            setActiveSection(section.id);
                            setEditMode(false);
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 text-sm ${activeSection === section.id
                            ? "bg-teal-500 text-white shadow-sm"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        <span>{section.icon}</span>
                        {section.label}
                    </button>
                ))}
            </div>

            {/* Section Content */}
            <div className="bg-gray-50 rounded-xl p-6">
                {/* Section Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span>{currentSectionConfig?.icon}</span>
                        {currentSectionConfig?.label}
                    </h3>
                    {canEditCurrentSection && !editMode && (
                        <button
                            onClick={() => setEditMode(true)}
                            className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            ✏️ Edit
                        </button>
                    )}
                    {editMode && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setEditMode(false)}
                                className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSaveSection(activeSection)}
                                disabled={sectionLoading[activeSection]}
                                className="px-4 py-2 text-sm bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50"
                            >
                                {sectionLoading[activeSection] ? "Saving..." : "Save"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Personal History Section */}
                {activeSection === "personal-history" && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Chief Complaint</label>
                            <textarea
                                value={formData.personalHistory?.chiefComplaint || ""}
                                onChange={(e) => updateFormData("personalHistory", "chiefComplaint", e.target.value)}
                                disabled={!editMode}
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100"
                                placeholder="Patient's main dental concern..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Habits</label>
                            <textarea
                                value={formData.personalHistory?.habits || ""}
                                onChange={(e) => updateFormData("personalHistory", "habits", e.target.value)}
                                disabled={!editMode}
                                rows={2}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100"
                                placeholder="Smoking, tobacco, bruxism, etc."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Past Dental History</label>
                            <textarea
                                value={formData.personalHistory?.pastDentalHistory || ""}
                                onChange={(e) => updateFormData("personalHistory", "pastDentalHistory", e.target.value)}
                                disabled={!editMode}
                                rows={2}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100"
                                placeholder="Previous treatments, extractions, etc."
                            />
                        </div>
                    </div>
                )}

                {/* Medical History Section */}
                {activeSection === "medical-history" && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {["diabetes", "hypertension", "asthma"].map(condition => (
                                <label key={condition} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                    <input
                                        type="checkbox"
                                        checked={formData.medicalHistory?.[condition] || false}
                                        onChange={(e) => updateFormData("medicalHistory", condition, e.target.checked)}
                                        disabled={!editMode}
                                        className="w-5 h-5 text-teal-500 rounded"
                                    />
                                    <span className="capitalize text-gray-700">{condition}</span>
                                </label>
                            ))}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                            <input
                                type="text"
                                value={formData.medicalHistory?.allergies || ""}
                                onChange={(e) => updateFormData("medicalHistory", "allergies", e.target.value)}
                                disabled={!editMode}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100"
                                placeholder="Drug allergies, latex, etc."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Medications</label>
                            <textarea
                                value={formData.medicalHistory?.medications || ""}
                                onChange={(e) => updateFormData("medicalHistory", "medications", e.target.value)}
                                disabled={!editMode}
                                rows={2}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100"
                                placeholder="List current medications..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pregnancy Status</label>
                            <select
                                value={formData.medicalHistory?.pregnancyStatus || ""}
                                onChange={(e) => updateFormData("medicalHistory", "pregnancyStatus", e.target.value)}
                                disabled={!editMode}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100"
                            >
                                <option value="">N/A</option>
                                <option value="not-pregnant">Not Pregnant</option>
                                <option value="pregnant">Pregnant</option>
                                <option value="breastfeeding">Breastfeeding</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Dental Examination Section */}
                {activeSection === "dental-examination" && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Findings</label>
                            <textarea
                                value={formData.dentalExamination?.findings || ""}
                                onChange={(e) => updateFormData("dentalExamination", "findings", e.target.value)}
                                disabled={!editMode}
                                rows={5}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100"
                                placeholder="Document examination findings, tooth conditions, periodontal status..."
                            />
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg text-blue-700 text-sm">
                            💡 Interactive tooth chart coming soon
                        </div>
                    </div>
                )}

                {/* Diagnosis Section */}
                {activeSection === "diagnosis" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                        <textarea
                            value={typeof formData.diagnosis === 'string' ? formData.diagnosis : ""}
                            onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                            disabled={!editMode}
                            rows={5}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100"
                            placeholder="Document clinical diagnosis..."
                        />
                    </div>
                )}

                {/* Treatment Plan Section */}
                {activeSection === "treatment-plan" && (
                    <div className="space-y-4">
                        {formData.treatmentPlan?.length > 0 ? (
                            <div className="space-y-3">
                                {formData.treatmentPlan.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                                            item.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-700" :
                                                item.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                                                    "bg-gray-100 text-gray-700"
                                            }`}>
                                            {item.status}
                                        </span>
                                        <span className="flex-1 font-medium">{item.procedure}</span>
                                        {item.tooth && <span className="text-gray-500">Tooth: {item.tooth}</span>}
                                        {item.estimatedCost > 0 && <span className="text-gray-500">₹{item.estimatedCost}</span>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic text-center py-8">No treatment plan items yet.</p>
                        )}
                    </div>
                )}

                {/* Procedures Section - Now uses dedicated component */}
                {activeSection === "procedures" && currentCaseSheet && (
                    <ProcedureSection
                        caseSheetId={currentCaseSheet._id}
                        patientId={currentCaseSheet.patientId?._id || currentCaseSheet.patientId}
                    />
                )}

                {/* Notes Section */}
                {activeSection === "notes" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes & Follow-ups</label>
                        <textarea
                            value={typeof formData.notes === 'string' ? formData.notes : ""}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            disabled={!editMode}
                            rows={6}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100"
                            placeholder="Additional notes, follow-up instructions..."
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CaseSheetTab;
