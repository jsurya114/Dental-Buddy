import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIllustrations, setFilter } from '../redux/illustrationSlice';
import { Plus, Image as ImageIcon, Video, Link, Filter, Search } from 'lucide-react';
import IllustrationCard from '../components/illustrations/IllustrationCard';
import IllustrationUploadModal from '../components/illustrations/IllustrationUploadModal';

const DentalIllustrations = () => {
    const dispatch = useDispatch();
    const { items, filter, loading, error } = useSelector((state) => state.illustrations);
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        dispatch(fetchIllustrations());
    }, [dispatch]);

    // Filter items based on active filter and search query
    const filteredItems = items.filter(item => {
        const matchesFilter = filter === 'All' || item.type === filter;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    const categories = [
        { id: 'All', label: 'All Media', icon: null },
        { id: 'Image', label: 'Images', icon: ImageIcon },
        { id: 'Video', label: 'Videos', icon: Video },
        { id: 'Link', label: 'External Links', icon: Link },
    ];

    return (
        <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Illustrations & Education</h1>
                    <p className="text-gray-500">Visual aids for patient education</p>
                </div>
                <button
                    onClick={() => setUploadModalOpen(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30 transition-all font-medium flex items-center gap-2 group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    <span>Upload Media</span>
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search title, tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:bg-white transition-all text-gray-800 placeholder-gray-400"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = filter === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => dispatch(setFilter(cat.id))}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${isActive
                                        ? "bg-teal-50 text-teal-700 shadow-sm ring-1 ring-teal-100"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                    }`}
                            >
                                {Icon && <Icon className="w-4 h-4" />}
                                {cat.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2">
                    <span className="text-lg">⚠️</span> {error}
                </div>
            )}

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto pr-2">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-video bg-gray-100 rounded-2xl"></div>
                        ))}
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 text-gray-300">
                            <ImageIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No illustrations found</h3>
                        <p className="text-gray-500 max-w-sm mt-1">
                            Try adjusting your search or filters, or upload new content.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                        {filteredItems.map((item) => (
                            <IllustrationCard key={item._id} item={item} />
                        ))}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            <IllustrationUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
            />
        </div>
    );
};

export default DentalIllustrations;
