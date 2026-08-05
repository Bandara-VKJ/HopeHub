import { StyleSheet } from "react-native";

export const patientProfileStyles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 25,
  },

  profileCard: {
    backgroundColor: "#F7FEFE",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#D5EEEC",
    alignItems: "center",
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },

  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2CA6A4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  avatarText: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "700",
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },

  infoText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 8,
  },

  taskButton: {
    marginTop: 25,
    backgroundColor: "#2CA6A4",
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 12,
  },

  taskButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
tasksContainer: {
  flex: 1,
  marginTop: 20,
  paddingHorizontal: 20,
},

tasksScroll: {
  maxHeight: 320,
},

tasksTitle: {
  fontSize: 22,
  fontWeight: "bold",
  marginBottom: 12,
},

taskCard: {
  backgroundColor: "#fff",
  padding: 16,
  borderRadius: 12,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: "#E5E7EB",
  elevation: 2,
},

taskTitle: {
  fontSize: 18,
  fontWeight: "600",
},

taskDescription: {
  marginTop: 8,
  color: "#555",
  fontSize: 15,
},

statusContainer: {
  marginTop: 10,
},

statusText: {
  color: "#2563EB",
  fontWeight: "600",
},

dueDate: {
  marginTop: 8,
  color: "#777",
},

emptyText: {
  textAlign: "center",
  color: "#888",
  marginTop: 20,
},
});