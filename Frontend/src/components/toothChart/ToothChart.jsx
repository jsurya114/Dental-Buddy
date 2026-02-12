import { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";
import ToothUpdateModal from "./ToothUpdateModal";
import { Info, LayoutGrid, Baby, ClipboardList, Loader2, Save } from "lucide-react";

// FDI Tooth Numbers
const ADULT_UPPER_RIGHT = ["18", "17", "16", "15", "14", "13", "12", "11"];
const ADULT_UPPER_LEFT = ["21", "22", "23", "24", "25", "26", "27", "28"];
const ADULT_LOWER_LEFT = ["38", "37", "36", "35", "34", "33", "32", "31"];
const ADULT_LOWER_RIGHT = ["41", "42", "43", "44", "45", "46", "47", "48"];

const CHILD_UPPER_RIGHT = ["55", "54", "53", "52", "51"];
const CHILD_UPPER_LEFT = ["61", "62", "63", "64", "65"];
const CHILD_LOWER_LEFT = ["75", "74", "73", "72", "71"];
const CHILD_LOWER_RIGHT = ["81", "82", "83", "84", "85"];

const STATUS_COLORS = {
    HEALTHY: "bg-white",
    DECAY: "bg-rose-500",
    FILLED: "bg-blue-500",
    RCTS: "bg-purple-500",
    CROWN: "bg-amber-400",
    MISSING: "bg-gray-400",
    IMPLANT: "bg-emerald-500",
    EXTRACTION_PLANNED: "bg-orange-500",
    IN_TREATMENT: "bg-teal-500"
};

const ToothChart = ({ patientId, procedures = [], onAddTreatment }) => {
    const [toothChartData, setToothChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPediatric, setIsPediatric] = useState(false);
    const [selectedTooth, setSelectedTooth] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (patientId) {
            fetchToothChart();
        }
    }, [patientId]);

    const fetchToothChart = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/patients/${patientId}/tooth-chart`);
            setToothChartData(response.data.toothChart || []);
        } catch (error) {
            console.error("Failed to fetch tooth chart:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToothClick = (toothNumber) => {
        setSelectedTooth(toothNumber);
        setIsModalOpen(true);
    };

    const handleSaveStatus = async (toothNumber, data) => {
        try {
            const response = await axiosInstance.patch(`/patients/${patientId}/tooth/${toothNumber}`, data);
            setToothChartData(response.data.toothChart);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to update tooth status:", error);
            alert("Failed to save changes. Please try again.");
        }
    };

    const getToothData = (toothNumber) => {
        return toothChartData.find(t => t.toothNumber === toothNumber);
    };

    const Tooth = ({ number }) => {
        const data = getToothData(number);
        const status = data?.status || "HEALTHY";
        const color = STATUS_COLORS[status];

        return (
            <button
                onClick={() => handleToothClick(number)}
                className="group relative flex flex-col items-center gap-2 p-1 focus:outline-none transition-transform active:scale-95"
            >
                <div className={`w-10 h-12 md:w-12 md:h-14 rounded-xl border-2 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md flex flex-col items-center justify-center overflow-hidden ${status === "HEALTHY" ? "border-sky-100 bg-white" : "border-transparent " + color
                    }`}>
                    {/* Visual representation of tooth can be improved with SVGs later */}
                    <div className={`w-full h-2/3 ${status === "HEALTHY" ? "bg-sky-50/50" : "bg-white/20"} rounded-t-lg`}></div>
                    <span className={`text-[10px] md:text-xs font-black mb-1 ${status === "HEALTHY" ? "text-sky-400" : "text-white"}`}>
                        {number}
                    </span>
                    {status === "MISSING" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-[2px] bg-sky-950/20 rotate-45"></div>
                            <div className="w-full h-[2px] bg-sky-950/20 -rotate-45 absolute"></div>
                        </div>
                    )}
                </div>
            </button>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-sky-100 shadow-sm">
                <Loader2 className="w-10 h-10 text-sky-500 animate-spin mb-4" />
                <p className="text-sky-600 font-bold">Syncing Dental Records...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Toggle */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 p-6 rounded-3xl border border-sky-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-600/20">
                        <LayoutGrid className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-sky-950 tracking-tight">Interactive Tooth Chart</h2>
                        <p className="text-sky-600/70 text-sm font-medium">Click on a tooth to document condition or treatment.</p>
                    </div>
                </div>

                <div className="flex bg-sky-100/50 p-1.5 rounded-2xl border border-sky-200 shadow-inner">
                    <button
                        onClick={() => setIsPediatric(false)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${!isPediatric ? "bg-white text-sky-600 shadow-md" : "text-sky-500 hover:text-sky-700"
                            }`}
                    >
                        Adult (32)
                    </button>
                    <button
                        onClick={() => setIsPediatric(true)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${isPediatric ? "bg-white text-sky-600 shadow-md" : "text-sky-500 hover:text-sky-700"
                            }`}
                    >
                        Pediatric (20)
                    </button>
                </div>
            </div>

            {/* Chart Container - Horizontal Scroll on Mobile */}
            <div className="overflow-x-auto custom-scrollbar">
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-sky-900/5 border border-sky-100 relative overflow-hidden group/chart min-w-[800px]">
                    <div className="absolute inset-0 bg-gradient-to-b from-sky-50/20 to-transparent pointer-events-none"></div>

                    <div className="relative z-10 space-y-16">
                        {/* Upper Arch */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-4">
                                <span className="text-[10px] font-black tracking-[0.2em] text-sky-300 uppercase">Upper Right</span>
                                <div className="h-px flex-1 mx-8 bg-sky-50"></div>
                                <span className="text-[10px] font-black tracking-[0.2em] text-sky-300 uppercase">Upper Left</span>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2 md:gap-4 lg:gap-6">
                                {(!isPediatric ? ADULT_UPPER_RIGHT : CHILD_UPPER_RIGHT).map(num => <Tooth key={num} number={num} />)}
                                <div className="w-px h-16 bg-sky-100 mx-2 md:mx-4"></div>
                                {(!isPediatric ? ADULT_UPPER_LEFT : CHILD_UPPER_LEFT).map(num => <Tooth key={num} number={num} />)}
                            </div>
                        </div>

                        {/* Lower Arch */}
                        <div className="space-y-4">
                            <div className="flex flex-wrap justify-center gap-2 md:gap-4 lg:gap-6">
                                {(!isPediatric ? ADULT_LOWER_RIGHT : CHILD_LOWER_RIGHT).map(num => <Tooth key={num} number={num} />)}
                                <div className="w-px h-16 bg-sky-100 mx-2 md:mx-4"></div>
                                {(!isPediatric ? ADULT_LOWER_LEFT : CHILD_LOWER_LEFT).map(num => <Tooth key={num} number={num} />)}
                            </div>
                            <div className="flex items-center justify-between px-4">
                                <span className="text-[10px] font-black tracking-[0.2em] text-sky-300 uppercase">Lower Right</span>
                                <div className="h-px flex-1 mx-8 bg-sky-50"></div>
                                <span className="text-[10px] font-black tracking-[0.2em] text-sky-300 uppercase">Lower Left</span>
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="mt-16 pt-10 border-t border-sky-50">
                        <div className="flex flex-wrap justify-center gap-y-4 gap-x-8">
                            {Object.entries(STATUS_COLORS).map(([status, color]) => (
                                <div key={status} className="flex items-center gap-3 bg-sky-50/30 px-4 py-2 rounded-xl border border-sky-50">
                                    <div className={`w-3.5 h-3.5 rounded-full border border-white shadow-sm ${color}`}></div>
                                    <span className="text-xs font-bold text-sky-900/70 capitalize">
                                        {status.toLowerCase().replace(/_/g, " ")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Selected Tooth Details & Treatment History */}
            {selectedTooth && (
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-sky-900/5 border border-sky-100 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-10 border-b border-sky-50">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-sky-600 rounded-[1.5rem] flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-sky-600/20">
                                {selectedTooth}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-sky-950">Tooth Details</h3>
                                <p className="text-sky-600/70 font-medium">FDI Notation • {ADULT_UPPER_RIGHT.includes(selectedTooth) || ADULT_UPPER_LEFT.includes(selectedTooth) || CHILD_UPPER_RIGHT.includes(selectedTooth) || CHILD_UPPER_LEFT.includes(selectedTooth) ? "Maxillary" : "Mandibular"} Arch</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-6 py-3 bg-sky-50 text-sky-600 font-bold rounded-xl border border-sky-100 hover:bg-sky-100 transition-all flex items-center gap-2"
                            >
                                <ClipboardList className="w-5 h-5" />
                                Update Status
                            </button>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-10">
                        {/* Status Info */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-black text-sky-900 uppercase tracking-widest flex items-center gap-2">
                                <Info className="w-4 h-4 text-sky-400" />
                                Current Condition
                            </h4>
                            <div className="p-6 bg-sky-50/50 rounded-3xl border border-sky-100 h-full">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-4 h-4 rounded-full shadow-sm ${STATUS_COLORS[getToothData(selectedTooth)?.status || "HEALTHY"]}`}></div>
                                    <span className="text-lg font-bold text-sky-950 capitalize">
                                        {(getToothData(selectedTooth)?.status || "HEALTHY").toLowerCase().replace(/_/g, " ")}
                                    </span>
                                </div>
                                <p className="text-sky-700 font-medium leading-relaxed">
                                    {getToothData(selectedTooth)?.notes || "No clinical notes documented for this tooth."}
                                </p>
                                <div className="mt-8 flex items-center justify-between pt-6 border-t border-sky-100/50">
                                    <p className="text-sky-400 text-[10px] font-bold uppercase tracking-widest">
                                        Last Sync: {getToothData(selectedTooth)?.updatedAt ? new Date(getToothData(selectedTooth).updatedAt).toLocaleDateString() : 'Never'}
                                    </p>
                                    <button
                                        onClick={() => onAddTreatment(selectedTooth)}
                                        className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-600/10 hover:bg-sky-700 transition-all"
                                    >
                                        <PlusIcon className="w-3.5 h-3.5" />
                                        Plan Treatment
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Recent Procedures for this tooth */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-black text-sky-900 uppercase tracking-widest flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-sky-400" />
                                Treatment History
                            </h4>
                            <div className="bg-sky-50/50 rounded-3xl border border-sky-100 overflow-hidden divide-y divide-sky-100 max-h-[300px] overflow-y-auto">
                                {procedures.filter(p => p.toothNumber === selectedTooth).length > 0 ? (
                                    procedures.filter(p => p.toothNumber === selectedTooth).map(p => (
                                        <div key={p._id} className="p-4 flex justify-between items-center hover:bg-sky-100/20 transition-colors">
                                            <div>
                                                <p className="font-bold text-sky-900 text-sm">{p.name}</p>
                                                <p className="text-[10px] text-sky-500 font-medium">{new Date(p.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${p.status === "COMPLETED" ? "bg-green-50 text-green-600 border-green-100" :
                                                p.status === "IN_PROGRESS" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                    "bg-gray-50 text-gray-500 border-gray-100"
                                                }`}>
                                                {p.status}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center text-sky-300">
                                        <p className="text-xs font-bold uppercase tracking-widest">No history</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ToothUpdateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveStatus}
                toothNumber={selectedTooth}
                currentData={getToothData(selectedTooth)}
            />
        </div>
    );
};

// Helper Icon
const PlusIcon = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
    </svg>
);

export default ToothChart;
