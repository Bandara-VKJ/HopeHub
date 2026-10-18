import { getCounselingLanguages } from "./counselingLanguages.js";
// Navigation rules only. These groups are not diagnoses or clinical scores.
const key = (value) => typeof value === "string"
  ? value.trim().toLowerCase().replace(/\s+/g, " ") : "";

export function normalizeRecoveryLevel(user = {}) {
  // A recorded counselor override takes precedence, even when unrecognized.
  const override = key(user.counselorLevel);
  const raw = override || key(user.predictedLevel);
  const groups = {
    "no risk": "low", "very low": "low", low: "low",
    moderate: "moderate", mid: "moderate", high: "high",
    "very high": "high", "severe addiction": "high",
    "level 1 no risk": "low", "level 2": "low",
    "level 3": "moderate", "level 4": "moderate",
    "level 5": "high", "level 6": "high", "level 7 severe": "high",
  };
  return { group: groups[raw] || "unknown",
    source: override ? "counselor" : raw ? "prediction" : "none" };
}

// Literal, whole-term profile keywords; no regex is constructed from user input.
// Sinhala entries support existing free-text Sinhala specialty profiles.
const recovery = /\b(addiction|recovery|substance|alcohol|drug|relapse)\b|ඇබ්බැහි|පුනරුත්ථාපන/i;
const wellbeing = /\b(stress|anxiety|wellness|wellbeing|well-being|coping|prevention|general counseling|general counselling)\b|ආතති|කාංසා|යහපැවැත්ම/i;

export function rankCounselors(counselors, user) {
  const level = normalizeRecoveryLevel(user);
  // Existing User.language is a saved app-language preference, not verified fluency.
  const preferredLanguage = ["en", "si"].includes(user?.language) ? user.language : null;
  const rows = counselors.filter(c => c.approvalStatus === "approved").map(c => {
    const specialty = typeof c.specialty === "string" ? c.specialty : "";
    // Higher/unknown groups prioritize explicit recovery-related profile text.
    // Lower group also considers wellbeing-related text. This does not verify expertise.
    const matches = recovery.test(specialty) ||
      (level.group === "low" && wellbeing.test(specialty));
    const languages = getCounselingLanguages(c.counselingLanguages);
    const languageMatch = preferredLanguage && languages.length
      ? languages.includes(preferredLanguage) : null;
    const languagePriority = languageMatch === true ? 2 : languageMatch === null ? 1 : 0;
    return { counselor: c, available: c.available === true, matches, languageMatch, languagePriority,
      reason: matches ? "Listed specialty matches support keywords."
        : "Approved counselor; no specialty keyword match." };
  });
  rows.sort((a, b) => Number(b.available) - Number(a.available) ||
    b.languagePriority - a.languagePriority ||
    Number(b.matches) - Number(a.matches) ||
    String(a.counselor._id).localeCompare(String(b.counselor._id)));
  return { level, rows };
}

// Injectable for tests; production passes the actual Mongoose models and serializer.
export function createRecommendationHandler({ User, Counselor, serialize }) {
  return async (req, res) => {
    res.set("Cache-Control", "private, no-store");
    const id = req.user?._id || req.user?.id;
    if (!id) return res.status(401).json({ message: "Login required" });
    if (req.user?.role && req.user.role !== "user") {
      return res.status(403).json({ message: "Patient account required" });
    }
    try {
      // Identity and level come only from verified auth and the database.
      const user = await User.findById(id)
        .select("role counselorLevel predictedLevel language").lean();
      if (!user || user.role !== "user") {
        return res.status(403).json({ message: "Patient account required" });
      }
      const counselors = await Counselor.find({ approvalStatus: "approved" })
        .select("-password").lean();
      const { level, rows } = rankCounselors(counselors, user);
      return res.status(200).json({
        success: true,
        recoveryGroup: level.group,
        levelSource: level.source,
        guidance: level.group === "high" || level.group === "unknown"
          ? "Consider contacting a counselor to discuss your support needs."
          : "Choose a counselor to discuss your support needs.",
        counselors: rows.map(({ counselor, available, matches, reason, languageMatch }) => ({
          ...serialize(counselor),
          counselingLanguages: getCounselingLanguages(counselor.counselingLanguages),
          recommendation: { available, specialtyMatch: matches, languageMatch, reason },
        })),
      });
    } catch (error) {
      console.error("Counselor recommendations failed:", error.name);
      return res.status(500).json({ message: "Recommendations unavailable" });
    }
  };
}
