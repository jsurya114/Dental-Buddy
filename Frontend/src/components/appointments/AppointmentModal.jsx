import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPatients } from "../../redux/patientSlice";
import { fetchUsers, fetchProfessionalUsers } from "../../redux/userSlice";

const AppointmentModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
    const dispatch = useDispatch();
    const { patients } = useSelector(state => state.patients);
    const { users, professionalUsers } = useSelector(state => state.users);

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

    useEffect(() => {
        if (isOpen) {
            dispatch(fetchPatients({ page: 1, limit: 100 })); // Fetch all for search (optimize later)
            dispatch(fetchProfessionalUsers());
        }
    }, [isOpen, dispatch]);

    useEffect(() => {
        if (initialData) {
            const date = new Date(initialData.appointmentDate);
            setFormData({
                patientId: initialData.patientId._id,
                doctorId: initialData.doctorId._id,
                appointmentDate: date.toISOString().split('T')[0],
                time: date.toTimeString().slice(0, 5),
                durationMinutes: initialData.durationMinutes,
                reason: initialData.reason || ""
            });
            setSearchTerm(initialData.patientId.fullName);
        } else {
            // Reset form
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
        if (searchTerm) {
            const filtered = patients.filter(p =>
                p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.phone.includes(searchTerm)
            );
            setFilteredPatients(filtered);
        } else {
            setFilteredPatients([]);
        }
    }, [searchTerm, patients]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePatientSelect = (patient) => {
        setFormData({ ...formData, patientId: patient._id });
        setSearchTerm(patient.fullName);
        setFilteredPatients([]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Combine date and time
        const combinedDate = new Date(`${formData.appointmentDate}T${formData.time}`);

        const payload = {
            ...formData,
            appointmentDate: combinedDate
        };
        delete payload.time; // Remove helper field

        onSubmit(payload);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl mx-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    {initialData ? "Edit Appointment" : "New Appointment"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Patient Search */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name or phone"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            required
                            disabled={!!initialData} // Disable patient change on edit for simplicity
                        />
                        {/* Dropdown results */}
                        {searchTerm && filteredPatients.length > 0 && !formData.patientId && !initialData && (
                            <div className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {filteredPatients.map(p => (
                                    <div
                                        key={p._id}
                                        onClick={() => handlePatientSelect(p)}
                                        className="px-4 py-2 hover:bg-teal-50 cursor-pointer border-b border-gray-50 last:border-0"
                                    >
                                        <div className="font-medium text-gray-800">{p.fullName}</div>
                                        <div className="text-xs text-gray-500">{p.phone} • {p.gender}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Doctor Select */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                        <select
                            name="doctorId"
                            value={formData.doctorId}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            required
                        >
                            <option value="">Select Doctor</option>
                            {doctors.map(doc => (
                                <option key={doc._id} value={doc._id}>
                                    {doc.fullName} ({doc.role})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                name="appointmentDate"
                                value={formData.appointmentDate}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Minutes)</label>
                        <select
                            name="durationMinutes"
                            value={formData.durationMinutes}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="15">15 Minutes</option>
                            <option value="30">30 Minutes</option>
                            <option value="45">45 Minutes</option>
                            <option value="60">1 Hour</option>
                            <option value="90">1.5 Hours</option>
                            <option value="120">2 Hours</option>
                        </select>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Notes</label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            placeholder="E.g., Checkup, Cleaning, Pain..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
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
                            {initialData ? "Update Appointment" : "Book Appointment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppointmentModal;
