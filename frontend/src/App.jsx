import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import CompleteProfilePage from "./pages/CompleteProfilePage";
import Dashboard from "./pages/Dashboard"; 
import UpdateResumePage from "./pages/UpdateResumePage";
import UpdateDetailsPage from "./pages/UpdateDetailsPage";
import ResumeAnalysisPage from "./pages/ResumeAnalysisPage";
import InterviewPrepPage from "./pages/InterviewPrepPage";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/complete-profile" element={<CompleteProfilePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analysis" element={<ResumeAnalysisPage />} />
            <Route path="/interview" element={<InterviewPrepPage />} />
            <Route path="/update-resume" element={<UpdateResumePage />} />
            <Route path="/update-details" element={<UpdateDetailsPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;
