import { StyleSheet } from "react-native";

export const colors = {
  bg: "#F4F7F7",
  card: "#FFFFFF",
  primary: "#2CA6A4",
  primaryDark: "#1F7F7D",
  primarySoft: "#E3F4F3",
  text: "#1E2A2A",
  textMuted: "#6B7878",
  border: "#E6ECEC",
  danger: "#E05C5C",
  dangerSoft: "#FDECEC",
  success: "#4CAF50",
};

export const familyDashStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
    backgroundColor: colors.bg,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  pageSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 2,
    fontWeight: "500",
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.4,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.dangerSoft,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: "700",
    fontSize: 13,
  },
  loadingText: {
    color: colors.primary,
    fontWeight: "600",
  },

  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryCardAccent: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },
  summaryNumberAccent: {
    color: "#fff",
  },
  summaryLabel: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },
  summaryLabelAccent: {
    color: "rgba(255,255,255,0.85)",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 32,
  },

  taskCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 5,
    shadowColor: "#0B2A2A",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
    paddingRight: 10,
    lineHeight: 22,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  taskDescription: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },

  familyStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  familyStatusLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },

  actionRow: {
    flexDirection: "row",
    marginTop: 14,
    gap: 10,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 6,
    flex: 1,
  },
  confirmButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    backgroundColor: colors.danger,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyIconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  emptySubText: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 13,
  },
});