import React from "react";
import "./Usermanagement.css";

function UserManagement() {
  return (
    <div>
      <header className="page-topbar">
        <h1>User Management</h1>
        <p>Manage patient accounts</p>
      </header>
      <section className="page-body">
        {/* TODO: user list, search, edit/suspend actions, etc. */}
        <p>User management content goes here.</p>
      </section>
    </div>
  );
}

export default UserManagement;