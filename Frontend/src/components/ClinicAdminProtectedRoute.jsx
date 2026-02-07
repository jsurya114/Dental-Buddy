import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ClinicAdminProtectedRoute = ({ children }) => {
    const { isAuthenticated, token } = useSelector((state) => state.clinicAdmin);

    if (!isAuthenticated || !token) {
        return <Navigate to="/clinic-admin/login" replace />;
    }

    return children;
};

export default ClinicAdminProtectedRoute;
