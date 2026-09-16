import { StyleSheet } from "react-native";

export const loginStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F4F9F9",
  },

  pageContent: {
    paddingBottom: 40,
  },

  /* =========================
     TOP ANIMATION
     ========================= */

  hero: {
    height: 300,
    backgroundColor: "#2CA6A4",

    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,

    overflow: "hidden",

    position: "relative",
  },

  heroAnimation: {
    position: "absolute",

    width: 380,
    height: 380,

    alignSelf: "center",

    top: -35,

    opacity: 0.9,
  },

  heroContent: {
    position: "absolute",

    left: 22,
    bottom: 120,

    zIndex: 2,
  },

smallTitle: {
  color: "#DFF7F6",
  fontSize: 16,
  fontWeight: "500",

  textShadowColor: "rgba(0, 0, 0, 0.6)",
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 6,
},

brand: {
  color: "#fff",
  fontSize: 38,
  fontWeight: "900",
  marginTop: 2,

  textShadowColor: "rgba(0, 0, 0, 0.6)",
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 7,
},

subtitle: {
  color: "#EAFDFC",
  fontSize: 13,
  marginTop: 6,
  width: 230,
  lineHeight: 19,

  textShadowColor: "rgba(0, 0, 0, 0.6)",
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 5,
},

  roleSwitch: {
  flexDirection: "row",
  backgroundColor: "#fff",
  marginHorizontal: 20,
  marginTop: -100,

  borderRadius: 18,
  padding: 5,

  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 10,

  elevation: 4,

  zIndex: 5,
},

  roleBtn: {
    flex: 1,

    paddingVertical: 12,

    borderRadius: 14,

    alignItems: "center",
  },

  roleBtnActive: {
    backgroundColor: "#2CA6A4",
  },

  roleText: {
    color: "#7A9A9A",

    fontWeight: "700",

    fontSize: 13,
  },

  roleTextActive: {
    color: "#fff",
  },


  card: {
    backgroundColor: "#fff",

    marginHorizontal: 20,
    marginTop: 20,

    padding: 22,

    borderRadius: 24,

    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 12,

    elevation: 5,

    zIndex: 4,
  },

  cardTitle: {
    fontSize: 24,

    fontWeight: "800",

    color: "#1A3A3A",

    marginBottom: 20,

    textAlign: "center",
  },


  inputWrapper: {
    minHeight: 54,

    backgroundColor: "rgba(244, 249, 249, 0.85)",

    borderRadius: 16,

    paddingHorizontal: 14,

    marginBottom: 12,

    flexDirection: "row",

    alignItems: "center",

    borderWidth: 1,

    borderColor: "#DDEEEE",

    gap: 10,
  },

  input: {
    flex: 1,

    fontSize: 14,

    color: "#1A3A3A",

    paddingVertical: 0,

    outlineStyle: "none",
  },


  button: {
    height: 56,

    borderRadius: 18,

    backgroundColor: "#2CA6A4",

    justifyContent: "center",

    alignItems: "center",

    marginTop: 8,

    shadowColor: "#2CA6A4",
    shadowOpacity: 0.3,
    shadowRadius: 8,

    elevation: 5,
  },

  buttonText: {
    color: "#fff",

    fontSize: 16,

    fontWeight: "800",
  },


  bottomText: {
    textAlign: "center",

    marginTop: 18,

    color: "#7A9A9A",
  },

  loginText: {
    color: "#2CA6A4",

    fontWeight: "800",
  },
  modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",
  alignItems: "center",
},

languageModal: {
  width: "85%",
  backgroundColor: "#FFFFFF",
  borderRadius: 20,
  padding: 25,
  alignItems: "center",
},

modalTitle: {
  fontSize: 24,
  fontWeight: "bold",
  color: "#234B4B",
  marginBottom: 8,
},

modalSubtitle: {
  fontSize: 16,
  color: "#7A9A9A",
  marginBottom: 25,
},

languageButton: {
  width: "100%",
  padding: 15,
  borderWidth: 1,
  borderColor: "#D5E2E2",
  borderRadius: 12,
  marginBottom: 12,
  alignItems: "center",
},

languageButtonSelected: {
  borderColor: "#4F8A8A",
  backgroundColor: "#E8F4F4",
},

languageText: {
  fontSize: 17,
  color: "#234B4B",
  fontWeight: "500",
},

continueButton: {
  width: "100%",
  padding: 15,
  borderRadius: 12,
  backgroundColor: "#4F8A8A",
  alignItems: "center",
  marginTop: 15,
},

continueButtonText: {
  fontSize: 17,
  fontWeight: "bold",
  color: "#FFFFFF",
}
});

export default {};