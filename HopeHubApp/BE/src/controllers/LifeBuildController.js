import LifeBuildAssessment from "../models/LifeBuildingmodels.js";

/* =========================================================
   INTEREST → JOB RECOMMENDATION MAP

   ONLY using the jobs provided for HopeHub.
========================================================= */

const interestJobMap = {
  "Fixing machines or tools": [
    "Mechanic Helper",
    "Bicycle Repair",
    "AC Technician Assistant",
  ],

  "Working with computers": [
    "Data Entry",
    "Computer Operator",
    "Mobile Repair Assistant",
  ],

  "Drawing or designing": [
    "Graphic Design Helper",
    "Banner Designer",
    "Craft Work",
  ],

  "Helping people": [
    "Caregiver Assistant",
    "Community Support Worker",
  ],

  "Teaching or mentoring": [
    "Tuition Assistant",
    "Skills Trainer Helper",
  ],

  "Managing projects": [
    "Store Supervisor Assistant",
    "Event Helper",
  ],

  "Farming or gardening": [
    "Farm Worker",
    "Nursery Assistant",
    "Gardening",
  ],

  "Cooking": [
    "Kitchen Helper",
    "Bakery Assistant",
    "Catering",
  ],

  "Selling products": [
    "Sales Assistant",
    "Shop Keeper Helper",
  ],

  "Organizing events": [
    "Event Helper",
    "Decorating Assistant",
  ],

  "Driving": [
    "Delivery Rider",
    "Driver Assistant",
  ],

  "Working outdoors": [
    "Construction Helper",
    "Cleaning Services",
    "Gardening",
  ],
};


/* =========================================================
   CALCULATE RECOVERY SAFETY SCORE
========================================================= */

const calculateSafetyScore = (answers) => {
  let totalScore = 0;
  let answeredQuestions = 0;

  Object.entries(answers).forEach(([key, answer]) => {

    // Question 13 is interest selection
    if (key === "q13" || key === "13") {
      return;
    }

    // Ignore arrays
    if (Array.isArray(answer)) {
      return;
    }

    // Likert scale answers
    if (
      typeof answer === "number" &&
      answer >= 1 &&
      answer <= 5
    ) {
      totalScore += answer;
      answeredQuestions++;
    }
  });

  if (answeredQuestions === 0) {
    return 0;
  }

  const averageScore = totalScore / answeredQuestions;

  const percentage = (averageScore / 5) * 100;

  return Math.round(percentage);
};


/* =========================================================
   GENERATE JOB RECOMMENDATIONS
========================================================= */

const generateJobRecommendations = (interests) => {
  let jobs = [];

  if (!Array.isArray(interests)) {
    return jobs;
  }

  interests.forEach((interest) => {
    if (interestJobMap[interest]) {
      jobs.push(...interestJobMap[interest]);
    }
  });

  // Remove duplicates
  jobs = [...new Set(jobs)];

  return jobs;
};


/* =========================================================
   CREATE LIFE BUILD ASSESSMENT
========================================================= */

export const createAssessment = async (req, res) => {
  try {

    const {
      userId,
      answers,
      interests,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!answers) {
      return res.status(400).json({
        success: false,
        message: "Assessment answers are required",
      });
    }


    /* ==========================================
       GET INTERESTS

       Use interests sent separately.
       If not available, try to get Question 13.
    ========================================== */

    let selectedInterests = interests || [];

    if (
      selectedInterests.length === 0 &&
      Array.isArray(answers.q13)
    ) {
      selectedInterests = answers.q13;
    }

    if (
      selectedInterests.length === 0 &&
      Array.isArray(answers["13"])
    ) {
      selectedInterests = answers["13"];
    }


    /* ==========================================
       CALCULATE SAFETY SCORE
    ========================================== */

    const recoverySafetyScore =
      calculateSafetyScore(answers);


    /* ==========================================
       DETERMINE RISK LEVEL
    ========================================== */

    let riskLevel = "";

    if (recoverySafetyScore >= 50) {
      riskLevel = "Low Risk";
    } else {
      riskLevel = "High Risk";
    }


    /* ==========================================
       GENERATE RECOMMENDED JOBS

       ONLY if score is 50% or above
    ========================================== */

    let recommendedJobs = [];

    if (recoverySafetyScore >= 50) {
      recommendedJobs =
        generateJobRecommendations(selectedInterests);
    }


    /* ==========================================
       SAVE TO DATABASE
    ========================================== */

    const assessment =
      await LifeBuildAssessment.create({

        userId,

        answers,

        interests: selectedInterests,

        recoverySafetyScore,

        riskLevel,

        recommendedJobs,

      });


    /* ==========================================
       SEND RESPONSE
    ========================================== */

    return res.status(201).json({

      success: true,

      message:
        "LifeBuild assessment completed successfully",

      data: {

        id: assessment._id,

        recoverySafetyScore,

        riskLevel,

        interests: selectedInterests,

        recommendedJobs,

      },

    });

  } catch (error) {

    console.error(
      "Error creating assessment:",
      error
    );

    return res.status(500).json({

      success: false,

      message: "Server error",

      error: error.message,

    });

  }
};


/* =========================================================
   GET USER'S LATEST LIFE BUILD RESULT
========================================================= */

export const getLatestAssessment = async (req, res) => {

  try {

    const { userId } = req.params;

    const assessment =
      await LifeBuildAssessment.findOne({
        userId,
      }).sort({
        createdAt: -1,
      });


    if (!assessment) {

      return res.status(404).json({

        success: false,

        message:
          "No assessment found",

      });

    }


    return res.status(200).json({

      success: true,

      data: {

        recoverySafetyScore:
          assessment.recoverySafetyScore,

        riskLevel:
          assessment.riskLevel,

        recommendedJobs:
          assessment.recommendedJobs,

        interests:
          assessment.interests,

      },

    });

  } catch (error) {

    console.error(
      "Error getting assessment:",
      error
    );

    return res.status(500).json({

      success: false,

      message: "Server error",

      error: error.message,

    });

  }

};