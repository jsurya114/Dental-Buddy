import { useState } from "react";
import { usePermissions } from "../../hooks/usePermission";
import { ChevronRight, ChevronLeft, Clock, Calendar as CalendarIcon } from "lucide-react";

const getEventStyle = (startTime, durationMinutes) => {
    const startHour = startTime.getHours();
    const startMin = startTime.getMinutes();
    const totalMinutesFromStart = (startHour * 60) + startMin;
    const dayStartMinutes = 8 * 60; // 8:00 AM

    const top = ((totalMinutesFromStart - dayStartMinutes) / 60) * 100; // 100px per hour
    const height = (durationMinutes / 60) * 100;

    return {
        top: `${top}px`,
        height: `${height}px`
    };
};

const STATUS_COLORS = {
    BOOKED: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
    CHECKED_IN: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100",
    IN_TREATMENT: "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100",
    COMPLETED: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
    CANCELLED: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100",
    NO_SHOW: "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200"
};

const CalendarView = ({ appointments, onSelectAppointment, onViewChange, currentView }) => {
    const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

    return (
        <div className="flex flex-col h-[700px] overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-teal-600" />
                    <span className="font-bold text-gray-800">Daily Schedule</span>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => onViewChange("day")}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${currentView === 'day'
                                ? 'bg-white text-teal-700 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Day
                    </button>
                    <button
                        className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
                        title="Weekly view coming soon"
                    >
                        Week
                    </button>
                    <button
                        className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
                        title="Monthly view coming soon"
                    >
                        Month
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto relative custom-scrollbar bg-white">
                {/* Time Grid */}
                {hours.map(hour => (
                    <div key={hour} className="flex border-b border-gray-50 h-[100px] group">
                        <div className="w-20 flex-shrink-0 text-right pr-4 pt-2 text-xs font-semibold text-gray-400 border-r border-gray-50 group-hover:bg-gray-50/50 transition-colors sticky left-0 bg-white z-10 select-none">
                            {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                        </div>
                        <div className="flex-1 relative bg-[linear-gradient(to_right,#f9fafb_1px,transparent_1px),linear-gradient(to_bottom,#f9fafb_1px,transparent_1px)] bg-[size:100%_25px]">
                            {/* Hourly divider line is the border-b of current div */}
                        </div>
                    </div>
                ))}

                {/* Events Container */}
                <div className="absolute top-0 left-20 right-0 h-full pointer-events-none">
                    {/* Current Time Indicator (Static for now, could be dynamic) */}
                    {/* <div className="absolute top-[300px] left-0 right-0 border-t-2 border-red-400 z-20 opacity-50"></div> */}

                    {appointments.map(apt => {
                        const date = new Date(apt.appointmentDate);
                        const hour = date.getHours();
                        if (hour < 8 || hour > 20) return null;

                        const style = getEventStyle(date, apt.durationMinutes);

                        return (
                            <div
                                key={apt._id}
                                style={style}
                                onClick={() => onSelectAppointment(apt)}
                                className={`absolute left-2 right-4 rounded-xl border-l-4 p-2.5 shadow-sm cursor-pointer transition-all duration-200 pointer-events-auto flex flex-col justify-between group overflow-hidden ${STATUS_COLORS[apt.status] || "bg-gray-100 border-gray-300"}`}
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <div className="font-bold text-sm truncate text-gray-900 leading-tight">
                                        {apt.patientId?.fullName || "Unknown Patient"}
                                    </div>
                                    <div className="text-[10px] font-mono font-medium opacity-70 bg-white/40 px-1.5 py-0.5 rounded">
                                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                <div className="text-xs truncate opacity-80 mt-1 flex items-center gap-1">
                                    <span className="font-medium">{apt.reason || "No reason"}</span>
                                    {apt.doctorId && (
                                        <span className="opacity-60">• Dr. {apt.doctorId.fullName.split(' ').pop()}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
