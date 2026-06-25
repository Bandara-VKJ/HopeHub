import { StyleSheet } from "react-native";

const ACCENT = "#6C63FF";

export const questionnaireStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 22,
    backgroundColor: "#F8F8FC",
  },

  // ---------- HEADER ----------
  header: {
    marginBottom: 22,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  skipLink: {
    color: "#9C9AB5",
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E9E8F5",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progress: {
    marginTop: 8,
    fontSize: 13,
    color: "#8B89A6",
    fontWeight: "500",
  },

  // ---------- QUESTION ----------
  question: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E1D2B",
    lineHeight: 30,
    marginBottom: 18,
  },

  // ---------- EXPLANATION ----------
  explainBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: "#F0EFFB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  explainBtnText: {
    fontWeight: "700",
    fontSize: 13,
  },
  explanationBox: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E3F7",
  },
  explanationText: {
    color: "#54526B",
    lineHeight: 21,
    fontSize: 13.5,
  },

  // ---------- OPTIONS ----------
  optionsContainer: {
    gap: 10,
  },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#ECEBF6",
  },
  optionBtnSelected: {
    borderWidth: 1.5,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#CFCDE3",
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    fontSize: 15,
    color: "#33323F",
    fontWeight: "500",
  },

  // ---------- TEXT / VOICE INPUT CARD ----------
  inputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#ECEBF6",
  },
  inputCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  inputCardLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8B89A6",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  charCount: {
    fontSize: 11,
    color: "#B4B2C8",
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 110,
    textAlignVertical: "top",
    color: "#222",
  },
  inputFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  listeningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  listeningDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: ACCENT,
  },
  listeningText: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  micPulse: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 25,
  },
  micBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
  },
  micBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  // ---------- NAVIGATION ----------
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    gap: 12,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: "#EFEEF7",
  },
  navBtnDisabled: {
    opacity: 0.5,
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
  },
  navBtnTextDisabled: {
    color: "#BBB",
  },
  navBtnPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 15,
    borderRadius: 12,
  },
  navBtnPrimaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  // ---------- FINAL SCREEN ----------
  finalContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  finalIconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#E9F8EC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  finalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E1D2B",
    marginBottom: 6,
  },
  finalSubtitle: {
    fontSize: 14,
    color: "#8B89A6",
    marginBottom: 30,
    textAlign: "center",
  },
  finalBtn: {
    width: "100%",
    paddingVertical: 18,
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  finalText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
  reviewLink: {
    color: "#8B89A6",
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
export default {};