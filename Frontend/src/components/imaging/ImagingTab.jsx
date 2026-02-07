import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
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

    if (loading && !files.length) {
        return (
            <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    const displayCategories = activeCategory
        ? [activeCategory]
        : Object.keys(CATEGORY_CONFIG).filter(cat => grouped[cat]?.length > 0);

    return (
        <div className="space-y-6">
            {/* Messages */}
            {successMessage && (
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl">✓ {successMessage}</div>
            )}
            {error && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl">✗ {error}</div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span>📁</span> Imaging & Documents
                    <span className="text-sm font-normal text-gray-500">({files.length})</span>
                </h3>
                {can("IMAGING", "CREATE") && (
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm"
                    >
                        📤 Upload File
                    </button>
                )}
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => setActiveCategory(null)}
                    className={`px-4 py-2 rounded-xl whitespace-nowrap font-medium transition-all ${!activeCategory ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                >
                    All
                </button>
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                    const count = grouped[key]?.length || 0;
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

            {/* Files by Category */}
            {displayCategories.length > 0 ? (
                <div className="space-y-6">
                    {displayCategories.map(cat => {
                        const config = CATEGORY_CONFIG[cat];
                        const categoryFiles = grouped[cat] || [];
                        if (categoryFiles.length === 0) return null;

                        return (
                            <div key={cat}>
                                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <span className={`w-8 h-8 rounded-lg bg-gradient-to-r ${config.color} text-white flex items-center justify-center`}>
                                        {config.icon}
                                    </span>
                                    {config.label}
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {categoryFiles.map(file => (
                                        <div
                                            key={file._id}
                                            onClick={() => openPreview(file)}
                                            className="bg-gray-50 rounded-xl p-3 cursor-pointer hover:shadow-md transition-all border border-gray-100 hover:border-teal-200"
                                        >
                                            {/* Thumbnail */}
                                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-200 mb-2 flex items-center justify-center">
                                                {file.isImage ? (
                                                    <img
                                                        src={getPreviewUrl(file._id)}
                                                        alt={file.title}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = "none";
                                                            e.target.nextSibling.style.display = "flex";
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`text-4xl ${file.isImage ? "hidden" : "flex"}`}>
                                                    {file.isPdf ? "📄" : "📁"}
                                                </div>
                                            </div>
                                            <p className="text-sm font-medium text-gray-800 truncate">{file.title}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(file.uploadedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                    <div className="text-4xl mb-3">📁</div>
                    <p>No files uploaded yet.</p>
                    {can("IMAGING", "CREATE") && (
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="mt-4 text-teal-600 hover:text-teal-700 font-medium"
                        >
                            + Upload first file
                        </button>
                    )}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Upload File</h3>
                        <form onSubmit={handleUpload} className="space-y-4">
                            {/* File Drop Zone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-teal-400 transition-colors"
                            >
                                {uploadData.file ? (
                                    <div>
                                        <div className="text-3xl mb-2">
                                            {uploadData.file.type.startsWith("image/") ? "🖼️" : "📄"}
                                        </div>
                                        <p className="text-gray-700 font-medium">{uploadData.file.name}</p>
                                        <p className="text-gray-500 text-sm">
                                            {(uploadData.file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="text-4xl mb-2">📤</div>
                                        <p className="text-gray-600">Click to select file</p>
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                <select
                                    value={uploadData.category}
                                    onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500"
                                >
                                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                                        <option key={key} value={key}>{config.icon} {config.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    value={uploadData.title}
                                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500"
                                    placeholder="e.g., Upper Right Molar X-Ray"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={uploadData.description}
                                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500"
                                    rows={2}
                                    placeholder="Optional notes..."
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowUploadModal(false); setUploadData({ file: null, category: "XRAY", title: "", description: "" }); }}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading || !uploadData.file}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50"
                                >
                                    {uploading ? "Uploading..." : "Upload"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreviewModal && selectedFile && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-gray-800">{selectedFile.title}</h3>
                                <p className="text-sm text-gray-500">
                                    {CATEGORY_CONFIG[selectedFile.category]?.label} •
                                    Uploaded {new Date(selectedFile.uploadedAt).toLocaleDateString()}
                                    {selectedFile.uploadedBy?.fullName && ` by ${selectedFile.uploadedBy.fullName}`}
                                </p>
                            </div>
                            <button
                                onClick={() => { setShowPreviewModal(false); setSelectedFile(null); }}
                                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 bg-gray-100 flex items-center justify-center">
                            {selectedFile.isImage ? (
                                <img
                                    src={getPreviewUrl(selectedFile._id)}
                                    alt={selectedFile.title}
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : selectedFile.isPdf ? (
                                <iframe
                                    src={getPreviewUrl(selectedFile._id)}
                                    className="w-full h-full min-h-[500px]"
                                    title={selectedFile.title}
                                />
                            ) : (
                                <div className="text-center">
                                    <div className="text-6xl mb-4">📁</div>
                                    <p className="text-gray-600">Preview not available</p>
                                    <a
                                        href={getPreviewUrl(selectedFile._id)}
                                        download={selectedFile.originalName}
                                        className="mt-4 inline-block px-6 py-2 bg-teal-500 text-white rounded-xl"
                                    >
                                        Download File
                                    </a>
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
