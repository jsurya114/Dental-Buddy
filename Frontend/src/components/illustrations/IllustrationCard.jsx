import { Trash2, Play, ExternalLink, Image as ImageIcon, Video, MonitorPlay } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { deleteIllustration } from '../../redux/illustrationSlice';
import { useState } from 'react';

const IllustrationCard = ({ item, canDelete }) => {
    const dispatch = useDispatch();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this illustration?')) {
            setIsDeleting(true);
            await dispatch(deleteIllustration(item._id));
            setIsDeleting(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getSourceUrl = (src) => {
        if (src.startsWith('http')) return src;
        return `/${src}`;
    };

    const TypeIcon = {
        IMAGE: ImageIcon,
        VIDEO: Video,
        EMBED: MonitorPlay
    }[item.type] || ImageIcon;

    return (
        <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">

            {/* Media Display */}
            <div className="aspect-video bg-gray-100 relative overflow-hidden">
                {item.type === 'IMAGE' && (
                    <img
                        src={getSourceUrl(item.source)}
                        alt={item.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                )}

                {item.type === 'VIDEO' && (
                    <video
                        src={getSourceUrl(item.source)}
                        controls
                        className="w-full h-full object-contain bg-black"
                    />
                )}

                {item.type === 'EMBED' && (
                    <div className="w-full h-full bg-black">
                        <iframe
                            src={item.source}
                            title={item.title}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                )}

                {/* Overlay Gradient on Hover */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Type Badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-md text-gray-800 text-xs font-bold rounded-full shadow-sm flex items-center gap-1.5">
                    <TypeIcon className="w-3 h-3 text-teal-600" />
                    {item.type}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-gray-800 line-clamp-1 mb-1 group-hover:text-teal-600 transition-colors" title={item.title}>
                    {item.title || "Untitled Illustration"}
                </h3>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                        {formatDate(item.createdAt)}
                    </span>

                    {canDelete && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
                            title="Delete Illustration"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IllustrationCard;
