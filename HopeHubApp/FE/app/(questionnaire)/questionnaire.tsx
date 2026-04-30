import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { questionnaireStyles } from './questionnaireStyles'
import { router } from 'expo-router'

export default function LifeScreen() {

  const questions = [
    // Section 1
    "How often do you consume alcohol?",
    "How often do you use cannabis?",
    "How often do you use cocaine?",
    "How often do you use heroin?",
    "How often do you use methamphetamine?",
    "How often do you use nicotine (smoking/vaping)?",

    // Section 2 - Neuroticism
    "How often do you feel anxious or stressed?",
    "Do you frequently feel emotionally unstable or worried?",

    // Extraversion
    "Do you enjoy being in social gatherings frequently?",
    "Do you feel energized when interacting with others?",

    // Openness
    "Do you enjoy trying new and unusual experiences?",
    "Are you open to taking risks or exploring new ideas?",

    // Agreeableness
    "Do you consider yourself cooperative and empathetic?",
    "Do you often avoid conflicts with others?",

    // Conscientiousness
    "Do you plan your tasks and follow routines?",
    "Do you consider yourself disciplined and responsible?",

    // Impulsiveness
    "Do you often act without thinking about consequences?",
    "Do you make quick decisions without planning?",

    // Sensation Seeking
    "Do you enjoy thrilling or risky activities?",
    "Do you seek excitement even if it involves danger?",
  ];

  const options = ["Never", "Rarely", "Sometimes", "Often", "Very Often"];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  const handleAnswer = (option : string) => {
    setAnswers({ ...answers, [currentIndex]: option });
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

  const isLast = currentIndex === questions.length;

  const handleSubmit = async() =>{
    try {
        console.log('Questionnaire completed..!')
        router.replace('/Home/home')
    } catch (error) {
        console.log('Questionnaire not completed..!')
    }
  }
  const skipall = () =>{
    setCurrentIndex(questions.length)
  }

  return (
    <View style={questionnaireStyles.container}>

      {!isLast ? (
        <>
          <Text style={questionnaireStyles.progress}>
            Question {currentIndex + 1} / {questions.length}
          </Text>

          <Text style={questionnaireStyles.question}>
            {questions[currentIndex]}
          </Text>

          <View style={questionnaireStyles.optionsContainer}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  questionnaireStyles.optionBtn,
                  answers[currentIndex] === opt && questionnaireStyles.selected
                ]}
                onPress={() => handleAnswer(opt)}
              >
                <Text>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>

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
              onPress={skipall}
              style={questionnaireStyles.navBtn}
            >
              <Text>Skip All</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <TouchableOpacity onPress={handleSubmit} style={questionnaireStyles.finalBtn}>
          <Text style={questionnaireStyles.finalText}>Let’s Start Journey..!</Text>
        </TouchableOpacity>
      )}

    </View>
  );
}