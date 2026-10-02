import { StyleSheet } from "react-native";

export const accountCreateStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F4FAFA",
  },

  hero: {
    position: "relative",
    minHeight: 240,
    backgroundColor: "#DFF5F4",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 25,
    overflow: "hidden",
  },

  heroAnimation: {
    width: 190,
    height: 150,
  },

  heroContent: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -10,
  },

  smallTitle: {
    fontSize: 15,
    color: "#557979",
    fontWeight: "500",
    marginBottom: 3,
  },

  brand: {
    fontSize: 32,
    color: "#2CA6A4",
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  roleSwitch: {
    flexDirection: "row",
    alignSelf: "center",
    width: "88%",
    backgroundColor: "#E8F1F1",
    borderRadius: 12,
    padding: 4,
    marginTop: 22,
    marginBottom: 15,
  },

  roleBtn: {
    flex: 1,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
  },

  roleBtnActive: {
    backgroundColor: "#2CA6A4",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  roleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#617777",
  },

  roleTextActive: {
    color: "#FFFFFF",
  },

  card: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 28,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  cardTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#254747",
    marginBottom: 20,
  },

  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#385E5E",
    marginBottom: 13,
  },

  divider: {
    height: 1,
    backgroundColor: "#E5EEEE",
    marginVertical: 17,
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FBFB",
    borderWidth: 1,
    borderColor: "#D8E7E7",
    borderRadius: 11,
    paddingHorizontal: 13,
    minHeight: 52,
    marginBottom: 13,
  },

  // IMPORTANT:
  // Do NOT add outlineStyle: "none" here.
  input: {
    flex: 1,
    fontSize: 15,
    color: "#263D3D",
    paddingVertical: 10,
    marginLeft: 8,
  },

  button: {
    width: "100%",
    minHeight: 52,
    backgroundColor: "#2CA6A4",
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#2CA6A4",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  bottomText: {
    textAlign: "center",
    marginTop: 19,
    fontSize: 14,
    color: "#718585",
  },

  loginText: {
    color: "#2CA6A4",
    fontWeight: "700",
  },
});