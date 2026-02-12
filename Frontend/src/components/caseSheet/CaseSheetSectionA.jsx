import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { User, Calendar, Phone, MapPin, Heart, Info, Stethoscope, UserCheck } from "lucide-react";

const CaseSheetSectionA = ({ formData, onChange, readOnly }) => {
    const { currentPatient } = useSelector((state) => state.patients);
    const { user } = useSelector((state) => state.auth);

    // Check if current user is a doctor
    const isDoctor = ["DOCTOR", "DENTAL_SURGEON", "CONSULTANT", "SURGEON", "INTERN_DOCTOR"].includes(user?.role || user?.roleCode);

    // Auto-fill logic
    const dentistName = formData?.dentistName || (isDoctor ? (user?.fullName || user?.loginId) : "");
    const visitDate = formData?.visitDate ? new Date(formData.visitDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                        <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        Patient Information
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 ml-11">Section A: General Details & Demographics</p>
                </div>
                <div className="px-4 py-1.5 bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider rounded-full border border-teal-100 shadow-sm">
                    OP Record
                </div>
            </div>

            {/* Form Content */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                {/* Group 1: Administrative */}
                <div className="col-span-1 md:col-span-2 space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
                        <Info className="w-3 h-3" /> Administrative Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">OP Number</label>
                            <input
                                type="text"
                                value={formData?.opNumber || ""}
                                onChange={(e) => onChange("opNumber", e.target.value)}
                                disabled={readOnly}
                                placeholder="Auto"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-mono text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all disabled:opacity-60"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="date"
                                    value={visitDate}
                                    onChange={(e) => onChange("visitDate", e.target.value)}
                                    disabled={readOnly}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Group 2: Personal Info */}
                <div className="col-span-1 md:col-span-2 space-y-4 mt-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
                        <User className="w-3 h-3" /> Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Full Name</label>
                            <input
                                type="text"
                                value={formData?.name ?? currentPatient?.fullName ?? ""}
                                onChange={(e) => onChange("name", e.target.value)}
                                disabled={readOnly}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 font-bold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Age</label>
                            <input
                                type="number"
                                value={formData?.age ?? currentPatient?.age ?? ""}
                                onChange={(e) => onChange("age", e.target.value)}
                                disabled={readOnly}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Gender</label>
                            <select
                                value={formData?.gender ?? currentPatient?.gender ?? ""}
                                onChange={(e) => onChange("gender", e.target.value)}
                                disabled={readOnly}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all appearance-none"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Group 3: Contact Details */}
                <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
                        <Phone className="w-3 h-3" /> Contact Details
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    value={formData?.phone ?? currentPatient?.phone ?? ""}
                                    onChange={(e) => onChange("phone", e.target.value)}
                                    disabled={readOnly}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
                                <textarea
                                    value={formData?.address || currentPatient?.address || ""}
                                    onChange={(e) => onChange("address", e.target.value)}
                                    disabled={readOnly}
                                    rows={3}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none text-sm"
                                    placeholder="Enter full address"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Group 4: Additional Info */}
                <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
                        <Heart className="w-3 h-3" /> Relationship & Referrals
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Marital Status</label>
                            <select
                                value={formData?.maritalStatus || ""}
                                onChange={(e) => onChange("maritalStatus", e.target.value)}
                                disabled={readOnly}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all appearance-none"
                            >
                                <option value="">Select Status</option>
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Divorced">Divorced</option>
                                <option value="Widowed">Widowed</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Referred By</label>
                                <input
                                    type="text"
                                    value={formData?.referredBy || ""}
                                    onChange={(e) => onChange("referredBy", e.target.value)}
                                    disabled={readOnly}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                    placeholder="Source"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-teal-600 uppercase mb-1.5 ml-1">Doctor</label>
                                <div className="relative">
                                    <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={dentistName}
                                        onChange={(e) => onChange("dentistName", e.target.value)}
                                        disabled={readOnly}
                                        placeholder="Doctor"
                                        className="w-full pl-9 pr-4 py-2.5 bg-teal-50/50 border border-teal-100 rounded-xl text-teal-800 font-semibold text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CaseSheetSectionA;
