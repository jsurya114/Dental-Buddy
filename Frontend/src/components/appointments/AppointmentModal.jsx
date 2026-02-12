import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPatients } from "../../redux/patientSlice";
import { fetchUsers, fetchProfessionalUsers } from "../../redux/userSlice";
import { X, Calendar, Clock, User, Stethoscope, FileText, Search, Check } from "lucide-react";

const AppointmentModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
    const dispatch = useDispatch();
    const { patients } = useSelector(state => state.patients);
    const { professionalUsers } = useSelector(state => state.users);

    const doctors = professionalUsers || [];

    const [formData, setFormData] = useState({
        patientId: "",
        doctorId: "",
        appointmentDate: "",
        time: "",
        durationMinutes: 30,
        reason: ""
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (isOpen) {
            dispatch(fetchPatients({ page: 1, limit: 100 }));
            dispatch(fetchProfessionalUsers());
        }
    }, [isOpen, dispatch]);

    useEffect(() => {
        if (initialData) {
            const date = new Date(initialData.appointmentDate);
            setFormData({
                patientId: initialData.patientId?._id || "",
                doctorId: initialData.doctorId?._id || "",
                appointmentDate: date.toISOString().split('T')[0],
                time: date.toTimeString().slice(0, 5),
                durationMinutes: initialData.durationMinutes,
                reason: initialData.reason || ""
            });
            setSearchTerm(initialData.patientId?.fullName || "");
        } else {
            setFormData({
                patientId: "",
                doctorId: "",
                appointmentDate: new Date().toLocaleDateString('en-CA'),
                time: "09:00",
                durationMinutes: 30,
                reason: ""
            });
            setSearchTerm("");
        }
    }, [initialData, isOpen]);

    useEffect(() => {
        if (searchTerm && !initialData) {
            const filtered = patients.filter(p =>
                p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.phone.includes(searchTerm)
            );
            setFilteredPatients(filtered);
            setShowResults(true);
        } else {
            setFilteredPatients([]);
            setShowResults(false);
        }
    }, [searchTerm, patients, initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePatientSelect = (patient) => {
        setFormData({ ...formData, patientId: patient._id });
        setSearchTerm(patient.fullName);
        setShowResults(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const combinedDate = new Date(`${formData.appointmentDate}T${formData.time}`);
        const payload = {
            ...formData,
            appointmentDate: combinedDate
        };
        delete payload.time;
        onSubmit(payload);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {initialData ? "Edit Appointment" : "New Appointment"}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {initialData ? "Update visit details" : "Schedule a new patient visit"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Patient Search */}
                        <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                <User className="w-4 h-4 text-teal-600" /> Patient
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setFormData(prev => ({ ...prev, patientId: "" })); // Reset ID on change
                                    }}
                                    placeholder="Search patient by name or phone..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                                    required
                                    disabled={!!initialData}
                                />
                                {formData.patientId && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <div className="bg-teal-100 text-teal-700 p-0.5 rounded-full">
                                            <Check className="w-3 h-3" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Dropdown results */}
                            {showResults && filteredPatients.length > 0 && (
                                <div className="absolute z-20 w-full bg-white border border-gray-200 mt-2 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                    {filteredPatients.map(p => (
                                        <button
                                            key={p._id}
                                            type="button"
                                            onClick={() => handlePatientSelect(p)}
                                            className="w-full text-left px-4 py-3 hover:bg-teal-50 border-b border-gray-50 last:border-0 transition-colors flex items-center justify-between group"
                                        >
                                            <div>
                                                <div className="font-semibold text-gray-800 group-hover:text-teal-700">{p.fullName}</div>
                                                <div className="text-xs text-gray-500">{p.phone} • {p.gender}</div>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 text-teal-600 text-xs font-medium bg-white px-2 py-1 rounded-md shadow-sm border border-teal-100">
                                                Select
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Doctor Select */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                <Stethoscope className="w-4 h-4 text-teal-600" /> Doctor
                            </label>
                            <div className="relative">
                                <select
                                    name="doctorId"
                                    value={formData.doctorId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all appearance-none"
                                    required
                                >
                                    <option value="">Select a doctor...</option>
                                    {doctors.map(doc => (
                                        <option key={doc._id} value={doc._id}>
                                            {doc.fullName} ({doc.role})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Date & Time Row - Responsive */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-teal-600" /> Date
                                </label>
                                <input
                                    type="date"
                                    name="appointmentDate"
                                    value={formData.appointmentDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-teal-600" /> Time
                                </label>
                                <input
                                    type="time"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-teal-600" /> Duration
                            </label>
                            <div className="relative">
                                <select
                                    name="durationMinutes"
                                    value={formData.durationMinutes}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all appearance-none"
                                >
                                    <option value="15">15 Minutes (Checkup)</option>
                                    <option value="30">30 Minutes (Standard)</option>
                                    <option value="45">45 Minutes (Extended)</option>
                                    <option value="60">1 Hour (Procedure)</option>
                                    <option value="90">1.5 Hours (Complex)</option>
                                    <option value="120">2 Hours (Surgery)</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-teal-600" /> Notes / Reason
                            </label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none placeholder:text-gray-400"
                                placeholder="E.g., Yearly checkup, complaint of toothache, etc."
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:from-teal-600 hover:to-cyan-700 hover:shadow-teal-500/30 transition-all active:scale-[0.98]"
                            >
                                {initialData ? "Save Changes" : "Book Appointment"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AppointmentModal;
