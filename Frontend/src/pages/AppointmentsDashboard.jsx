import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAppointments,
    createAppointment,
    updateAppointmentStatus,
    updateAppointment,
    cancelAppointment,
    clearAppointmentMessages
} from "../redux/appointmentSlice";
import { fetchUsers } from "../redux/userSlice";
import { usePermissions } from "../hooks/usePermission";
import AppointmentList from "../components/appointments/AppointmentList";
import AppointmentModal from "../components/appointments/AppointmentModal";

const AppointmentsDashboard = () => {
    const dispatch = useDispatch();
    const { can } = usePermissions();

    // State
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA')); // YYYY-MM-DD in local time
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [view, setView] = useState("day"); // 'day' | 'week'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);

    // Redux
    const { list: appointments, loading, error, successMessage } = useSelector(state => state.appointments);
    const { users } = useSelector(state => state.users);
    const { user } = useSelector(state => state.auth);

    // Initial Fetch
    useEffect(() => {
        dispatch(fetchUsers({ page: 1, limit: 100 })); // Fetch doctors
    }, [dispatch]);

    // Fetch appointments when filters change
    useEffect(() => {
        dispatch(fetchAppointments({ date: selectedDate, doctorId: selectedDoctor }));
    }, [dispatch, selectedDate, selectedDoctor]);

    // Cleanup messages
    useEffect(() => {
        if (successMessage || error) {
            const timer = setTimeout(() => {
                dispatch(clearAppointmentMessages());
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, error, dispatch]);

    // Handlers
    const handleCreate = async (data) => {
        const result = await dispatch(createAppointment(data));
        if (createAppointment.fulfilled.match(result)) {
            setIsModalOpen(false);
        }
    };

    const handleUpdate = async (data) => {
        const result = await dispatch(updateAppointment({ id: editingAppointment._id, data }));
        if (updateAppointment.fulfilled.match(result)) {
            setIsModalOpen(false);
            setEditingAppointment(null);
        }
    };



    const handleCancel = async (id) => {
        if (window.confirm("Are you sure you want to cancel this appointment?")) {
            await dispatch(cancelAppointment(id));
            setActionMenuOpen(null);
        }
    };

    const openCreateModal = () => {
        setEditingAppointment(null);
        setIsModalOpen(true);
    };

    const openEditModal = (apt) => {
        setEditingAppointment(apt);
        setIsModalOpen(true);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 h-screen flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
                    <p className="text-gray-500 text-sm">Manage clinic schedule</p>
                </div>

                {can("APPOINTMENT", "CREATE") && (
                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium flex items-center gap-2"
                    >
                        <span>➕</span> New Appointment
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                    />
                </div>

                <div className="min-w-[200px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Doctor</label>
                    {user?.role === "DOCTOR" ? (
                        <div className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500">
                            Myself
                        </div>
                    ) : (
                        <select
                            value={selectedDoctor}
                            onChange={(e) => setSelectedDoctor(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="">All Doctors</option>
                            {users?.map(u => (
                                <option key={u._id} value={u._id}>{u.fullName}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Status Key */}
                <div className="ml-auto flex gap-3 text-xs">
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Booked</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Checked In</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> In Treatment</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Completed</div>
                </div>
            </div>

            {/* Messages */}
            {successMessage && (
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium animate-fade-in">
                    {successMessage}
                </div>
            )}
            {error && (
                <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-medium animate-fade-in">
                    {error}
                </div>
            )}

            {/* Calendar */}
            <div className="flex-1 min-h-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    </div>
                )}

                <AppointmentList
                    appointments={appointments}
                    onEdit={openEditModal}
                    onDelete={handleCancel}
                />


            </div>

            {/* Modal */}
            <AppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={editingAppointment ? handleUpdate : handleCreate}
                initialData={editingAppointment}
            />
        </div>
    );
};

export default AppointmentsDashboard;
