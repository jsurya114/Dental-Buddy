import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadMedia, addEmbed } from '../../redux/illustrationSlice';
import { X, Upload, Video, Camera, Link, Image as ImageIcon, Loader2 } from 'lucide-react';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Add New Illustration</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('UPLOAD')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'UPLOAD' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Upload className="w-4 h-4" /> Upload
                    </button>
                    <button
                        onClick={() => setActiveTab('CAMERA')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'CAMERA' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Camera className="w-4 h-4" /> Camera
                    </button>
                    <button
                        onClick={() => setActiveTab('EMBED')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'EMBED' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Link className="w-4 h-4" /> Embed URL
                    </button>
                </div>

                <div className="p-6">
                    {/* Common Title Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Root Canal Diagram"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>

                    {/* UPLOAD TAB */}
                    {activeTab === 'UPLOAD' && (
                        <div className="space-y-4">
                            {!preview ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="mx-auto w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG, or MP4</p>
                                </div>
                            ) : (
                                <div className="relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                    {file?.type?.startsWith('video/') ? (
                                        <video src={preview} controls className="w-full h-48 object-contain" />
                                    ) : (
                                        <img src={preview} alt="Preview" className="w-full h-48 object-contain" />
                                    )}
                                    <button
                                        onClick={() => { setFile(null); setPreview(null); }}
                                        className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white rounded-full shadow-sm text-gray-600 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* CAMERA TAB */}
                    {activeTab === 'CAMERA' && (
                        <div className="space-y-4">
                            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                                <canvas ref={canvasRef} width="640" height="480" className="hidden"></canvas>
                            </div>
                            <button
                                type="button"
                                onClick={capturePhoto}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <Camera className="w-4 h-4" /> Capture Photo
                            </button>
                        </div>
                    )}

                    {/* EMBED TAB */}
                    {activeTab === 'EMBED' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                                <input
                                    type="url"
                                    value={embedUrl}
                                    onChange={(e) => setEmbedUrl(e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">Supports YouTube, Facebook, Instagram</p>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    {activeTab !== 'CAMERA' && (
                        <button
                            onClick={handleSubmit}
                            disabled={loading || (activeTab === 'UPLOAD' && !file) || (activeTab === 'EMBED' && !embedUrl)}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
