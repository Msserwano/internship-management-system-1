// src/routes/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

// Layouts
import DashboardLayout from "../components/layout/DashboardLayout";

// Public pages
import LandingPage      from "../pages/landing/LandingPage";
import LoginPage        from "../pages/auth/LoginPage";
import RegisterPage     from "../pages/auth/RegisterPage";
import ForgotPassword   from "../pages/auth/ForgotPassword";
import ResetPassword    from "../pages/auth/ResetPassword";
import EmailVerification from "../pages/auth/EmailVerification";

// Applicant pages
import ApplicantDashboard   from "../pages/applicant/Dashboard";
import AvailableInternships from "../pages/applicant/AvailableInternships";
import MyApplications       from "../pages/applicant/MyApplications";
import ApplyWizard          from "../pages/applicant/ApplyWizard";
import InterviewSchedule    from "../pages/applicant/InterviewSchedule";
import Documents            from "../pages/applicant/Documents";
import Messages             from "../pages/applicant/Messages";
import ApplicantProfile     from "../pages/applicant/Profile";
import ApplicantSettings    from "../pages/applicant/Settings";
import Notifications        from "../pages/applicant/Notifications";

// HR pages
import HRDashboard      from "../pages/hr/Dashboard";
import HRInternships    from "../pages/hr/Internships";
import HRApplications   from "../pages/hr/Applications";
import HRApplicants     from "../pages/hr/Applicants";
import HRDepartments    from "../pages/hr/Departments";
import HRInterviews     from "../pages/hr/Interviews";
import HRReports        from "../pages/hr/Reports";
import HRUsers          from "../pages/hr/Users";
import HRSettings       from "../pages/hr/Settings";

// Admin pages
import AdminDashboard   from "../pages/admin/Dashboard";
import AdminUsers       from "../pages/admin/Users";
import AdminRoles       from "../pages/admin/Roles";
import AdminDepartments from "../pages/admin/Departments";
import AdminAuditLogs   from "../pages/admin/AuditLogs";
import AdminSettings    from "../pages/admin/Settings";
import AdminNotifications from "../pages/admin/Notifications";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirects = { applicant:"/applicant/dashboard", hr:"/hr/dashboard", admin:"/admin/dashboard" };
    return <Navigate to={redirects[user.role] || "/login"} replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    const redirects = { applicant:"/applicant/dashboard", hr:"/hr/dashboard", admin:"/admin/dashboard" };
    return <Navigate to={redirects[user.role] || "/applicant/dashboard"} replace />;
  }
  return children;
};

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login"             element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register"          element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password"   element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password"    element={<ResetPassword />} />
      <Route path="/verify-email"      element={<EmailVerification />} />

      {/* Applicant */}
      <Route path="/applicant" element={<ProtectedRoute allowedRoles={["applicant"]}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"      element={<ApplicantDashboard />} />
        <Route path="internships"    element={<AvailableInternships />} />
        <Route path="applications"   element={<MyApplications />} />
        <Route path="apply/:id"      element={<ApplyWizard />} />
        <Route path="interviews"     element={<InterviewSchedule />} />
        <Route path="documents"      element={<Documents />} />
        <Route path="messages"       element={<Messages />} />
        <Route path="profile"        element={<ApplicantProfile />} />
        <Route path="settings"       element={<ApplicantSettings />} />
        <Route path="notifications"  element={<Notifications />} />
      </Route>

      {/* HR */}
      <Route path="/hr" element={<ProtectedRoute allowedRoles={["hr"]}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"    element={<HRDashboard />} />
        <Route path="internships"  element={<HRInternships />} />
        <Route path="applications" element={<HRApplications />} />
        <Route path="applicants"   element={<HRApplicants />} />
        <Route path="departments"  element={<HRDepartments />} />
        <Route path="interviews"   element={<HRInterviews />} />
        <Route path="reports"      element={<HRReports />} />
        <Route path="users"        element={<HRUsers />} />
        <Route path="settings"     element={<HRSettings />} />
      </Route>

      {/* Admin */}
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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);
export default AppRouter;
