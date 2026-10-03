import { StyleSheet } from "react-native";

export const lifeBuildStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f8f8",
  },

  header: {
    position: "relative",
    minHeight: 150,
    backgroundColor: "#2CA6A4",
    paddingTop: 38,
    paddingBottom: 22,
    paddingHorizontal: 20,
    overflow: "hidden",
    justifyContent: "center",
  },

  headerContent: {
    width: "78%",
  },

  headerCircleLarge: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 180,
    height: 180,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 90,
  },

  headerCircleSmall: {
    position: "absolute",
    top: 45,
    right: 35,
    width: 85,
    height: 85,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 45,
  },

  headerSmallText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    marginBottom: 5,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
  },

  headerDescription: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    lineHeight: 19,
  },

  headerIcon: {
    position: "absolute",
    right: 16,
    top: 38,
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  startMainCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e0f0ef",
    shadowColor: "#2CA6A4",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 3,
  },

  startCenterContent: {
    width: "100%",
    alignItems: "center",
  },

  startIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e1f5f4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  startMainTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#1a2e2e",
    textAlign: "center",
    marginBottom: 8,
  },

  startMainDescription: {
    fontSize: 13,
    color: "#718181",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 18,
  },

  startButton: {
    backgroundColor: "#2CA6A4",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },

  startButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  stepsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
    rowGap: 12,
  },

  stepCard: {
    width: "48.5%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e0f0ef",
    shadowColor: "#2CA6A4",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  stepCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e1f5f4",
    justifyContent: "center",
    alignItems: "center",
  },

  stepNumberText: {
    color: "#2CA6A4",
    fontSize: 12,
    fontWeight: "700",
  },

  stepIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0fafa",
    justifyContent: "center",
    alignItems: "center",
  },

  stepCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a2e2e",
    marginBottom: 4,
    lineHeight: 18,
  },

  stepCardDescription: {
    fontSize: 11,
    color: "#718181",
    lineHeight: 16,
  },
  screenPadding: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 100,
  },

  sectionLabel: {
    color: "#2CA6A4",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 6,
  },

  screenTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a2e2e",
    marginBottom: 8,
  },

  screenSubtitle: {
    fontSize: 13,
    color: "#718181",
    lineHeight: 20,
    marginBottom: 20,
  },

  progressTrack: {
    height: 8,
    backgroundColor: "#e1f5f4",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 8,
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#2CA6A4",
    borderRadius: 10,
  },

  progressText: {
    textAlign: "right",
    color: "#718181",
    fontSize: 12,
    marginBottom: 20,
  },

  questionCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e0f0ef",
  },

  questionSection: {
    color: "#2CA6A4",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },

  questionText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a2e2e",
    marginBottom: 18,
    lineHeight: 25,
  },

  questionMeta: {
    color: "#718181",
    fontSize: 12,
    marginBottom: 12,
  },

  textInput: {
    borderWidth: 1,
    borderColor: "#d5eeec",
    backgroundColor: "#f7fefe",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 14,
    color: "#1a2e2e",
  },

  optionButton: {
    borderWidth: 1,
    borderColor: "#d5eeec",
    backgroundColor: "#f7fefe",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  optionButtonSelected: {
    borderColor: "#2CA6A4",
    backgroundColor: "#e1f5f4",
  },

  optionText: {
    color: "#1a2e2e",
    fontSize: 14,
    fontWeight: "400",
    flex: 1,
  },

  optionTextSelected: {
    color: "#1a7775",
    fontWeight: "700",
  },

  maxSelectHint: {
    fontSize: 12,
    color: "#718181",
    marginBottom: 12,
  },

  skillLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a2e2e",
    marginBottom: 10,
  },

  skillRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },

  skillButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7fefe",
    borderWidth: 1,
    borderColor: "#d5eeec",
  },

  skillButtonSelected: {
    backgroundColor: "#2CA6A4",
    borderColor: "#2CA6A4",
  },

  skillButtonText: {
    color: "#1a2e2e",
    fontWeight: "700",
  },

  skillButtonTextSelected: {
    color: "#fff",
  },

  navigationRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },

  previousButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#2CA6A4",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  previousButtonText: {
    color: "#2CA6A4",
    fontSize: 14,
    fontWeight: "700",
  },

  nextButton: {
    flex: 1,
    backgroundColor: "#2CA6A4",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  nextButtonSuccess: {
    backgroundColor: "#17a673",
  },

  nextButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  scoreContainer: {
  alignItems: "center",
},

scorePercentage: {
  fontSize: 56,
  fontWeight: "800",
  color: "#2CA6A4",
},

scoreObtained: {
  fontSize: 18,
  fontWeight: "700",
  color: "#1f2d2d",
  marginTop: 4,
},

scoreDescription: {
  fontSize: 13,
  color: "#6b7b7b",
  textAlign: "center",
  marginTop: 10,
  lineHeight: 19,
},

sectionScoreRow: {
  marginTop: 12,
},

sectionScoreHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
},

sectionScoreName: {
  fontSize: 14,
  color: "#1f2d2d",
  flex: 1,
},

sectionScoreValue: {
  fontSize: 14,
  fontWeight: "700",
  color: "#1f2d2d",
},

sectionProgressTrack: {
  height: 8,
  borderRadius: 4,
  backgroundColor: "#E3ECEC",
  marginTop: 6,
  overflow: "hidden",
},

sectionProgressFill: {
  height: "100%",
  backgroundColor: "#2CA6A4",
},

});