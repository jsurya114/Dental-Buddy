import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchPatientById, deactivatePatient } from "../redux/patientSlice";
import { usePermissions } from "../hooks/usePermission";
import CaseSheetTab from "../components/caseSheet/CaseSheetTab";
import BillingTab from "../components/billing/BillingTab";
import ImagingTab from "../components/imaging/ImagingTab";
import PrescriptionTab from "../components/prescriptions/PrescriptionTab";

const PatientProfile = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentPatient, loading, error } = useSelector((state) => state.patients);
    const user = useSelector((state) => state.auth.user || state.clinicAdmin?.admin);
    const userRole = user?.role || user?.roleCode;
    const { can } = usePermissions();
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        if (id) {
            dispatch(fetchPatientById(id));
        }
    }, [dispatch, id]);

    const handleDeactivate = async () => {
        if (window.confirm("Are you sure you want to deactivate this patient?")) {
            await dispatch(deactivatePatient(id));
            navigate("/app/patients");
        }
    };

    if (loading) return <div className="text-center py-12 text-gray-500">Loading patient...</div>;
    if (error) return <div className="text-center py-12 text-red-500">{error}</div>;
    if (!currentPatient) return <div className="text-center py-12 text-gray-500">Patient not found</div>;



    const tabs = [
        { id: "overview", label: "Overview", icon: "👤" },
        { id: "cases", label: "Case Sheets", icon: "📋" },
        { id: "prescriptions", label: "Prescriptions", icon: "💊" },
        // Only show Billing for Admin and Billing Staff
        { id: "imaging", label: "Imaging", icon: "🔬" }
    ];

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -z-0"></div>

                <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                    <div className="flex items-start gap-6">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-4xl shadow-inner">
                            {currentPatient.gender === "Female" ? "👩" : "👨"}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">{currentPatient.fullName}</h1>
                            <div className="flex items-center gap-3 mt-2 text-gray-500">
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium">
                                    {currentPatient.patientId}
                                </span>
                                <span>{currentPatient.gender}</span>
                                <span>•</span>
                                <span>{currentPatient.age} years</span>
                            </div>
                            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    📞 {currentPatient.phone}
                                </span>
                                {currentPatient.email && (
                                    <span className="flex items-center gap-1">
                                        📧 {currentPatient.email}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {can("PATIENT", "EDIT") && (
                            <Link
                                to={`/app/patients/${id}/edit`}
                                className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600 font-medium"
                            >
                                ✏️ Edit Profile
                            </Link>
                        )}
                        {can("PATIENT", "DELETE") && (
                            <button
                                onClick={handleDeactivate}
                                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
                            >
                                Deactivate
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id
                            ? "bg-white text-teal-600 shadow-sm"
                            : "text-gray-500 hover:bg-white/50"
                            }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 min-h-[400px]">
                {activeTab === "overview" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Personal Details */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center text-sm">👤</span>
                                Personal Details
                            </h3>
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-xs uppercase text-gray-400 font-semibold">Date of Birth</dt>
                                    <dd className="text-gray-700 mt-1 font-medium">
                                        {currentPatient.dob ? new Date(currentPatient.dob).toLocaleDateString() : "N/A"}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs uppercase text-gray-400 font-semibold">Address</dt>
                                    <dd className="text-gray-700 mt-1 font-medium">{currentPatient.address || "N/A"}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs uppercase text-gray-400 font-semibold">Occupation</dt>
                                    <dd className="text-gray-700 mt-1 font-medium">{currentPatient.occupation || "N/A"}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Emergency Contact */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center text-sm">🚑</span>
                                Emergency Contact
                            </h3>
                            {currentPatient.emergencyContact?.name ? (
                                <dl className="space-y-4">
                                    <div>
                                        <dt className="text-xs uppercase text-gray-400 font-semibold">Name</dt>
                                        <dd className="text-gray-700 mt-1 font-medium">{currentPatient.emergencyContact.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs uppercase text-gray-400 font-semibold">Phone</dt>
                                        <dd className="text-gray-700 mt-1 font-medium">{currentPatient.emergencyContact.phone}</dd>
                                    </div>
                                </dl>
                            ) : (
                                <p className="text-gray-400 italic">No emergency contact provided.</p>
                            )}
                        </div>
                    </div>
                ) : activeTab === "cases" ? (
                    <CaseSheetTab patientId={currentPatient._id} />
                ) : activeTab === "billing" ? (
                    <BillingTab patientId={currentPatient._id} />
                ) : activeTab === "imaging" ? (
                    <ImagingTab patientId={currentPatient._id} />
                ) : activeTab === "prescriptions" ? (
                    <PrescriptionTab
                        patientId={currentPatient._id}
                        onSwitchTab={setActiveTab}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 text-3xl">
                            🚧
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Coming Soon</h3>
                        <p className="text-gray-500 max-w-sm mt-2">
                            The {tabs.find(t => t.id === activeTab)?.label} module is currently under development.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientProfile;
