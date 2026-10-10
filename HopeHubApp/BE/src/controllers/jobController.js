import Job from "../models/job.js";

// CREATE JOB
export const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      type,
      salary,
      recommendedFor,
      description,
    } = req.body;

    if (!title?.trim() || !company?.trim()) {
      return res.status(400).json({
        message: "Job title and company are required",
      });
    }

    let image = req.body.image || "";

    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const job = await Job.create({
      image,
      title,
      company,
      location,
      type,
      salary,
      recommendedFor,
      description,
    });

    res.status(201).json({
      message: "Job posted successfully",
      job,
    });
  } catch (error) {
    console.log("createJob error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors)
          .map((err) => err.message)
          .join(", "),
      });
    }

    res.status(500).json({
      message: "Error posting job",
    });
  }
};

// GET ALL JOBS
export const getJobs = async (req, res) => {
  try {
    const { type, search } = req.query;

    const filter = { isActive: true };

    if (type) {
      filter.type = type;
    }

    if (search) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");

      filter.$or = [{ title: regex }, { company: regex }, { location: regex }];
    }

    const jobs = await Job.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.log("getJobs error:", error);

    res.status(500).json({
      message: "Error fetching jobs",
    });
  }
};


export const getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    res.status(200).json({ job });
  } catch (error) {
    console.log("getJobById error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    res.status(500).json({
      message: "Error fetching job",
    });
  }
};