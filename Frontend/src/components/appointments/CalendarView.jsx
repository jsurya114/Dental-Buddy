import { useState } from "react";
import { usePermissions } from "../../hooks/usePermission";

/**
 * Helper to calculate position and height for events
 */
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
    BOOKED: "bg-blue-100 border-blue-300 text-blue-700",
    CHECKED_IN: "bg-yellow-100 border-yellow-300 text-yellow-700",
    IN_TREATMENT: "bg-purple-100 border-purple-300 text-purple-700",
    COMPLETED: "bg-green-100 border-green-300 text-green-700",
    CANCELLED: "bg-red-100 border-red-300 text-red-700",
    NO_SHOW: "bg-gray-100 border-gray-300 text-gray-700"
};

const CalendarView = ({ appointments, onSelectAppointment, onViewChange, currentView }) => {
    const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

    return (
        <div className="flex flex-col h-[600px] overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="font-bold text-gray-700">Schedule</div>
                <div className="flex gap-2 text-sm">
                    <button
                        onClick={() => onViewChange("day")}
                        className={`px-3 py-1 rounded-lg ${currentView === 'day' ? 'bg-white shadow text-teal-600 font-medium' : 'text-gray-500'}`}
                    >
                        Day
                    </button>
                    {/* Week view placeholder */}
                    <button className="px-3 py-1 rounded-lg text-gray-400 cursor-not-allowed">Week</button>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto relative custom-scrollbar">
                {hours.map(hour => (
                    <div key={hour} className="flex border-b border-gray-100 h-[100px]">
                        {/* Time Column */}
                        <div className="w-16 flex-shrink-0 text-right pr-3 pt-2 text-xs text-gray-500 font-medium border-r border-gray-100 bg-gray-50 sticky left-0 z-10">
                            {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                        </div>
                        {/* Event Area */}
                        <div className="flex-1 relative bg-white bg-[linear-gradient(to_right,#f9fafb_1px,transparent_1px),linear-gradient(to_bottom,#f9fafb_1px,transparent_1px)] bg-[size:100%_25px]">
                            {/* Render appointments for this hour block if needed */}
                        </div>
                    </div>
                ))}

                {/* Render Appointments Absolute */}
                <div className="absolute top-0 left-16 right-0 h-full pointer-events-none">
                    {appointments.map(apt => {
                        const date = new Date(apt.appointmentDate);
                        const hour = date.getHours();
                        if (hour < 8 || hour > 20) return null; // Only show 8-8

                        const style = getEventStyle(date, apt.durationMinutes);

                        return (
                            <div
                                key={apt._id}
                                style={style}
                                onClick={() => onSelectAppointment(apt)}
                                className={`absolute left-2 right-2 rounded-lg p-2 border-l-4 text-xs shadow-sm cursor-pointer hover:shadow-md transition-all pointer-events-auto flex flex-col justify-between ${STATUS_COLORS[apt.status] || "bg-gray-100"}`}
                            >
                                <div className="font-bold truncate">{apt.patientId?.fullName || "Unknown Patient"}</div>
                                <div className="truncate opacity-75">{apt.reason || "No reason"}</div>
                                <div className="absolute top-2 right-2 bg-white/50 px-1 rounded text-[10px] font-mono">
                                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
