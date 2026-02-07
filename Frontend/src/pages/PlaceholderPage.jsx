const PlaceholderPage = ({ title }) => {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-5xl shadow-sm">
                🚧
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
            <p className="text-gray-500 max-w-md">
                This module is currently under development. Check back soon for updates!
            </p>
        </div>
    );
};

export default PlaceholderPage;
