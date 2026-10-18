import Job, { SKILL_OPTIONS, EDUCATION_LEVELS } from "../models/job.js";
import LifeBuildProfile from "../models/LifeBuildingJobQuestions.js";

const MIN_MATCH_PERCENT = 40;

const parseJSON = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value !== "string") return value; // already parsed (JSON body)
  return JSON.parse(value);
};

const cleanRequiredSkills = (raw) => {
  const cleaned = {};

  Object.entries(raw || {}).forEach(([skill, level]) => {
    const n = Number(level);
    if (SKILL_OPTIONS.includes(skill) && n >= 1 && n <= 5) {
      cleaned[skill] = n;
    }
  });

  return cleaned;
};

const countInterestHits = (job, answers) => {
  const userInterests = Array.isArray(answers.jobInterest) ? answers.jobInterest : [];
  const jobTags = Array.isArray(job.interestTags) ? job.interestTags : [];
  return userInterests.filter((i) => jobTags.includes(i)).length;
};

const scoreJob = (job, answers) => {
  // Interests (50)
  const userInterests = Array.isArray(answers.jobInterest) ? answers.jobInterest : [];
  const hits = countInterestHits(job, answers);
  const interestScore = userInterests.length ? 50 * (hits / userInterests.length) : 0;

  const required = job.requiredSkills || {};
  const skillNames = Object.keys(required);
  const userSkills = answers.skills || {};

  const skillScore = skillNames.length
    ? 40 *
      (skillNames.reduce(
        (sum, name) => sum + Math.min((Number(userSkills[name]) || 0) / required[name], 1),
        0
      ) /
        skillNames.length)
    : 20;

  // Education (10)
  const meetsEducation =
    !job.minEducation ||
    EDUCATION_LEVELS.indexOf(answers.education) >= EDUCATION_LEVELS.indexOf(job.minEducation);
  const educationScore = meetsEducation ? 10 : 0;

  return Math.round(interestScore + skillScore + educationScore);
};

// CREATE JOB
export const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      type,
      salary,
      contactNumber,
      recommendedFor,
      description,
      minEducation,
    } = req.body;

    if (!title?.trim() || !company?.trim()) {
      return res.status(400).json({
        message: "Job title and company are required",
      });
    }

    if (!contactNumber?.trim()) {
      return res.status(400).json({
        message: "Contact number is required",
      });
    }

    let interestTags;
    let requiredSkills;

    try {
      interestTags = parseJSON(req.body.interestTags, []);
      requiredSkills = cleanRequiredSkills(parseJSON(req.body.requiredSkills, {}));
    } catch {
      return res.status(400).json({
        message: "interestTags and requiredSkills must be valid JSON",
      });
    }

    if (!Array.isArray(interestTags) || interestTags.length === 0) {
      return res.status(400).json({
        message: "Select at least one matching interest",
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
      contactNumber,
      recommendedFor,
      description,
      interestTags,
      requiredSkills,
      minEducation: minEducation || "",
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

export const getJobs = async (req, res) => {
  try {
    const { type, search, userId } = req.query;

    const filter = { isActive: true };

    if (type) {
      filter.type = type;
    }

    if (search) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");

      filter.$or = [{ title: regex }, { company: regex }, { location: regex }];
    }

    if (userId) {
      const profile = await LifeBuildProfile.findOne({ userId }).lean();

      // Profile answers are stored directly on the document
      if (profile) {
        const jobs = await Job.find(filter).lean();

        const recommended = jobs
          .filter((job) => countInterestHits(job, profile) > 0)
          .map((job) => ({ ...job, matchPercent: scoreJob(job, profile) }))
          .filter((job) => job.matchPercent >= MIN_MATCH_PERCENT)
          .sort((a, b) => b.matchPercent - a.matchPercent);

        return res.status(200).json({
          count: recommended.length,
          jobs: recommended,
        });
      }
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

// GET ONE JOB
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