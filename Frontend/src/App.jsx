import { useEffect } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkSession } from "./redux/authSlice";

// Public pages
import RoleSelection from "./pages/RoleSelection";
import Login from "./pages/Login";

// AppShell and protected route
import AppShell from "./app/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import DashboardRouter from "./app/DashboardRouter";

// Management pages
import RoleManagement from "./pages/RoleManagement";
import RoleCreate from "./pages/RoleCreate";
import RoleEdit from "./pages/RoleEdit";
import UserManagement from "./pages/UserManagement";
import UserCreate from "./pages/UserCreate";
import UserEdit from "./pages/UserEdit";
import PatientList from "./pages/PatientList";
import PatientCreate from "./pages/PatientCreate";
import PatientProfile from "./pages/PatientProfile";
import PatientEdit from "./pages/PatientEdit";
import PlaceholderPage from "./pages/PlaceholderPage";
import ReportsDashboard from "./pages/ReportsDashboard";
import AppointmentsDashboard from "./pages/AppointmentsDashboard";
import CaseSheets from "./pages/CaseSheets";
import Prescriptions from "./pages/Prescriptions";
import Imaging from "./pages/Imaging";
import Billing from "./pages/Billing";

function App() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkSession());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Routes>


      {/* Entry Point - Role Selection */}
      <Route
        path="/"
        element={
          <PublicOnlyRoute>
            <RoleSelection />
          </PublicOnlyRoute>
        }
      />

      {/* Unified Login Route */}
      <Route
        path="/login/:role"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />


      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        {/* Dashboard - Role-based routing */}
        <Route path="dashboard" element={<DashboardRouter />} />

        {/* Role Management */}
        <Route path="roles" element={<RoleManagement />} />
        <Route path="roles/create" element={<RoleCreate />} />
        <Route path="roles/edit/:id" element={<RoleEdit />} />

        {/* User Management */}
        <Route path="users" element={<UserManagement />} />
        <Route path="users/create" element={<UserCreate />} />
        <Route path="users/edit/:id" element={<UserEdit />} />

        {/* Patient Management */}
        <Route path="patients" element={<PatientList />} />
        <Route path="patients/create" element={<PatientCreate />} />
        <Route path="patients/:id" element={<PatientProfile />} />
        <Route path="patients/:id/edit" element={<PatientEdit />} />

        {/* Placeholder routes for future pages */}
        <Route path="appointments" element={<AppointmentsDashboard />} />
        <Route path="case-sheets" element={<CaseSheets />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="billing" element={<Billing />} />
        <Route path="imaging" element={<Imaging />} />
        <Route path="reports" element={<ReportsDashboard />} />

        {/* Default redirect within /app */}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>


      <Route path="/clinic-admin/dashboard" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/clinic-admin/roles" element={<Navigate to="/app/roles" replace />} />
      <Route path="/clinic-admin/roles/create" element={<Navigate to="/app/roles/create" replace />} />
      <Route path="/clinic-admin/roles/edit/:id" element={<RedirectHelper base="/app/roles/edit" />} />
      <Route path="/clinic-admin/users" element={<Navigate to="/app/users" replace />} />
      <Route path="/clinic-admin/users/create" element={<Navigate to="/app/users/create" replace />} />
      <Route path="/clinic-admin/users/edit/:id" element={<RedirectHelper base="/app/users/edit" />} />

      {/* Redirect old dashboard routes */}
      <Route path="/app/admin/dashboard" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/app/doctor/dashboard" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/app/reception/dashboard" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/app/billing/dashboard" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/app/common/dashboard" element={<Navigate to="/app/dashboard" replace />} />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * Helper to preserve route parameters during redirect
 */
const RedirectHelper = ({ base }) => {
  const { id } = useParams();
  if (!id) return <Navigate to={base.replace("/edit", "")} replace />;
  return <Navigate to={`${base}/${id}`} replace />;
};

export default App;
