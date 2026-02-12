import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAppointments,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    deleteAppointment,
    clearAppointmentMessages
} from "../redux/appointmentSlice";
import { fetchUsers } from "../redux/userSlice";
import { usePermissions } from "../hooks/usePermission";
import AppointmentList from "../components/appointments/AppointmentList";
import AppointmentModal from "../components/appointments/AppointmentModal";
import { Plus, Calendar, Clock, CheckCircle2, User, ChevronLeft, ChevronRight, XCircle } from "lucide-react";

const AppointmentsDashboard = () => {
    const dispatch = useDispatch();
    const { can } = usePermissions();

    // State
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
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
        dispatch(fetchUsers({ page: 1, limit: 100 }));
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
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to PERMANENTLY delete this cancelled appointment?")) {
            await dispatch(deleteAppointment(id));
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

    const handleDateChange = (days) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    return (
        <div className="space-y-6 min-h-screen flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-sky-950 tracking-tight">Appointments</h1>
                    <p className="text-sky-700/70 mt-1 text-base sm:text-lg font-medium">Coordinate clinic schedules and patient visits</p>
                </div>

                {can("APPOINTMENT", "CREATE") && (
                    <button
                        onClick={openCreateModal}
                        className="w-full sm:w-auto px-8 py-4 bg-sky-600 text-white rounded-2xl shadow-xl shadow-sky-600/30 hover:shadow-2xl hover:bg-sky-700 transition-all font-black flex items-center justify-center gap-3 group active:scale-95"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        <span>Schedule Appointment</span>
                    </button>
                )}
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-[2rem] shadow-xl shadow-sky-900/5 border border-sky-100 flex flex-col lg:flex-row gap-6 items-center justify-between">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    {/* Date Navigation */}
                    <div className="flex items-center gap-4 bg-sky-50 p-2 rounded-2xl border border-sky-100 w-full sm:w-auto justify-between">
                        <button
                            onClick={() => handleDateChange(-1)}
                            className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all text-sky-600"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="relative flex-1 sm:flex-none">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full sm:w-auto pl-10 pr-4 py-2 bg-transparent border-none text-sm font-black text-sky-950 focus:ring-0 cursor-pointer text-center"
                            />
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-500 pointer-events-none" />
                        </div>
                        <button
                            onClick={() => handleDateChange(1)}
                            className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all text-sky-600"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Doctor Filter */}
                    <div className="w-full sm:w-64">
                        {user?.role === "DOCTOR" ? (
                            <div className="px-6 py-3.5 border border-sky-100 rounded-2xl text-sm bg-sky-50 text-sky-700 flex items-center gap-3 font-bold shadow-inner">
                                <User className="w-5 h-5 text-sky-400" /> View My Schedule
                            </div>
                        ) : (
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-400" />
                                <select
                                    value={selectedDoctor}
                                    onChange={(e) => setSelectedDoctor(e.target.value)}
                                    className="w-full pl-12 pr-10 py-3.5 border border-sky-100 rounded-2xl text-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all appearance-none bg-sky-50 font-bold text-sky-950"
                                >
                                    <option value="">All Practitioners</option>
                                    {users?.map(u => (
                                        <option key={u._id} value={u._id}>{u.fullName}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Legend */}
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[10px] sm:text-xs font-black text-sky-800 bg-sky-50/50 px-6 py-4 rounded-2xl border border-sky-100 w-full lg:w-auto uppercase tracking-tighter">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 shadow-md"></span> Booked</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500 shadow-md"></span> Checked In</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-500 shadow-md"></span> Treating</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 shadow-md"></span> Done</div>
                </div>
            </div>

            {/* Messages */}
            {successMessage && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in shadow-sm">
                    <CheckCircle2 className="w-5 h-5" /> {successMessage}
                </div>
            )}
            {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in shadow-sm">
                    <XCircle className="w-5 h-5" /> {error}
                </div>
            )}

            {/* Calendar Container */}
            <div className="flex-1 bg-white rounded-[2.5rem] shadow-xl shadow-sky-900/5 border border-sky-100 overflow-hidden relative flex flex-col">
                {loading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-100 border-t-sky-600"></div>
                        <p className="text-sky-500 font-medium animate-pulse">Loading schedule...</p>
                    </div>
                )}

                <div className="flex-1 overflow-auto">
                    <AppointmentList
                        appointments={appointments}
                        onEdit={openEditModal}
                        onCancel={handleCancel}
                        onDeletePerm={handleDelete}
                    />
                </div>
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
