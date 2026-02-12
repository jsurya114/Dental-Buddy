import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePermissions } from "../../hooks/usePermission";
import {
    fetchCaseSheetByPatient,
    createCaseSheet,
    updateCaseSheetSection,
    clearSuccessMessage,
} from "../../redux/caseSheetSlice";
import ProcedureSection from "./ProcedureSection";
import CaseSheetSectionA from "./CaseSheetSectionA";
import ToothChart from "../toothChart/ToothChart";
import {
    FileText, User, Heart, Stethoscope, Clipboard, CheckSquare,
    StickyNote, Edit2, Check, X, Loader2, Save, LayoutGrid
} from "lucide-react";

const SECTIONS = [
    { id: "section-a", key: "sectionA", label: "Patient Details", icon: User, permission: "CASE_PERSONAL" },
    { id: "tooth-chart", key: "toothChart", label: "Tooth Chart", icon: LayoutGrid, permission: "CASE_EXAM" },
    { id: "personal-history", key: "personalHistory", label: "Personal History", icon: Heart, permission: "CASE_PERSONAL" },
    { id: "medical-history", key: "medicalHistory", label: "Medical History", icon: Stethoscope, permission: "CASE_MEDICAL" },
    { id: "dental-examination", key: "dentalExamination", label: "Dental Exam", icon: Clipboard, permission: "CASE_EXAM" },
    { id: "diagnosis", key: "diagnosis", label: "Diagnosis", icon: CheckSquare, permission: "CASE_DIAGNOSIS" },
    { id: "treatment-plan", key: "treatmentPlan", label: "Treatment Plan", icon: FileText, permission: "CASE_TREATMENT" },
    { id: "procedures", key: "procedures", label: "Procedures", icon: StickyNote, permission: "CASE_PROCEDURE" },
    { id: "notes", key: "notes", label: "Clinical Notes", icon: Edit2, permission: "CASE_NOTES" }
];

const CaseSheetTab = ({ patientId }) => {
    const dispatch = useDispatch();
    const { can } = usePermissions();
    const { currentCaseSheet, loading, error, successMessage, sectionLoading } = useSelector(state => state.caseSheet);
    const [activeSection, setActiveSection] = useState("section-a");
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [autoFillTooth, setAutoFillTooth] = useState(null);

    const { procedures } = useSelector(state => state.procedures);

    // Fetch Case Sheet
    useEffect(() => {
        if (patientId) {
            dispatch(fetchCaseSheetByPatient(patientId));
        }
    }, [dispatch, patientId]);

    // Update Local State
    useEffect(() => {
        if (currentCaseSheet) {
            setFormData(currentCaseSheet);
        }
    }, [currentCaseSheet]);

    // Clear Messages
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

    const visibleSections = SECTIONS.filter(section => can(section.permission, "VIEW"));
    const currentSectionConfig = SECTIONS.find(s => s.id === activeSection);
    const canEditCurrentSection = currentSectionConfig && can(currentSectionConfig.permission, "EDIT");

    // Loading State
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-3" />
                <p className="text-gray-400 font-medium">Loading case sheet...</p>
            </div>
        );
    }

    // Empty State / Create
    if (!currentCaseSheet) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200 m-4">
                <div className="w-20 h-20 bg-teal-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm ring-1 ring-teal-100 animate-bounce">
                    <Clipboard className="w-10 h-10 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">No Case Sheet Found</h3>
                <p className="text-gray-500 max-w-sm mt-2 mb-8 leading-relaxed">
                    This patient doesn't have a case sheet yet. Create one to start documenting clinical records.
                </p>
                {can("CASE_PERSONAL", "CREATE") && (
                    <button
                        onClick={handleCreateCaseSheet}
                        className="px-8 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Create Case Sheet
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col lg:flex-row gap-6 p-1">

            {/* Left: Navigation (Vertical on Desktop, Horizontal Scroll on Mobile) - Responsive */}
            <div className="lg:w-64 shrink-0 flex flex-col gap-1 bg-white rounded-2xl p-2 border border-gray-100 shadow-sm overflow-x-auto lg:overflow-visible flex-row lg:flex-col sticky top-0 z-10 no-scrollbar custom-scrollbar-hide">
                {visibleSections.map(section => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                        <button
                            key={section.id}
                            onClick={() => {
                                setActiveSection(section.id);
                                setEditMode(false);
                            }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm whitespace-nowrap ${isActive
                                ? "bg-teal-50 text-teal-700 shadow-sm border border-teal-100"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? "text-teal-600" : "text-gray-400"}`} />
                            {section.label}
                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500 hidden lg:block"></div>}
                        </button>
                    );
                })}
            </div>

            {/* Right: Content Area */}
            <div className="flex-1 min-w-0 space-y-6">

                {/* Section Header & Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gray-50 rounded-xl text-gray-500">
                            {currentSectionConfig?.icon && <currentSectionConfig.icon className="w-6 h-6" />}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">{currentSectionConfig?.label}</h2>
                            <p className="text-sm text-gray-400 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {canEditCurrentSection && !editMode && (
                            <button
                                onClick={() => setEditMode(true)}
                                className="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Edit2 className="w-4 h-4" /> Edit Section
                            </button>
                        )}
                        {editMode && (
                            <>
                                <button
                                    onClick={() => setEditMode(false)}
                                    className="px-5 py-2.5 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleSaveSection(activeSection)}
                                    disabled={sectionLoading[activeSection]}
                                    className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 hover:from-teal-700 hover:to-teal-600 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {sectionLoading[activeSection] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {sectionLoading[activeSection] ? "Saving..." : "Save Changes"}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Content Render */}
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">

                    {/* Section A */}
                    {activeSection === "section-a" && (
                        <CaseSheetSectionA
                            formData={formData.sectionA || {}}
                            onChange={(field, value) => updateFormData("sectionA", field, value)}
                            readOnly={!editMode}
                        />
                    )}

                    {activeSection === "tooth-chart" && (
                        <ToothChart
                            patientId={patientId}
                            procedures={procedures}
                            onAddTreatment={(toothNum) => {
                                setAutoFillTooth(toothNum);
                                setActiveSection("procedures");
                            }}
                        />
                    )}

                    {/* Text Area Sections (Personal/Medical/Dental/Diagnosis/Notes) - Shared Style */}
                    {["personal-history", "medical-history", "dental-examination", "diagnosis", "notes"].includes(activeSection) && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
                            {/* Specific Fields mapping based on section */}
                            {activeSection === "personal-history" && (
                                <div className="space-y-5">
                                    <TextAreaField label="Chief Complaint" value={formData.personalHistory?.chiefComplaint} onChange={v => updateFormData("personalHistory", "chiefComplaint", v)} disabled={!editMode} rows={4} placeholder="Patient's primary reason for visit..." />
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <TextAreaField label="History of Present Illness" value={formData.personalHistory?.historyOfPresentIllness} onChange={v => updateFormData("personalHistory", "historyOfPresentIllness", v)} disabled={!editMode} rows={3} />
                                        <TextAreaField label="Past Dental History" value={formData.personalHistory?.pastDentalHistory} onChange={v => updateFormData("personalHistory", "pastDentalHistory", v)} disabled={!editMode} rows={3} />
                                    </div>
                                    <TextAreaField label="Habits" value={formData.personalHistory?.habits} onChange={v => updateFormData("personalHistory", "habits", v)} disabled={!editMode} rows={2} placeholder="Smoking, Tobacco etc." />
                                </div>
                            )}

                            {activeSection === "medical-history" && (
                                <div className="space-y-6">
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <h4 className="text-sm font-bold text-gray-700 mb-3">Systemic Conditions</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                            {["diabetes", "hypertension", "asthma", "cardiac", "epilepsy", "thyroid", "allergies"].map(cond => (
                                                <label key={cond} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formData.medicalHistory?.[cond] ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.medicalHistory?.[cond] || false}
                                                        onChange={e => updateFormData("medicalHistory", cond, e.target.checked)}
                                                        disabled={!editMode}
                                                        className="w-4 h-4 text-red-500 rounded border-gray-300 focus:ring-red-500"
                                                    />
                                                    <span className={`text-sm font-medium capitalize ${formData.medicalHistory?.[cond] ? 'text-red-700' : 'text-gray-600'}`}>{cond}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <TextAreaField label="Current Medications" value={formData.medicalHistory?.medications} onChange={v => updateFormData("medicalHistory", "medications", v)} disabled={!editMode} rows={3} />
                                </div>
                            )}

                            {activeSection === "dental-examination" && (
                                <div className="space-y-5">
                                    <TextAreaField label="Extra Oral Findings" value={formData.dentalExamination?.extraOral} onChange={v => updateFormData("dentalExamination", "extraOral", v)} disabled={!editMode} rows={3} />
                                    <TextAreaField label="Intra Oral Findings" value={formData.dentalExamination?.intraOral} onChange={v => updateFormData("dentalExamination", "intraOral", v)} disabled={!editMode} rows={4} />
                                    <TextAreaField label="Hard Tissue Examination" value={formData.dentalExamination?.hardTissue} onChange={v => updateFormData("dentalExamination", "hardTissue", v)} disabled={!editMode} rows={3} />
                                </div>
                            )}

                            {activeSection === "diagnosis" && (
                                <TextAreaField label="Provisional & Final Diagnosis" value={formData.diagnosis} onChange={v => setFormData(p => ({ ...p, diagnosis: v }))} disabled={!editMode} rows={8} placeholder="Enter detailed diagnosis..." />
                            )}

                            {activeSection === "notes" && (
                                <TextAreaField label="Clinical Notes & Follow-up" value={formData.notes} onChange={v => setFormData(p => ({ ...p, notes: v }))} disabled={!editMode} rows={8} placeholder="Add progress notes..." />
                            )}
                        </div>
                    )}

                    {/* Treatment Plan - Todo List Style */}
                    {activeSection === "treatment-plan" && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-blue-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Treatment Planning</h3>
                            <p className="text-gray-500 max-w-md mx-auto mt-2">
                                Treatment plans are automatically generated from the Procedures tab when you mark items as 'Planned'.
                            </p>
                            <button
                                onClick={() => setActiveSection("procedures")}
                                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                            >
                                Go to Procedures
                            </button>
                        </div>
                    )}

                    {/* Procedures */}
                    {activeSection === "procedures" && currentCaseSheet && (
                        <ProcedureSection
                            caseSheetId={currentCaseSheet._id}
                            patientId={currentCaseSheet.patientId?._id || currentCaseSheet.patientId}
                            autoFillTooth={autoFillTooth}
                            onClearAutoFill={() => setAutoFillTooth(null)}
                        />
                    )}

                </div>
            </div>
        </div>
    );
};

// Helper Component for consistent text areas
const TextAreaField = ({ label, value, onChange, disabled, rows = 3, placeholder }) => (
    <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{label}</label>
        <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            rows={rows}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white outline-none transition-all resize-none disabled:opacity-60 disabled:bg-gray-50"
            placeholder={placeholder}
        />
    </div>
);

// Helper Icon
const PlusIcon = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

export default CaseSheetTab;
