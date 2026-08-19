import { StyleSheet } from "react-native";

export const familyDashStyles = StyleSheet.create({

  logoutButton: {
    marginHorizontal: 20,
    marginTop: 25,
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFD5D5",
    gap: 8,
    },
    loadingText: {
    marginTop: 10,
    color: "#2CA6A4",
    fontWeight: "600",
  },
    container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: "#F7F7F7",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 24,
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    flex: 1,
    paddingRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  taskDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 8,
    color: "#999",
    fontSize: 14,
  },
})