import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";

import { useState, useEffect } from "react";
import { questionnaireStyles } from "./questionnaireStyles";
import { router } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

const BASE_URL =
  "https://connector-removed-stoneware.ngrok-free.dev";

const ngrokFetch = (
  url: string,
  options: RequestInit = {}
) =>
  fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "ngrok-skip-browser-warning": "true",
    },
  });

const TEXT_INPUT_INDICES = new Set([
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
]);


const QUESTION_DETAILS: Record<
  number,
  {
    explanation: string;
    example: string;
  }
> = {
  6: {
    explanation:
      "Stress or anxiety can include overthinking, constant worrying, panic feelings, racing thoughts, headaches, or difficulty sleeping.",
    example:
      "Example: I overthink at night and feel nervous before exams.",
  },

  7: {
    explanation:
      "Emotional instability may include mood swings, becoming upset easily, or feeling emotionally overwhelmed.",
    example:
      "Example: My emotions change quickly and small problems affect me deeply.",
  },

  8: {
    explanation:
      "This question checks whether you enjoy spending time with people or attending social gatherings.",
    example:
      "Example: I enjoy spending time with friends and group activities.",
  },

  9: {
    explanation:
      "Feeling energized around people means social interaction improves your mood and motivation.",
    example:
      "Example: Talking with people makes me feel more active and motivated.",
  },

  10: {
    explanation:
      "Trying new experiences includes exploring new hobbies, activities, or environments.",
    example:
      "Example: I enjoy learning new things and trying different experiences.",
  },

  11: {
    explanation:
      "Risk-taking may include making bold decisions or enjoying uncertain challenges.",
    example:
      "Example: I like trying challenging things even if success is uncertain.",
  },

  12: {
    explanation:
      "Being cooperative and empathetic means understanding and supporting other people emotionally.",
    example:
      "Example: I try to understand others and help when they are struggling.",
  },

  13: {
    explanation:
      "Avoiding conflict means trying to prevent arguments or uncomfortable situations.",
    example:
      "Example: I prefer peaceful discussions instead of arguments.",
  },

  14: {
    explanation:
      "Planning routines means organizing tasks, managing schedules, and preparing ahead.",
    example:
      "Example: I make plans and schedules before starting work.",
  },

  15: {
    explanation:
      "Discipline and responsibility include finishing tasks on time and staying focused on goals.",
    example:
      "Example: I complete my responsibilities seriously and on time.",
  },

  16: {
    explanation:
      "Acting without thinking may include impulsive decisions or emotional reactions.",
    example:
      "Example: Sometimes I react quickly and regret it later.",
  },

  17: {
    explanation:
      "Quick decisions without planning involve acting fast without fully considering consequences.",
    example:
      "Example: I often decide things immediately without much thought.",
  },

  18: {
    explanation:
      "Thrill-seeking behavior includes enjoying adventurous or risky activities.",
    example:
      "Example: I enjoy exciting and adventurous experiences.",
  },

  19: {
    explanation:
      "Seeking excitement despite danger means enjoying risky situations for excitement.",
    example:
      "Example: I sometimes enjoy risky activities because they feel exciting.",
  },
};


type VoiceTextInputProps = {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
};

function VoiceTextInput({
  value,
  onChange,
  placeholder,
}: VoiceTextInputProps) {
  const [isListening, setIsListening] = useState(false);

  useSpeechRecognitionEvent("result", (event) => {
    if (event.results?.[0]?.transcript) {
      onChange(event.results[0].transcript);
    }
  });

  useSpeechRecognitionEvent("start", () =>
    setIsListening(true)
  );

  useSpeechRecognitionEvent("end", () =>
    setIsListening(false)
  );

  useSpeechRecognitionEvent("error", (event) => {
    console.log("Speech error:", event);
    setIsListening(false);
  });

  const startListening = async () => {
    const result =
      await ExpoSpeechRecognitionModule.requestPermissionsAsync();

    if (!result.granted) {
      alert(
        "Microphone permission is required for voice input."
      );
      return;
    }

    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      continuous: false,
    });
  };

  const stopListening = () => {
    ExpoSpeechRecognitionModule.stop();
  };

  return (
    <View style={{ width: "100%", marginVertical: 20 }}>
      {/* TEXT INPUT */}
      <TextInput
        style={{
          borderWidth: 1.5,
          borderColor: isListening ? "#6C63FF" : "#ccc",
          borderRadius: 12,
          padding: 14,
          fontSize: 15,
          minHeight: 110,
          textAlignVertical: "top",
          backgroundColor: isListening
            ? "#F3F2FF"
            : "#f9f9f9",
          color: "#222",
        }}
        multiline
        placeholder={
          placeholder ||
          "Type your answer or tap mic..."
        }
        placeholderTextColor="#888"
        value={value}
        onChangeText={onChange}
      />

      {/* LISTENING STATUS */}
      {isListening && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
            gap: 6,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#6C63FF",
            }}
          />

          <Text
            style={{
              color: "#6C63FF",
              fontSize: 13,
              fontWeight: "500",
            }}
          >
            Listening... speak now
          </Text>
        </View>
      )}

      {/* MIC BUTTON */}
      <TouchableOpacity
        onPress={
          isListening
            ? stopListening
            : startListening
        }
        style={{
          alignSelf: "flex-end",
          marginTop: 10,
          paddingHorizontal: 20,
          paddingVertical: 11,
          borderRadius: 25,
          backgroundColor: isListening
            ? "#FF4444"
            : "#6C63FF",
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 16 }}>
          {isListening ? "🛑" : "🎤"}
        </Text>

        <Text
          style={{
            color: "#fff",
            fontWeight: "700",
            fontSize: 14,
          }}
        >
          {isListening ? "Stop" : "Speak"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}


export default function LifeScreen() {
  const [userId, setUserId] = useState<string | null>(
    null
  );

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [showExplanation, setShowExplanation] =
    useState(false);

  const [answers, setAnswers] = useState<{
    [key: number]: string;
  }>({});

  useEffect(() => {
    const getUser = async () => {
      const id =
        await AsyncStorage.getItem("userId");

      if (!id) {
        alert("Session expired.");

        router.replace("/(auth)/Login/login");
        return;
      }

      setUserId(id);
    };

    getUser();
  }, []);

  const questions = [
    "How often do you consume alcohol?",
    "How often do you use cannabis?",
    "How often do you use cocaine?",
    "How often do you use heroin?",
    "How often do you use methamphetamine?",
    "How often do you use nicotine (smoking/vaping)?",
    "How often do you feel anxious or stressed?",
    "Do you frequently feel emotionally unstable or worried?",
    "Do you enjoy being in social gatherings frequently?",
    "Do you feel energized when interacting with others?",
    "Do you enjoy trying new and unusual experiences?",
    "Are you open to taking risks or exploring new ideas?",
    "Do you consider yourself cooperative and empathetic?",
    "Do you often avoid conflicts with others?",
    "Do you plan your tasks and follow routines?",
    "Do you consider yourself disciplined and responsible?",
    "Do you often act without thinking about consequences?",
    "Do you make quick decisions without planning?",
    "Do you enjoy thrilling or risky activities?",
    "Do you seek excitement even if it involves danger?",
  ];

  const options = [
    "Never",
    "Rarely",
    "Sometimes",
    "Often",
    "Very Often",
  ];

  const isLast =
    currentIndex === questions.length;

  const isTextInput =
    TEXT_INPUT_INDICES.has(currentIndex);

  const handleAnswer = (answer: string) => {
    setAnswers({
      ...answers,
      [currentIndex]: answer,
    });
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length) {
      setShowExplanation(false);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setShowExplanation(false);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const skipAll = () => {
    setCurrentIndex(questions.length);
  };

  const handleSubmit = async () => {
    try {
      if (!userId) {
        alert("User ID missing");
        return;
      }

      console.log("Submitting answers:", answers);

      const response = await ngrokFetch(
        `${BASE_URL}/api/questionnaire/submit`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            userId,
            answers,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed");
        return;
      }

      console.log("Saved!");

      router.replace("/(tabs)/Home/home");

    } catch (error) {
      console.log(error);
      alert("Network error");
    }
  };

  return (
    <View style={questionnaireStyles.container}>
      {!isLast ? (
        <>
          {/* PROGRESS */}
          <Text style={questionnaireStyles.progress}>
            Question {currentIndex + 1} /{" "}
            {questions.length}
          </Text>

          {/* QUESTION */}
          <Text style={questionnaireStyles.question}>
            {questions[currentIndex]}
          </Text>

          {/* INPUT TYPE */}
          {isTextInput ? (
            <>
              {/* EXPLAIN BUTTON */}
              <TouchableOpacity
                onPress={() =>
                  setShowExplanation(
                    !showExplanation
                  )
                }
                style={{
                  backgroundColor: "#EFEAFE",
                  padding: 12,
                  borderRadius: 10,
                  marginTop: 15,
                }}
              >
                <Text
                  style={{
                    color: "#6C63FF",
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  {showExplanation
                    ? "Hide Explanation"
                    : "Explain the Problem"}
                </Text>
              </TouchableOpacity>

              {/* EXPLANATION BOX */}
              {showExplanation &&
                QUESTION_DETAILS[
                currentIndex
                ] && (
                  <View
                    style={{
                      backgroundColor:
                        "#F5F4FF",
                      padding: 14,
                      borderRadius: 12,
                      marginTop: 12,
                      borderWidth: 1,
                      borderColor: "#DCD8FF",
                    }}
                  >
                    <Text
                      style={{
                        color: "#444",
                        lineHeight: 22,
                        fontSize: 14,
                      }}
                    >
                      {
                        QUESTION_DETAILS[
                          currentIndex
                        ].explanation
                      }
                    </Text>
                  </View>
                )}

              {/* INPUT */}
              <VoiceTextInput
                value={
                  answers[currentIndex] || ""
                }
                onChange={(text) =>
                  handleAnswer(text)
                }
                placeholder={
                  QUESTION_DETAILS[
                    currentIndex
                  ]?.example
                }
              />
            </>
          ) : (
            <View
              style={
                questionnaireStyles.optionsContainer
              }
            >
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    questionnaireStyles.optionBtn,

                    answers[currentIndex] ===
                    opt &&
                    questionnaireStyles.selected,
                  ]}
                  onPress={() =>
                    handleAnswer(opt)
                  }
                >
                  <Text>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* NAVIGATION */}
          <View
            style={
              questionnaireStyles.navigation
            }
          >
            <TouchableOpacity
              onPress={prevQuestion}
              disabled={currentIndex === 0}
              style={
                questionnaireStyles.navBtn
              }
            >
              <Text>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={nextQuestion}
              style={
                questionnaireStyles.navBtn
              }
            >
              <Text>Next</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={skipAll}
              style={
                questionnaireStyles.navBtn
              }
            >
              <Text>Skip All</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <TouchableOpacity
          onPress={handleSubmit}
          style={
            questionnaireStyles.finalBtn
          }
        >
          <Text
            style={
              questionnaireStyles.finalText
            }
          >
            Let's Start Journey..!
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}