import { usePermissions } from "../../hooks/usePermission";
import { Clock, User, Calendar, AlertCircle, Edit2, Trash2, CheckCircle2 } from "lucide-react";

const AppointmentList = ({ appointments, onEdit, onCancel, onDeletePerm }) => {
    const { can } = usePermissions();

    const getStatusBadge = (status) => {
        const styles = {
            BOOKED: "bg-blue-50 text-blue-700 border-blue-100",
            CHECKED_IN: "bg-yellow-50 text-yellow-700 border-yellow-100",
            IN_TREATMENT: "bg-purple-50 text-purple-700 border-purple-100",
            COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
            CANCELLED: "bg-red-50 text-red-700 border-red-100",
            NO_SHOW: "bg-gray-100 text-gray-600 border-gray-200"
        };

        const labels = {
            BOOKED: "Booked",
            CHECKED_IN: "Checked In",
            IN_TREATMENT: "In Treatment",
            COMPLETED: "Completed",
            CANCELLED: "Cancelled",
            NO_SHOW: "No Show"
        };

        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || "bg-gray-100 text-gray-800"}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (!appointments || appointments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No appointments found</h3>
                <p className="text-gray-500 text-sm mt-1">There are no appointments scheduled for this time period.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2rem] shadow-xl shadow-sky-900/5 border border-sky-100 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                        <tr className="bg-sky-50/80 border-b border-sky-100">
                            <th className="px-6 py-5 text-xs font-bold text-sky-600 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-5 text-xs font-bold text-sky-600 uppercase tracking-wider">Patient</th>
                            <th className="px-6 py-5 text-xs font-bold text-sky-600 uppercase tracking-wider">Doctor</th>
                            <th className="px-6 py-5 text-xs font-bold text-sky-600 uppercase tracking-wider">Reason</th>
                            <th className="px-6 py-5 text-xs font-bold text-sky-600 uppercase tracking-wider text-center">Status</th>
                            <th className="px-6 py-5 text-right text-xs font-bold text-sky-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {appointments.map((apt) => (
                            <tr key={apt._id} className="group hover:bg-teal-50/30 transition-colors duration-200">
                                {/* Time */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                                            <Clock className="w-3.5 h-3.5 text-teal-500" />
                                            {new Date(apt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <span className="text-xs text-gray-400 pl-5">{apt.durationMinutes} min</span>
                                    </div>
                                </td>

                                {/* Patient */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                            {apt.patientId?.fullName?.charAt(0) || "U"}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{apt.patientId?.fullName || "Unknown"}</div>
                                            <div className="text-xs text-gray-500">{apt.patientId?.phone || "-"}</div>
                                        </div>
                                    </div>
                                </td>

                                {/* Doctor */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs border border-indigo-100">
                                            {apt.doctorId?.fullName?.charAt(0) || "D"}
                                        </div>
                                        <span className="text-sm text-gray-700">{apt.doctorId?.fullName || "Unassigned"}</span>
                                    </div>
                                </td>

                                {/* Reason */}
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-600 max-w-[150px] truncate" title={apt.reason}>
                                        {apt.reason || <span className="text-gray-400 italic">No reason specified</span>}
                                    </div>
                                </td>

                                {/* Status */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(apt.status)}
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <div className="flex justify-end gap-2">
                                        {can("APPOINTMENT", "EDIT") && apt.status !== "CANCELLED" && (
                                            <button
                                                onClick={() => onEdit(apt)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-600 border border-teal-100 rounded-xl font-bold text-xs hover:bg-teal-100 transition-all"
                                                title="Edit Appointment"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                                <span>Edit</span>
                                            </button>
                                        )}
                                        {can("APPOINTMENT", "DELETE") && ["BOOKED", "CHECKED_IN"].includes(apt.status) && (
                                            <button
                                                onClick={() => onCancel(apt._id)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl font-bold text-xs hover:bg-amber-100 transition-all"
                                                title="Cancel Appointment"
                                            >
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                <span>Cancel</span>
                                            </button>
                                        )}
                                        {can("APPOINTMENT", "DELETE") && apt.status === "CANCELLED" && (
                                            <button
                                                onClick={() => onDeletePerm(apt._id)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-bold text-xs hover:bg-rose-100 transition-all"
                                                title="Permanently Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>Delete</span>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AppointmentList;
