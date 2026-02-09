import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIllustrations, setFilter } from '../redux/illustrationSlice';
import { Plus, Image as ImageIcon, Video, Link, Filter } from 'lucide-react';
import IllustrationCard from '../components/illustrations/IllustrationCard';
import IllustrationUploadModal from '../components/illustrations/IllustrationUploadModal';

const DentalIllustrations = () => {
    const dispatch = useDispatch();
    const { items, loading, filter, error } = useSelector((state) => state.illustrations);
    const { user } = useSelector((state) => state.auth);

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchIllustrations(filter));
    }, [dispatch, filter]);

    const handleFilterChange = (newFilter) => {
        dispatch(setFilter(newFilter));
    };

    // Permissions
    // Assuming user permissions are stored in user.permissions object
    // Or based on role. Adjust logic as needed.
    const canCreate = user?.role === 'ADMIN' || user?.role === 'DOCTOR' || user?.role === 'CLINIC_ADMIN' || user?.permissions?.ILLUSTRATION?.CREATE;
    const canDelete = user?.role === 'ADMIN' || user?.role === 'CLINIC_ADMIN' || user?.permissions?.ILLUSTRATION?.DELETE;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dental Illustrations</h1>
                    <p className="text-gray-500 mt-1">Educational content and patient references</p>
                </div>

                {canCreate && (
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add New
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <FilterButton
                    label="All"
                    active={filter === 'ALL'}
                    onClick={() => handleFilterChange('ALL')}
                />
                <FilterButton
                    label="Images"
                    icon={<ImageIcon className="w-4 h-4" />}
                    active={filter === 'IMAGE'}
                    onClick={() => handleFilterChange('IMAGE')}
                />
                <FilterButton
                    label="Videos"
                    icon={<Video className="w-4 h-4" />}
                    active={filter === 'VIDEO'}
                    onClick={() => handleFilterChange('VIDEO')}
                />
                <FilterButton
                    label="Embeds"
                    icon={<Link className="w-4 h-4" />}
                    active={filter === 'EMBED'}
                    onClick={() => handleFilterChange('EMBED')}
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            {/* Grid */}
            {loading && items.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="aspect-video bg-gray-200 rounded-xl"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.length > 0 ? (
                        items.map((item) => (
                            <IllustrationCard key={item._id} item={item} canDelete={canDelete} />
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                            <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="font-medium">No illustrations found</p>
                            <p className="text-sm mt-1">Upload a new image or video to get started</p>
                        </div>
                    )}
                </div>
            )}

            {/* Upload Modal */}
            <IllustrationUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
            />

        </div>
    );
};

const FilterButton = ({ label, icon, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${active
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
    >
        {icon}
        {label}
    </button>
);

export default DentalIllustrations;
