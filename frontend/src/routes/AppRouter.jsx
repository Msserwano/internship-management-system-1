
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";

// Auth pages
import LoginPage      from "../pages/auth/LoginPage";
import RegisterPage   from "../pages/auth/RegisterPage";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword  from "../pages/auth/ResetPassword";

// Applicant pages
import ApplicantDashboard   from "../pages/applicant/Dashboard";
import AvailableInternships from "../pages/applicant/AvailableInternships";
import MyApplications       from "../pages/applicant/MyApplications";
import ApplyWizard          from "../pages/applicant/ApplyWizard";
import InterviewSchedule    from "../pages/applicant/InterviewSchedule";
import Documents            from "../pages/applicant/Documents";
import ApplicantProfile     from "../pages/applicant/Profile";
import ApplicantSettings    from "../pages/applicant/Settings";
import ApplicantNotifications from "../pages/applicant/Notifications";
import EvaluationPage from "../pages/applicant/Evaluation";

// HR pages
import HRDashboard     from "../pages/hr/Dashboard";
import HRInternships   from "../pages/hr/Internships";
import HRApplications  from "../pages/hr/Applications";
import HRNotifications from "../pages/hr/Notifications";
import HRApplicants    from "../pages/hr/Applicants";
import HRDepartments   from "../pages/hr/Departments";
import HRInterviews    from "../pages/hr/Interviews";
import HRReports       from "../pages/hr/Reports";
import HRUsers         from "../pages/hr/Users";
import HRSettings      from "../pages/hr/Settings";
import HREvaluations   from "../pages/hr/Evaluations";

// Admin pages
import AdminDashboard      from "../pages/admin/Dashboard";
import AdminUsers          from "../pages/admin/Users";
import AdminRoles          from "../pages/admin/Roles";
import AdminDepartments    from "../pages/admin/Departments";
import AdminAuditLogs      from "../pages/admin/AuditLogs";
import AdminSettings       from "../pages/admin/Settings";
import AdminNotifications  from "../pages/admin/Notifications";

// ---------------------------------------------------------------------------
// Role-based redirect helper
// ---------------------------------------------------------------------------
// Role-based redirect helper
// ---------------------------------------------------------------------------
const roleDashboard = (role) => {
  const normRole = role ? String(role).toLowerCase() : "";
  const map = { applicant: "/applicant/dashboard", hr: "/hr/dashboard", admin: "/admin/dashboard" };
  return map[normRole] || "/login";
};

// ---------------------------------------------------------------------------
// ProtectedRoute — redirects to /login when unauthenticated
// ---------------------------------------------------------------------------
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const userRole = user.role ? String(user.role).toLowerCase() : "";
  if (allowedRoles && !allowedRoles.map(r => r.toLowerCase()).includes(userRole)) {
    return <Navigate to={roleDashboard(userRole)} replace />;
  }

  return children;
};

// ---------------------------------------------------------------------------
// PublicRoute — redirects authenticated users to their dashboard
// ---------------------------------------------------------------------------
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    const target = roleDashboard(user.role);
    if (target !== "/login") {
      return <Navigate to={target} replace />;
    }
  }
  return children;
};

// ---------------------------------------------------------------------------
// App Router
// ---------------------------------------------------------------------------
const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* Root — redirect to login (no landing page for an internal system) */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public auth routes */}
      <Route path="/login"           element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register"        element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password"  element={<ResetPassword />} />

      {/* Applicant routes */}
      <Route path="/applicant" element={<ProtectedRoute allowedRoles={["applicant"]}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<ApplicantDashboard />} />
        <Route path="internships"   element={<AvailableInternships />} />
        <Route path="applications"  element={<MyApplications />} />
        <Route path="apply"         element={<ApplyWizard />} />
        <Route path="apply/:id"     element={<ApplyWizard />} />
        <Route path="interviews"    element={<InterviewSchedule />} />
        <Route path="documents"     element={<Documents />} />
        <Route path="profile"       element={<ApplicantProfile />} />
        <Route path="settings"      element={<ApplicantSettings />} />
        <Route path="notifications" element={<ApplicantNotifications />} />
        <Route path="evaluation"    element={<EvaluationPage />} />
      </Route>

      {/* HR routes */}
      <Route path="/hr" element={<ProtectedRoute allowedRoles={["hr"]}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<HRDashboard />} />
        <Route path="internships"   element={<HRInternships />} />
        <Route path="applications"  element={<HRApplications />} />
        <Route path="notifications" element={<HRNotifications />} />
        <Route path="applicants"    element={<HRApplicants />} />
        <Route path="departments"   element={<HRDepartments />} />
        <Route path="interviews"    element={<HRInterviews />} />
        <Route path="reports"       element={<HRReports />} />
        <Route path="users"         element={<HRUsers />} />
        <Route path="settings"      element={<HRSettings />} />
        <Route path="evaluations"   element={<HREvaluations />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<AdminDashboard />} />
        <Route path="users"         element={<AdminUsers />} />
        <Route path="roles"         element={<AdminRoles />} />
        <Route path="departments"   element={<AdminDepartments />} />
        <Route path="audit-logs"    element={<AdminAuditLogs />} />
        <Route path="settings"      element={<AdminSettings />} />
        <Route path="notifications" element={<AdminNotifications />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
