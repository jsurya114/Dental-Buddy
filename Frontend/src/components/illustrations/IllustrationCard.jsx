import { Trash2, Play, ExternalLink } from 'lucide-react';
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

    return (
        <div className="group relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full">

            {/* Media Display */}
            <div className="aspect-video bg-gray-100 relative overflow-hidden">
                {item.type === 'IMAGE' && (
                    <img
                        src={getSourceUrl(item.source)}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                    <div className="w-full h-full">
                        <iframe
                            src={item.source}
                            title={item.title}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                        {/* Overlay to prevent interaction in list view if needed, but useful to play directly */}
                    </div>
                )}

                {/* Type Badge */}
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full uppercase tracking-wide">
                    {item.type}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-gray-800 line-clamp-1 mb-1" title={item.title}>
                    {item.title || "Untitled Illustration"}
                </h3>
                <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-xs text-gray-500">
                        {formatDate(item.createdAt)}
                    </span>

                    {canDelete && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Delete"
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
