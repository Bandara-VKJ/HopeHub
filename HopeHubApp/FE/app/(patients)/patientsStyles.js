import { StyleSheet } from "react-native";

export const patientsStyles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    color: "#1F2937",
  },

  patientCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FEFE",
    padding: 15,
    marginBottom: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#D5EEEC",
  },
    avatar: {
    width: 55,
    height: 55,
    borderRadius: 30,
    marginRight: 15,
    },
  avatarPlaceholder: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: "#2CA6A4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  avatarText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
  },

  patientName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
  },

  patientEmail: {
    marginTop: 5,
    fontSize: 14,
    color: "#6B7280",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

});