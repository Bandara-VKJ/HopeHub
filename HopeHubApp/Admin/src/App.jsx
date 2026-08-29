import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/Layout/Layout";
import Login from "./pages/login_admin/Login"; // adjust filename to match what's actually inside login_admin
import UserManagement from "./pages/Usermanagement/Usermanagement";
import CounselorManagement from "./pages/Counselormanagement/Counselormanagement";
import LifeRebuild from "./pages/LifeBuild/LifeBbuild";
import Profile from "./pages/Profile/Profile";
import Dashboard from "./pages/dashboard_admin/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login is standalone — no sidebar, so keep it OUTSIDE Layout */}
        <Route path="/admin/login" element={<Login />} />

        <Route element={<Layout />}>
          {/* one root redirect only */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/counselors" element={<CounselorManagement />} />
          <Route path="/life-rebuild" element={<LifeRebuild />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;