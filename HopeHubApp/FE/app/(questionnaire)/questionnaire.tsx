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

import LottieView from 'lottie-react-native';
import { useLanguage } from "@/i18n/LanguageContext";
import type { Translations } from "@/i18n/en";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

const ngrokFetch = async (
  url: string,
  options: RequestInit = {}
) => {
  const token = await AsyncStorage.getItem("token");
  console.log("JWT:", token);
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

const TEXT_INPUT_INDICES = new Set([
  6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
]);

const SECTIONS: {
  range: [number, number];
  titleKey: keyof Translations["questionnaire"]["sections"];
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  animation: any;
}[] = [
  { range: [0, 5], titleKey: "lifestyle", icon: "leaf-outline", animation: require('../../assets/animations/Medical App.json'), color: "#6C63FF" },
  { range: [6, 7], titleKey: "mental", icon: "heart-outline", animation: require('../../assets/animations/Mental Health.json'), color: "#FF6B81" },
  { range: [8, 11], titleKey: "social", icon: "people-outline", animation: require('../../assets/animations/Dance Party.json'), color: "#3AB0FF" },
  { range: [12, 19], titleKey: "personality", icon: "sparkles-outline", animation: require('../../assets/animations/personlity.json'), color: "#33C481" },
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
  const { t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;



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


  return (
    <View style={styles.inputCard}>
      <View style={styles.inputCardHeader}>
        <Text style={styles.inputCardLabel}>{t.questionnaire.yourAnswer}</Text>
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
  const { t } = useLanguage();
  const q = t.questionnaire;
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
        alert(q.sessionExpired);
        router.replace("/(auth)/Login/login");
        return;
      }

      setUserId(id);
    };

    getUser();
  }, []);

  const questions = q.questions;

  const optionValues = ["Never", "Rarely", "Sometimes", "Often", "Very Often"];

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
        alert(q.userIdMissing)
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
        alert(data.message || q.failed)
        setIsSubmitting(false);
        return;
      }

      console.log("Saved!");
      router.replace("/(tabs)/Home/home");
    } catch (error) {
      console.log(error);
      alert(t.common.networkError)
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
                  {q.sections[section.titleKey]}
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
          {section.animation && (
              <LottieView
                source={section.animation}
                autoPlay
                loop
                style={{
                  position: "absolute",
                  width: 450,        
                  height: 450,    
                  top: 0,
                  alignSelf: "center",
                  opacity: 0.30,
                }}
              />
            )}

            <Text style={styles.question}>{questions[currentIndex]}</Text>

            {isTextInput ? (
              <>
                <TouchableOpacity
                  onPress={() => setShowExplanation(!showExplanation)}
                  style={styles.explainBtn}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={q.details ? "chevron-up" : "help-circle-outline"}
                    size={16}
                    color={section.color}
                  />
                  <Text style={[styles.explainBtnText, { color: section.color }]}>
                    {q.details ? "Hide Explanation" : "Explain the Problem"}
                  </Text>
                </TouchableOpacity>

              {showExplanation && q.details[currentIndex] && (
                <View style={styles.explanationBox}>
                  <Text style={styles.explanationText}>
                    {q.details[currentIndex].explanation}
                  </Text>
                </View>
              )}
                <VoiceTextInput
                  value={answers[currentIndex] || ""}
                  onChange={handleAnswer}
                  placeholder={q.details[currentIndex]?.example}
                  accentColor={section.color}
                />
              </>
            ) : (
              <View style={styles.optionsContainer}>
               {optionValues.map((opt, i) => (
                <OptionButton
                  key={opt}
                  label={q.options[i]}
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
            <LottieView
              source={require("../../assets/animations/Fireworks.json")}
              autoPlay
              loop
              style={{
                width: 220,
                height: 220,
              }}
            />

          <Text style={styles.finalTitle}>{q.allSet}</Text>
          <Text style={styles.finalSubtitle}>
             {q.answered(answeredCount, questions.length)}
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
          <Text style={styles.finalText}>{q.startJourney}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setCurrentIndex(0)} style={{ marginTop: 14 }}>
        <Text style={styles.reviewLink}>{q.review}</Text>
      </TouchableOpacity>
        </View>
      )}
    </View>
  );
}