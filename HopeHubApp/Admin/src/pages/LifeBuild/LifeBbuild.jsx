import React, { useEffect, useState } from "react";
import "./LifeBbuild.css";

const BASE_URL = "http://localhost:5000";
const EMPTY_FORM = {
  title: "",
  company: "",
  location: "",
  type: "Full-time",
  salary: "",
  recommendedFor: "",
  description: "",
};

function getImageUrl(image) {
  if (!image) return "";
  if (image.startsWith("http") || image.startsWith("data:")) return image;
  return `${BASE_URL}${image}`;
}

function JobOpportunities() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);


  async function fetchJobs() {
    try {
      setLoading(true);

      const response = await fetch(`${BASE_URL}/api/job/all-jobs`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load jobs");
      }

      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
    } catch (error) {
      console.error("Fetch jobs error:", error);
      window.alert(error.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);


  function openModal() {
    setForm(EMPTY_FORM);
    setImageFile(null);
    setPreview("");
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  function openDetails(job) {
    setSelectedJob(job);
  }

  function closeDetails() {
    setSelectedJob(null);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleImageChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }
  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.title.trim() || !form.company.trim()) return;

    try {
      setSubmitting(true);

      const body = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        body.append(key, value);
      });

      if (imageFile) {
        body.append("image", imageFile);
      }

      const response = await fetch(`${BASE_URL}/api/job/add-job`, {
        method: "POST",
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to post job");
      }

      setJobs((prev) => [data.job, ...prev]);
      setIsOpen(false);
    } catch (error) {
      console.error("Post job error:", error);
      window.alert(error.message || "Failed to post job");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <header className="page-topbar">
        <div>
          <h1>Job Opportunities</h1>
          <p>Post openings and match them to the right person.</p>
        </div>
        <button type="button" className="post-job-btn" onClick={openModal}>
          + Post a job
        </button>
      </header>

      <section className="page-body">
        {loading ? (
          <div className="empty-state">
            <p>Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <p>No jobs posted yet.</p>
            <span>Use "Post a job" to add the first opportunity.</span>
          </div>
        ) : (
          <div className="job-grid">
            {jobs.map((job) => (
              <article
                key={job._id}
                className="job-card"
                onClick={() => openDetails(job)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && openDetails(job)}
              >
                <div className="job-card-body">
                  <h3>{job.title}</h3>
                  {job.location && <p className="job-card-company">{job.location}</p>}
                  {job.salary && (
                    <div className="job-card-tags">
                      <span className="job-tag">{job.salary}</span>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Post a job</h2>
              <button type="button" className="modal-close" onClick={closeModal} aria-label="Close">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="job-form">
              <label className="form-field">
                <span>Job image</span>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {preview && <img src={preview} alt="Preview" className="image-preview" />}
              </label>

              <label className="form-field">
                <span>Job title *</span>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Frontend Developer"
                  required
                />
              </label>

              <label className="form-field">
                <span>Company *</span>
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="e.g. Acme Inc."
                  required
                />
              </label>

              <div className="form-row">
                <label className="form-field">
                  <span>Location</span>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Remote, Colombo, ..."
                  />
                </label>

                <label className="form-field">
                  <span>Job type</span>
                  <select name="type" value={form.type} onChange={handleChange}>
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                    <option>Freelance</option>
                  </select>
                </label>
              </div>

              <label className="form-field">
                <span>Salary range</span>
                <input
                  type="text"
                  name="salary"
                  value={form.salary}
                  onChange={handleChange}
                  placeholder="e.g. LKR 150,000 - 200,000"
                />
              </label>

              <label className="form-field">
                <span>Recommended for</span>
                <input
                  type="text"
                  name="recommendedFor"
                  value={form.recommendedFor}
                  onChange={handleChange}
                  placeholder="Skills, experience level, or a specific person"
                />
              </label>

              <label className="form-field">
                <span>Description</span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="What the role involves, requirements, how to apply..."
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Posting..." : "Post job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedJob && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedJob.title}</h2>
              <button type="button" className="modal-close" onClick={closeDetails} aria-label="Close">
                ×
              </button>
            </div>

            {selectedJob.image && (
              <img
                src={getImageUrl(selectedJob.image)}
                alt={selectedJob.title}
                className="job-detail-image"
              />
            )}

            <p className="job-card-company">
              {selectedJob.company}
              {selectedJob.location && ` · ${selectedJob.location}`}
            </p>

            <div className="job-card-tags">
              <span className="job-tag">{selectedJob.type}</span>
              {selectedJob.salary && <span className="job-tag">{selectedJob.salary}</span>}
            </div>

            {selectedJob.description && (
              <p className="job-card-desc">{selectedJob.description}</p>
            )}

            {selectedJob.recommendedFor && (
              <p className="job-card-recommend">
                Good fit for: {selectedJob.recommendedFor}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default JobOpportunities;