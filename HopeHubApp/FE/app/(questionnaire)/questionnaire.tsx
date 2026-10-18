import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import { useState, useEffect, useRef } from "react";
import { questionnaireStyles as styles } from "./questionnaireStyles";
import { router } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import LottieView from "lottie-react-native";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Translations } from "@/i18n/en";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

const ngrokFetch = async (url: string, options: RequestInit = {}) => {
  const token = await AsyncStorage.getItem("token");
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


const OPTION_SETS = {
  frequency: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
  occurrence: ["Never", "Once", "A few times", "Often", "Very often"],
  attempts: ["Never", "Once", "A few times", "Many times", "Very often"],
  coping: [
    "Talk to someone I trust",
    "Exercise or a hobby",
    "Use alcohol or drugs",
    "Avoid or ignore it",
    "Something else",
  ],
  change: ["Decreased", "No change", "Increased slightly", "Increased", "Increased a lot"],
} as const;

type OptionSetKey = keyof typeof OPTION_SETS;

const QUESTION_OPTION_SET: OptionSetKey[] = [

  "frequency", "frequency", "frequency", "frequency", "frequency", "frequency", "frequency",

  "occurrence", 
  "attempts",   
  "occurrence", 
  "occurrence", 

  "frequency",
  "frequency", 
  "coping", 
  "change", 
];


const OTHER_DRUG_INDEX = 6;

const SECTIONS: {
  range: [number, number];
  titleKey: keyof Translations["questionnaire"]["sections"];
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  animation: any;
}[] = [
  { range: [0, 6], titleKey: "substance", icon: "leaf-outline", animation: require("../../assets/animations/Medical App.json"), color: "#6C63FF" },
  { range: [7, 10], titleKey: "severity", icon: "pulse-outline", animation: require("../../assets/animations/Mental Health.json"), color: "#FF6B81" },
  { range: [11, 14], titleKey: "behavioral", icon: "sparkles-outline", animation: require("../../assets/animations/personlity.json"), color: "#33C481" },
];

function getSection(index: number) {
  return SECTIONS.find((s) => index >= s.range[0] && index <= s.range[1]) ?? SECTIONS[0];
}

type DrugNameInputProps = {
  value: string;
  onChange: (text: string) => void;
  label: string;
  placeholder?: string;
  accentColor: string;
};

function DrugNameInput({ value, onChange, label, placeholder, accentColor }: DrugNameInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputCard}>
      <View style={styles.inputCardHeader}>
        <Text style={styles.inputCardLabel}>{label}</Text>
        <Text style={styles.charCount}>{value.length}/100</Text>
      </View>

      <TextInput
        style={[
          styles.textInput,
          {
            borderColor: isFocused ? accentColor : "#E3E1F5",
            backgroundColor: "#FAFAFE",
          },
        ]}
        maxLength={100}
        placeholder={placeholder}
        placeholderTextColor="#9C9AB5"
        value={value}
        onChangeText={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
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
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [otherDrugName, setOtherDrugName] = useState("");
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

  const isLast = currentIndex === questions.length;
  const section = getSection(Math.min(currentIndex, questions.length - 1));

  const optionSetKey = QUESTION_OPTION_SET[Math.min(currentIndex, questions.length - 1)];
  const optionValues = OPTION_SETS[optionSetKey];
  const optionLabels = q.optionSets[optionSetKey];

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
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    try {
      if (!userId) {
        alert(q.userIdMissing);
        return;
      }

      setIsSubmitting(true);

      const payload = {
        userId,
        answers,
        otherDrugName: otherDrugName.trim(),
      };

      const response = await ngrokFetch(`${BASE_URL}/api/questionnaire/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || q.failed);
        setIsSubmitting(false);
        return;
      }

      router.replace("/(tabs)/Home/home");
    } catch (error) {
      console.log(error);
      alert(t.common.networkError);
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

            <Text style={styles.progress}>{q.progress(currentIndex + 1, questions.length)}</Text>
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
                  opacity: 0.3,
                }}
              />
            )}

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              <Text style={styles.question}>{questions[currentIndex]}</Text>

              {currentIndex === OTHER_DRUG_INDEX && (
                <DrugNameInput
                  value={otherDrugName}
                  onChange={setOtherDrugName}
                  label={q.otherDrugNameLabel}
                  placeholder={q.otherDrugNamePlaceholder}
                  accentColor={section.color}
                />
              )}

              <View style={styles.optionsContainer}>
                {optionValues.map((value, i) => (
                  <OptionButton
                    key={`${optionSetKey}-${value}`}
                    label={optionLabels[i]}
                    selected={answers[currentIndex] === value}
                    onPress={() => handleAnswer(value)}
                    accentColor={section.color}
                  />
                ))}
              </View>
            </ScrollView>
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
                {q.back}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={nextQuestion}
              activeOpacity={0.85}
              style={[styles.navBtnPrimary, { backgroundColor: section.color }]}
            >
              <Text style={styles.navBtnPrimaryText}>
                {currentIndex === questions.length - 1 ? q.finish : q.next}
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
            style={{ width: 220, height: 220 }}
          />

          <Text style={styles.finalTitle}>{q.allSet}</Text>
          <Text style={styles.finalSubtitle}>{q.answered(answeredCount, questions.length)}</Text>

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