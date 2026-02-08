import { usePermissions } from "../../hooks/usePermission";

const AppointmentList = ({ appointments, onEdit, onDelete, onStatusChange }) => {
    const { can } = usePermissions();

    const getStatusBadge = (status) => {
        const styles = {
            BOOKED: "bg-blue-100 text-blue-800",
            CHECKED_IN: "bg-yellow-100 text-yellow-800",
            IN_TREATMENT: "bg-purple-100 text-purple-800",
            COMPLETED: "bg-green-100 text-green-800",
            CANCELLED: "bg-red-100 text-red-800",
            NO_SHOW: "bg-gray-100 text-gray-800"
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-800"}`}>
                {status.replace("_", " ")}
            </span>
        );
    };

    if (!appointments || appointments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-4xl mb-2">📅</div>
                <p>No appointments found for this date.</p>
            </div>
        );
    }

    // Check if any appointment is active (not cancelled) to decide whether to show Actions column
    const showActionsColumn = appointments.some(apt => apt.status !== "CANCELLED");

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4">Patient</th>
                            <th className="px-6 py-4">Doctor</th>
                            <th className="px-6 py-4">Reason</th>
                            <th className="px-6 py-4">Status</th>
                            {showActionsColumn && <th className="px-6 py-4 text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {appointments.map((apt) => (
                            <tr key={apt._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {new Date(apt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    <div className="text-xs text-gray-400 font-normal">{apt.durationMinutes} mins</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{apt.patientId?.fullName || "Unknown"}</div>
                                    <div className="text-xs text-gray-500">{apt.patientId?.phone || "-"}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {apt.doctorId?.fullName || "Unknown"}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                    {apt.reason || "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(apt.status)}
                                </td>
                                {showActionsColumn && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            {can("APPOINTMENT", "EDIT") && apt.status !== "CANCELLED" && (
                                                <button
                                                    onClick={() => onEdit(apt)}
                                                    className="text-teal-600 hover:text-teal-900 bg-teal-50 px-3 py-1 rounded-lg transition-colors"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            {can("APPOINTMENT", "DELETE") && ["BOOKED", "CHECKED_IN"].includes(apt.status) && (
                                                <button
                                                    onClick={() => onDelete(apt._id)}
                                                    className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-lg transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AppointmentList;
