import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadMedia, addEmbed } from '../../redux/illustrationSlice';
import { X, Upload, Video, Camera, Link, Image as ImageIcon, Loader2, Check } from 'lucide-react';

const IllustrationUploadModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.illustrations);

    const [activeTab, setActiveTab] = useState('UPLOAD'); // UPLOAD | EMBED | CAMERA
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [embedUrl, setEmbedUrl] = useState('');
    const [cameraStream, setCameraStream] = useState(null);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Reset state on close
    useEffect(() => {
        if (!isOpen) {
            setTitle('');
            setFile(null);
            setPreview(null);
            setEmbedUrl('');
            stopCamera();
            setActiveTab('UPLOAD');
        }
    }, [isOpen]);

    // Handle File Selection
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    // Camera Logic
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setCameraStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera access denied:", err);
            alert("Could not access camera. Please allow permissions.");
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            context.drawImage(videoRef.current, 0, 0, 640, 480);

            canvasRef.current.toBlob((blob) => {
                const capturedFile = new File([blob], `camera-capture-${Date.now()}.png`, { type: 'image/png' });
                setFile(capturedFile);
                setPreview(URL.createObjectURL(capturedFile));
                stopCamera();
                setActiveTab('UPLOAD'); // Switch to preview
            }, 'image/png');
        }
    };

    useEffect(() => {
        if (activeTab === 'CAMERA') {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [activeTab]);


    // Submit Handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (activeTab === 'EMBED') {
                if (!embedUrl) return;
                await dispatch(addEmbed({ type: 'EMBED', embedUrl, title })).unwrap();
            } else {
                if (!file) return;
                const type = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';
                await dispatch(uploadMedia({ type, file, title })).unwrap();
            }
            onClose();
        } catch (error) {
            console.error("Upload failed", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden scale-100 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Add Illustration</h2>
                        <p className="text-sm text-gray-500">Upload media or embed a video</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-2 gap-2 bg-white">
                    <button
                        onClick={() => setActiveTab('UPLOAD')}
                        className={`flex-1 py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${activeTab === 'UPLOAD'
                                ? 'bg-teal-50 text-teal-700 shadow-sm ring-1 ring-teal-100'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                    >
                        <Upload className="w-4 h-4" /> Upload
                    </button>
                    <button
                        onClick={() => setActiveTab('CAMERA')}
                        className={`flex-1 py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${activeTab === 'CAMERA'
                                ? 'bg-teal-50 text-teal-700 shadow-sm ring-1 ring-teal-100'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                    >
                        <Camera className="w-4 h-4" /> Camera
                    </button>
                    <button
                        onClick={() => setActiveTab('EMBED')}
                        className={`flex-1 py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${activeTab === 'EMBED'
                                ? 'bg-teal-50 text-teal-700 shadow-sm ring-1 ring-teal-100'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                    >
                        <Link className="w-4 h-4" /> Embed
                    </button>
                </div>

                <div className="p-6 pt-2">
                    {/* Common Title Input */}
                    <div className="mb-5">
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title (Optional)</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Root Canal Diagram"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-gray-400"
                        />
                    </div>

                    {/* UPLOAD TAB */}
                    {activeTab === 'UPLOAD' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {!preview ? (
                                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-teal-500 hover:bg-teal-50/30 transition-all cursor-pointer relative group">
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="mx-auto w-14 h-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                                        <ImageIcon className="w-7 h-7" />
                                    </div>
                                    <p className="font-semibold text-gray-700 group-hover:text-teal-700">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG, or MP4</p>
                                </div>
                            ) : (
                                <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-200 group">
                                    {file?.type?.startsWith('video/') ? (
                                        <video src={preview} controls className="w-full h-56 object-contain" />
                                    ) : (
                                        <img src={preview} alt="Preview" className="w-full h-56 object-contain" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2 pointer-events-none">
                                        <button
                                            onClick={() => { setFile(null); setPreview(null); }}
                                            className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all pointer-events-auto"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* CAMERA TAB */}
                    {activeTab === 'CAMERA' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="relative bg-black rounded-2xl overflow-hidden aspect-video shadow-inner">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                                <canvas ref={canvasRef} width="640" height="480" className="hidden"></canvas>
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={capturePhoto}
                                        className="w-14 h-14 bg-white rounded-full border-4 border-gray-300 shadow-lg hover:border-teal-500 hover:scale-105 transition-all flex items-center justify-center"
                                    >
                                        <div className="w-10 h-10 bg-teal-600 rounded-full"></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* EMBED TAB */}
                    {activeTab === 'EMBED' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Video URL</label>
                                <input
                                    type="url"
                                    value={embedUrl}
                                    onChange={(e) => setEmbedUrl(e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-mono text-sm"
                                />
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                    <Video className="w-3 h-3" /> Supports YouTube, Vimeo, etc.
                                </p>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200/80 rounded-xl transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    {activeTab !== 'CAMERA' && (
                        <button
                            onClick={handleSubmit}
                            disabled={loading || (activeTab === 'UPLOAD' && !file) || (activeTab === 'EMBED' && !embedUrl)}
                            className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {activeTab === 'EMBED' ? 'Embed Video' : 'Upload Media'}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default IllustrationUploadModal;
