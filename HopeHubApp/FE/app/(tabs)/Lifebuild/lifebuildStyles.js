//lifebuildStyles.js

import { StyleSheet } from "react-native";

export const lifeBuildStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f8f8",
  },

  /* ================= HEADER ================= */

  header: {
    position: "relative",
    minHeight: 230,
    backgroundColor: "#2CA6A4",
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    overflow: "hidden",
  },

  headerContent: {
    width: "75%",
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
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 8,
  },

  headerDescription: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    lineHeight: 20,
  },

  headerIcon: {
    position: "absolute",
    right: 30,
    bottom: 35,
    width: 65,
    height: 65,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  /* ================= CONTENT ================= */

  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 100,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e0f0ef",

    shadowColor: "#2CA6A4",
    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  cardTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  cardTitleText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a2e2e",
  },

  /* ================= START ASSESSMENT ================= */

  startIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e1f5f4",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },

  startTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a2e2e",
    textAlign: "center",
    marginBottom: 10,
  },

  startDescription: {
    fontSize: 13,
    color: "#718181",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 22,
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
  },

  startButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  /* ================= HOW LIFE BUILD WORKS ================= */

  howItWorksCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e0f0ef",
  },

  howItWorksDescription: {
    fontSize: 12,
    color: "#718181",
    lineHeight: 18,
    marginTop: -4,
    marginBottom: 18,
  },

  /* ================= QUESTIONNAIRE ================= */

  progressContainer: {
    marginBottom: 18,
  },

  progressText: {
    fontSize: 12,
    color: "#718181",
    marginBottom: 8,
  },

  progressTrack: {
    height: 8,
    backgroundColor: "#e6eeee",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#2CA6A4",
    borderRadius: 10,
  },

  questionNumber: {
    fontSize: 12,
    color: "#2CA6A4",
    fontWeight: "700",
    marginBottom: 8,
  },

  questionText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a2e2e",
    lineHeight: 26,
    marginBottom: 20,
  },

  optionButton: {
    borderWidth: 1,
    borderColor: "#d5eeec",
    backgroundColor: "#f7fefe",
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
  },

  optionButtonSelected: {
    backgroundColor: "#e1f5f4",
    borderColor: "#2CA6A4",
    borderWidth: 2,
  },

  optionText: {
    fontSize: 14,
    color: "#405050",
  },

  optionTextSelected: {
    color: "#1a2e2e",
    fontWeight: "700",
  },

  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 12,
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

  nextButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },

  /* ================= SCORE ================= */

  scoreContainer: {
    alignItems: "center",
    marginVertical: 12,
  },

  scoreCircle: {
    width: 145,
    height: 145,
    borderRadius: 75,
    backgroundColor: "#e8f7f6",
    borderWidth: 8,
    borderColor: "#2CA6A4",
    justifyContent: "center",
    alignItems: "center",
  },

  scoreText: {
    fontSize: 34,
    fontWeight: "700",
    color: "#1a2e2e",
  },

  scoreLabel: {
    fontSize: 11,
    color: "#678080",
    marginTop: 2,
  },

  scoreProgressTrack: {
    height: 9,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 10,
    backgroundColor: "#e6eeee",
  },

  scoreProgressFill: {
    height: "100%",
    borderRadius: 10,
  },

  /* ================= STATUS ================= */

  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 4,
  },

  statusTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },

  statusDescription: {
    fontSize: 11,
    color: "#657575",
    lineHeight: 17,
  },

  /* ================= CAREERS ================= */

  sectionDescription: {
    fontSize: 12,
    color: "#687878",
    lineHeight: 18,
    marginBottom: 14,
  },

  careerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7fefe",
    borderWidth: 1,
    borderColor: "#d5eeec",
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
  },

  careerIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: "#e1f5f4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  careerContent: {
    flex: 1,
  },

  careerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a2e2e",
    marginBottom: 3,
  },

  careerDescription: {
    fontSize: 11,
    color: "#718181",
    lineHeight: 16,
  },

  /* ================= SUPPORT ================= */

  supportCard: {
    backgroundColor: "#fff7f7",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffd6d6",
  },

  supportIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ffe6e6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  supportTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#b02a2a",
    marginBottom: 7,
  },

  supportDescription: {
    fontSize: 12,
    color: "#7d6060",
    textAlign: "center",
    lineHeight: 19,
  },

  /* ================= HOW IT WORKS ================= */

  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#e1f5f4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  stepNumberText: {
    color: "#2CA6A4",
    fontSize: 13,
    fontWeight: "700",
  },

  stepContent: {
    flex: 1,
  },

  stepTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a2e2e",
    marginBottom: 3,
  },

  stepDescription: {
    fontSize: 11,
    color: "#718181",
    lineHeight: 16,
  },
});