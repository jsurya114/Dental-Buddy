import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

/**
 * AppShell - Protected layout wrapper for the entire application
 * 
 * This is the main container that wraps all authenticated pages.
 * It provides:
 * - Persistent sidebar navigation
 * - Header with user info
 * - Content area via Outlet for nested routes
 */
const AppShell = () => {
    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <Header />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 py-3 text-center">
                    <p className="text-gray-500 text-sm font-medium">
                        <span className="text-indigo-600">Dental Buddy</span>
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default AppShell;
