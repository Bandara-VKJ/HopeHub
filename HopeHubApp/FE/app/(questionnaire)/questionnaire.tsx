import { Text, View, TouchableOpacity, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { questionnaireStyles } from './questionnaireStyles';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const TEXT_INPUT_INDICES = new Set([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);

// ── Voice Text Input Component ──────────────────────────────────────────────
type VoiceTextInputProps = {
  value: string;
  onChange: (text: string) => void;
};

function VoiceTextInput({ value, onChange }: VoiceTextInputProps) {
  const [isListening, setIsListening] = useState(false);

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
    <View style={{ width: "100%", marginVertical: 20 }}>
      {/* Text Input */}
      <TextInput
        style={{
          borderWidth: 1.5,
          borderColor: isListening ? "#6C63FF" : "#ccc",
          borderRadius: 12,
          padding: 14,
          fontSize: 15,
          minHeight: 110,
          textAlignVertical: "top",
          backgroundColor: isListening ? "#F3F2FF" : "#f9f9f9",
          color: "#222",
        }}
        multiline
        placeholder="Type your answer or tap the mic to speak..."
        placeholderTextColor="#aaa"
        value={value}
        onChangeText={onChange}
      />

      {/* Listening indicator */}
      {isListening && (
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 8,
          gap: 6,
        }}>
          <View style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#6C63FF",
          }} />
          <Text style={{ color: "#6C63FF", fontSize: 13, fontWeight: "500" }}>
            Listening... speak now
          </Text>
        </View>
      )}

      {/* Mic / Stop Button */}
      <TouchableOpacity
        onPress={isListening ? stopListening : startListening}
        style={{
          alignSelf: "flex-end",
          marginTop: 10,
          paddingHorizontal: 20,
          paddingVertical: 11,
          borderRadius: 25,
          backgroundColor: isListening ? "#FF4444" : "#6C63FF",
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          shadowColor: isListening ? "#FF4444" : "#6C63FF",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.35,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        <Text style={{ fontSize: 16 }}>
          {isListening ? "🛑" : "🎤"}
        </Text>
        <Text style={{
          color: "#fff",
          fontWeight: "700",
          fontSize: 14,
          letterSpacing: 0.3,
        }}>
          {isListening ? "Stop" : "Speak"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Main Questionnaire Screen ───────────────────────────────────────────────
export default function LifeScreen() {

  const [userId, setUserId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const getUser = async () => {
      const id = await AsyncStorage.getItem("userId");
      console.log("Questionnaire userId:", id);
      if (!id) {
        alert("Session expired. Please login again.");
        router.replace('/(auth)/Login/login');
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

  const handleAnswer = (option: string) => {
    setAnswers({ ...answers, [currentIndex]: option });
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length) setCurrentIndex(currentIndex + 1);
  };

  const prevQuestion = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const skipAll = () => {
    setCurrentIndex(questions.length);
  };

  const handleSubmit = async () => {
    try {
      if (!userId) {
        alert("User ID missing. Please login again.");
        router.replace('/(auth)/Login/login');
        return;
      }

      const response = await ngrokFetch(
        `${BASE_URL}/api/questionnaire/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, answers }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to save");
        return;
      }

      console.log("Questionnaire saved!");
      router.replace("/(tabs)/Home/home");

    } catch (error) {
      console.log("Submit error:", error);
      alert("Network error");
    }
  };

  return (
    <View style={questionnaireStyles.container}>

      {!isLast ? (
        <>
          {/* Progress */}
          <Text style={questionnaireStyles.progress}>
            Question {currentIndex + 1} / {questions.length}
          </Text>

          {/* Question */}
          <Text style={questionnaireStyles.question}>
            {questions[currentIndex]}
          </Text>

          {/* Answer Input — voice text input OR option buttons */}
          {isTextInput ? (
            <VoiceTextInput
              value={answers[currentIndex] || ""}
              onChange={(text) => handleAnswer(text)}
            />
          ) : (
            <View style={questionnaireStyles.optionsContainer}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    questionnaireStyles.optionBtn,
                    answers[currentIndex] === opt && questionnaireStyles.selected,
                  ]}
                  onPress={() => handleAnswer(opt)}
                >
                  <Text>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Navigation */}
          <View style={questionnaireStyles.navigation}>
            <TouchableOpacity
              onPress={prevQuestion}
              disabled={currentIndex === 0}
              style={questionnaireStyles.navBtn}
            >
              <Text>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={nextQuestion}
              style={questionnaireStyles.navBtn}
            >
              <Text>Next</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={skipAll}
              style={questionnaireStyles.navBtn}
            >
              <Text>Skip All</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <TouchableOpacity onPress={handleSubmit} style={questionnaireStyles.finalBtn}>
          <Text style={questionnaireStyles.finalText}>Let's Start Journey..!</Text>
        </TouchableOpacity>
      )}

    </View>
  );
}