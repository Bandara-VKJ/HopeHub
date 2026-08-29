import React from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    // clear whatever you store on login (token, admin info, etc.)
    localStorage.removeItem("adminToken");

    navigate("/admin/login", { replace: true });
  };

  return (
    <div>
      <header className="page-topbar">
        <h1>Profile</h1>
        <p>Admin profile settings</p>
      </header>
      <section className="page-body">
        {/* TODO: admin profile form */}
        <p>Profile settings content goes here.</p>

        <button className="signout-btn" onClick={handleSignOut}>
          Sign Out
        </button>
      </section>
    </div>
  );
}

export default Profile;