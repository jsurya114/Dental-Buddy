import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";


const ProtectedRoute = ({ children }) => {
   
    const authState = useSelector((state) => state.auth);
    const clinicAdminState = useSelector((state) => state.clinicAdmin);

    const isAuthenticated = authState.isAuthenticated || clinicAdminState?.isAuthenticated;

    // Not authenticated - redirect to role selection
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
