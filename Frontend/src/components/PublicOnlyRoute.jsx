import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getDashboardRoute } from "../config/roleDashboardMap";

const PublicOnlyRoute = ({ children }) => {
    const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

    if (loading) {
        // Optional: Render nothing or a spinner while checking session
        return null;
    }

    if (isAuthenticated && user) {
        const role = user.role || user.roleCode;
        const dashboardRoute = getDashboardRoute(role);
        return <Navigate to={dashboardRoute} replace />;
    }

    return children;
};

export default PublicOnlyRoute;
