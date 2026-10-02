import React, {
  useEffect,
  useState,
} from "react";

import {
  FaTrash,
} from "react-icons/fa";

import "./Counselormanagement.css";


const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


function CounselorManagement() {

  const [
    counselors,
    setCounselors,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    actionLoading,
    setActionLoading,
  ] = useState(null);


  // ==========================================================
  // LOAD COUNSELORS
  // ==========================================================

  const fetchCounselors =
    async () => {

      try {

        setLoading(true);


        const response =
          await fetch(
            `${BASE_URL}/api/counselors/admin/all`
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Failed to load counselors"
          );

        }


        setCounselors(
          Array.isArray(
            data.counselors
          )
            ? data.counselors
            : []
        );


      } catch (error) {

        console.error(
          "Fetch counselors error:",
          error
        );


        window.alert(
          error.message ||
          "Failed to load counselors"
        );


      } finally {

        setLoading(false);

      }

    };


  useEffect(() => {

    fetchCounselors();

  }, []);


  // ==========================================================
  // ACCESS / APPROVE
  // ==========================================================

  const handleApprove =
    async (id) => {

      const confirmed =
        window.confirm(
          "Give this counselor access to the system?"
        );


      if (!confirmed) {
        return;
      }


      try {

        setActionLoading(id);


        const response =
          await fetch(
            `${BASE_URL}/api/counselors/admin/${id}/approve`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Failed to approve counselor"
          );

        }


        setCounselors(
          previous =>

            previous.map(
              counselor =>

                counselor._id === id

                  ? {
                      ...counselor,

                      approvalStatus:
                        "approved",

                      approvedAt:
                        new Date().toISOString(),

                      rejectedAt:
                        null,
                    }

                  : counselor
            )
        );


        window.alert(
          "Counselor access approved successfully."
        );


      } catch (error) {

        console.error(
          "Approve counselor error:",
          error
        );


        window.alert(
          error.message ||
          "Failed to approve counselor"
        );


      } finally {

        setActionLoading(null);

      }

    };


  // ==========================================================
  // CANCEL / REJECT
  // ==========================================================

  const handleReject =
    async (id) => {

      const confirmed =
        window.confirm(
          "Cancel this counselor's access?"
        );


      if (!confirmed) {
        return;
      }


      try {

        setActionLoading(id);


        const response =
          await fetch(
            `${BASE_URL}/api/counselors/admin/${id}/reject`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Failed to cancel counselor access"
          );

        }


        setCounselors(
          previous =>

            previous.map(
              counselor =>

                counselor._id === id

                  ? {
                      ...counselor,

                      approvalStatus:
                        "rejected",

                      rejectedAt:
                        new Date().toISOString(),

                      approvedAt:
                        null,
                    }

                  : counselor
            )
        );


        window.alert(
          "Counselor access cancelled successfully."
        );


      } catch (error) {

        console.error(
          "Cancel counselor error:",
          error
        );


        window.alert(
          error.message ||
          "Failed to cancel counselor access"
        );


      } finally {

        setActionLoading(null);

      }

    };


  // ==========================================================
  // DELETE COUNSELOR ACCOUNT
  // ==========================================================

  const handleDelete =
    async (
      id,
      counselorName
    ) => {

      const confirmed =
        window.confirm(
          `Are you sure you want to permanently delete ${
            counselorName ||
            "this counselor"
          }'s account from the HopeHub System?`
        );


      if (!confirmed) {
        return;
      }


      try {

        setActionLoading(id);


        const response =
          await fetch(
            `${BASE_URL}/api/counselors/admin/${id}`,
            {
              method: "DELETE",

              headers: {
                "Content-Type":
                  "application/json",
              },
            }
          );


        let data = {};


        try {

          data =
            await response.json();

        } catch {

          data = {};

        }


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Failed to delete counselor account"
          );

        }


        setCounselors(
          previous =>

            previous.filter(
              counselor =>
                counselor._id !== id
            )
        );


        window.alert(
          "Counselor account deleted successfully from the HopeHub System."
        );


      } catch (error) {

        console.error(
          "Delete counselor error:",
          error
        );


        window.alert(
          error.message ||
          "Failed to delete counselor account."
        );


      } finally {

        setActionLoading(null);

      }

    };


  // ==========================================================
  // STATUS CLASS
  // ==========================================================

  const getStatusClass =
    (status) => {

      if (
        status ===
        "approved"
      ) {

        return "status-approved";

      }


      if (
        status ===
        "rejected"
      ) {

        return "status-rejected";

      }


      return "status-pending";

    };


  // ==========================================================
  // DISPLAY STATUS
  // ==========================================================

  const getStatusText =
    (status) => {

      if (
        status ===
        "approved"
      ) {

        return "Approved";

      }


      if (
        status ===
        "rejected"
      ) {

        return "Rejected";

      }


      return "Pending";

    };


  return (

    <div
      className="counselor-management"
    >

      {/* HEADER */}

      <header
        className="page-topbar"
      >

        <h1>
          Counselor Management
        </h1>


        <p>
          Manage counselor accounts
        </p>

      </header>


      <section
        className="page-body"
      >

        {/* PAGE HEADER */}

        <div
          className="management-header"
        >

          <div>

            <h2>
              Counselor Requests
            </h2>


            <p>
              Review counselor registrations
              and control counselor access.
            </p>

          </div>


          <button
            className="refresh-button"

            onClick={
              fetchCounselors
            }
          >

            Refresh

          </button>

        </div>


        {/* LOADING */}

        {loading ? (

          <div
            className="loading-box"
          >

            Loading counselors...

          </div>

        ) : counselors.length ===
          0 ? (

          <div
            className="empty-box"
          >

            <h3>
              No Counselor Requests
            </h3>


            <p>
              No counselor registrations
              were found.
            </p>

          </div>

        ) : (

          <div
            className="counselor-grid"
          >

            {counselors.map(
              counselor => (

                <div
                  className="counselor-card"

                  key={
                    counselor._id
                  }
                >

                  {/* TOP */}

                  <div
                    className="card-top"
                  >

                    <div
                      className="avatar"
                    >

                      {
                        counselor.avatar ||
                        `${counselor.firstName?.charAt(
                          0
                        ) || ""}${counselor.lastName?.charAt(
                          0
                        ) || ""}`
                      }

                    </div>


                    <div
                      className="counselor-main-info"
                    >

                      <h3>

                        {
                          counselor.name ||
                          `${counselor.firstName || ""} ${
                            counselor.lastName || ""
                          }`
                        }

                      </h3>


                      <p>

                        {
                          counselor.title ||
                          "Professional Counselor"
                        }

                      </p>

                    </div>


                    <span

                      className={
                        `status-badge ${getStatusClass(
                          counselor.approvalStatus
                        )}`
                      }
                    >

                      {
                        getStatusText(
                          counselor.approvalStatus
                        )
                      }

                    </span>

                  </div>


                  {/* DETAILS */}

                  <div
                    className="details"
                  >

                    <div
                      className="detail-row"
                    >

                      <span
                        className="detail-label"
                      >
                        Email
                      </span>


                      <span>
                        {
                          counselor.email
                        }
                      </span>

                    </div>


                    <div
                      className="detail-row"
                    >

                      <span
                        className="detail-label"
                      >
                        Mobile
                      </span>


                      <span>

                        {
                          counselor.mobile ||
                          "Not provided"
                        }

                      </span>

                    </div>


                    <div
                      className="detail-row"
                    >

                      <span
                        className="detail-label"
                      >
                        Title
                      </span>


                      <span>

                        {
                          counselor.title ||
                          "Not provided"
                        }

                      </span>

                    </div>


                    <div
                      className="detail-row"
                    >

                      <span
                        className="detail-label"
                      >
                        Specialty
                      </span>


                      <span>

                        {
                          counselor.specialty ||
                          "Not provided"
                        }

                      </span>

                    </div>


                    <div
                      className="detail-row"
                    >

                      <span
                        className="detail-label"
                      >
                        Experience
                      </span>


                      <span>

                        {
                          counselor.experience ||
                          "Not provided"
                        }

                      </span>

                    </div>


                    <div
                      className="detail-row"
                    >

                      <span
                        className="detail-label"
                      >
                        Availability
                      </span>


                      <span>

                        {
                          counselor.availability ||
                          "Not provided"
                        }

                      </span>

                    </div>


                    <div
                      className="detail-row"
                    >

                      <span
                        className="detail-label"
                      >
                        Registered
                      </span>


                      <span>

                        {
                          counselor.createdAt

                            ? new Date(
                                counselor.createdAt
                              ).toLocaleDateString()

                            : "N/A"
                        }

                      </span>

                    </div>

                  </div>


                  {/* BUTTONS */}

                  <div
                    className="card-actions"
                  >

                    {/* ACCESS */}

                    <button

                      className="access-button"

                      disabled={
                        actionLoading ===
                          counselor._id ||
                        counselor.approvalStatus ===
                          "approved"
                      }

                      onClick={() =>
                        handleApprove(
                          counselor._id
                        )
                      }
                    >

                      {
                        actionLoading ===
                        counselor._id

                          ? "Processing..."

                          : counselor.approvalStatus ===
                            "approved"

                          ? "Access Granted"

                          : "Access"
                      }

                    </button>


                    {/* CANCEL */}

                    <button

                      className="cancel-button"

                      disabled={
                        actionLoading ===
                          counselor._id ||
                        counselor.approvalStatus ===
                          "rejected"
                      }

                      onClick={() =>
                        handleReject(
                          counselor._id
                        )
                      }
                    >

                      {
                        actionLoading ===
                        counselor._id

                          ? "Processing..."

                          : counselor.approvalStatus ===
                            "rejected"

                          ? "Cancelled"

                          : "Cancel"
                      }

                    </button>


                    {/* DELETE */}

                    <button

                      className="delete-button"

                      title=
                        "Delete counselor account"

                      disabled={
                        actionLoading ===
                        counselor._id
                      }

                      onClick={() =>
                        handleDelete(
                          counselor._id,

                          counselor.name ||
                            `${counselor.firstName || ""} ${
                              counselor.lastName || ""
                            }`.trim()
                        )
                      }
                    >

                      <FaTrash />

                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>

    </div>
  );
}


export default CounselorManagement;