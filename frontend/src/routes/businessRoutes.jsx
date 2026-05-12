import React from "react";
import { Route } from "react-router-dom";
import BusinessLayout from "../pages/business/BusinessLayout";
import BusinessDashboard from "../pages/business/BusinessDashboard";
import BusinessProjectsPage from "../pages/business/BusinessProjectsPage";
import BusinessFundingPage from "../pages/business/BusinessFundingPage";
import BusinessInvestorsPage from "../pages/business/BusinessInvestorsPage";
import BusinessESGPage from "../pages/business/BusinessESGPage";
import BusinessReportsPage from "../pages/business/BusinessReportsPage";

// Dán block này vào trong <Routes> của App.jsx
export default function BusinessRoutes() {
  return (
    <Route path="/business" element={<BusinessLayout />}>
      <Route index element={<BusinessDashboard />} />
      <Route path="projects" element={<BusinessProjectsPage />} />
      <Route path="funding" element={<BusinessFundingPage />} />
      <Route path="investors" element={<BusinessInvestorsPage />} />
      <Route path="esg" element={<BusinessESGPage />} />
      <Route path="reports" element={<BusinessReportsPage />} />
    </Route>
  );
}

// Nếu App.jsx không cho import component này, dùng trực tiếp:
// <Route path="/business" element={<BusinessLayout />}>
//   <Route index element={<BusinessDashboard />} />
//   <Route path="projects" element={<BusinessProjectsPage />} />
//   <Route path="funding" element={<BusinessFundingPage />} />
//   <Route path="investors" element={<BusinessInvestorsPage />} />
//   <Route path="esg" element={<BusinessESGPage />} />
//   <Route path="reports" element={<BusinessReportsPage />} />
// </Route>
