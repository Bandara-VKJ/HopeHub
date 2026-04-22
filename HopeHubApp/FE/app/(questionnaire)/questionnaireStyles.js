import { StyleSheet } from 'react-native';


export const questionnaireStyles = StyleSheet.create({
    container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: '#fff'
  },
  progress: {
    fontSize: 16,
    marginBottom: 10,
  },
  question: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionBtn: {
    padding: 15,
    backgroundColor: "#eee",
    marginBottom: 10,
    borderRadius: 10,
  },
  selected: {
    backgroundColor: "#a0e7e5",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  navBtn: {
    padding: 15,
    backgroundColor: "#ddd",
    borderRadius: 10,
  },
  finalBtn: {
    padding: 20,
    backgroundColor: "#4CAF50",
    borderRadius: 15,
    alignItems: "center",
  },
  finalText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
})