import { StyleSheet } from "react-native";

export const CounselorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F9F9",
  },

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

  header: {
    backgroundColor: "#2CA6A4",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  greeting: {
    color: "#DFF7F6",
    fontSize: 16,
  },

  name: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 4,
  },

  profileBtn: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  profileCard: {
    backgroundColor: "#fff",
    marginTop: 25,
    borderRadius: 20,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
    backgroundColor: "#E8F8F8",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2CA6A4",
  },

  avatarText: {
    fontSize: 26,
    fontWeight: "900",
    color: "#2CA6A4",
  },

  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },

  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },

  profileTitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  ratingText: {
    marginLeft: 5,
    color: "#444",
    fontWeight: "600",
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 25,
  },

  statCard: {
    backgroundColor: "#fff",
    width: "30%",
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },

  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginTop: 8,
  },

  statLabel: {
    color: "#777",
    marginTop: 4,
    fontSize: 12,
  },

  section: {
    paddingHorizontal: 20,
    marginTop: 30,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 18,
  },

  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF5F5",
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#E8F8F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  infoLabel: {
    fontSize: 12,
    color: "#7A9A9A",
    fontWeight: "600",
  },

  infoValue: {
    fontSize: 15,
    color: "#1A3A3A",
    fontWeight: "700",
    marginTop: 2,
  },

  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  actionCard: {
    backgroundColor: "#fff",
    width: "47%",
    borderRadius: 20,
    paddingVertical: 25,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },

  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2CA6A4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  actionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  quoteCard: {
    marginHorizontal: 20,
    marginTop: 25,
    backgroundColor: "#2CA6A4",
    borderRadius: 24,
    padding: 25,
    alignItems: "center",
  },

  quoteText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 15,
    lineHeight: 24,
    fontStyle: "italic",
  },

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

logoutText: {
  color: "#E05C5C",
  fontSize: 16,
  fontWeight: "800",
},
statusBox: {
  backgroundColor: "#fff",
  marginHorizontal: 20,
  marginTop: 25,
  borderRadius: 20,
  padding: 18,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 4,
},

statusLabel: {
  fontSize: 13,
  color: "#7A9A9A",
  fontWeight: "700",
},

statusText: {
  fontSize: 22,
  fontWeight: "900",
  marginTop: 4,
},

statusButton: {
  minWidth: 135,
  height: 44,
  borderRadius: 14,
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: 6,
  paddingHorizontal: 12,
},

statusButtonText: {
  fontSize: 13,
  fontWeight: "900",
},
});