import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
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
   QUESTIONS 1 - 16

   These questions are used for:
   - Personal background
   - Skills
   - Interests
   - Career recommendation

   They are NOT directly used for the
   Recovery Safety Score.
===================================================== */

const PROFILE_QUESTIONS: ProfileQuestion[] = [
  /* ================= SECTION A ================= */

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

  /* ================= SECTION B ================= */

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

  /* ================= SECTION C ================= */

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

  /* ================= SECTION D ================= */

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
   EXACTLY 25 QUESTIONS

   5 Sections × 5 Questions
===================================================== */

const RECOVERY_QUESTIONS: RecoveryQuestion[] = [
  /* ================= SECTION A ================= */

  {
    id: 1,
    section: "Recovery Self-Efficacy",
    question:
      "I am confident that I can resist using drugs even when I feel stressed.",
  },
  {
    id: 2,
    section: "Recovery Self-Efficacy",
    question:
      "I can control my urges without using drugs.",
  },
  {
    id: 3,
    section: "Recovery Self-Efficacy",
    question:
      "I believe I can continue my recovery successfully.",
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

  /* ================= SECTION B ================= */

  {
    id: 6,
    section: "Emotional Stability",
    question:
      "I can manage my emotions in healthy ways.",
  },
  {
    id: 7,
    section: "Emotional Stability",
    question:
      "I usually remain calm when facing problems.",
  },
  {
    id: 8,
    section: "Emotional Stability",
    question:
      "I feel hopeful about my future.",
  },
  {
    id: 9,
    section: "Emotional Stability",
    question:
      "I rarely feel overwhelmed by negative emotions.",
  },
  {
    id: 10,
    section: "Emotional Stability",
    question:
      "I believe I have control over my life.",
  },

  /* ================= SECTION C ================= */

  {
    id: 11,
    section: "Lifestyle Stability",
    question:
      "I maintain a regular daily routine.",
  },
  {
    id: 12,
    section: "Lifestyle Stability",
    question:
      "I get enough sleep most nights.",
  },
  {
    id: 13,
    section: "Lifestyle Stability",
    question:
      "I participate in healthy daily activities.",
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
    question:
      "I spend my free time in productive activities.",
  },

  /* ================= SECTION D ================= */

  {
    id: 16,
    section: "Social Support",
    question:
      "My family supports my recovery.",
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
    question:
      "I know where to seek help if I need support.",
  },
  {
    id: 19,
    section: "Social Support",
    question:
      "I feel accepted by people around me.",
  },
  {
    id: 20,
    section: "Social Support",
    question:
      "I have someone I trust to discuss my problems.",
  },

  /* ================= SECTION E ================= */

  {
    id: 21,
    section: "Career Readiness",
    question:
      "I believe I can perform well in a job.",
  },
  {
    id: 22,
    section: "Career Readiness",
    question:
      "I enjoy learning new skills.",
  },
  {
    id: 23,
    section: "Career Readiness",
    question:
      "I can work responsibly with others.",
  },
  {
    id: 24,
    section: "Career Readiness",
    question:
      "I am willing to attend vocational training.",
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
  {
    label: "Strongly Disagree",
    value: 1,
  },
  {
    label: "Disagree",
    value: 2,
  },
  {
    label: "Neutral",
    value: 3,
  },
  {
    label: "Agree",
    value: 4,
  },
  {
    label: "Strongly Agree",
    value: 5,
  },
];

/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function LifeBuildScreen() {
  /*
    start
    profile
    assessment
    result
  */

  const [screen, setScreen] = useState<
    "start" | "profile" | "assessment" | "result"
  >("start");

  const [profileIndex, setProfileIndex] =
    useState(0);

  const [questionIndex, setQuestionIndex] =
    useState(0);

  /*
    Normal single answers
  */

  const [profileAnswers, setProfileAnswers] =
    useState<Record<string, string>>({});

  /*
    Multiple answers
  */

  const [multiAnswers, setMultiAnswers] =
    useState<Record<string, string[]>>({});

  /*
    Skills rating

    Example:

    {
      Communication: 4,
      Teamwork: 5
    }
  */

  const [skillAnswers, setSkillAnswers] =
    useState<Record<string, number>>({});

  /*
    Recovery answers

    Question ID : Score
  */

  const [recoveryAnswers, setRecoveryAnswers] =
    useState<Record<number, number>>({});

  const [safetyScore, setSafetyScore] =
    useState(0);

  /* =====================================================
     CURRENT QUESTIONS
  ===================================================== */

  const currentProfileQuestion =
    PROFILE_QUESTIONS[profileIndex];

  const currentRecoveryQuestion =
    RECOVERY_QUESTIONS[questionIndex];

  /* =====================================================
     START ASSESSMENT
  ===================================================== */

  const startAssessment = () => {
    setScreen("profile");
  };

  /* =====================================================
     PROFILE ANSWERS
  ===================================================== */

  const saveProfileAnswer = (value: string) => {
    setProfileAnswers((previous) => ({
      ...previous,
      [currentProfileQuestion.id]: value,
    }));
  };

  /* =====================================================
     MULTI SELECT
  ===================================================== */

  const toggleMultiAnswer = (
    questionId: string,
    option: string,
    maxSelections?: number
  ) => {
    const currentAnswers =
      multiAnswers[questionId] || [];

    const alreadySelected =
      currentAnswers.includes(option);

    if (alreadySelected) {
      setMultiAnswers((previous) => ({
        ...previous,
        [questionId]: currentAnswers.filter(
          (item) => item !== option
        ),
      }));

      return;
    }

    if (
      maxSelections &&
      currentAnswers.length >= maxSelections
    ) {
      Alert.alert(
        "Maximum Selection",
        `You can select up to ${maxSelections} options.`
      );

      return;
    }

    setMultiAnswers((previous) => ({
      ...previous,
      [questionId]: [
        ...currentAnswers,
        option,
      ],
    }));
  };

  /* =====================================================
     SKILL ANSWER
  ===================================================== */

  const selectSkillRating = (
    skill: string,
    value: number
  ) => {
    setSkillAnswers((previous) => ({
      ...previous,
      [skill]: value,
    }));
  };

  /* =====================================================
     PROFILE VALIDATION
  ===================================================== */

  const isCurrentProfileQuestionAnswered =
    () => {
      if (
        currentProfileQuestion.type ===
        "multiSelect"
      ) {
        const answers =
          multiAnswers[
            currentProfileQuestion.id
          ] || [];

        return answers.length > 0;
      }

      if (
        currentProfileQuestion.type ===
        "skills"
      ) {
        return SKILLS.every(
          (skill) => skillAnswers[skill]
        );
      }

      const answer =
        profileAnswers[
          currentProfileQuestion.id
        ];

      return !!answer && answer.trim() !== "";
    };

  /* =====================================================
     NEXT PROFILE QUESTION
  ===================================================== */

  const goToNextProfileQuestion = () => {
    if (!isCurrentProfileQuestionAnswered()) {
      Alert.alert(
        "Answer Required",
        "Please provide an answer before continuing."
      );

      return;
    }

    if (
      profileIndex <
      PROFILE_QUESTIONS.length - 1
    ) {
      setProfileIndex(profileIndex + 1);
    } else {
      setScreen("assessment");
    }
  };

  /* =====================================================
     PREVIOUS PROFILE QUESTION
  ===================================================== */

  const goToPreviousProfileQuestion = () => {
    if (profileIndex > 0) {
      setProfileIndex(profileIndex - 1);
    }
  };

  /* =====================================================
     RECOVERY ANSWERS
  ===================================================== */

  const selectRecoveryAnswer = (
    value: number
  ) => {
    setRecoveryAnswers((previous) => ({
      ...previous,
      [currentRecoveryQuestion.id]: value,
    }));
  };

  /* =====================================================
     NEXT RECOVERY QUESTION
  ===================================================== */

  const goToNextRecoveryQuestion = () => {
    const answer =
      recoveryAnswers[
        currentRecoveryQuestion.id
      ];

    if (!answer) {
      Alert.alert(
        "Answer Required",
        "Please select an answer before continuing."
      );

      return;
    }

    if (
      questionIndex <
      RECOVERY_QUESTIONS.length - 1
    ) {
      setQuestionIndex(questionIndex + 1);
    } else {
      calculateSafetyScore();
    }
  };

  /* =====================================================
     PREVIOUS RECOVERY QUESTION
  ===================================================== */

  const goToPreviousRecoveryQuestion = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    }
  };

  /* =====================================================
     CALCULATE RECOVERY SAFETY SCORE

     25 Questions
     Maximum = 25 × 5 = 125

     Percentage:
     (Total Score / 125) × 100
  ===================================================== */

  const calculateSafetyScore = () => {
    let totalScore = 0;

    RECOVERY_QUESTIONS.forEach(
      (question) => {
        totalScore +=
          recoveryAnswers[question.id] || 0;
      }
    );

    const maximumScore =
      RECOVERY_QUESTIONS.length * 5;

    const percentage =
      (totalScore / maximumScore) * 100;

    const finalScore =
      Math.round(percentage);

    setSafetyScore(finalScore);

    setScreen("result");
  };

  /* =====================================================
     RISK LEVEL
  ===================================================== */

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

  const isEligibleForCareer =
    safetyScore >= 50;

  /* =====================================================
     RESTART
  ===================================================== */

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
     START SCREEN
  ===================================================== */

  if (screen === "start") {
    return (
      <ScrollView
        style={lifeBuildStyles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={lifeBuildStyles.header}>
          <View
            style={
              lifeBuildStyles.headerCircleLarge
            }
          />

          <View
            style={
              lifeBuildStyles.headerCircleSmall
            }
          />

          <View
            style={
              lifeBuildStyles.headerContent
            }
          >
            <Text
              style={
                lifeBuildStyles.headerSmallText
              }
            >
              BUILD YOUR FUTURE
            </Text>

            <Text
              style={
                lifeBuildStyles.headerTitle
              }
            >
              LifeBuild
            </Text>

            <Text
              style={
                lifeBuildStyles.headerDescription
              }
            >
              Your recovery journey can help you
              build a safer and stronger future.
            </Text>
          </View>

          <View
            style={
              lifeBuildStyles.headerIcon
            }
          >
            <Ionicons
              name="rocket-outline"
              size={42}
              color="#fff"
            />
          </View>
        </View>

        <View
          style={lifeBuildStyles.content}
        >
          {/* HOW LIFE BUILD WORKS */}

          <View
            style={lifeBuildStyles.card}
          >
            <View
              style={
                lifeBuildStyles.cardHeader
              }
            >
              <View
                style={
                  lifeBuildStyles.cardTitle
                }
              >
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color="#2CA6A4"
                />

                <Text
                  style={
                    lifeBuildStyles.cardTitleText
                  }
                >
                  How LifeBuild Works
                </Text>
              </View>
            </View>

            {/* STEP 1 */}

            <View
              style={
                lifeBuildStyles.stepRow
              }
            >
              <View
                style={
                  lifeBuildStyles.stepNumber
                }
              >
                <Text
                  style={
                    lifeBuildStyles.stepNumberText
                  }
                >
                  1
                </Text>
              </View>

              <View
                style={
                  lifeBuildStyles.stepContent
                }
              >
                <Text
                  style={
                    lifeBuildStyles.stepTitle
                  }
                >
                  Tell Us About Yourself
                </Text>

                <Text
                  style={
                    lifeBuildStyles.stepDescription
                  }
                >
                  Answer 16 questions about your
                  background, skills, interests and
                  recovery support needs.
                </Text>
              </View>
            </View>

            {/* STEP 2 */}

            <View
              style={
                lifeBuildStyles.stepRow
              }
            >
              <View
                style={
                  lifeBuildStyles.stepNumber
                }
              >
                <Text
                  style={
                    lifeBuildStyles.stepNumberText
                  }
                >
                  2
                </Text>
              </View>

              <View
                style={
                  lifeBuildStyles.stepContent
                }
              >
                <Text
                  style={
                    lifeBuildStyles.stepTitle
                  }
                >
                  Complete Recovery Assessment
                </Text>

                <Text
                  style={
                    lifeBuildStyles.stepDescription
                  }
                >
                  Answer 25 Recovery Safety
                  Assessment questions.
                </Text>
              </View>
            </View>

            {/* STEP 3 */}

            <View
              style={
                lifeBuildStyles.stepRow
              }
            >
              <View
                style={
                  lifeBuildStyles.stepNumber
                }
              >
                <Text
                  style={
                    lifeBuildStyles.stepNumberText
                  }
                >
                  3
                </Text>
              </View>

              <View
                style={
                  lifeBuildStyles.stepContent
                }
              >
                <Text
                  style={
                    lifeBuildStyles.stepTitle
                  }
                >
                  Calculate Safety Score
                </Text>

                <Text
                  style={
                    lifeBuildStyles.stepDescription
                  }
                >
                  Your 25 assessment answers are
                  used to calculate your Recovery
                  Safety Score.
                </Text>
              </View>
            </View>

            {/* STEP 4 */}

            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
              }}
            >
              <View
                style={
                  lifeBuildStyles.stepNumber
                }
              >
                <Text
                  style={
                    lifeBuildStyles.stepNumberText
                  }
                >
                  4
                </Text>
              </View>

              <View
                style={
                  lifeBuildStyles.stepContent
                }
              >
                <Text
                  style={
                    lifeBuildStyles.stepTitle
                  }
                >
                  Discover Your Career Path
                </Text>

                <Text
                  style={
                    lifeBuildStyles.stepDescription
                  }
                >
                  If your Recovery Safety Score is
                  50% or above, suitable career
                  paths can be recommended.
                </Text>
              </View>
            </View>
          </View>

          {/* START ASSESSMENT */}

          <View
            style={lifeBuildStyles.card}
          >
            <View
              style={
                lifeBuildStyles.startIcon
              }
            >
              <Ionicons
                name="clipboard-outline"
                size={40}
                color="#2CA6A4"
              />
            </View>

            <Text
              style={
                lifeBuildStyles.startTitle
              }
            >
              Start Your Assessment
            </Text>

            <Text
              style={
                lifeBuildStyles.startDescription
              }
            >
              Complete your personal information
              and Recovery Safety Assessment to
              understand your current recovery
              safety level.
            </Text>

            <TouchableOpacity
              style={
                lifeBuildStyles.startButton
              }
              onPress={startAssessment}
            >
              <Text
                style={
                  lifeBuildStyles.startButtonText
                }
              >
                Start Assessment
              </Text>

              <Ionicons
                name="arrow-forward"
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  /* =====================================================
     PROFILE QUESTIONS 1 - 16
  ===================================================== */

  if (screen === "profile") {
    const savedAnswer =
      profileAnswers[
        currentProfileQuestion.id
      ] || "";

    const selectedMultiAnswers =
      multiAnswers[
        currentProfileQuestion.id
      ] || [];

    const progress =
      ((profileIndex + 1) /
        PROFILE_QUESTIONS.length) *
      100;

    return (
      <ScrollView
        style={lifeBuildStyles.container}
        contentContainerStyle={{
          padding: 16,
          paddingTop: 60,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            color: "#2CA6A4",
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 1,
            marginBottom: 6,
          }}
        >
          PERSONAL & CAREER INFORMATION
        </Text>

        <Text
          style={{
            fontSize: 25,
            fontWeight: "700",
            color: "#1a2e2e",
            marginBottom: 8,
          }}
        >
          Tell Us About Yourself
        </Text>

        <Text
          style={{
            fontSize: 13,
            color: "#718181",
            lineHeight: 20,
            marginBottom: 20,
          }}
        >
          This information helps us understand
          your background, skills and interests
          for future career recommendations.
        </Text>

        {/* PROGRESS */}

        <View
          style={{
            height: 8,
            backgroundColor: "#e1f5f4",
            borderRadius: 10,
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          <View
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: "#2CA6A4",
              borderRadius: 10,
            }}
          />
        </View>

        <Text
          style={{
            textAlign: "right",
            color: "#718181",
            fontSize: 12,
            marginBottom: 20,
          }}
        >
          Question {profileIndex + 1} of{" "}
          {PROFILE_QUESTIONS.length}
        </Text>

        {/* QUESTION CARD */}

        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 18,
            padding: 18,
            borderWidth: 1,
            borderColor: "#e0f0ef",
          }}
        >
          <Text
            style={{
              color: "#2CA6A4",
              fontSize: 12,
              fontWeight: "700",
              marginBottom: 8,
            }}
          >
            {
              currentProfileQuestion.section
            }
          </Text>

          <Text
            style={{
              fontSize: 17,
              fontWeight: "700",
              color: "#1a2e2e",
              marginBottom: 18,
              lineHeight: 25,
            }}
          >
            {currentProfileQuestion.question}
          </Text>

          {/* TEXT / NUMBER */}

          {(currentProfileQuestion.type ===
            "text" ||
            currentProfileQuestion.type ===
              "number") && (
            <TextInput
              value={savedAnswer}
              onChangeText={
                saveProfileAnswer
              }
              placeholder="Enter your answer"
              keyboardType={
                currentProfileQuestion.type ===
                "number"
                  ? "numeric"
                  : "default"
              }
              style={{
                borderWidth: 1,
                borderColor: "#d5eeec",
                backgroundColor: "#f7fefe",
                borderRadius: 12,
                paddingHorizontal: 15,
                paddingVertical: 14,
                fontSize: 14,
                color: "#1a2e2e",
              }}
            />
          )}

          {/* SINGLE SELECT */}

          {currentProfileQuestion.type ===
            "select" &&
            currentProfileQuestion.options?.map(
              (option) => {
                const selected =
                  savedAnswer === option;

                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() =>
                      saveProfileAnswer(option)
                    }
                    style={{
                      borderWidth: 1,
                      borderColor: selected
                        ? "#2CA6A4"
                        : "#d5eeec",
                      backgroundColor: selected
                        ? "#e1f5f4"
                        : "#f7fefe",
                      borderRadius: 12,
                      padding: 14,
                      marginBottom: 10,
                      flexDirection: "row",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: selected
                          ? "#1a7775"
                          : "#1a2e2e",
                        fontWeight: selected
                          ? "700"
                          : "400",
                        fontSize: 14,
                      }}
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
              }
            )}

          {/* MULTI SELECT */}

          {currentProfileQuestion.type ===
            "multiSelect" && (
            <>
              {currentProfileQuestion.maxSelections && (
                <Text
                  style={{
                    fontSize: 12,
                    color: "#718181",
                    marginBottom: 12,
                  }}
                >
                  Select up to{" "}
                  {
                    currentProfileQuestion.maxSelections
                  }{" "}
                  options
                </Text>
              )}

              {currentProfileQuestion.options?.map(
                (option) => {
                  const selected =
                    selectedMultiAnswers.includes(
                      option
                    );

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
                      style={{
                        borderWidth: 1,
                        borderColor: selected
                          ? "#2CA6A4"
                          : "#d5eeec",
                        backgroundColor: selected
                          ? "#e1f5f4"
                          : "#f7fefe",
                        borderRadius: 12,
                        padding: 14,
                        marginBottom: 10,
                        flexDirection: "row",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: selected
                            ? "#1a7775"
                            : "#1a2e2e",
                          fontWeight: selected
                            ? "700"
                            : "400",
                          fontSize: 14,
                          flex: 1,
                        }}
                      >
                        {option}
                      </Text>

                      <Ionicons
                        name={
                          selected
                            ? "checkbox"
                            : "square-outline"
                        }
                        size={22}
                        color={
                          selected
                            ? "#2CA6A4"
                            : "#8a9a9a"
                        }
                      />
                    </TouchableOpacity>
                  );
                }
              )}
            </>
          )}

          {/* SKILLS */}

          {currentProfileQuestion.type ===
            "skills" && (
            <View>
              <Text
                style={{
                  fontSize: 12,
                  color: "#718181",
                  marginBottom: 16,
                }}
              >
                Rate each skill from 1 to 5.
              </Text>

              {SKILLS.map((skill) => (
                <View
                  key={skill}
                  style={{
                    marginBottom: 18,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#1a2e2e",
                      marginBottom: 10,
                    }}
                  >
                    {skill}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      gap: 8,
                    }}
                  >
                    {[1, 2, 3, 4, 5].map(
                      (value) => {
                        const selected =
                          skillAnswers[skill] ===
                          value;

                        return (
                          <TouchableOpacity
                            key={value}
                            onPress={() =>
                              selectSkillRating(
                                skill,
                                value
                              )
                            }
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: 21,
                              justifyContent:
                                "center",
                              alignItems:
                                "center",
                              backgroundColor:
                                selected
                                  ? "#2CA6A4"
                                  : "#f7fefe",
                              borderWidth: 1,
                              borderColor:
                                selected
                                  ? "#2CA6A4"
                                  : "#d5eeec",
                            }}
                          >
                            <Text
                              style={{
                                color: selected
                                  ? "#fff"
                                  : "#1a2e2e",
                                fontWeight:
                                  "700",
                              }}
                            >
                              {value}
                            </Text>
                          </TouchableOpacity>
                        );
                      }
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* NAVIGATION */}

        <View
          style={{
            flexDirection: "row",
            gap: 12,
            marginTop: 20,
          }}
        >
          {profileIndex > 0 && (
            <TouchableOpacity
              onPress={
                goToPreviousProfileQuestion
              }
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#2CA6A4",
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#2CA6A4",
                  fontWeight: "700",
                }}
              >
                Back
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={
              goToNextProfileQuestion
            }
            style={{
              flex: 1,
              backgroundColor: "#2CA6A4",
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "700",
              }}
            >
              {profileIndex ===
              PROFILE_QUESTIONS.length - 1
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
     QUESTIONS 1 - 25
  ===================================================== */

  if (screen === "assessment") {
    const progress =
      ((questionIndex + 1) /
        RECOVERY_QUESTIONS.length) *
      100;

    const selectedAnswer =
      recoveryAnswers[
        currentRecoveryQuestion.id
      ];

    return (
      <ScrollView
        style={lifeBuildStyles.container}
        contentContainerStyle={{
          padding: 16,
          paddingTop: 60,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            color: "#2CA6A4",
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 1,
            marginBottom: 6,
          }}
        >
          RECOVERY SAFETY ASSESSMENT
        </Text>

        <Text
          style={{
            fontSize: 25,
            fontWeight: "700",
            color: "#1a2e2e",
            marginBottom: 8,
          }}
        >
          Recovery Assessment
        </Text>

        <Text
          style={{
            fontSize: 13,
            color: "#718181",
            lineHeight: 20,
            marginBottom: 20,
          }}
        >
          Please select the answer that best
          describes how you currently feel.
        </Text>

        {/* PROGRESS */}

        <View
          style={{
            height: 8,
            backgroundColor: "#e1f5f4",
            borderRadius: 10,
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          <View
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: "#2CA6A4",
              borderRadius: 10,
            }}
          />
        </View>

        <Text
          style={{
            textAlign: "right",
            color: "#718181",
            fontSize: 12,
            marginBottom: 20,
          }}
        >
          Question {questionIndex + 1} of{" "}
          {RECOVERY_QUESTIONS.length}
        </Text>

        {/* QUESTION CARD */}

        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 18,
            padding: 18,
            borderWidth: 1,
            borderColor: "#e0f0ef",
          }}
        >
          <Text
            style={{
              color: "#2CA6A4",
              fontSize: 12,
              fontWeight: "700",
              marginBottom: 8,
            }}
          >
            SECTION:{" "}
            {currentRecoveryQuestion.section.toUpperCase()}
          </Text>

          <Text
            style={{
              color: "#718181",
              fontSize: 12,
              marginBottom: 12,
            }}
          >
            RECOVERY QUESTION{" "}
            {currentRecoveryQuestion.id}
          </Text>

          <Text
            style={{
              fontSize: 17,
              fontWeight: "700",
              color: "#1a2e2e",
              lineHeight: 25,
              marginBottom: 20,
            }}
          >
            {currentRecoveryQuestion.question}
          </Text>

          {/* LIKERT OPTIONS */}

          {ANSWER_OPTIONS.map(
            (option) => {
              const selected =
                selectedAnswer === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() =>
                    selectRecoveryAnswer(
                      option.value
                    )
                  }
                  style={{
                    borderWidth: 1,
                    borderColor: selected
                      ? "#2CA6A4"
                      : "#d5eeec",
                    backgroundColor: selected
                      ? "#e1f5f4"
                      : "#f7fefe",
                    borderRadius: 12,
                    paddingVertical: 14,
                    paddingHorizontal: 15,
                    marginBottom: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent:
                      "space-between",
                  }}
                >
                  <Text
                    style={{
                      color: selected
                        ? "#1a7775"
                        : "#1a2e2e",
                      fontSize: 14,
                      fontWeight: selected
                        ? "700"
                        : "400",
                    }}
                  >
                    {option.value}.{" "}
                    {option.label}
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
            }
          )}
        </View>

        {/* NAVIGATION */}

        <View
          style={{
            flexDirection: "row",
            gap: 12,
            marginTop: 20,
          }}
        >
          {questionIndex > 0 && (
            <TouchableOpacity
              onPress={
                goToPreviousRecoveryQuestion
              }
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#2CA6A4",
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#2CA6A4",
                  fontWeight: "700",
                }}
              >
                Back
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={
              goToNextRecoveryQuestion
            }
            style={{
              flex: 1,
              backgroundColor:
                questionIndex ===
                RECOVERY_QUESTIONS.length - 1
                  ? "#17a673"
                  : "#2CA6A4",
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "700",
              }}
            >
              {questionIndex ===
              RECOVERY_QUESTIONS.length - 1
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
      {/* HEADER */}

      <View style={lifeBuildStyles.header}>
        <View
          style={
            lifeBuildStyles.headerCircleLarge
          }
        />

        <View
          style={
            lifeBuildStyles.headerCircleSmall
          }
        />

        <View
          style={
            lifeBuildStyles.headerContent
          }
        >
          <Text
            style={
              lifeBuildStyles.headerSmallText
            }
          >
            YOUR ASSESSMENT RESULT
          </Text>

          <Text
            style={
              lifeBuildStyles.headerTitle
            }
          >
            LifeBuild
          </Text>

          <Text
            style={
              lifeBuildStyles.headerDescription
            }
          >
            Here is your current Recovery Safety
            Score and recommended next steps.
          </Text>
        </View>

        <View
          style={
            lifeBuildStyles.headerIcon
          }
        >
          <Ionicons
            name="trophy-outline"
            size={40}
            color="#fff"
          />
        </View>
      </View>

      <View
        style={lifeBuildStyles.content}
      >
        {/* SAFETY SCORE */}

        <View
          style={lifeBuildStyles.card}
        >
          <View
            style={
              lifeBuildStyles.cardHeader
            }
          >
            <View
              style={
                lifeBuildStyles.cardTitle
              }
            >
              <Ionicons
                name="shield-checkmark"
                size={22}
                color="#2CA6A4"
              />

              <Text
                style={
                  lifeBuildStyles.cardTitleText
                }
              >
                Recovery Safety Score
              </Text>
            </View>
          </View>

          <View
            style={
              lifeBuildStyles.scoreContainer
            }
          >
            <View
              style={
                lifeBuildStyles.scoreCircle
              }
            >
              <Text
                style={
                  lifeBuildStyles.scoreText
                }
              >
                {safetyScore}%
              </Text>

              <Text
                style={
                  lifeBuildStyles.scoreLabel
                }
              >
                Safety Score
              </Text>
            </View>
          </View>

          {/* PROGRESS BAR */}

          <View
            style={[
              lifeBuildStyles.scoreProgressTrack,
              {
                backgroundColor: "#e8f0f0",
              },
            ]}
          >
            <View
              style={[
                lifeBuildStyles.scoreProgressFill,
                {
                  width: `${safetyScore}%`,
                  backgroundColor:
                    riskInfo.color,
                },
              ]}
            />
          </View>

          {/* STATUS */}

          <View
            style={[
              lifeBuildStyles.statusBox,
              {
                backgroundColor:
                  riskInfo.background,
                borderLeftColor:
                  riskInfo.color,
              },
            ]}
          >
            <Ionicons
              name={
                riskInfo.icon as any
              }
              size={25}
              color={riskInfo.color}
            />

            <View style={{ flex: 1 }}>
              <Text
                style={[
                  lifeBuildStyles.statusTitle,
                  {
                    color: riskInfo.color,
                  },
                ]}
              >
                {riskInfo.level}
              </Text>

              <Text
                style={
                  lifeBuildStyles.statusDescription
                }
              >
                {riskInfo.description}
              </Text>
            </View>
          </View>
        </View>

        {/* CAREER RECOMMENDATION */}

        {isEligibleForCareer ? (
          <View
            style={lifeBuildStyles.card}
          >
            <View
              style={
                lifeBuildStyles.cardHeader
              }
            >
              <View
                style={
                  lifeBuildStyles.cardTitle
                }
              >
                <Ionicons
                  name="briefcase"
                  size={22}
                  color="#17a673"
                />

                <Text
                  style={
                    lifeBuildStyles.cardTitleText
                  }
                >
                  Recommended Career Paths
                </Text>
              </View>
            </View>

            <Text
              style={
                lifeBuildStyles.sectionDescription
              }
            >
              Based on your recovery safety
              score, skills, interests and
              background, these career paths may
              be suitable for your current
              recovery journey.
            </Text>

            {CAREER_PATHS.map(
              (career) => (
                <TouchableOpacity
                  key={career.id}
                  style={
                    lifeBuildStyles.careerCard
                  }
                >
                  <View
                    style={
                      lifeBuildStyles.careerIcon
                    }
                  >
                    <Ionicons
                      name={
                        career.icon as any
                      }
                      size={25}
                      color="#2CA6A4"
                    />
                  </View>

                  <View
                    style={
                      lifeBuildStyles.careerContent
                    }
                  >
                    <Text
                      style={
                        lifeBuildStyles.careerTitle
                      }
                    >
                      {career.title}
                    </Text>

                    <Text
                      style={
                        lifeBuildStyles.careerDescription
                      }
                    >
                      {career.description}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#8a9a9a"
                  />
                </TouchableOpacity>
              )
            )}
          </View>
        ) : (
          <View
            style={
              lifeBuildStyles.supportCard
            }
          >
            <View
              style={
                lifeBuildStyles.supportIcon
              }
            >
              <Ionicons
                name="heart-outline"
                size={30}
                color="#e0362e"
              />
            </View>

            <Text
              style={
                lifeBuildStyles.supportTitle
              }
            >
              Focus on Your Recovery
            </Text>

            <Text
              style={
                lifeBuildStyles.supportDescription
              }
            >
              Your Recovery Safety Score is
              currently below 50%. Continue
              focusing on your recovery and
              support activities. Career
              recommendations will become
              available when your score reaches
              50% or above.
            </Text>
          </View>
        )}

        {/* RESTART */}

        <TouchableOpacity
          onPress={restartAssessment}
          style={{
            borderWidth: 1,
            borderColor: "#2CA6A4",
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              color: "#2CA6A4",
              fontSize: 14,
              fontWeight: "700",
            }}
          >
            Take Assessment Again
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}