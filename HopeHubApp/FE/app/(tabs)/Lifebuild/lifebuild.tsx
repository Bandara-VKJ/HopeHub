import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { lifeBuildStyles } from "./lifebuildStyles";

/* =====================================================
   TYPES
===================================================== */

type Career = {
  id: number;
  title: string;
  description: string;
  icon: string;
};

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

/* =====================================================
   CAREER PATHS
===================================================== */

const CAREER_PATHS: Career[] = [
  {
    id: 1,
    title: "Data Entry",
    description:
      "A structured career path that can help you develop computer and administrative skills.",
    icon: "laptop-outline",
  },
  {
    id: 2,
    title: "Office Assistant",
    description:
      "Support daily office activities and gradually build workplace confidence.",
    icon: "briefcase-outline",
  },
  {
    id: 3,
    title: "ICT / Computer Course",
    description:
      "Develop practical computer skills through suitable training or NVQ courses.",
    icon: "school-outline",
  },
];

/* =====================================================
   PROFILE QUESTIONS
===================================================== */

const PROFILE_QUESTIONS: ProfileQuestion[] = [
  {
    id: "age",
    question: "What is your age?",
    type: "number",
    section: "Demographic Information",
  },
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
    options: [
      "No formal education",
      "Primary",
      "Secondary",
      "Diploma",
      "Degree or higher",
    ],
  },
  {
    id: "substance",
    question: "What type of substance did you previously use?",
    type: "text",
    section: "Substance Use Background",
  },
  {
    id: "firstUseAge",
    question: "At what age did you first use drugs?",
    type: "number",
    section: "Substance Use Background",
  },
  {
    id: "substanceDuration",
    question: "What was the duration of substance use?",
    type: "select",
    section: "Substance Use Background",
    options: [
      "1-2 months",
      "3-6 months",
      "6 months - 1 year",
      "1-2 years",
      "More than 3 years",
      "4-6 years",
      "Other",
    ],
  },
  {
    id: "treatmentReferral",
    question: "How were you referred for treatment?",
    type: "select",
    section: "Substance Use Background",
    options: [
      "Family member recommendation",
      "Psychiatrist / Counsellor recommendation",
      "Self-referred",
    ],
  },
  {
    id: "receivedTreatment",
    question: "What treatment have you received?",
    type: "multiSelect",
    section: "Substance Use Background",
    options: [
      "Medicine",
      "Counselling",
      "Mindfulness / Meditation",
      "Physical Activities",
    ],
  },
  {
    id: "stressFrequency",
    question: "How often do you experience stress?",
    type: "select",
    section: "Psychological & Environmental Factors",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    id: "emotionalTriggers",
    question: "How much do emotional triggers affect you?",
    type: "select",
    section: "Psychological & Environmental Factors",
    options: [
      "Not at all",
      "Slightly",
      "Moderately",
      "Significantly",
    ],
  },
  {
    id: "recoveryFactors",
    question: "Which factors affect your recovery?",
    type: "multiSelect",
    section: "Psychological & Environmental Factors",
    options: [
      "Stress",
      "Social",
      "Financial",
      "Family",
      "Mental health",
      "ADHD",
      "Autism",
      "Personal Disorders (Dyslexia, Dysgraphia)",
      "Others",
    ],
  },
  {
    id: "skills",
    question: "Rate your confidence in each skill.",
    type: "skills",
    section: "Skills, Interests & Reintegration",
  },
  {
    id: "jobInterest",
    question:
      "Which activities do you enjoy most? Select up to three.",
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
  {
    id: "willingToLearn",
    question: "Are you willing to learn new skills?",
    type: "select",
    section: "Skills, Interests & Reintegration",
    options: ["Yes", "No"],
  },
  {
    id: "supportNeeded",
    question: "What type of support do you need?",
    type: "multiSelect",
    section: "Skills, Interests & Reintegration",
    options: [
      "Jobs",
      "Training",
      "Counselling",
      "Financial",
      "Other",
    ],
  },
  {
    id: "recoveryStatus",
    question: "What is your current recovery status?",
    type: "select",
    section: "Skills, Interests & Reintegration",
    options: ["In program", "Not in program"],
  },
];

/* =====================================================
   SKILLS
===================================================== */

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

/* =====================================================
   RECOVERY SAFETY QUESTIONS
===================================================== */

const RECOVERY_QUESTIONS: RecoveryQuestion[] = [
  {
    id: 1,
    section: "Recovery Self-Efficacy",
    question:
      "I am confident that I can resist using drugs even when I feel stressed.",
  },
  {
    id: 2,
    section: "Recovery Self-Efficacy",
    question: "I can control my urges without using drugs.",
  },
  {
    id: 3,
    section: "Recovery Self-Efficacy",
    question: "I believe I can continue my recovery successfully.",
  },
  {
    id: 4,
    section: "Recovery Self-Efficacy",
    question:
      "I can refuse drugs even if someone offers them to me.",
  },
  {
    id: 5,
    section: "Recovery Self-Efficacy",
    question:
      "I believe I can overcome difficult situations without returning to substance use.",
  },
  {
    id: 6,
    section: "Emotional Stability",
    question: "I can manage my emotions in healthy ways.",
  },
  {
    id: 7,
    section: "Emotional Stability",
    question: "I usually remain calm when facing problems.",
  },
  {
    id: 8,
    section: "Emotional Stability",
    question: "I feel hopeful about my future.",
  },
  {
    id: 9,
    section: "Emotional Stability",
    question: "I rarely feel overwhelmed by negative emotions.",
  },
  {
    id: 10,
    section: "Emotional Stability",
    question: "I believe I have control over my life.",
  },
  {
    id: 11,
    section: "Lifestyle Stability",
    question: "I maintain a regular daily routine.",
  },
  {
    id: 12,
    section: "Lifestyle Stability",
    question: "I get enough sleep most nights.",
  },
  {
    id: 13,
    section: "Lifestyle Stability",
    question: "I participate in healthy daily activities.",
  },
  {
    id: 14,
    section: "Lifestyle Stability",
    question:
      "I avoid places or people that encourage drug use.",
  },
  {
    id: 15,
    section: "Lifestyle Stability",
    question: "I spend my free time in productive activities.",
  },
  {
    id: 16,
    section: "Social Support",
    question: "My family supports my recovery.",
  },
  {
    id: 17,
    section: "Social Support",
    question:
      "I have friends who encourage me to stay drug-free.",
  },
  {
    id: 18,
    section: "Social Support",
    question: "I know where to seek help if I need support.",
  },
  {
    id: 19,
    section: "Social Support",
    question: "I feel accepted by people around me.",
  },
  {
    id: 20,
    section: "Social Support",
    question:
      "I have someone I trust to discuss my problems.",
  },
  {
    id: 21,
    section: "Career Readiness",
    question: "I believe I can perform well in a job.",
  },
  {
    id: 22,
    section: "Career Readiness",
    question: "I enjoy learning new skills.",
  },
  {
    id: 23,
    section: "Career Readiness",
    question: "I can work responsibly with others.",
  },
  {
    id: 24,
    section: "Career Readiness",
    question: "I am willing to attend vocational training.",
  },
  {
    id: 25,
    section: "Career Readiness",
    question:
      "I believe having a career will help me maintain recovery.",
  },
];

/* =====================================================
   LIKERT SCALE
===================================================== */

const ANSWER_OPTIONS = [
  { label: "Strongly Disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly Agree", value: 5 },
];

/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function LifeBuildScreen() {
  const [screen, setScreen] = useState<
    "start" | "profile" | "assessment" | "result"
  >("start");

  const [profileIndex, setProfileIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);

  const [profileAnswers, setProfileAnswers] = useState<
    Record<string, string>
  >({});
  const [multiAnswers, setMultiAnswers] = useState<
    Record<string, string[]>
  >({});
  const [skillAnswers, setSkillAnswers] = useState<
    Record<string, number>
  >({});
  const [recoveryAnswers, setRecoveryAnswers] = useState<
    Record<number, number>
  >({});
  const [safetyScore, setSafetyScore] = useState(0);

  const currentProfileQuestion = PROFILE_QUESTIONS[profileIndex];
  const currentRecoveryQuestion = RECOVERY_QUESTIONS[questionIndex];

  /* =====================================================
     HANDLERS
  ===================================================== */

  const startAssessment = () => {
    setScreen("profile");
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
    const alreadySelected = currentAnswers.includes(option);

    if (alreadySelected) {
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
    setSkillAnswers((previous) => ({
      ...previous,
      [skill]: value,
    }));
  };

  const isCurrentProfileQuestionAnswered = () => {
    if (currentProfileQuestion.type === "multiSelect") {
      const answers = multiAnswers[currentProfileQuestion.id] || [];
      return answers.length > 0;
    }

    if (currentProfileQuestion.type === "skills") {
      return SKILLS.every((skill) => skillAnswers[skill]);
    }

    const answer = profileAnswers[currentProfileQuestion.id];
    return !!answer && answer.trim() !== "";
  };

  const goToNextProfileQuestion = () => {
    if (!isCurrentProfileQuestionAnswered()) {
      Alert.alert(
        "Answer Required",
        "Please provide an answer before continuing."
      );
      return;
    }

    if (profileIndex < PROFILE_QUESTIONS.length - 1) {
      setProfileIndex(profileIndex + 1);
    } else {
      setScreen("assessment");
    }
  };

  const goToPreviousProfileQuestion = () => {
    if (profileIndex > 0) {
      setProfileIndex(profileIndex - 1);
    }
  };

  const selectRecoveryAnswer = (value: number) => {
    setRecoveryAnswers((previous) => ({
      ...previous,
      [currentRecoveryQuestion.id]: value,
    }));
  };

  const goToNextRecoveryQuestion = () => {
    const answer = recoveryAnswers[currentRecoveryQuestion.id];

    if (!answer) {
      Alert.alert(
        "Answer Required",
        "Please select an answer before continuing."
      );
      return;
    }

    if (questionIndex < RECOVERY_QUESTIONS.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      calculateSafetyScore();
    }
  };

  const goToPreviousRecoveryQuestion = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    }
  };

  const calculateSafetyScore = () => {
    let totalScore = 0;

    RECOVERY_QUESTIONS.forEach((question) => {
      totalScore += recoveryAnswers[question.id] || 0;
    });

    const maximumScore = RECOVERY_QUESTIONS.length * 5;
    const percentage = (totalScore / maximumScore) * 100;
    const finalScore = Math.round(percentage);

    setSafetyScore(finalScore);
    setScreen("result");
  };

  const getRiskLevel = () => {
    if (safetyScore >= 75) {
      return {
        level: "Low Risk",
        description:
          "You currently show a stronger recovery safety level. You can explore suitable career paths.",
        color: "#17a673",
        background: "#e9fbea",
        icon: "shield-checkmark",
      };
    }

    if (safetyScore >= 50) {
      return {
        level: "Moderate Recovery Safety",
        description:
          "You have reached the minimum recovery safety level to explore suitable career paths.",
        color: "#f09c00",
        background: "#fff7e6",
        icon: "shield-half",
      };
    }

    return {
      level: "Needs More Recovery Support",
      description:
        "Your current recovery safety score is below 50%. Focus on your recovery activities and support plan.",
      color: "#e0362e",
      background: "#fff0f0",
      icon: "shield-outline",
    };
  };

  const riskInfo = getRiskLevel();
  const isEligibleForCareer = safetyScore >= 50;

  const restartAssessment = () => {
    setProfileIndex(0);
    setQuestionIndex(0);
    setProfileAnswers({});
    setMultiAnswers({});
    setSkillAnswers({});
    setRecoveryAnswers({});
    setSafetyScore(0);
    setScreen("start");
  };

  /* =====================================================
     START SCREEN  (redesigned to match reference)
  ===================================================== */

  if (screen === "start") {
    return (
      <ScrollView
        style={lifeBuildStyles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Soft Header */}
        <View style={lifeBuildStyles.header}>
          <View style={lifeBuildStyles.headerCircleLarge} />
          <View style={lifeBuildStyles.headerCircleSmall} />

          <View style={lifeBuildStyles.headerContent}>
            <Text style={lifeBuildStyles.headerSmallText}>
              BUILD YOUR FUTURE
            </Text>
            <Text style={lifeBuildStyles.headerTitle}>LifeBuild</Text>
            <Text style={lifeBuildStyles.headerDescription}>
              Every step you take brings you closer to a stronger,
              healthier and brighter future.
            </Text>
          </View>

          <Image
            source={require("../../../assets/images/hero_recovery.png")}
            style={lifeBuildStyles.headerImage}
            resizeMode="cover"
          />

          <View style={lifeBuildStyles.headerIcon}>
            <Ionicons name="rocket-outline" size={42} color="#fff" />
          </View>
        </View>

        {/* Welcome Text */}
        <View style={lifeBuildStyles.welcomeSection}>
          <Text style={lifeBuildStyles.welcomeTitle}>
            Welcome back,{" "}
            <Text style={lifeBuildStyles.welcomeHighlight}>User!</Text>
          </Text>
          <Text style={lifeBuildStyles.welcomeSubtitle}>
            Your recovery journey can help you build a safer and
            stronger future.
          </Text>
        </View>

        {/* Main Start Card */}
        <View style={lifeBuildStyles.startMainCard}>
          <Image
            source={require("../../../assets/images/assessment_clipboard.png")}
            style={lifeBuildStyles.startLeftImage}
            resizeMode="contain"
          />

          <View style={lifeBuildStyles.startCenterContent}>
            <View style={lifeBuildStyles.startIconCircle}>
              <Ionicons name="clipboard-outline" size={32} color="#2CA6A4" />
            </View>

          <Text style={lifeBuildStyles.startMainTitle}>
            Start Your Assessment
          </Text>

          <Text style={lifeBuildStyles.startMainDescription}>
            Complete your personal information and Recovery Safety
            Assessment to understand your current recovery safety level.
          </Text>

          <TouchableOpacity
            style={lifeBuildStyles.startButton}
            onPress={startAssessment}
            activeOpacity={0.85}
          >
            <Text style={lifeBuildStyles.startButtonText}>
              Start Assessment
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
          </View>

          <Image
            source={require("../../../assets/images/assessment_laptop.png")}
            style={lifeBuildStyles.startRightImage}
            resizeMode="contain"
          />
        </View>

        {/* 2×2 Step Cards */}
        <View style={lifeBuildStyles.stepsGrid}>
          {/* Step 01 */}
          <View style={lifeBuildStyles.stepCard}>
            <View style={lifeBuildStyles.stepCardHeader}>
              <View style={lifeBuildStyles.stepNumberBadge}>
                <Text style={lifeBuildStyles.stepNumberText}>01</Text>
              </View>
              <View style={lifeBuildStyles.stepIconCircle}>
                <Ionicons name="person-outline" size={16} color="#2CA6A4" />
              </View>
            </View>
            <Text style={lifeBuildStyles.stepCardTitle}>
              Tell Us About Yourself
            </Text>
            <Text style={lifeBuildStyles.stepCardDescription}>
              Answer 16 questions about your background, skills,
              interests and recovery support needs.
            </Text>
            <Image source={require("../../../assets/images/profile_user.png")} style={lifeBuildStyles.stepImage} resizeMode="contain" />
          </View>

          {/* Step 02 */}
          <View style={lifeBuildStyles.stepCard}>
            <View style={lifeBuildStyles.stepCardHeader}>
              <View style={lifeBuildStyles.stepNumberBadge}>
                <Text style={lifeBuildStyles.stepNumberText}>02</Text>
              </View>
              <View style={lifeBuildStyles.stepIconCircle}>
                <Ionicons name="document-text-outline" size={16} color="#2CA6A4" />
              </View>
            </View>
            <Text style={lifeBuildStyles.stepCardTitle}>
              Complete Recovery Assessment
            </Text>
            <Text style={lifeBuildStyles.stepCardDescription}>
              Answer 25 Recovery Safety Assessment questions.
            </Text>
            <Image source={require("../../../assets/images/assessment_laptop.png")} style={lifeBuildStyles.stepImage} resizeMode="contain" />
          </View>

          {/* Step 03 */}
          <View style={lifeBuildStyles.stepCard}>
            <View style={lifeBuildStyles.stepCardHeader}>
              <View style={lifeBuildStyles.stepNumberBadge}>
                <Text style={lifeBuildStyles.stepNumberText}>03</Text>
              </View>
              <View style={lifeBuildStyles.stepIconCircle}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#2CA6A4" />
              </View>
            </View>
            <Text style={lifeBuildStyles.stepCardTitle}>
              Calculate Safety Score
            </Text>
            <Text style={lifeBuildStyles.stepCardDescription}>
              Your 25 assessment answers are used to calculate your
              Recovery Safety Score.
            </Text>
            <Image source={require("../../../assets/images/safety_shield.png")} style={lifeBuildStyles.stepImage} resizeMode="contain" />
          </View>

          {/* Step 04 */}
          <View style={lifeBuildStyles.stepCard}>
            <View style={lifeBuildStyles.stepCardHeader}>
              <View style={lifeBuildStyles.stepNumberBadge}>
                <Text style={lifeBuildStyles.stepNumberText}>04</Text>
              </View>
              <View style={lifeBuildStyles.stepIconCircle}>
                <Ionicons name="briefcase-outline" size={16} color="#2CA6A4" />
              </View>
            </View>
            <Text style={lifeBuildStyles.stepCardTitle}>
              Discover Your Career Path
            </Text>
            <Text style={lifeBuildStyles.stepCardDescription}>
              If your Recovery Safety Score is 50% or above, suitable
              career paths can be recommended.
            </Text>
            <Image source={require("../../../assets/images/career_growth.png")} style={lifeBuildStyles.stepImage} resizeMode="contain" />
          </View>
        </View>

        {/* Encouragement Banner */}
        <View style={lifeBuildStyles.encourageBanner}>
          <View style={lifeBuildStyles.encourageIconWrap}>
            <Ionicons name="heart" size={24} color="#2CA6A4" />
          </View>
          <View style={lifeBuildStyles.encourageTextWrap}>
            <Text style={lifeBuildStyles.encourageTitle}>
              You are stronger than you think.
            </Text>
            <Text style={lifeBuildStyles.encourageSubtitle}>
              We are here to support you every step of the way.
            </Text>
          </View>
        </View>

        {/* Feature Row */}
        <View style={lifeBuildStyles.featureRow}>
          <View style={lifeBuildStyles.featureItem}>
            <View style={lifeBuildStyles.featureIconCircle}>
              <Ionicons name="shield-checkmark" size={18} color="#2CA6A4" />
            </View>
            <Text style={lifeBuildStyles.featureTitle}>
              100% Confidential
            </Text>
            <Text style={lifeBuildStyles.featureDescription}>
              Your data is private and secure.
            </Text>
          </View>

          <View style={lifeBuildStyles.featureItem}>
            <View style={lifeBuildStyles.featureIconCircle}>
              <Ionicons name="stats-chart" size={18} color="#2CA6A4" />
            </View>
            <Text style={lifeBuildStyles.featureTitle}>
              Personalized Results
            </Text>
            <Text style={lifeBuildStyles.featureDescription}>
              Get recommendations that fit you.
            </Text>
          </View>

          <View style={lifeBuildStyles.featureItem}>
            <View style={lifeBuildStyles.featureIconCircle}>
              <Ionicons name="heart" size={18} color="#2CA6A4" />
            </View>
            <Text style={lifeBuildStyles.featureTitle}>
              Designed for You
            </Text>
            <Text style={lifeBuildStyles.featureDescription}>
              Built to support your recovery journey.
            </Text>
          </View>
        </View>

        {/* Extra bottom space for footer */}
        <View style={{ height: 24 }} />
      </ScrollView>
    );
  }

  /* =====================================================
     PROFILE QUESTIONS
  ===================================================== */

  if (screen === "profile") {
    const savedAnswer =
      profileAnswers[currentProfileQuestion.id] || "";
    const selectedMultiAnswers =
      multiAnswers[currentProfileQuestion.id] || [];
    const progress =
      ((profileIndex + 1) / PROFILE_QUESTIONS.length) * 100;

    return (
      <ScrollView
        style={lifeBuildStyles.container}
        contentContainerStyle={lifeBuildStyles.screenPadding}
        showsVerticalScrollIndicator={false}
      >
        <Text style={lifeBuildStyles.sectionLabel}>
          PERSONAL & CAREER INFORMATION
        </Text>

        <Text style={lifeBuildStyles.screenTitle}>
          Tell Us About Yourself
        </Text>

        <Text style={lifeBuildStyles.screenSubtitle}>
          This information helps us understand your background,
          skills and interests for future career recommendations.
        </Text>

        {/* Progress */}
        <View style={lifeBuildStyles.progressTrack}>
          <View
            style={[
              lifeBuildStyles.progressFill,
              { width: `${progress}%` },
            ]}
          />
        </View>
        <Text style={lifeBuildStyles.progressText}>
          Question {profileIndex + 1} of {PROFILE_QUESTIONS.length}
        </Text>

        {/* Question Card */}
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
                currentProfileQuestion.type === "number"
                  ? "numeric"
                  : "default"
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
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#2CA6A4"
                    />
                  )}
                </TouchableOpacity>
              );
            })}

          {/* MULTI SELECT */}
          {currentProfileQuestion.type === "multiSelect" && (
            <>
              {currentProfileQuestion.maxSelections && (
                <Text style={lifeBuildStyles.maxSelectHint}>
                  Select up to {currentProfileQuestion.maxSelections}{" "}
                  options
                </Text>
              )}

              {currentProfileQuestion.options?.map((option) => {
                const selected =
                  selectedMultiAnswers.includes(option);

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
                          onPress={() =>
                            selectSkillRating(skill, value)
                          }
                          style={[
                            lifeBuildStyles.skillButton,
                            selected &&
                              lifeBuildStyles.skillButtonSelected,
                          ]}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              lifeBuildStyles.skillButtonText,
                              selected &&
                                lifeBuildStyles.skillButtonTextSelected,
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

        {/* Navigation */}
        <View style={lifeBuildStyles.navigationRow}>
          {profileIndex > 0 && (
            <TouchableOpacity
              onPress={goToPreviousProfileQuestion}
              style={lifeBuildStyles.previousButton}
              activeOpacity={0.7}
            >
              <Text style={lifeBuildStyles.previousButtonText}>
                Back
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={goToNextProfileQuestion}
            style={lifeBuildStyles.nextButton}
            activeOpacity={0.85}
          >
            <Text style={lifeBuildStyles.nextButtonText}>
              {profileIndex === PROFILE_QUESTIONS.length - 1
                ? "Start Recovery Assessment"
                : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  /* =====================================================
     RECOVERY ASSESSMENT
  ===================================================== */

  if (screen === "assessment") {
    const progress =
      ((questionIndex + 1) / RECOVERY_QUESTIONS.length) * 100;
    const selectedAnswer =
      recoveryAnswers[currentRecoveryQuestion.id];

    return (
      <ScrollView
        style={lifeBuildStyles.container}
        contentContainerStyle={lifeBuildStyles.screenPadding}
        showsVerticalScrollIndicator={false}
      >
        <Text style={lifeBuildStyles.sectionLabel}>
          RECOVERY SAFETY ASSESSMENT
        </Text>

        <Text style={lifeBuildStyles.screenTitle}>
          Recovery Assessment
        </Text>

        <Text style={lifeBuildStyles.screenSubtitle}>
          Please select the answer that best describes how you
          currently feel.
        </Text>

        {/* Progress */}
        <View style={lifeBuildStyles.progressTrack}>
          <View
            style={[
              lifeBuildStyles.progressFill,
              { width: `${progress}%` },
            ]}
          />
        </View>
        <Text style={lifeBuildStyles.progressText}>
          Question {questionIndex + 1} of {RECOVERY_QUESTIONS.length}
        </Text>

        {/* Question Card */}
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

          {/* Likert Options */}
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
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color="#2CA6A4"
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Navigation */}
        <View style={lifeBuildStyles.navigationRow}>
          {questionIndex > 0 && (
            <TouchableOpacity
              onPress={goToPreviousRecoveryQuestion}
              style={lifeBuildStyles.previousButton}
              activeOpacity={0.7}
            >
              <Text style={lifeBuildStyles.previousButtonText}>
                Back
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={goToNextRecoveryQuestion}
            style={[
              lifeBuildStyles.nextButton,
              questionIndex === RECOVERY_QUESTIONS.length - 1 &&
                lifeBuildStyles.nextButtonSuccess,
            ]}
            activeOpacity={0.85}
          >
            <Text style={lifeBuildStyles.nextButtonText}>
              {questionIndex === RECOVERY_QUESTIONS.length - 1
                ? "View Result"
                : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  /* =====================================================
     RESULT SCREEN
  ===================================================== */

  return (
    <ScrollView
      style={lifeBuildStyles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={lifeBuildStyles.header}>
        <View style={lifeBuildStyles.headerCircleLarge} />
        <View style={lifeBuildStyles.headerCircleSmall} />

        <View style={lifeBuildStyles.headerContent}>
          <Text style={lifeBuildStyles.headerSmallText}>
            YOUR ASSESSMENT RESULT
          </Text>
          <Text style={lifeBuildStyles.headerTitle}>LifeBuild</Text>
          <Text style={lifeBuildStyles.headerDescription}>
            Here is your current Recovery Safety Score and recommended
            next steps.
          </Text>
        </View>

        <View style={lifeBuildStyles.headerIcon}>
          <Ionicons name="trophy-outline" size={40} color="#fff" />
        </View>
      </View>

      <View style={lifeBuildStyles.content}>
        {/* ===== Score + Status Card (side by side) ===== */}
        <View style={lifeBuildStyles.resultScoreCard}>
          <View style={lifeBuildStyles.resultScoreHeader}>
            <Ionicons
              name="shield-checkmark"
              size={20}
              color="#2CA6A4"
            />
            <Text style={lifeBuildStyles.resultScoreHeaderText}>
              Recovery Safety Score
            </Text>
          </View>

          <View style={lifeBuildStyles.resultScoreBody}>
            {/* Circular Score */}
            <View style={lifeBuildStyles.resultCircleWrap}>
              <View style={lifeBuildStyles.resultCircleOuter}>
                <View style={lifeBuildStyles.resultCircleInner}>
                  <Text style={lifeBuildStyles.resultScoreValue}>
                    {safetyScore}%
                  </Text>
                  <Text style={lifeBuildStyles.resultScoreLabel}>
                    Safety Score
                  </Text>
                </View>
              </View>
            </View>

            {/* Status Box */}
            <View
              style={[
                lifeBuildStyles.resultStatusBox,
                { backgroundColor: riskInfo.background },
              ]}
            >
              <View style={lifeBuildStyles.resultStatusIconRow}>
                <Ionicons
                  name={riskInfo.icon as any}
                  size={20}
                  color={riskInfo.color}
                />
                <Text
                  style={[
                    lifeBuildStyles.resultStatusTitle,
                    { color: riskInfo.color },
                  ]}
                >
                  {riskInfo.level}
                </Text>
              </View>
              <Text style={lifeBuildStyles.resultStatusDesc}>
                {riskInfo.description}
              </Text>
            </View>
          </View>

          {/* Progress bar under the score */}
          <View style={lifeBuildStyles.resultProgressTrack}>
            <View
              style={[
                lifeBuildStyles.resultProgressFill,
                {
                  width: `${safetyScore}%`,
                  backgroundColor: riskInfo.color,
                },
              ]}
            />
          </View>
        </View>

        {/* ===== Career Paths or Support ===== */}
        {isEligibleForCareer ? (
          <View style={lifeBuildStyles.resultCareerCard}>
            <View style={lifeBuildStyles.resultCareerHeader}>
              <Ionicons name="briefcase" size={20} color="#2CA6A4" />
              <Text style={lifeBuildStyles.resultCareerHeaderText}>
                Recommended Career Paths
              </Text>
            </View>

            <Text style={lifeBuildStyles.resultCareerDesc}>
              Based on your recovery safety score, skills, interests
              and background, these career paths may be suitable for
              your current recovery journey.
            </Text>

            {CAREER_PATHS.map((career) => (
              <TouchableOpacity
                key={career.id}
                style={lifeBuildStyles.resultCareerItem}
                activeOpacity={0.7}
              >
                <View style={lifeBuildStyles.resultCareerIcon}>
                  <Ionicons
                    name={career.icon as any}
                    size={22}
                    color="#2CA6A4"
                  />
                </View>

                <View style={lifeBuildStyles.resultCareerContent}>
                  <Text style={lifeBuildStyles.resultCareerTitle}>
                    {career.title}
                  </Text>
                  <Text style={lifeBuildStyles.resultCareerText}>
                    {career.description}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#8a9a9a"
                />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={lifeBuildStyles.supportCard}>
            <View style={lifeBuildStyles.supportIcon}>
              <Ionicons name="heart-outline" size={30} color="#e0362e" />
            </View>
            <Text style={lifeBuildStyles.supportTitle}>
              Focus on Your Recovery
            </Text>
            <Text style={lifeBuildStyles.supportDescription}>
              Your Recovery Safety Score is currently below 50%.
              Continue focusing on your recovery and support
              activities. Career recommendations will become available
              when your score reaches 50% or above.
            </Text>
          </View>
        )}

        {/* Restart */}
        <TouchableOpacity
          onPress={restartAssessment}
          style={lifeBuildStyles.restartButton}
          activeOpacity={0.7}
        >
          <Text style={lifeBuildStyles.restartButtonText}>
            Take Assessment Again
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
