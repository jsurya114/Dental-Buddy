import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { fetchPatientById } from "../../redux/patientSlice";
import { usePermissions } from "../../hooks/usePermission";
import {
    fetchImagingByPatient,
    uploadImaging,
    clearSuccessMessage,
    clearError
} from "../../redux/imagingSlice";

const CATEGORY_CONFIG = {
    XRAY: { label: "X-Rays", icon: "🦷", color: "from-blue-500 to-indigo-500" },
    INTRAORAL_PHOTO: { label: "Intraoral Photos", icon: "📸", color: "from-green-500 to-emerald-500" },
    CT_SCAN: { label: "CT Scans", icon: "🔬", color: "from-purple-500 to-violet-500" },
    LAB_REPORT: { label: "Lab Reports", icon: "🧪", color: "from-orange-500 to-amber-500" },
    PRESCRIPTION: { label: "Prescriptions", icon: "💊", color: "from-pink-500 to-rose-500" },
    CONSENT_FORM: { label: "Consent Forms", icon: "📝", color: "from-teal-500 to-cyan-500" },
    REFERRAL: { label: "Referrals", icon: "📤", color: "from-red-500 to-orange-500" },
    OTHER: { label: "Other Documents", icon: "📁", color: "from-gray-500 to-slate-500" }
};

const ImagingDetail = () => {
    const { patientId } = useParams();
    const dispatch = useDispatch();
    const { can } = usePermissions();

    // Selectors
    const { currentPatient } = useSelector((state) => state.patients);
    const { files, grouped, loading, uploading, error, successMessage } = useSelector(state => state.imaging);

    const fileInputRef = useRef(null);

    // Local State
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const [uploadData, setUploadData] = useState({
        file: null,
        category: "XRAY",
        title: "",
        description: ""
    });

    useEffect(() => {
        if (patientId) {
            dispatch(fetchPatientById(patientId));
            dispatch(fetchImagingByPatient(patientId));
        }
    }, [dispatch, patientId]);

    // Clear messages
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => dispatch(clearSuccessMessage()), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, dispatch]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => dispatch(clearError()), 5000);
            return () => clearTimeout(timer);
        }
    }, [error, dispatch]);

    // Handlers
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadData(prev => ({ ...prev, file, title: file.name.split(".")[0] }));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadData.file || !uploadData.title || !uploadData.category) return;

        const formData = new FormData();
        formData.append("file", uploadData.file);
        formData.append("patientId", patientId);
        formData.append("category", uploadData.category);
        formData.append("title", uploadData.title);
        formData.append("description", uploadData.description);

        const result = await dispatch(uploadImaging(formData));

        if (uploadImaging.fulfilled.match(result)) {
            setShowUploadModal(false);
            setUploadData({ file: null, category: "XRAY", title: "", description: "" });
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const openPreview = (file) => {
        setSelectedFile(file);
        setShowPreviewModal(true);
    };

    const getPreviewUrl = (fileId) => {
        const token = localStorage.getItem("accessToken");
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3125";
        return `${baseUrl}/api/imaging/${fileId}/preview?token=${token}`;
    };

    const displayCategories = activeCategory
        ? [activeCategory]
        : Object.keys(CATEGORY_CONFIG).filter(cat => grouped[cat]?.length > 0);

    if (!currentPatient) return <div className="p-8 text-center">Loading patient details...</div>;

    return (
        <div className="space-y-6 animate-fade-in h-full flex flex-col">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link to="/app/imaging" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                        ←
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            {currentPatient.fullName}
                            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">
                                {currentPatient.patientId}
                            </span>
                        </h1>
                        <p className="text-gray-500 text-sm">Imaging & Documents Gallery</p>
                    </div>
                </div>

                {can("IMAGING", "CREATE") && (
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        <span>📤</span> Upload File
                    </button>
                )}
            </div>

            {/* Messages */}
            {successMessage && (
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl border border-green-100">✓ {successMessage}</div>
            )}
            {error && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-100">✗ {error}</div>
            )}

            {/* Content Container */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">

                {/* Category Filter */}
                <div className="p-4 border-b border-gray-100 overflow-x-auto">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveCategory(null)}
                            className={`px-4 py-2 rounded-xl whitespace-nowrap font-medium transition-all ${!activeCategory ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                        >
                            All Files
                        </button>
                        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                            const count = grouped[key]?.length || 0;
                            // Show category if it has files OR (if we want to show empty categories can remove the count check)
                            // Keeping it cleaner by only showing populated categories is usually better UX, unless user wants to upload to a specific one easily.
                            // Let's show all for filtering purposes if they exist? Or just ones with data.
                            // Sticking to existing logic: only show if data exists
                            if (count === 0) return null;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveCategory(key)}
                                    className={`px-4 py-2 rounded-xl whitespace-nowrap font-medium transition-all flex items-center gap-2 ${activeCategory === key
                                        ? "bg-gray-800 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    {config.icon} {config.label}
                                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{count}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {loading && !files.length ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                        </div>
                    ) : displayCategories.length > 0 ? (
                        <div className="space-y-8">
                            {displayCategories.map(cat => {
                                const config = CATEGORY_CONFIG[cat];
                                const categoryFiles = grouped[cat] || [];
                                if (categoryFiles.length === 0) return null;

                                return (
                                    <div key={cat} className="animate-fade-in-up">
                                        <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-3">
                                            <span className={`w-10 h-10 rounded-xl bg-gradient-to-r ${config.color} text-white flex items-center justify-center shadow-sm`}>
                                                {config.icon}
                                            </span>
                                            {config.label}
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                            {categoryFiles.map(file => (
                                                <div
                                                    key={file._id}
                                                    onClick={() => openPreview(file)}
                                                    className="group bg-white rounded-2xl p-3 cursor-pointer hover:shadow-lg transition-all border border-gray-100 hover:border-teal-200 relative"
                                                >
                                                    {/* Thumbnail */}
                                                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3 flex items-center justify-center relative">
                                                        {file.isImage ? (
                                                            <img
                                                                src={getPreviewUrl(file._id)}
                                                                alt={file.title}
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                                onError={(e) => {
                                                                    e.target.style.display = "none";
                                                                    e.target.nextSibling.style.display = "flex";
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div className={`text-5xl ${file.isImage ? "hidden" : "flex"} opacity-50`}>
                                                            {file.isPdf ? "📄" : "📁"}
                                                        </div>
                                                        {/* Hover Overlay */}
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                            <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-gray-800 px-3 py-1 rounded-lg text-sm font-medium shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-all">
                                                                View
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="font-semibold text-gray-800 truncate mb-1">{file.title}</p>
                                                    <div className="flex justify-between items-center text-xs text-gray-400">
                                                        <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                                                        <span>{(file.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-400">
                            <div className="text-6xl mb-4 opacity-20">📂</div>
                            <h3 className="text-xl font-medium text-gray-600 mb-2">No files uploaded yet</h3>
                            <p className="mb-6">Upload imaging files, prescriptions, or reports specifically for {currentPatient.fullName}.</p>
                            {can("IMAGING", "CREATE") && (
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    className="px-6 py-2 bg-teal-50 text-teal-600 rounded-xl font-medium hover:bg-teal-100 transition-colors"
                                >
                                    Upload First File
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl transform transition-all scale-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">Upload File</h3>
                            <button onClick={() => setShowUploadModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">✕</button>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-5">
                            {/* File Drop Zone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${uploadData.file
                                    ? "border-teal-400 bg-teal-50/50"
                                    : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"}`}
                            >
                                {uploadData.file ? (
                                    <div className="animate-fade-in">
                                        <div className="text-4xl mb-3">
                                            {uploadData.file.type.startsWith("image/") ? "🖼️" : "📄"}
                                        </div>
                                        <p className="text-gray-800 font-bold text-lg">{uploadData.file.name}</p>
                                        <p className="text-gray-500">
                                            {(uploadData.file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                        <p className="text-teal-600 text-sm mt-2 font-medium">Click to change file</p>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="text-5xl mb-4 opacity-50">📤</div>
                                        <p className="text-gray-700 font-medium text-lg mb-1">Click to select file</p>
                                        <p className="text-gray-400 text-sm">Images & PDFs up to 10MB</p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                    <select
                                        value={uploadData.category}
                                        onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                                    >
                                        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                                            <option key={key} value={key}>{config.icon} {config.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={uploadData.title}
                                        onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                        placeholder="e.g., Upper Right Molar X-Ray"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description <span className="text-gray-400 font-normal">(Optional)</span></label>
                                    <textarea
                                        value={uploadData.description}
                                        onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                        rows={2}
                                        placeholder="Add any relevant notes..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowUploadModal(false); setUploadData({ file: null, category: "XRAY", title: "", description: "" }); }}
                                    className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading || !uploadData.file}
                                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg hover:to-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? "Uploading..." : "Upload File"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreviewModal && selectedFile && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl overflow-hidden max-w-5xl w-full h-[85vh] flex flex-col shadow-2xl">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${CATEGORY_CONFIG[selectedFile.category]?.color} text-white flex items-center justify-center shadow-sm`}>
                                    {CATEGORY_CONFIG[selectedFile.category]?.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg leading-tight">{selectedFile.title}</h3>
                                    <p className="text-xs text-gray-500">
                                        Uploaded {new Date(selectedFile.uploadedAt).toLocaleDateString()}
                                        {selectedFile.uploadedBy?.fullName && ` by ${selectedFile.uploadedBy.fullName}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <a
                                    href={getPreviewUrl(selectedFile._id)}
                                    download={selectedFile.originalName}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Download
                                </a>
                                <button
                                    onClick={() => { setShowPreviewModal(false); setSelectedFile(null); }}
                                    className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors font-bold"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto p-0 bg-gray-900 flex items-center justify-center relative">
                            {selectedFile.isImage ? (
                                <img
                                    src={getPreviewUrl(selectedFile._id)}
                                    alt={selectedFile.title}
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : selectedFile.isPdf ? (
                                <iframe
                                    src={getPreviewUrl(selectedFile._id)}
                                    className="w-full h-full"
                                    title={selectedFile.title}
                                />
                            ) : (
                                <div className="text-center text-white">
                                    <div className="text-6xl mb-4">📁</div>
                                    <p className="text-gray-300">Preview not available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImagingDetail;
