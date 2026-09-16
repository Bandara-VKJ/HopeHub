import React, { useEffect, useState } from "react";
import "./Usermanagement.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const withSkipWarning = (url) => {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}ngrok-skip-browser-warning=true`;
};

const ngrokFetch = (url, options = {}) => {
  const token = localStorage.getItem("adminToken");

  return fetch(withSkipWarning(url), {
    ...options,
    headers: {
      ...(options.headers || {}),
      "ngrok-skip-browser-warning": "true",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
  });
};
function UserManagement() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [patientToDelete, setPatientToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ngrokFetch(`${BASE_URL}/api/counselors/all-patients`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load patients");
      }

      setPatients(data.patients);
    } catch (err) {
      console.error(err);
      setError("Could not load patients. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPatient = async (patientId) => {
    setDetailsLoading(true);
    setSelectedPatient(null);
    try {
      const res = await ngrokFetch(
        `${BASE_URL}/api/counselors/patient/${patientId}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load patient");
      }

      setSelectedPatient(data.patient);
    } catch (err) {
      console.error(err);
      setError("Could not load patient details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => setSelectedPatient(null);

  const requestDelete = (patient) => {

    setPatientToDelete(patient);
  };

  const cancelDelete = () => setPatientToDelete(null);

  const confirmDelete = async () => {
    if (!patientToDelete) return;
    setDeleting(true);
    try {
      const res = await ngrokFetch(
        `${BASE_URL}/api/counselors/patient/${patientToDelete._id}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete patient");
      }

      setPatients((prev) =>
        prev.filter((p) => p._id !== patientToDelete._id)
      );

      if (selectedPatient && selectedPatient._id === patientToDelete._id) {
        setSelectedPatient(null);
      }

      setPatientToDelete(null);
    } catch (err) {
      console.error(err);
      setError("Could not delete patient. Please try again.");
      setPatientToDelete(null);
    } finally {
      setDeleting(false);
    }
  };
  const filteredPatients = patients.filter((patient) => {
  const search = searchTerm.toLowerCase().trim();

    if (!search) return true;

    const firstName = patient.firstName?.toLowerCase() || "";
    const lastName = patient.lastName?.toLowerCase() || "";
    const email = patient.email?.toLowerCase() || "";
    const userId = patient._id?.toLowerCase() || "";

    return (
      firstName.includes(search) ||
      lastName.includes(search) ||
      email.includes(search) ||
      userId.includes(search)
    );
  });
  return (
    <div>
      <header className="page-topbar">
        <h1>User Management</h1>
        <p>Manage patient accounts</p>
      </header>

      <div className="um-search-wrapper">
      <input
        type="text"
        className="um-search-input"
        placeholder="Search by first name, last name, email or user ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {searchTerm && (
        <button
          className="um-search-clear"
          onClick={() => setSearchTerm("")}
        >
          ×
        </button>
      )}
    </div>

      <section className="page-body">
        {error && <div className="um-error">{error}</div>}

        {loading ? (
          <p>Loading patients...</p>
        ) : filteredPatients.length === 0 ? (
          <p>
            {patients.length === 0
              ? "No patients found."
              : "No patients match your search."}
          </p>
        ) : (
          <table className="um-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr
                  key={patient._id}
                  className="um-row"
                  onClick={() => handleViewPatient(patient._id)}
                >
                  <td>
                    {patient.firstName || patient.lastName
                      ? `${patient.firstName || ""} ${patient.lastName || ""}`.trim()
                      : "—"}
                  </td>
                  <td>{patient.email || "—"}</td>
                  <td className="um-actions">
                    <button
                      className="um-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        requestDelete(patient);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Details panel */}
        {(detailsLoading || selectedPatient) && (
          <div className="um-details-overlay" onClick={closeDetails}>
            <div className="um-details-panel" onClick={(e) => e.stopPropagation()}>
              <button className="um-close-btn" onClick={closeDetails}>
                ×
              </button>

              {detailsLoading ? (
                <p>Loading details...</p>
              ) : (
                selectedPatient && (
                  <>
                    <h2>
                      {selectedPatient.firstName || selectedPatient.lastName
                        ? `${selectedPatient.firstName || ""} ${
                            selectedPatient.lastName || ""
                          }`.trim()
                        : "Unnamed Patient"}
                    </h2>
                    <p>
                      <strong>Email:</strong> {selectedPatient.email || "—"}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedPatient.mobile || "—"}
                    </p>
                    <p>
                      <strong>Addiction level:</strong>{" "}
                      {selectedPatient.level || "—"}
                    </p>
                    <p>
                      <strong>Patient ID:</strong> {selectedPatient._id}
                    </p>

                    <button
                      className="um-delete-btn"
                      onClick={() => requestDelete(selectedPatient)}
                    >
                      Delete Patient
                    </button>
                  </>
                )
              )}
            </div>
          </div>
        )}

        {/* Delete confirmation modal */}
        {patientToDelete && (
          <div className="um-confirm-overlay">
            <div className="um-confirm-box">
              <h3>Delete patient?</h3>
              <p>
                Are you sure you want to delete{" "}
                <strong>{patientToDelete.firstName || "this patient"}</strong>?
                This action cannot be undone.
              </p>
              <div className="um-confirm-actions">
                <button
                  className="um-cancel-btn"
                  onClick={cancelDelete}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="um-confirm-delete-btn"
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default UserManagement;