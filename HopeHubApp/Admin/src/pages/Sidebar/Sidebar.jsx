import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const NAV_ITEMS = [
  { path: "/users", label: "User Management" },
  { path: "/counselors", label: "Counselor Management" },
  { path: "/life-rebuild", label: "Life Rebuild" },
  { path: "/profile", label: "Profile" },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>HopeHub</h2>
        <span className="sidebar-subtitle">Admin Panel</span>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? "active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;