import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

/**
 * AppShell - Main layout wrapper
 * Updated for responsiveness with mobile drawer state
 */
const AppShell = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="flex h-screen bg-sky-50 overflow-hidden font-sans text-gray-800">
            {/* Sidebar with mobile drawer state */}
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:pl-64">
                <Header onToggleSidebar={toggleSidebar} />

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto scroll-smooth">
                    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full animate-fade-in">
                        <Outlet />
                    </div>

                    {/* Footer */}
                    <footer className="py-6 text-center text-xs text-sky-900/40 mt-auto">
                        <p>© {new Date().getFullYear()} <span className="text-sky-700 font-semibold">Dental Buddy</span>. All rights reserved.</p>
                        <p className="mt-1 font-medium">Professional Practice Management v2.0</p>
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default AppShell;
