import { useNavigate } from "react-router-dom";
import { Construction, ArrowLeft } from "lucide-react";

const PlaceholderPage = ({ title }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-500">
            <div className="w-32 h-32 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-transparent opacity-50"></div>
                <Construction className="w-16 h-16 text-teal-600 relative z-10" />
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight text-center">
                {title}
            </h1>

            <p className="text-gray-500 text-lg max-w-md text-center mb-10 leading-relaxed">
                This module is currently under active development.
                <br className="hidden md:block" />
                Check back soon for the premium experience!
            </p>

            <button
                onClick={() => navigate(-1)} // Go back to previous page
                className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center gap-2 group"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Go Back
            </button>
        </div>
    );
};

export default PlaceholderPage;
