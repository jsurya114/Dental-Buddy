import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const CaseSheetSectionA = ({ formData, onChange, readOnly }) => {
    const { currentPatient } = useSelector((state) => state.patients);
    const { user } = useSelector((state) => state.auth);

    // Auto-fill logic on mount/update is handled here or parent. 
    // Ideally parent sets initial state, but we can display read-only defaults from props/store.

    // Check if current user is a doctor
    const isDoctor = ["DOCTOR", "DENTAL_SURGEON", "CONSULTANT", "SURGEON", "INTERN_DOCTOR"].includes(user?.role || user?.roleCode);

    // Auto-fill only if doctor, otherwise empty (unless already saved)
    const dentistName = formData?.dentistName || (isDoctor ? (user?.fullName || user?.loginId) : "");
    const visitDate = formData?.visitDate ? new Date(formData.visitDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    return (
        <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-slate-100 p-4 border-b-2 border-slate-200 text-center">
                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">Dental OP Case Sheet</h2>
                <span className="inline-block bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full mt-2">
                    SECTION - A
                </span>
            </div>

            {/* Form Content */}
            <div className="p-6 bg-slate-50 space-y-6">

                {/* Row 1: OP Number & Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">OP Number</label>
                        <input
                            type="text"
                            value={formData?.opNumber || ""}
                            onChange={(e) => onChange("opNumber", e.target.value)}
                            disabled={readOnly}
                            placeholder="Auto-generated / Manual"
                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                        <input
                            type="date"
                            value={visitDate}
                            onChange={(e) => onChange("visitDate", e.target.value)}
                            disabled={readOnly}
                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500 transition-all"
                        />
                    </div>
                </div>

                {/* Row 2: Patient Basic Info (Auto-filled / Read-only mostly) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                        <input
                            type="text"
                            value={formData?.name ?? currentPatient?.fullName ?? ""}
                            onChange={(e) => onChange("name", e.target.value)}
                            disabled={readOnly}
                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age</label>
                        <input
                            type="number"
                            value={formData?.age ?? currentPatient?.age ?? ""}
                            onChange={(e) => onChange("age", e.target.value)}
                            disabled={readOnly}
                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label>
                        <select
                            value={formData?.gender ?? currentPatient?.gender ?? ""}
                            onChange={(e) => onChange("gender", e.target.value)}
                            disabled={readOnly}
                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 transition-all"
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                {/* Row 3: Contact & Personal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                        <input
                            type="text"
                            value={formData?.phone ?? currentPatient?.phone ?? ""}
                            onChange={(e) => onChange("phone", e.target.value)}
                            disabled={readOnly}
                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Marital Status</label>
                        <select
                            value={formData?.maritalStatus || ""}
                            onChange={(e) => onChange("maritalStatus", e.target.value)}
                            disabled={readOnly}
                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 transition-all"
                        >
                            <option value="">Select Status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                        </select>
                    </div>
                </div>

                {/* Row 4: Address */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                    <textarea
                        value={formData?.address || currentPatient?.address || ""}
                        onChange={(e) => onChange("address", e.target.value)}
                        disabled={readOnly}
                        rows={2}
                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 transition-all resize-none"
                        placeholder="Current residential address..."
                    />
                </div>

                {/* Row 5: Referral & Dentist */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Referred By</label>
                        <input
                            type="text"
                            value={formData?.referredBy || ""}
                            onChange={(e) => onChange("referredBy", e.target.value)}
                            disabled={readOnly}
                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 transition-all"
                            placeholder="Doctor / Clinic / Friend"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Consulting Dentist</label>
                        <input
                            type="text"
                            value={dentistName}
                            onChange={(e) => onChange("dentistName", e.target.value)}
                            disabled={readOnly}
                            placeholder={isDoctor ? "Doctor Name" : "Enter Doctor Name"}
                            className="w-full px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-800 font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-75 disabled:cursor-not-allowed"
                        />
                    </div>
                </div>
            </div>

            {/* Footer / Status Bar (Optional) */}
            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
                <span>Dental OP Record</span>
                <span>Confidential Medical Document</span>
            </div>
        </div>
    );
};

export default CaseSheetSectionA;
