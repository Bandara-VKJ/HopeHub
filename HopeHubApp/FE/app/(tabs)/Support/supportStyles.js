import { StyleSheet } from "react-native";

/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

export const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#f4fafa",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#2CA6A4",
    fontWeight: "700",
  },

  container: {
    flex: 1,
    backgroundColor: "#f4fafa",
  },

  header: {
    backgroundColor: "#2CA6A4",
    paddingTop: 52,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },

  headerContent: {
    marginBottom: 16,
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#ffffff30",
    justifyContent: "center",
    alignItems: "center",
  },

  logoTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },

  logoSubtitle: {
    fontSize: 12,
    color: "#ffffffcc",
    marginTop: 1,
  },

  heroBanner: {
    backgroundColor: "#ffffff18",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ffffff30",
    padding: 16,
  },

  heroTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
  },

  heroBody: {
    fontSize: 13,
    color: "#ffffffdd",
    lineHeight: 18,
  },

  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 18,
    gap: 8,
  },

  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#ddd",
  },

  filterBtnActive: {
    backgroundColor: "#2CA6A4",
    borderColor: "#2CA6A4",
  },

  filterText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
  },

  filterTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  resultCount: {
    fontSize: 12,
    color: "#999",
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
  },

  cardList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 14,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#2CA6A4",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  avatarText: {
    fontSize: 18,
    fontWeight: "700",
  },

  cardInfo: {
    flex: 1,
  },

  counselorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 2,
  },

  counselorTitle: {
    fontSize: 12,
    color: "#777",
    marginBottom: 5,
  },

  ratingReviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  ratingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },

  reviewCount: {
    fontSize: 12,
    color: "#999",
  },

  availBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
    flexShrink: 0,
  },

  availDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  availText: {
    fontSize: 11,
    fontWeight: "600",
  },

  metaContainer: {
    marginTop: 14,
    gap: 6,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  metaText: {
    fontSize: 13,
    color: "#555",
    flex: 1,
  },

  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 14,
  },

  cardActions: {
    flexDirection: "row",
    gap: 8,
  },

  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#eee",
  },

  actionBtnPrimary: {
    backgroundColor: "#2CA6A4",
    borderColor: "#2CA6A4",
  },

  actionBtnDisabled: {
    backgroundColor: "#f1f1f1",
    borderColor: "#e5e5e5",
  },

  actionBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },

  actionBtnTextPrimary: {
    color: "#fff",
  },

  actionBtnTextDisabled: {
    color: "#aaa",
  },

  viewProfile: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    gap: 3,
  },

  viewProfileText: {
    fontSize: 13,
    color: "#2CA6A4",
    fontWeight: "600",
  },

  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 25,
    alignItems: "center",
    marginTop: 10,
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "800",
    color: "#1A3A3A",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 5,
    color: "#7A9A9A",
    fontSize: 13,
  },

  emergencyBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff5f0",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#f9cbb0",
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
  },

  emergencyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#e26d36",
    marginBottom: 4,
  },

  emergencyBody: {
    fontSize: 12,
    color: "#666",
    lineHeight: 17,
  },

  emergencyNumber: {
    fontWeight: "700",
    color: "#e26d36",
  },

  /*
  |--------------------------------------------------------------------------
  | MODAL
  |--------------------------------------------------------------------------
  */

  modalContainer: {
    flex: 1,
    backgroundColor: "#F4FAFA",
  },

  modalHeader: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E6F1F1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A3A3A",
  },

  modalHeaderSubtitle: {
    fontSize: 12,
    color: "#7A9A9A",
    marginTop: 3,
  },

  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F7F7",
    justifyContent: "center",
    alignItems: "center",
  },

  /*
  |--------------------------------------------------------------------------
  | PROFILE
  |--------------------------------------------------------------------------
  */

  profileHero: {
    backgroundColor: "#2CA6A4",
    alignItems: "center",
    paddingVertical: 35,
  },

  profileAvatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.7)",
  },

  profileAvatarText: {
    fontSize: 32,
    fontWeight: "900",
  },

  profileName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 14,
  },

  profileTitle: {
    color: "#EAFDFC",
    fontSize: 14,
    marginTop: 4,
  },

  profileStatusBadge: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  profileStatusText: {
    fontSize: 12,
    fontWeight: "800",
  },

  profileStatsRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 18,
  },

  profileStatCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  profileStatNumber: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1A3A3A",
    marginTop: 6,
  },

  profileStatLabel: {
    fontSize: 11,
    color: "#7A9A9A",
    fontWeight: "700",
    marginTop: 2,
  },

  profileInfoCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  profileSectionTitle: {
    fontSize: 17,
    color: "#1A3A3A",
    fontWeight: "900",
    marginBottom: 10,
  },

  profileInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF5F5",
  },

  profileInfoIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#E8F8F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  profileInfoLabel: {
    fontSize: 12,
    color: "#7A9A9A",
    fontWeight: "700",
  },

  profileInfoValue: {
    fontSize: 14,
    color: "#1A3A3A",
    fontWeight: "800",
    marginTop: 2,
  },

  profileActions: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 18,
    gap: 10,
  },

  profilePrimaryBtn: {
    flex: 1,
    backgroundColor: "#2CA6A4",
    borderRadius: 16,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },

  profilePrimaryBtnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },

  /*
  |--------------------------------------------------------------------------
  | BOOKING
  |--------------------------------------------------------------------------
  */

  bookingSection: {
    marginHorizontal: 16,
    marginTop: 18,
  },

  bookingSectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#1A3A3A",
    marginBottom: 12,
  },

  dateCard: {
    width: 74,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#E4EEEE",
    alignItems: "center",
    marginRight: 9,
  },

  dateCardSelected: {
    backgroundColor: "#2CA6A4",
    borderColor: "#2CA6A4",
  },

  dateDay: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7A9A9A",
  },

  dateNumber: {
    fontSize: 23,
    fontWeight: "900",
    color: "#1A3A3A",
    marginVertical: 3,
  },

  dateMonth: {
    fontSize: 11,
    color: "#7A9A9A",
    fontWeight: "700",
  },

  dateTextSelected: {
    color: "#fff",
  },

  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  timeSlot: {
    width: "47%",
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#E4EEEE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  timeSlotSelected: {
    backgroundColor: "#2CA6A4",
    borderColor: "#2CA6A4",
  },

  timeSlotDisabled: {
    backgroundColor: "#F1F1F1",
    borderColor: "#E2E2E2",
  },

  timeSlotText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "#1A3A3A",
  },

  timeSlotTextSelected: {
    color: "#fff",
  },

  timeSlotTextDisabled: {
    color: "#aaa",
  },

  slotBookedText: {
    fontSize: 8,
    color: "#DC2626",
    marginLeft: 4,
    fontWeight: "800",
  },

  bookingInfoCard: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: "#EAF8F8",
    borderRadius: 16,
    padding: 15,
  },

  bookingInfoTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#1A3A3A",
    marginBottom: 4,
  },

  bookingInfoText: {
    fontSize: 12,
    color: "#527272",
    lineHeight: 17,
  },

  selectedSummary: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1A3A3A",
    marginBottom: 10,
  },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },

  summaryText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#455",
    fontWeight: "700",
  },

  confirmBookingButton: {
    marginHorizontal: 16,
    marginTop: 20,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#2CA6A4",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },

  confirmBookingDisabled: {
    backgroundColor: "#A9CCCC",
  },

  confirmBookingText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },

  /*
  |--------------------------------------------------------------------------
  | BOOKING STATUS CARD
  |--------------------------------------------------------------------------
  */

  existingBookingCard: {
    marginTop: 15,
    backgroundColor: "#F7FBFB",
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: "#E2EEEE",
  },

  existingBookingTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  existingBookingTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#1A3A3A",
  },

  existingBookingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  existingBookingText: {
    marginLeft: 7,
    fontSize: 12,
    color: "#536969",
    fontWeight: "700",
  },

  pendingMessage: {
    marginTop: 8,
    fontSize: 11,
    color: "#D97706",
    fontWeight: "700",
  },

  bookingStatus: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
    gap: 4,
  },

  bookingStatusText: {
    fontSize: 10,
    fontWeight: "900",
  },

  bookNowButton: {
    height: 46,
    backgroundColor: "#2CA6A4",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  bookNowText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
  },
});

/*
|--------------------------------------------------------------------------
| AI STYLES
|--------------------------------------------------------------------------
*/

export const aiStyles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 70,
    right: 22,
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
  },

  fabInner: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#2CA6A4",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2CA6A4",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  },

  fabRing: {
    position: "absolute",
    width: 76,
    height: 76,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#2CA6A440",
  },

  fabLabel: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: "#2CA6A4",
  },

  fabLabelText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#2CA6A4",
    letterSpacing: 0.5,
  },
});