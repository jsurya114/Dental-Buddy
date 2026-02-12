import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePermissions } from "../../hooks/usePermission";
import {
    fetchImagingByPatient,
    uploadImaging,
    clearSuccessMessage,
    clearError
} from "../../redux/imagingSlice";
import {
    Upload, X, FileText, Image as ImageIcon,
    Download, Eye, Trash2, FolderOpen, Loader2
} from "lucide-react";

const CATEGORY_CONFIG = {
    XRAY: { label: "X-Rays", icon: "🦷", color: "text-blue-600 bg-blue-50 border-blue-100" },
    INTRAORAL_PHOTO: { label: "Intraoral Photos", icon: "📸", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    CT_SCAN: { label: "CT Scans", icon: "🔬", color: "text-purple-600 bg-purple-50 border-purple-100" },
    LAB_REPORT: { label: "Lab Reports", icon: "🧪", color: "text-amber-600 bg-amber-50 border-amber-100" },
    PRESCRIPTION: { label: "Prescriptions", icon: "💊", color: "text-rose-600 bg-rose-50 border-rose-100" },
    CONSENT_FORM: { label: "Consent Forms", icon: "📝", color: "text-cyan-600 bg-cyan-50 border-cyan-100" },
    REFERRAL: { label: "Referrals", icon: "📤", color: "text-orange-600 bg-orange-50 border-orange-100" },
    OTHER: { label: "Other Documents", icon: "📁", color: "text-slate-600 bg-slate-50 border-slate-100" }
};

const ImagingTab = ({ patientId }) => {
    const dispatch = useDispatch();
    const { can } = usePermissions();
    const { files, grouped, loading, uploading, error, successMessage } = useSelector(state => state.imaging);
    const fileInputRef = useRef(null);

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

        await dispatch(uploadImaging(formData));
        setShowUploadModal(false);
        setUploadData({ file: null, category: "XRAY", title: "", description: "" });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const openPreview = (file) => {
        setSelectedFile(file);
        setShowPreviewModal(true);
    };

    const getPreviewUrl = (fileId) => {
        const token = localStorage.getItem("accessToken");
        return `/api/imaging/${fileId}/preview?token=${token}`;
    };

    const displayCategories = activeCategory
        ? [activeCategory]
        : Object.keys(CATEGORY_CONFIG).filter(cat => grouped[cat]?.length > 0);

    if (loading && !files.length) {
        return (
            <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <FolderOpen className="w-5 h-5" />
                        </div>
                        Imaging & Documents
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{files.length}</span>
                    </h3>
                    <p className="text-sm text-gray-500 ml-11">Manage X-rays, scans, and reports</p>
                </div>
                {can("IMAGING", "CREATE") && (
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        Upload File
                    </button>
                )}
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
                <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl border border-emerald-100 flex items-center gap-2">
                    <span className="text-lg">✓</span> {successMessage}
                </div>
            )}
            {error && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
                    <span className="text-lg">⚠</span> {error}
                </div>
            )}

            {/* Content Area */}
            {files.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <FolderOpen className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">No files uploaded</h3>
                    <p className="text-gray-500 mt-1 max-w-sm">
                        Upload patient documents, X-rays, and scans to keep them organized.
                    </p>
                </div>
            ) : (
                <>
                    {/* Category Filter Pills */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setActiveCategory(null)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${!activeCategory
                                    ? "bg-gray-900 text-white shadow-md"
                                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            All Files
                        </button>
                        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                            const count = grouped[key]?.length || 0;
                            if (count === 0) return null;
                            const isActive = activeCategory === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveCategory(key)}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${isActive
                                            ? "bg-gray-900 text-white shadow-md"
                                            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    <span>{config.icon}</span>
                                    {config.label}
                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Grid of Files */}
                    <div className="space-y-8">
                        {displayCategories.map(cat => {
                            const config = CATEGORY_CONFIG[cat];
                            const categoryFiles = grouped[cat] || [];
                            if (categoryFiles.length === 0) return null;

                            return (
                                <div key={cat} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="flex items-center gap-3 mb-4">
                                        <h4 className={`text-sm font-bold uppercase tracking-wider px-3 py-1 rounded-lg ${config.color}`}>
                                            {config.icon} {config.label}
                                        </h4>
                                        <div className="h-px bg-gray-100 flex-1"></div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                                        {categoryFiles.map((file) => (
                                            <div
                                                key={file._id}
                                                onClick={() => openPreview(file)}
                                                className="group relative bg-white rounded-2xl p-3 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
                                            >
                                                {/* File Preview/Icon */}
                                                <div className="aspect-square rounded-xl bg-gray-50 mb-3 overflow-hidden flex items-center justify-center relative">
                                                    {file.isImage ? (
                                                        <img
                                                            src={getPreviewUrl(file._id)}
                                                            alt={file.title}
                                                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                            loading="lazy"
                                                            onError={(e) => {
                                                                e.target.style.display = "none";
                                                                e.target.parentNode.querySelector(".fallback-icon").style.display = "flex";
                                                            }}
                                                        />
                                                    ) : null}

                                                    {/* Fallback Icon */}
                                                    <div className={`fallback-icon w-full h-full flex items-center justify-center ${file.isImage ? "hidden" : "flex"}`}>
                                                        {file.isPdf ? (
                                                            <FileText className="w-12 h-12 text-red-400 group-hover:scale-110 transition-transform" />
                                                        ) : (
                                                            <ImageIcon className="w-12 h-12 text-blue-400 group-hover:scale-110 transition-transform" />
                                                        )}
                                                    </div>

                                                    {/* Hover Overlay */}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                                        <button className="p-2 bg-white rounded-full text-gray-800 hover:text-teal-600 shadow-lg transform scale-0 group-hover:scale-100 transition-transform delay-75">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <h5 className="font-bold text-gray-800 text-sm truncate px-1" title={file.title}>
                                                    {file.title}
                                                </h5>
                                                <p className="text-xs text-gray-400 px-1 mt-0.5">
                                                    {new Date(file.uploadedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Upload Document</h3>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-4">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${uploadData.file
                                        ? "border-teal-500 bg-teal-50"
                                        : "border-gray-200 hover:border-teal-400 hover:bg-gray-50"
                                    }`}
                            >
                                {uploadData.file ? (
                                    <div className="flex flex-col items-center">
                                        <FileText className="w-10 h-10 text-teal-600 mb-2" />
                                        <p className="font-bold text-teal-800">{uploadData.file.name}</p>
                                        <p className="text-xs text-teal-600">{(uploadData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <Upload className="w-10 h-10 text-gray-300 mb-2" />
                                        <p className="font-medium text-gray-600">Click to upload</p>
                                        <p className="text-xs text-gray-400">PDF, JPG, PNG up to 10MB</p>
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

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Category</label>
                                    <select
                                        value={uploadData.category}
                                        onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                                    >
                                        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Title</label>
                                    <input
                                        type="text"
                                        value={uploadData.title}
                                        onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                                        placeholder="Document title"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Description</label>
                                    <textarea
                                        value={uploadData.description}
                                        onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                                        rows={2}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none resize-none"
                                        placeholder="Optional notes..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading || !uploadData.file}
                                className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {uploading ? "Uploading..." : "Upload Document"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreviewModal && selectedFile && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl overflow-hidden w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{selectedFile.title}</h3>
                                <p className="text-sm text-gray-500">
                                    {CATEGORY_CONFIG[selectedFile.category]?.label} • {new Date(selectedFile.uploadedAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <a
                                    href={getPreviewUrl(selectedFile._id)}
                                    download={selectedFile.originalName}
                                    className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                    title="Download"
                                >
                                    <Download className="w-5 h-5" />
                                </a>
                                <button
                                    onClick={() => { setShowPreviewModal(false); setSelectedFile(null); }}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 bg-gray-100 overflow-hidden flex items-center justify-center relative">
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
                                <div className="text-center">
                                    <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 font-medium">Preview not available for this file type</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImagingTab;
