import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPatientById, updatePatient } from "../redux/patientSlice";
import { User, Phone, MapPin, Briefcase, HeartPulse, Save, X, ArrowLeft } from "lucide-react";

const PatientEdit = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentPatient, loading, error } = useSelector((state) => state.patients);

    const [formData, setFormData] = useState({
        fullName: "",
        gender: "Male",
        age: "",
        dob: "",
        phone: "",
        email: "",
        address: "",
        occupation: "",
        emergencyContactName: "",
        emergencyContactPhone: ""
    });

    // Fetch patient data on mount
    useEffect(() => {
        if (id) {
            dispatch(fetchPatientById(id));
        }
    }, [dispatch, id]);

    // Populate form data when patient loads
    useEffect(() => {
        if (currentPatient) {
            setFormData({
                fullName: currentPatient.fullName || "",
                gender: currentPatient.gender || "Male",
                age: currentPatient.age || "",
                dob: currentPatient.dob ? currentPatient.dob.split("T")[0] : "",
                phone: currentPatient.phone || "",
                email: currentPatient.email || "",
                address: currentPatient.address || "",
                occupation: currentPatient.occupation || "",
                emergencyContactName: currentPatient.emergencyContact?.name || "",
                emergencyContactPhone: currentPatient.emergencyContact?.phone || ""
            });
        }
    }, [currentPatient]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const patientData = {
            ...formData,
            emergencyContact: {
                name: formData.emergencyContactName,
                phone: formData.emergencyContactPhone
            }
        };

        const result = await dispatch(updatePatient({ id, patientData }));
        if (updatePatient.fulfilled.match(result)) {
            navigate(`/app/patients/${id}`);
        }
    };

    const InputGroup = ({ label, icon: Icon, required, ...props }) => (
        <div>
            <label className="block text-sm font-bold text-sky-900 mb-1.5 flex items-center gap-1.5">
                {Icon && <Icon className="w-3.5 h-3.5 text-sky-400" />}
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                {...props}
                className="w-full px-4 py-2.5 bg-sky-50/50 border-sky-100 border rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm font-medium text-sky-900 placeholder-sky-300"
            />
        </div>
    );

    const SelectGroup = ({ label, icon: Icon, options, ...props }) => (
        <div>
            <label className="block text-sm font-bold text-sky-900 mb-1.5 flex items-center gap-1.5">
                {Icon && <Icon className="w-3.5 h-3.5 text-sky-400" />}
                {label}
            </label>
            <div className="relative">
                <select
                    {...props}
                    className="w-full px-4 py-2.5 bg-sky-50/50 border-sky-100 border rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm appearance-none font-medium text-sky-900"
                >
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
        </div>
    );

    if (loading && !currentPatient) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mb-4"></div>
                <p className="text-sky-500 font-medium">Loading patient details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sky-600 hover:text-sky-900 transition-colors font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>
                <h1 className="text-2xl font-bold text-sky-950 tracking-tight absolute left-1/2 -translate-x-1/2">Edit Patient</h1>
                <div className="w-10"></div> {/* Spacer for alignment */}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 flex items-start gap-3">
                    <span className="text-lg">⚠️</span>
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info Card */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-sky-900/5 border border-sky-100">
                    <h2 className="text-lg font-bold text-sky-950 mb-6 flex items-center gap-2">
                        <span className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-sm">
                            <User className="w-5 h-5" />
                        </span>
                        Personal Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup
                            label="Full Name"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            placeholder="ex. John Doe"
                        />
                        <SelectGroup
                            label="Gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            options={["Male", "Female", "Other"]}
                        />
                        <InputGroup
                            label="Age"
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            placeholder="ex. 32"
                        />
                        <InputGroup
                            label="Date of Birth"
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Contact Info Card */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-sky-900/5 border border-sky-100">
                    <h2 className="text-lg font-bold text-sky-950 mb-6 flex items-center gap-2">
                        <span className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-sm">
                            <Phone className="w-5 h-5" />
                        </span>
                        Contact Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup
                            label="Phone Number"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="+1 (555) 000-0000"
                            icon={Phone}
                        />
                        <InputGroup
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                        />
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-sky-900 mb-1.5 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                                Residential Address
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-2.5 bg-sky-50/50 border-sky-100 border rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm font-medium text-sky-900 placeholder-sky-300 resize-none"
                                placeholder="Enter full address..."
                            />
                        </div>
                        <InputGroup
                            label="Occupation"
                            name="occupation"
                            value={formData.occupation}
                            onChange={handleChange}
                            placeholder="ex. Software Engineer"
                            icon={Briefcase}
                        />
                    </div>
                </div>

                {/* Emergency Contact Card */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-sky-900/5 border border-sky-100">
                    <h2 className="text-lg font-bold text-sky-950 mb-6 flex items-center gap-2">
                        <span className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-sm border border-rose-100">
                            <HeartPulse className="w-5 h-5" />
                        </span>
                        Emergency Contact
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup
                            label="Contact Name"
                            name="emergencyContactName"
                            value={formData.emergencyContactName}
                            onChange={handleChange}
                            placeholder="Relative or friend's name"
                        />
                        <InputGroup
                            label="Contact Phone"
                            type="tel"
                            name="emergencyContactPhone"
                            value={formData.emergencyContactPhone}
                            onChange={handleChange}
                            placeholder="Emergency phone number"
                        />
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate(`/app/patients/${id}`)}
                        className="px-6 py-3 text-sky-700 font-bold hover:bg-sky-50 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-600/20 hover:bg-sky-700 hover:shadow-xl hover:shadow-sky-600/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {loading ? "Saving Changes..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PatientEdit;
