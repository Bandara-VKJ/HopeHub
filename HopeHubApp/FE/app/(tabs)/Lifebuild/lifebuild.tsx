import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lifeBuildStyles } from "./lifebuildStyles";
import JobPage from "../../(lifepages)/jobpage";
import { ngrokFetch } from "@/utill/ngrokFetch";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

type ProfileQuestionType =
  | "text"
  | "number"
  | "select"
  | "multiSelect"
  | "skills";

type ProfileQuestion = {
  id: string;
  question: string;
  type: ProfileQuestionType;
  section?: string;
  options?: string[];
  maxSelections?: number;
  allowOther?: boolean;
};

type RecoveryQuestion = {
  id: number;
  section: string;
  question: string;
};

const PROFILE_QUESTIONS: ProfileQuestion[] = [
  { id: "age", question: "What is your age?", type: "number", section: "Demographic Information" },
  {
    id: "gender",
    question: "What is your gender?",
    type: "select",
    section: "Demographic Information",
    options: ["Male", "Female", "Prefer not to say"],
  },
  {
    id: "education",
    question: "What is your education level?",
    type: "select",
    section: "Demographic Information",
    options: ["No formal education", "Primary", "Secondary", "Diploma", "Degree or higher"],
  },
  {
    id: "jobInterest",
    question: "Which activities do you enjoy most? Select up to three.",
    type: "multiSelect",
    section: "Skills, Interests & Reintegration",
    maxSelections: 3,
    options: [
      "Fixing machines or tools",
      "Working with computers",
      "Drawing or designing",
      "Helping people",
      "Teaching or mentoring",
      "Managing projects",
      "Farming or gardening",
      "Cooking",
      "Selling products",
      "Organizing events",
      "Driving",
      "Working outdoors",
    ],
  },
];

const SKILLS = [
  "Communication",
  "Teamwork",
  "Problem Solving",
  "Time Management",
  "Computer Skills",
  "Leadership",
  "Creativity",
  "Decision Making",
];

const RECOVERY_QUESTIONS: RecoveryQuestion[] = [
  { id: 1, section: "Recovery Self-Efficacy", question: "I am confident that I can resist using drugs even when I feel stressed." },
  { id: 2, section: "Recovery Self-Efficacy", question: "I can control my urges without using drugs." },
  { id: 3, section: "Recovery Self-Efficacy", question: "I believe I can continue my recovery successfully." },
  { id: 4, section: "Recovery Self-Efficacy", question: "I can refuse drugs even if someone offers them to me." },
  { id: 5, section: "Emotional Stability", question: "I can manage my emotions in healthy ways." },
  { id: 6, section: "Emotional Stability", question: "I usually remain calm when facing problems." },
  { id: 7, section: "Emotional Stability", question: "I feel hopeful about my future." },
  { id: 8, section: "Emotional Stability", question: "I believe I have control over my life." },
  { id: 9, section: "Lifestyle Stability", question: "I maintain a regular daily routine." },
  { id: 10, section: "Lifestyle Stability", question: "I get enough sleep most nights." },
  { id: 11, section: "Lifestyle Stability", question: "I avoid places or people that encourage drug use." },
  { id: 12, section: "Lifestyle Stability", question: "I spend my free time in productive activities." },
  { id: 13, section: "Social Support", question: "My family supports my recovery." },
  { id: 14, section: "Social Support", question: "I have friends who encourage me to stay drug-free." },
  { id: 15, section: "Social Support", question: "I know where to seek help if I need support." },
  { id: 16, section: "Social Support", question: "I have someone I trust to discuss my problems." },
  { id: 17, section: "Career Readiness", question: "I believe I can perform well in a job." },
  { id: 18, section: "Career Readiness", question: "I can work responsibly with others." },
  { id: 19, section: "Career Readiness", question: "I am willing to attend vocational training." },
  { id: 20, section: "Career Readiness", question: "I believe having a career will help me maintain recovery." },
];

const MAX_SCORE = RECOVERY_QUESTIONS.length * 5;

const ANSWER_OPTIONS = [
  { label: "Strongly Disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly Agree", value: 5 },
];

const STEP_CARDS = [
  {
    number: "01",
    icon: "document-text-outline",
    title: "Complete Recovery Assessment",
    description: "Answer 20 Recovery Safety Assessment questions and submit.",
  },
  {
    number: "02",
    icon: "shield-checkmark-outline",
    title: "See Your Safety Score",
    description:
      "Your score is calculated from your 20 answers and shown right away.",
  },
  {
    number: "03",
    icon: "person-outline",
    title: "Tell Us About Yourself",
    description:
      "Answer 16 questions about your background, skills, interests and recovery support needs.",
  },
  {
    number: "04",
    icon: "briefcase-outline",
    title: "Discover Your Career Path",
    description:
      "If your Recovery Safety Score is 50% or above, suitable career paths can be recommended.",
  },
];

export default function LifeBuildScreen() {
  const [screen, setScreen] = useState<
    "start" | "profile" | "assessment" | "score" | "result"
  >("start");

  const [profileIndex, setProfileIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);

  const [profileAnswers, setProfileAnswers] = useState<Record<string, string>>({});
  const [multiAnswers, setMultiAnswers] = useState<Record<string, string[]>>({});
  const [skillAnswers, setSkillAnswers] = useState<Record<string, number>>({});
  const [recoveryAnswers, setRecoveryAnswers] = useState<Record<number, number>>({});
  const [safetyScore, setSafetyScore] = useState(0);
  const [obtainedScore, setObtainedScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [scoreCompleted, setScoreCompleted] = useState(false);
  const [loadingScore, setLoadingScore] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(false);

  /* ---------------------------- LOAD FROM BE ---------------------------- */

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoadingScore(true);

    const [scoreDone, profileDone] = await Promise.all([
      loadLifeBuildScore(),
      loadProfileStatus(),
    ]);

    // Profile already completed before -> go directly to the job page
    if (scoreDone && profileDone) {
      setScreen("score");
    }

    setLoadingScore(false);
  };

  // returns true if the recovery assessment is completed
  const loadLifeBuildScore = async (): Promise<boolean> => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return false;

      const response = await ngrokFetch(
        `${BASE_URL}/api/lifeBuild/score/${userId}`,
        { method: "GET" }
      );

      if (response.status === 404) {
        setScoreCompleted(false);
        return false;
      }

      const json = await response.json();

      if (!response.ok || !json.success) {
        console.error("Failed to get LifeBuild score:", json.message);
        return false;
      }

      const score = json.data;
      const completed = score.scoreCompleted === true;

      setSafetyScore(score.percentage ?? 0);
      setObtainedScore(score.obtainedScore ?? 0);
      setScoreCompleted(completed);

      return completed;
    } catch (error) {
      console.error("Failed to load LifeBuild score:", error);
      return false;
    }
  };

  // returns true if the profile questionnaire is completed
  const loadProfileStatus = async (): Promise<boolean> => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return false;

      const response = await ngrokFetch(
        `${BASE_URL}/api/lifeBuild/profile/${userId}`,
        { method: "GET" }
      );

      if (response.status === 404) {
        setProfileCompleted(false);
        return false;
      }

      const json = await response.json();

      if (!response.ok || !json.success) {
        console.error("Failed to get profile:", json.message);
        return false;
      }

      const completed = json.data?.jobCompleted === true;
      setProfileCompleted(completed);

      return completed;
    } catch (error) {
      console.error("Failed to load profile status:", error);
      return false;
    }
  };

  /* ------------------------------ HELPERS ------------------------------- */

  const currentProfileQuestion = PROFILE_QUESTIONS[profileIndex];
  const currentRecoveryQuestion = RECOVERY_QUESTIONS[questionIndex];

  const startAssessment = () => setScreen("assessment");

  const handleFindJob = () => {
    if (profileCompleted) {
      setScreen("score"); // straight to <JobPage />
    } else {
      setProfileIndex(0);
      setScreen("profile");
    }
  };

  const saveProfileAnswer = (value: string) => {
    setProfileAnswers((previous) => ({
      ...previous,
      [currentProfileQuestion.id]: value,
    }));
  };

  const toggleMultiAnswer = (
    questionId: string,
    option: string,
    maxSelections?: number
  ) => {
    const currentAnswers = multiAnswers[questionId] || [];

    if (currentAnswers.includes(option)) {
      setMultiAnswers((previous) => ({
        ...previous,
        [questionId]: currentAnswers.filter((item) => item !== option),
      }));
      return;
    }

    if (maxSelections && currentAnswers.length >= maxSelections) {
      Alert.alert(
        "Maximum Selection",
        `You can select up to ${maxSelections} options.`
      );
      return;
    }

    setMultiAnswers((previous) => ({
      ...previous,
      [questionId]: [...currentAnswers, option],
    }));
  };

  const selectSkillRating = (skill: string, value: number) => {
    setSkillAnswers((previous) => ({ ...previous, [skill]: value }));
  };

  const isCurrentProfileQuestionAnswered = () => {
    if (currentProfileQuestion.type === "multiSelect") {
      return (multiAnswers[currentProfileQuestion.id] || []).length > 0;
    }
    if (currentProfileQuestion.type === "skills") {
      return SKILLS.every((skill) => skillAnswers[skill]);
    }
    const answer = profileAnswers[currentProfileQuestion.id];
    return !!answer && answer.trim() !== "";
  };

  const buildProfilePayload = () => {
    const answers: Record<string, any> = {};

    PROFILE_QUESTIONS.forEach((question) => {
      if (question.type === "multiSelect") {
        answers[question.id] = multiAnswers[question.id] || [];
      } else if (question.type === "skills") {
        answers[question.id] = skillAnswers;
      } else if (question.type === "number") {
        answers[question.id] = Number(profileAnswers[question.id]);
      } else {
        answers[question.id] = (profileAnswers[question.id] || "").trim();
      }
    });

    return answers;
  };

  const buildRecoveryPayload = () => {
    const answers: Record<string, number> = {};

    RECOVERY_QUESTIONS.forEach((question) => {
      answers[`q${question.id}`] = recoveryAnswers[question.id];
    });

    return answers;
  };

  /* ----------------------------- SUBMIT TO BE --------------------------- */

  const submitToServer = async () => {
    const userId = await AsyncStorage.getItem("userId");

    if (!userId) {
      throw new Error("User not logged in");
    }

    const response = await ngrokFetch(`${BASE_URL}/api/lifeBuild/assessment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        answers: buildRecoveryPayload(),
      }),
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || "Failed to save assessment");
    }

    return json.data;
  };

  const submitProfile = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      const userId = await AsyncStorage.getItem("userId");
      if (!userId) throw new Error("User not logged in");

      const response = await ngrokFetch(`${BASE_URL}/api/lifeBuild/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, answers: buildProfilePayload() }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to save profile");
      }

      setProfileCompleted(true);
      setScreen("score"); // opens <JobPage />
    } catch (error: any) {
      Alert.alert(
        "Could Not Save",
        error?.message || "Could not save your answers. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const submitRecoveryAnswers = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      const saved = await submitToServer();

      setObtainedScore(saved.obtainedScore);
      setSafetyScore(saved.percentage);
      setScoreCompleted(saved.scoreCompleted === true);

      setScreen("start");
    } catch (error: any) {
      Alert.alert(
        "Could Not Save",
        error?.message || "Could not save your answers. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ----------------------------- NAVIGATION ----------------------------- */

  const goToNextProfileQuestion = () => {
    if (!isCurrentProfileQuestionAnswered()) {
      Alert.alert("Answer Required", "Please provide an answer before continuing.");
      return;
    }

    if (profileIndex < PROFILE_QUESTIONS.length - 1) {
      setProfileIndex(profileIndex + 1);
    } else {
      submitProfile();
    }
  };

  const goToPreviousProfileQuestion = () => {
    if (profileIndex > 0) {
      setProfileIndex(profileIndex - 1);
    } else {
      setScreen("start");
    }
  };

  const selectRecoveryAnswer = (value: number) => {
    setRecoveryAnswers((previous) => ({
      ...previous,
      [currentRecoveryQuestion.id]: value,
    }));
  };

  const goToNextRecoveryQuestion = () => {
    if (!recoveryAnswers[currentRecoveryQuestion.id]) {
      Alert.alert("Answer Required", "Please select an answer before continuing.");
      return;
    }

    if (questionIndex < RECOVERY_QUESTIONS.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      submitRecoveryAnswers();
    }
  };

  const goToPreviousRecoveryQuestion = () => {
    if (questionIndex > 0) setQuestionIndex(questionIndex - 1);
  };

  const restartAssessment = () => {
    setProfileIndex(0);
    setQuestionIndex(0);
    setProfileAnswers({});
    setMultiAnswers({});
    setSkillAnswers({});
    setRecoveryAnswers({});
    setSafetyScore(0);
    setObtainedScore(0);
    setScoreCompleted(false);
    setScreen("start");
  };

  if (loadingScore) {
    return (
      <View
        style={[
          lifeBuildStyles.container,
          {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Ionicons name="hourglass-outline" size={42} color="#2CA6A4" />

        <Text
          style={{
            marginTop: 16,
            fontSize: 16,
            color: "#4a5a5a",
          }}
        >
          Checking your assessment...
        </Text>
      </View>
    );
  }

  if (screen === "start") {
    return (
      <ScrollView style={lifeBuildStyles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={lifeBuildStyles.header}>
          <View style={lifeBuildStyles.headerCircleLarge} />
          <View style={lifeBuildStyles.headerCircleSmall} />

          <View style={lifeBuildStyles.headerContent}>
            <Text style={lifeBuildStyles.headerSmallText}>BUILD YOUR FUTURE</Text>
            <Text style={lifeBuildStyles.headerTitle}>LifeBuild</Text>
            <Text style={lifeBuildStyles.headerDescription}>
              Every step you take brings you closer to a stronger, healthier and
              brighter future.
            </Text>
          </View>

          <View style={lifeBuildStyles.headerIcon}>
            <Ionicons name="rocket-outline" size={42} color="#fff" />
          </View>
        </View>

        {/* Main Start Card */}
        <View style={lifeBuildStyles.startMainCard}>
          <View style={lifeBuildStyles.startCenterContent}>
            <View style={lifeBuildStyles.startIconCircle}>
              <Ionicons
                name={scoreCompleted ? "shield-checkmark-outline" : "clipboard-outline"}
                size={32}
                color={safetyScore >= 50 || !scoreCompleted ? "#2CA6A4" : "#E67E22"}
              />
            </View>

            {scoreCompleted ? (
              <>
                <Text style={lifeBuildStyles.startMainTitle}>Your Recovery Safety Score</Text>

                <Text
                  style={{
                    fontSize: 48,
                    fontWeight: "800",
                    marginVertical: 8,
                    color: safetyScore >= 50 ? "#2CA6A4" : "#E67E22",
                  }}
                >
                  {Math.round(safetyScore)}%
                </Text>

                <Text style={{ fontSize: 14, color: "#4a5a5a", marginBottom: 6 }}>
                  {obtainedScore} / {MAX_SCORE} points
                </Text>

                <Text style={lifeBuildStyles.startMainDescription}>
                  {safetyScore >= 50
                    ? "Great progress! You're ready to explore career paths that suit you."
                    : "Your score is below 50%. Keep building your recovery support, then retake the assessment to unlock career recommendations."}
                </Text>

                <TouchableOpacity
                  style={lifeBuildStyles.startButton}
                  onPress={handleFindJob}
                  activeOpacity={0.85}
                >
                  <Text style={lifeBuildStyles.startButtonText}>Let's Find Job</Text>
                  <Ionicons name="briefcase-outline" size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity onPress={restartAssessment} style={{ marginTop: 14 }}>
                  <Text style={{ color: "#2CA6A4", fontWeight: "600" }}>Retake Assessment</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={lifeBuildStyles.startMainTitle}>Start Your Assessment</Text>

                <Text style={lifeBuildStyles.startMainDescription}>
                  Complete your personal information and Recovery Safety Assessment to
                  understand your current recovery safety level.
                </Text>

                <TouchableOpacity
                  style={lifeBuildStyles.startButton}
                  onPress={startAssessment}
                  activeOpacity={0.85}
                >
                  <Text style={lifeBuildStyles.startButtonText}>Start Assessment</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* 2x2 Step Cards */}
        <View style={lifeBuildStyles.stepsGrid}>
          {STEP_CARDS.map((step) => (
            <View key={step.number} style={lifeBuildStyles.stepCard}>
              <View style={lifeBuildStyles.stepCardHeader}>
                <View style={lifeBuildStyles.stepNumberBadge}>
                  <Text style={lifeBuildStyles.stepNumberText}>{step.number}</Text>
                </View>
                <View style={lifeBuildStyles.stepIconCircle}>
                  <Ionicons name={step.icon as any} size={16} color="#2CA6A4" />
                </View>
              </View>
              <Text style={lifeBuildStyles.stepCardTitle}>{step.title}</Text>
              <Text style={lifeBuildStyles.stepCardDescription}>
                {step.description}
              </Text>
            </View>
          ))}
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    );
  }

  if (screen === "profile") {
    const savedAnswer = profileAnswers[currentProfileQuestion.id] || "";
    const selectedMultiAnswers = multiAnswers[currentProfileQuestion.id] || [];
    const progress = ((profileIndex + 1) / PROFILE_QUESTIONS.length) * 100;
    const isLastProfileQuestion = profileIndex === PROFILE_QUESTIONS.length - 1;

    return (
      <ScrollView
        style={lifeBuildStyles.container}
        contentContainerStyle={lifeBuildStyles.screenPadding}
        showsVerticalScrollIndicator={false}
      >
        <Text style={lifeBuildStyles.sectionLabel}>PERSONAL & CAREER INFORMATION</Text>
        <Text style={lifeBuildStyles.screenTitle}>Tell Us About Yourself</Text>
        <Text style={lifeBuildStyles.screenSubtitle}>
          This information helps us understand your background, skills and
          interests for future career recommendations.
        </Text>

        <View style={lifeBuildStyles.progressTrack}>
          <View style={[lifeBuildStyles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={lifeBuildStyles.progressText}>
          Question {profileIndex + 1} of {PROFILE_QUESTIONS.length}
        </Text>

        <View style={lifeBuildStyles.questionCard}>
          <Text style={lifeBuildStyles.questionSection}>
            {currentProfileQuestion.section}
          </Text>
          <Text style={lifeBuildStyles.questionText}>
            {currentProfileQuestion.question}
          </Text>

          {/* TEXT / NUMBER */}
          {(currentProfileQuestion.type === "text" ||
            currentProfileQuestion.type === "number") && (
            <TextInput
              value={savedAnswer}
              onChangeText={saveProfileAnswer}
              placeholder="Enter your answer"
              keyboardType={
                currentProfileQuestion.type === "number" ? "numeric" : "default"
              }
              style={lifeBuildStyles.textInput}
            />
          )}

          {/* SINGLE SELECT */}
          {currentProfileQuestion.type === "select" &&
            currentProfileQuestion.options?.map((option) => {
              const selected = savedAnswer === option;
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => saveProfileAnswer(option)}
                  style={[
                    lifeBuildStyles.optionButton,
                    selected && lifeBuildStyles.optionButtonSelected,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      lifeBuildStyles.optionText,
                      selected && lifeBuildStyles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                  {selected && (
                    <Ionicons name="checkmark-circle" size={22} color="#2CA6A4" />
                  )}
                </TouchableOpacity>
              );
            })}

          {/* MULTI SELECT */}
          {currentProfileQuestion.type === "multiSelect" && (
            <>
              {currentProfileQuestion.maxSelections && (
                <Text style={lifeBuildStyles.maxSelectHint}>
                  Select up to {currentProfileQuestion.maxSelections} options
                </Text>
              )}

              {currentProfileQuestion.options?.map((option) => {
                const selected = selectedMultiAnswers.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() =>
                      toggleMultiAnswer(
                        currentProfileQuestion.id,
                        option,
                        currentProfileQuestion.maxSelections
                      )
                    }
                    style={[
                      lifeBuildStyles.optionButton,
                      selected && lifeBuildStyles.optionButtonSelected,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        lifeBuildStyles.optionText,
                        selected && lifeBuildStyles.optionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                    <Ionicons
                      name={selected ? "checkbox" : "square-outline"}
                      size={22}
                      color={selected ? "#2CA6A4" : "#8a9a9a"}
                    />
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          {/* SKILLS */}
          {currentProfileQuestion.type === "skills" && (
            <View>
              <Text style={lifeBuildStyles.maxSelectHint}>
                Rate each skill from 1 to 5.
              </Text>

              {SKILLS.map((skill) => (
                <View key={skill}>
                  <Text style={lifeBuildStyles.skillLabel}>{skill}</Text>
                  <View style={lifeBuildStyles.skillRow}>
                    {[1, 2, 3, 4, 5].map((value) => {
                      const selected = skillAnswers[skill] === value;
                      return (
                        <TouchableOpacity
                          key={value}
                          onPress={() => selectSkillRating(skill, value)}
                          style={[
                            lifeBuildStyles.skillButton,
                            selected && lifeBuildStyles.skillButtonSelected,
                          ]}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              lifeBuildStyles.skillButtonText,
                              selected && lifeBuildStyles.skillButtonTextSelected,
                            ]}
                          >
                            {value}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={lifeBuildStyles.navigationRow}>
          <TouchableOpacity
            onPress={goToPreviousProfileQuestion}
            disabled={submitting}
            style={lifeBuildStyles.previousButton}
            activeOpacity={0.7}
          >
            <Text style={lifeBuildStyles.previousButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goToNextProfileQuestion}
            disabled={submitting}
            style={[
              lifeBuildStyles.nextButton,
              isLastProfileQuestion && lifeBuildStyles.nextButtonSuccess,
              submitting && { opacity: 0.6 },
            ]}
            activeOpacity={0.85}
          >
            <Text style={lifeBuildStyles.nextButtonText}>
              {submitting ? "Saving..." : isLastProfileQuestion ? "Find Jobs" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (screen === "assessment") {
    const progress = ((questionIndex + 1) / RECOVERY_QUESTIONS.length) * 100;
    const selectedAnswer = recoveryAnswers[currentRecoveryQuestion.id];
    const isLast = questionIndex === RECOVERY_QUESTIONS.length - 1;

    return (
      <ScrollView
        style={lifeBuildStyles.container}
        contentContainerStyle={lifeBuildStyles.screenPadding}
        showsVerticalScrollIndicator={false}
      >
        <Text style={lifeBuildStyles.sectionLabel}>RECOVERY SAFETY ASSESSMENT</Text>
        <Text style={lifeBuildStyles.screenTitle}>Recovery Assessment</Text>
        <Text style={lifeBuildStyles.screenSubtitle}>
          Please select the answer that best describes how you currently feel.
        </Text>

        <View style={lifeBuildStyles.progressTrack}>
          <View style={[lifeBuildStyles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={lifeBuildStyles.progressText}>
          Question {questionIndex + 1} of {RECOVERY_QUESTIONS.length}
        </Text>

        <View style={lifeBuildStyles.questionCard}>
          <Text style={lifeBuildStyles.questionSection}>
            SECTION: {currentRecoveryQuestion.section.toUpperCase()}
          </Text>
          <Text style={lifeBuildStyles.questionMeta}>
            RECOVERY QUESTION {currentRecoveryQuestion.id}
          </Text>
          <Text style={lifeBuildStyles.questionText}>
            {currentRecoveryQuestion.question}
          </Text>

          {ANSWER_OPTIONS.map((option) => {
            const selected = selectedAnswer === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => selectRecoveryAnswer(option.value)}
                style={[
                  lifeBuildStyles.optionButton,
                  selected && lifeBuildStyles.optionButtonSelected,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    lifeBuildStyles.optionText,
                    selected && lifeBuildStyles.optionTextSelected,
                  ]}
                >
                  {option.value}. {option.label}
                </Text>
                {selected && (
                  <Ionicons name="checkmark-circle" size={22} color="#2CA6A4" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={lifeBuildStyles.navigationRow}>
          {questionIndex > 0 && (
            <TouchableOpacity
              onPress={goToPreviousRecoveryQuestion}
              style={lifeBuildStyles.previousButton}
              activeOpacity={0.7}
            >
              <Text style={lifeBuildStyles.previousButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={goToNextRecoveryQuestion}
            disabled={submitting}
            style={[
              lifeBuildStyles.nextButton,
              isLast && lifeBuildStyles.nextButtonSuccess,
              submitting && { opacity: 0.6 },
            ]}
            activeOpacity={0.85}
          >
            <Text style={lifeBuildStyles.nextButtonText}>
              {submitting ? "Saving..." : isLast ? "Submit" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (screen === "score") {
    return <JobPage safetyScore={safetyScore} onRestart={restartAssessment} />;
  }

  return null;
}