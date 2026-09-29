import { StyleSheet } from "react-native";

export const taskStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F9F9",
  },

  loadingText: {
    marginTop: 10,
    color: "#2CA6A4",
    fontWeight: "600",
  },

  scrollView: {
    flex: 1,
    padding: 16,
  },

  pageTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  dayContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    backgroundColor: "#fafafa",
  },

  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  dayTitle: {
    fontWeight: "700",
    fontSize: 15,
  },

  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  calendarIcon: {
    marginRight: 8,
  },

  dateText: {
    color: "#222",
  },

  emptyDateText: {
    color: "#999",
  },

  webDateInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    fontSize: 14,
  },

  taskContainer: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },

  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  taskTitle: {
    fontWeight: "600",
    fontSize: 13,
  },

  textInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },

  youtubeContainer: {
    height: 200,
    marginTop: 10,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#000",
  },

  addTaskButton: {
    color: "#2CA6A4",
    fontWeight: "600",
  },

  addDayButton: {
    marginBottom: 20,
  },

  addDayText: {
    color: "#0a7d9c",
    fontWeight: "700",
  },

  saveButton: {
    backgroundColor: "#17db1a",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});