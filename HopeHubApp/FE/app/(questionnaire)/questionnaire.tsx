import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";

import { useState, useEffect, useRef } from "react";
import { questionnaireStyles as styles } from "./questionnaireStyles";
import { router } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

const BASE_URL = "https://connector-removed-stoneware.ngrok-free.dev";

const ngrokFetch = (url: string, options: RequestInit = {}) =>
  fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "ngrok-skip-browser-warning": "true",
    },
  });

const TEXT_INPUT_INDICES = new Set([
  6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
]);

const QUESTION_DETAILS: Record<
  number,
  { explanation: string; example: string }
> = {
  6: {
    explanation:
      "Stress or anxiety can include overthinking, constant worrying, panic feelings, racing thoughts, headaches, or difficulty sleeping.",
    example: "Example: I overthink at night and feel nervous before exams.",
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
    example: "Example: I enjoy spending time with friends and group activities.",
  },
  9: {
    explanation:
      "Feeling energized around people means social interaction improves your mood and motivation.",
    example: "Example: Talking with people makes me feel more active and motivated.",
  },
  10: {
    explanation:
      "Trying new experiences includes exploring new hobbies, activities, or environments.",
    example: "Example: I enjoy learning new things and trying different experiences.",
  },
  11: {
    explanation:
      "Risk-taking may include making bold decisions or enjoying uncertain challenges.",
    example: "Example: I like trying challenging things even if success is uncertain.",
  },
  12: {
    explanation:
      "Being cooperative and empathetic means understanding and supporting other people emotionally.",
    example: "Example: I try to understand others and help when they are struggling.",
  },
  13: {
    explanation:
      "Avoiding conflict means trying to prevent arguments or uncomfortable situations.",
    example: "Example: I prefer peaceful discussions instead of arguments.",
  },
  14: {
    explanation:
      "Planning routines means organizing tasks, managing schedules, and preparing ahead.",
    example: "Example: I make plans and schedules before starting work.",
  },
  15: {
    explanation:
      "Discipline and responsibility include finishing tasks on time and staying focused on goals.",
    example: "Example: I complete my responsibilities seriously and on time.",
  },
  16: {
    explanation: "Acting without thinking may include impulsive decisions or emotional reactions.",
    example: "Example: Sometimes I react quickly and regret it later.",
  },
  17: {
    explanation:
      "Quick decisions without planning involve acting fast without fully considering consequences.",
    example: "Example: I often decide things immediately without much thought.",
  },
  18: {
    explanation: "Thrill-seeking behavior includes enjoying adventurous or risky activities.",
    example: "Example: I enjoy exciting and adventurous experiences.",
  },
  19: {
    explanation:
      "Seeking excitement despite danger means enjoying risky situations for excitement.",
    example: "Example: I sometimes enjoy risky activities because they feel exciting.",
  },
};

const SECTIONS: {
  range: [number, number];
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  { range: [0, 5], title: "Lifestyle & Habits", icon: "leaf-outline", color: "#6C63FF" },
  { range: [6, 7], title: "Mental Wellbeing", icon: "heart-outline", color: "#FF6B81" },
  { range: [8, 11], title: "Social Energy", icon: "people-outline", color: "#3AB0FF" },
  { range: [12, 19], title: "Personality Traits", icon: "sparkles-outline", color: "#33C481" },
];

function getSection(index: number) {
  return SECTIONS.find((s) => index >= s.range[0] && index <= s.range[1]) ?? SECTIONS[0];
}

type VoiceTextInputProps = {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  accentColor: string;
};

function VoiceTextInput({
  value,
  onChange,
  placeholder,
  accentColor,
}: VoiceTextInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;

  useSpeechRecognitionEvent("result", (event) => {
    if (event.results?.[0]?.transcript) {
      onChange(event.results[0].transcript);
    }
  });

  useSpeechRecognitionEvent("start", () => setIsListening(true));
  useSpeechRecognitionEvent("end", () => setIsListening(false));
  useSpeechRecognitionEvent("error", (event) => {
    console.log("Speech error:", event);
    setIsListening(false);
  });

  // Soft pulsing ring behind the mic button while it is actively listening.
  useEffect(() => {
    let loop: Animated.CompositeAnimation | undefined;

    if (isListening) {
      pulse.setValue(1);
      loop = Animated.loop(
        Animated.timing(pulse, {
          toValue: 1.5,
          duration: 900,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      );
      loop.start();
    } else {
      pulse.setValue(1);
    }

    return () => loop?.stop();
  }, [isListening]);

  const startListening = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

    if (!result.granted) {
      alert("Microphone permission is required for voice input.");
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
    <View style={styles.inputCard}>
      <View style={styles.inputCardHeader}>
        <Text style={styles.inputCardLabel}>Your answer</Text>
        <Text style={styles.charCount}>{value.length}/300</Text>
      </View>

      <TextInput
        style={[
          styles.textInput,
          {
            borderColor: isListening || isFocused ? accentColor : "#E3E1F5",
            backgroundColor: isListening ? `${accentColor}12` : "#FAFAFE",
          },
        ]}
        multiline
        maxLength={300}
        placeholder={placeholder || "Type your answer or tap the mic..."}
        placeholderTextColor="#9C9AB5"
        value={value}
        onChangeText={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      <View style={styles.inputFooter}>
        {isListening ? (
          <View style={styles.listeningRow}>
            <View style={styles.listeningDot} />
            <Text style={[styles.listeningText, { color: accentColor }]}>
              Listening... speak now
            </Text>
          </View>
        ) : (
          <View />
        )}

        <View>
          {isListening && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.micPulse,
                {
                  backgroundColor: accentColor,
                  transform: [{ scale: pulse }],
                  opacity: pulse.interpolate({
                    inputRange: [1, 1.5],
                    outputRange: [0.45, 0],
                  }),
                },
              ]}
            />
          )}

          <TouchableOpacity
            onPress={isListening ? stopListening : startListening}
            activeOpacity={0.85}
            style={[
              styles.micBtn,
              { backgroundColor: isListening ? "#FF4757" : accentColor },
            ]}
          >
            <Ionicons name={isListening ? "stop" : "mic"} size={16} color="#fff" />
            <Text style={styles.micBtnText}>{isListening ? "Stop" : "Speak"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

type OptionButtonProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  accentColor: string;
};

// A single multiple-choice option, with a small press-bounce and an
// animated checkmark so picking an answer feels responsive.
function OptionButton({ label, selected, onPress, accentColor }: OptionButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 70, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        style={[
          styles.optionBtn,
          selected && [
            styles.optionBtnSelected,
            { borderColor: accentColor, backgroundColor: `${accentColor}14` },
          ],
        ]}
      >
        <View
          style={[
            styles.radioCircle,
            selected && { borderColor: accentColor, backgroundColor: accentColor },
          ]}
        >
          {selected && <Ionicons name="checkmark" size={14} color="#fff" />}
        </View>
        <Text style={[styles.optionText, selected && { color: accentColor, fontWeight: "700" }]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function LifeScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const getUser = async () => {
      const id = await AsyncStorage.getItem("userId");

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

  const options = ["Never", "Rarely", "Sometimes", "Often", "Very Often"];

  const isLast = currentIndex === questions.length;
  const isTextInput = TEXT_INPUT_INDICES.has(currentIndex);
  const section = getSection(Math.min(currentIndex, questions.length - 1));

  // Animate the progress bar whenever the question index changes.
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentIndex / questions.length,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [currentIndex]);

  // Fade + slide the question card in on every navigation.
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(14);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentIndex]);

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentIndex]: answer });
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
    if (isSubmitting) return;

    try {
      if (!userId) {
        alert("User ID missing");
        return;
      }

      setIsSubmitting(true);
      console.log("Submitting answers:", answers);

      const response = await ngrokFetch(`${BASE_URL}/api/questionnaire/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, answers }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed");
        setIsSubmitting(false);
        return;
      }

      console.log("Saved!");
      router.replace("/(tabs)/Home/home");
    } catch (error) {
      console.log(error);
      alert("Network error");
      setIsSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <View style={styles.container}>
      {!isLast ? (
        <>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={[styles.sectionBadge, { backgroundColor: `${section.color}18` }]}>
                <Ionicons name={section.icon} size={14} color={section.color} />
                <Text style={[styles.sectionBadgeText, { color: section.color }]}>
                  {section.title}
                </Text>
              </View>

              <TouchableOpacity onPress={skipAll}>
                <Text style={styles.skipLink}>Skip all</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: section.color,
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>

            <Text style={styles.progress}>
              Question {currentIndex + 1} of {questions.length}
            </Text>
          </View>

          {/* QUESTION */}
          <Animated.View
            style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          >
            <Text style={styles.question}>{questions[currentIndex]}</Text>

            {isTextInput ? (
              <>
                <TouchableOpacity
                  onPress={() => setShowExplanation(!showExplanation)}
                  style={styles.explainBtn}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={showExplanation ? "chevron-up" : "help-circle-outline"}
                    size={16}
                    color={section.color}
                  />
                  <Text style={[styles.explainBtnText, { color: section.color }]}>
                    {showExplanation ? "Hide Explanation" : "Explain the Problem"}
                  </Text>
                </TouchableOpacity>

                {showExplanation && QUESTION_DETAILS[currentIndex] && (
                  <View style={styles.explanationBox}>
                    <Text style={styles.explanationText}>
                      {QUESTION_DETAILS[currentIndex].explanation}
                    </Text>
                  </View>
                )}

                <VoiceTextInput
                  value={answers[currentIndex] || ""}
                  onChange={handleAnswer}
                  placeholder={QUESTION_DETAILS[currentIndex]?.example}
                  accentColor={section.color}
                />
              </>
            ) : (
              <View style={styles.optionsContainer}>
                {options.map((opt) => (
                  <OptionButton
                    key={opt}
                    label={opt}
                    selected={answers[currentIndex] === opt}
                    onPress={() => handleAnswer(opt)}
                    accentColor={section.color}
                  />
                ))}
              </View>
            )}
          </Animated.View>

          {/* NAVIGATION */}
          <View style={styles.navigation}>
            <TouchableOpacity
              onPress={prevQuestion}
              disabled={currentIndex === 0}
              activeOpacity={0.8}
              style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
            >
              <Ionicons name="chevron-back" size={18} color={currentIndex === 0 ? "#BBB" : "#444"} />
              <Text style={[styles.navBtnText, currentIndex === 0 && styles.navBtnTextDisabled]}>
                Back
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={nextQuestion}
              activeOpacity={0.85}
              style={[styles.navBtnPrimary, { backgroundColor: section.color }]}
            >
              <Text style={styles.navBtnPrimaryText}>
                {currentIndex === questions.length - 1 ? "Finish" : "Next"}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.finalContainer}>
          <View style={styles.finalIconWrap}>
            <Ionicons name="rocket-outline" size={42} color="#4CAF50" />
          </View>

          <Text style={styles.finalTitle}>All set!</Text>
          <Text style={styles.finalSubtitle}>
            You answered {answeredCount} of {questions.length} questions.
          </Text>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
            style={[styles.finalBtn, isSubmitting && { opacity: 0.7 }]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.finalText}>Let's Start Journey..!</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setCurrentIndex(0)} style={{ marginTop: 14 }}>
            <Text style={styles.reviewLink}>Review my answers</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}