import { StyleSheet } from "react-native";

export const accountCreateStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F4F9F9",
  },

  header: {
    backgroundColor: "#2CA6A4",
    paddingTop: 60,
    paddingHorizontal: 22,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  smallTitle: {
    color: "#DFF7F6",
    fontSize: 16,
    fontWeight: "500",
  },

  brand: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "900",
    marginTop: 2,
  },

  subtitle: {
    color: "#EAFDFC",
    fontSize: 13,
    marginTop: 6,
    width: 210,
    lineHeight: 19,
  },

  logo: {
    width: 95,
    height: 95,
    resizeMode: "contain",
  },

  roleSwitch: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -22,
    borderRadius: 18,
    padding: 5,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
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
  },

  roleTextActive: {
    color: "#fff",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 35,
    padding: 18,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },

  cardTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1A3A3A",
    marginBottom: 16,
  },

  sectionLabel: {
    fontSize: 14,
    color: "#2CA6A4",
    fontWeight: "800",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  inputWrapper: {
    minHeight: 54,
    backgroundColor: "#F4F9F9",
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
  },

  divider: {
    height: 1,
    backgroundColor: "#E6F1F1",
    marginVertical: 12,
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
    marginTop: 16,
    color: "#7A9A9A",
  },

  loginText: {
    color: "#2CA6A4",
    fontWeight: "800",
  },
});