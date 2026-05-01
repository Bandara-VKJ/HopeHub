import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { questionnaireStyles } from './questionnaireStyles'
import { router } from 'expo-router'
import { getAuth } from "firebase/auth";

export default function LifeScreen() {

  const auth = getAuth();
  const user = auth.currentUser;
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

 const handleSubmit = async () => {
  try {
    const user = getAuth().currentUser;

    if (!user) {
      alert("User not logged in");
      return;
    }

    await fetch("https://connector-removed-stoneware.ngrok-free.dev/api/questionnaire/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: user.uid,
        answers: answers
      })
    });

    console.log("Saved to DB!");
    router.replace("/Home/home");

  } catch (error) {
    console.log("Error:", error);
  }
};
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