import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import ChatPage from "./pages/chat/ChatPage";
import SmartBotPage from "./pages/chatbot/SmartBotPage";
import ProtectedRoute from "./routes/ProtectedRoute";

// Admin
import AdminFinancialFeasibilityPage from "./pages/admin/AdminFinancialFeasibilityPage";
import AdminAuditLogsPage from "./pages/admin/AdminAuditLogsPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProjectsPage from "./pages/admin/AdminProjectsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminSystemSettingsPage from "./pages/admin/AdminSystemSettingsPage";
import AdminApprovalWorkflowPage from "./pages/admin/AdminApprovalWorkflowPage";
import AdminKYCPage from "./pages/admin/AdminKYCPage";
import AdminAIAssistantPage from "./pages/admin/AdminAIAssistantPage";
import AdminFraudDetectionPage from "./pages/admin/AdminFraudDetectionPage";
import AdminModerationPage from "./pages/admin/AdminModerationPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
// Investor
import InvestorAIPage from "./pages/investor/InvestorAIPage";
import InvestorChatPage from "./pages/investor/InvestorChatPage";
import InvestorFundingPage from "./pages/investor/InvestorFundingPage";
import InvestorFavoritesPage from "./pages/investor/InvestorFavoritesPage";
import InvestorInterestsPage from "./pages/investor/InvestorInterestsPage";
import InvestorProjectDetail from "./pages/investor/InvestorProjectDetail";
import InvestorLayout from "./pages/investor/InvestorLayout";
import InvestorProjectsPage from "./pages/investor/InvestorProjectsPage";
import InvestorDashboard from "./pages/investor/InvestorDashboard";
// Business
import GreenCreditScorePage from "./pages/business/GreenCreditScorePage";
import BusinessLayout from "./pages/business/BusinessLayout";
import BusinessDashboard from "./pages/business/BusinessDashboard";
import BusinessProjectsPage from "./pages/business/BusinessProjectsPage";
import BusinessFundingPage from "./pages/business/BusinessFundingPage";
import BusinessInvestorsPage from "./pages/business/BusinessInvestorsPage";
import BusinessESGPage from "./pages/business/BusinessESGPage";
import BusinessReportsPage from "./pages/business/BusinessReportsPage";
import BusinessProjectFormPage from "./pages/business/BusinessProjectFormPage";
import BusinessDocumentsPage from "./pages/business/BusinessDocumentsPage";
import BusinessProjectDetailPage from "./pages/business/BusinessProjectDetailPage";
import BusinessAnalyticsPage from "./pages/business/BusinessAnalyticsPage";
import BusinessAIPage from "./pages/business/BusinessAIPage";
import BusinessInvestorMatchingPage from "./pages/business/BusinessInvestorMatchingPage";
import BusinessAIToolsPage from "./pages/business/BusinessAIToolsPage";
import BusinessInvestmentRequestsPage from "./pages/business/BusinessInvestmentRequestsPage";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        {/* Admin */}
       <Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<AdminDashboard />} />
  <Route path="projects" element={<AdminProjectsPage />} />
  <Route path="users" element={<AdminUsersPage />} />
  <Route path="reports" element={<AdminReportsPage />} />
  <Route path="moderation" element={<AdminModerationPage />} />
  <Route path="analytics" element={<AdminAnalyticsPage />} />
  <Route path="financial-feasibility" element={<AdminFinancialFeasibilityPage />} />
  <Route path="system-settings" element={<AdminSystemSettingsPage />} />
  <Route path="approval-workflow" element={<AdminApprovalWorkflowPage />} />
  <Route path="kyc" element={<AdminKYCPage />} />
  <Route path="fraud-detection" element={<AdminFraudDetectionPage />} />
  <Route path="audit-logs" element={<AdminAuditLogsPage />} />
  <Route path="ai-assistant" element={<AdminAIAssistantPage />} />
</Route>

       {/* Investor */}
<Route
  path="/investor"
  element={
    <ProtectedRoute allowedRoles={["investor"]}>
      <InvestorLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<InvestorDashboard />} />
  <Route path="projects/:id" element={<InvestorProjectDetail />} />
  <Route path="projects" element={<InvestorProjectsPage />} />
  <Route path="favorites" element={<InvestorFavoritesPage />} />
  <Route path="funding" element={<InvestorFundingPage />} />
  <Route path="interests" element={<InvestorInterestsPage />} />
  <Route path="chat" element={<InvestorChatPage />} />
  <Route path="ai" element={<InvestorAIPage />} />
</Route>

        {/* Business (nested routes) */}
        <Route
          path="/business"
          element={
            <ProtectedRoute allowedRoles={["business"]}>
              <BusinessLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<BusinessDashboard />} />
          <Route path="projects" element={<BusinessProjectsPage />} />
          <Route path="funding" element={<BusinessFundingPage />} />
          <Route path="investors" element={<BusinessInvestorsPage />} />
          <Route path="esg" element={<BusinessESGPage />} />
          <Route path="reports" element={<BusinessReportsPage />} />
          <Route path="projects/create" element={<BusinessProjectFormPage />} />
          <Route path="documents" element={<BusinessDocumentsPage />} />
          <Route path="projects/:id/edit" element={<BusinessProjectFormPage />} />
          <Route path="analytics" element={<BusinessAnalyticsPage />} />
          <Route path="projects/:id" element={<BusinessProjectDetailPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="investor-matching" element={<BusinessInvestorMatchingPage />} />
          <Route path="ai-tools" element={<BusinessAIToolsPage />} />
          <Route path="investment-requests" element={<BusinessInvestmentRequestsPage />} />
          <Route path="ai" element={<BusinessAIToolsPage />} />
          <Route path="green-credit-score" element={<GreenCreditScorePage />} />
        </Route>
<Route path="chat" element={<InvestorChatPage />} />       
<Route path="chat" element={<ChatPage mode="business" />} />        <Route path="/smart-bot" element={<SmartBotPage />} />
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}