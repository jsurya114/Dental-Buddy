import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchPatientById, deactivatePatient } from "../redux/patientSlice";
import { usePermissions } from "../hooks/usePermission";
import CaseSheetTab from "../components/caseSheet/CaseSheetTab";
import BillingTab from "../components/billing/BillingTab";
import PrescriptionTab from "../components/prescriptions/PrescriptionTab";
import {
    User,
    ClipboardList,
    Pill,
    Receipt,
    Microscope,
    Edit,
    Trash2,
    ArrowLeft,
    Phone,
    Mail,
    MapPin,
    Briefcase,
    Calendar,
    AlertCircle,
    UserX
} from "lucide-react";

const PatientProfile = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentPatient, loading, error } = useSelector((state) => state.patients);
    const { can } = usePermissions();
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        if (id) {
            dispatch(fetchPatientById(id));
        }
    }, [dispatch, id]);

    const handleDeactivate = async () => {
        if (window.confirm(`Are you sure you want to ${currentPatient.active !== false ? 'deactivate' : 'reactivate'} this patient?`)) {
            await dispatch(deactivatePatient(id));
            navigate("/app/patients");
        }
    };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full"></div></div>;
    if (error) return <div className="text-center py-20 text-red-500 font-medium">{error}</div>;
    if (!currentPatient) return <div className="text-center py-20 text-sky-500 font-medium">Patient not found</div>;

    const tabs = [
        { id: "overview", label: "Overview", icon: User },
        { id: "cases", label: "Case Sheets", icon: ClipboardList },
        { id: "prescriptions", label: "Prescriptions", icon: Pill },
        { id: "billing", label: "Billing", icon: Receipt },
        // { id: "imaging", label: "Imaging", icon: Microscope } // Imaging is usually a separate page or tab
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Navigation */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate("/app/patients")}
                    className="flex items-center gap-2 text-sky-500 hover:text-sky-700 transition-colors font-medium group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Patients
                </button>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl shadow-sky-900/5 border border-sky-100 relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-sky-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row gap-8 relative z-10">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 p-1 shadow-lg shadow-sky-200">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-4xl md:text-5xl border-4 border-white">
                                {currentPatient.gender === "Female" ? "👩" : "👨"}
                            </div>
                        </div>
                    </div>

                    {/* Info and Actions */}
                    <div className="flex-1 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            {/* Detailed Info */}
                            <div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl md:text-3xl font-bold text-sky-950">{currentPatient.fullName}</h1>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${currentPatient.active !== false ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                                        }`}>
                                        {currentPatient.active !== false ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-sky-600/80 font-bold mt-1 text-sm tracking-tight">Patient ID: <span className="text-sky-900 font-black">{currentPatient.patientId}</span></p>
                            </div>

                            {/* Action Buttons - Fully Responsive */}
                            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                {can("PATIENT", "EDIT") && (
                                    <Link
                                        to={`/app/patients/${id}/edit`}
                                        className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 text-sky-700 bg-white border border-sky-200 rounded-xl hover:bg-sky-50 transition-all font-bold text-xs shadow-sm"
                                    >
                                        <Edit className="w-3.5 h-3.5" />
                                        Edit
                                    </Link>
                                )}
                                {can("IMAGING", "VIEW") && (
                                    <Link
                                        to={`/app/imaging/${id}`}
                                        className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-all font-bold text-xs shadow-sm"
                                    >
                                        <Microscope className="w-3.5 h-3.5" />
                                        Imaging
                                    </Link>
                                )}
                                {can("PATIENT", "DELETE") && (
                                    <button
                                        onClick={handleDeactivate}
                                        className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 text-rose-700 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-all font-bold text-xs shadow-sm"
                                    >
                                        <UserX className="w-3.5 h-3.5" />
                                        {currentPatient.active !== false ? "Block" : "Unblock"}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm text-sky-800">
                            <div className="flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-400 shadow-sm border border-sky-100">
                                    <User className="w-5 h-5" />
                                </span>
                                <div>
                                    <p className="text-xs text-sky-400 font-bold uppercase tracking-wider">Demographics</p>
                                    <p className="font-bold text-sky-900">{currentPatient.age} yrs, {currentPatient.gender}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100">
                                    <Phone className="w-5 h-5" />
                                </span>
                                <div>
                                    <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">Phone</p>
                                    <p className="font-bold text-sky-900">{currentPatient.phone}</p>
                                </div>
                            </div>

                            {currentPatient.email && (
                                <div className="flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500 shadow-sm border border-violet-100">
                                        <Mail className="w-5 h-5" />
                                    </span>
                                    <div>
                                        <p className="text-xs text-violet-400 font-bold uppercase tracking-wider">Email</p>
                                        <p className="font-bold text-sky-900">{currentPatient.email}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs - Horizontal Scroll on Mobile */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-2 custom-scrollbar no-scrollbar-on-mobile whitespace-nowrap">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${isActive
                                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20"
                                : "bg-white text-sky-600/70 hover:bg-sky-50 hover:text-sky-700 border border-sky-100"
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-sky-100' : 'text-sky-400'}`} />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-sky-900/5 border border-sky-100 min-h-[500px] animate-fade-in relative overflow-hidden">
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Personal Details */}
                        <div>
                            <h3 className="text-lg font-bold text-sky-950 mb-6 flex items-center gap-2 border-b border-sky-100 pb-4">
                                <span className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center shadow-sm">
                                    <User className="w-5 h-5" />
                                </span>
                                Detailed Information
                            </h3>
                            <dl className="grid grid-cols-1 gap-y-6">
                                <div className="flex flex-col group">
                                    <dt className="text-xs uppercase text-sky-400 font-bold mb-1.5 flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" /> Date of Birth
                                    </dt>
                                    <dd className="text-sky-900 font-bold text-lg pl-5 border-l-2 border-sky-100 group-hover:border-sky-300 transition-colors">
                                        {currentPatient.dob ? new Date(currentPatient.dob).toLocaleDateString(undefined, { dateStyle: 'long' }) : "N/A"}
                                    </dd>
                                </div>
                                <div className="flex flex-col group">
                                    <dt className="text-xs uppercase text-sky-400 font-bold mb-1.5 flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4" /> Address
                                    </dt>
                                    <dd className="text-sky-900 font-medium text-base bg-sky-50/50 p-4 rounded-xl border border-sky-100 group-hover:border-sky-200 transition-colors">
                                        {currentPatient.address || "No address provided"}
                                    </dd>
                                </div>
                                <div className="flex flex-col group">
                                    <dt className="text-xs uppercase text-sky-400 font-bold mb-1.5 flex items-center gap-1.5">
                                        <Briefcase className="w-4 h-4" /> Occupation
                                    </dt>
                                    <dd className="text-sky-900 font-bold text-lg pl-5 border-l-2 border-sky-100 group-hover:border-sky-300 transition-colors">
                                        {currentPatient.occupation || "N/A"}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Emergency Contact */}
                        <div>
                            <h3 className="text-lg font-bold text-sky-950 mb-6 flex items-center gap-2 border-b border-sky-100 pb-4">
                                <span className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center shadow-sm border border-rose-100">
                                    <AlertCircle className="w-5 h-5" />
                                </span>
                                Emergency Contact
                            </h3>
                            {currentPatient.emergencyContact?.name ? (
                                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-6 relative overflow-hidden group hover:border-rose-200 transition-colors">
                                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-100 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
                                    <dl className="grid grid-cols-1 gap-y-5 relative z-10">
                                        <div>
                                            <dt className="text-xs uppercase text-rose-400 font-bold mb-1">Name</dt>
                                            <dd className="text-gray-900 font-bold text-xl">{currentPatient.emergencyContact.name}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs uppercase text-rose-400 font-bold mb-1">Phone</dt>
                                            <dd className="text-gray-900 font-bold text-xl flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                                                    <Phone className="w-4 h-4" />
                                                </div>
                                                {currentPatient.emergencyContact.phone}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-sky-50/30 rounded-2xl border-2 border-dashed border-sky-100">
                                    <p className="text-sky-400 font-medium">No emergency contact details available.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === "cases" && <CaseSheetTab patientId={currentPatient._id} />}
                {activeTab === "prescriptions" && <PrescriptionTab patientId={currentPatient._id} onSwitchTab={setActiveTab} />}
                {activeTab === "billing" && <BillingTab patientId={currentPatient._id} />}
            </div>
        </div>
    );
};

export default PatientProfile;
