import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/login_admin/Login";
import Dashboard from "./pages/dashboard_admin/Dashboard";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/admin/login"
          element={<Login />}
        />

        <Route
          path="/admin/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="*"
          element={<Navigate to="/admin/login" />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;