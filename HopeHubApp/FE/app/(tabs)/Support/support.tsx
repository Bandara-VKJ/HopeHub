import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BASE_URL = "https://connector-removed-stoneware.ngrok-free.dev";

const ngrokFetch = (url: string, options: RequestInit = {}) =>
  fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "ngrok-skip-browser-warning": "true",
    },
  });

type FilterType = "All Counselors" | "Available Now" | "Top Rated";

type Counselor = {
  _id: string;
  firstName?: string;
  lastName?: string;
  name: string;
  title: string;
  rating: number;
  reviews: number;
  specialty: string;
  experience: string;
  availability: string;
  available: boolean;
  topRated: boolean;
  avatar: string;
  avatarColor: string;
  email?: string;
  mobile?: string;
};

const getAvatar = (counselor: Counselor) => {
  return (
    counselor.avatar ||
    `${counselor.firstName?.[0] || ""}${counselor.lastName?.[0] || ""}`.toUpperCase() ||
    "CN"
  );
};

const AICounsellingFAB = ({ onPress }: { onPress?: () => void }) => (
  <TouchableOpacity style={aiStyles.fab} onPress={onPress} activeOpacity={0.85}>
    <View style={aiStyles.fabInner}>
      <Ionicons name="sparkles" size={26} color="#fff" />
    </View>
    <View style={aiStyles.fabLabel}>
      <Text style={aiStyles.fabLabelText}>AI</Text>
    </View>
    <View style={aiStyles.fabRing} />
  </TouchableOpacity>
);

const StarRating = ({ rating }: { rating: number }) => (
  <View style={styles.ratingRow}>
    <Ionicons name="star" size={14} color="#F09C00" />
    <Text style={styles.ratingText}>{rating || 0}</Text>
  </View>
);

const ActionButton = ({
  icon,
  label,
  primary,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  primary?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.actionBtn, primary && styles.actionBtnPrimary]}
    activeOpacity={0.8}
  >
    <Ionicons
      name={icon}
      size={16}
      color={primary ? "#fff" : "#333"}
      style={{ marginRight: 5 }}
    />
    <Text style={[styles.actionBtnText, primary && styles.actionBtnTextPrimary]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const CounselorProfileModal = ({
  visible,
  counselor,
  onClose,
}: {
  visible: boolean;
  counselor: Counselor | null;
  onClose: () => void;
}) => {
  if (!counselor) return null;

  const avatar = getAvatar(counselor);
  const avatarColor = counselor.avatarColor || "#2CA6A4";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalHeaderTitle}>Counselor Profile</Text>

          <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color="#1A3A3A" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 35 }}
        >
          <View style={styles.profileHero}>
            <View style={[styles.profileAvatar, { backgroundColor: avatarColor + "22" }]}>
              <Text style={[styles.profileAvatarText, { color: avatarColor }]}>
                {avatar}
              </Text>
            </View>

            <Text style={styles.profileName}>{counselor.name}</Text>
            <Text style={styles.profileTitle}>{counselor.title}</Text>

            <View
              style={[
                styles.profileStatusBadge,
                {
                  backgroundColor: counselor.available ? "#E6F9EE" : "#FDE8E8",
                },
              ]}
            >
              <View
                style={[
                  styles.availDot,
                  {
                    backgroundColor: counselor.available ? "#22C55E" : "#EF4444",
                  },
                ]}
              />
              <Text
                style={[
                  styles.profileStatusText,
                  {
                    color: counselor.available ? "#16A34A" : "#DC2626",
                  },
                ]}
              >
                {counselor.available ? "Available Now" : "Busy"}
              </Text>
            </View>
          </View>

          <View style={styles.profileStatsRow}>
            <View style={styles.profileStatCard}>
              <Ionicons name="star" size={22} color="#F09C00" />
              <Text style={styles.profileStatNumber}>{counselor.rating || 0}</Text>
              <Text style={styles.profileStatLabel}>Rating</Text>
            </View>

            <View style={styles.profileStatCard}>
              <Ionicons name="chatbubbles-outline" size={22} color="#2CA6A4" />
              <Text style={styles.profileStatNumber}>{counselor.reviews || 0}</Text>
              <Text style={styles.profileStatLabel}>Reviews</Text>
            </View>

            <View style={styles.profileStatCard}>
              <Ionicons name="medal-outline" size={22} color="#8B5CF6" />
              <Text style={styles.profileStatNumber}>
                {counselor.topRated ? "Yes" : "No"}
              </Text>
              <Text style={styles.profileStatLabel}>Top Rated</Text>
            </View>
          </View>

          <View style={styles.profileInfoCard}>
            <Text style={styles.profileSectionTitle}>Professional Details</Text>

            <ProfileInfoRow
              icon="heart-outline"
              label="Specialty"
              value={counselor.specialty || "-"}
            />

            <ProfileInfoRow
              icon="school-outline"
              label="Experience"
              value={counselor.experience || "-"}
            />

            <ProfileInfoRow
              icon="calendar-outline"
              label="Availability"
              value={counselor.availability || "-"}
            />

            <ProfileInfoRow
              icon="mail-outline"
              label="Email"
              value={counselor.email || "-"}
            />

            <ProfileInfoRow
              icon="call-outline"
              label="Mobile"
              value={counselor.mobile || "-"}
            />
          </View>

          <View style={styles.profileActions}>
            <TouchableOpacity style={styles.profilePrimaryBtn}>
              <Ionicons name="chatbubble-outline" size={18} color="#fff" />
              <Text style={styles.profilePrimaryBtnText}>Start Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileSecondaryBtn}>
              <Ionicons name="calendar-outline" size={18} color="#2CA6A4" />
              <Text style={styles.profileSecondaryBtnText}>Book Session</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const ProfileInfoRow = ({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) => (
  <View style={styles.profileInfoRow}>
    <View style={styles.profileInfoIcon}>
      <Ionicons name={icon} size={19} color="#2CA6A4" />
    </View>

    <View style={{ flex: 1 }}>
      <Text style={styles.profileInfoLabel}>{label}</Text>
      <Text style={styles.profileInfoValue}>{value}</Text>
    </View>
  </View>
);

const CounselorCard = ({
  counselor,
  onViewProfile,
}: {
  counselor: Counselor;
  onViewProfile: () => void;
}) => {
  const avatar = getAvatar(counselor);
  const avatarColor = counselor.avatarColor || "#2CA6A4";

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: avatarColor + "22" }]}>
          <Text style={[styles.avatarText, { color: avatarColor }]}>{avatar}</Text>
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.counselorName}>{counselor.name}</Text>
          <Text style={styles.counselorTitle}>{counselor.title}</Text>

          <View style={styles.ratingReviewRow}>
            <StarRating rating={counselor.rating || 0} />
            <Text style={styles.reviewCount}>
              ({counselor.reviews || 0} reviews)
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.availBadge,
            {
              backgroundColor: counselor.available ? "#e6f9ee" : "#fde8e8",
            },
          ]}
        >
          <View
            style={[
              styles.availDot,
              {
                backgroundColor: counselor.available ? "#22c55e" : "#ef4444",
              },
            ]}
          />

          <Text
            style={[
              styles.availText,
              {
                color: counselor.available ? "#16a34a" : "#dc2626",
              },
            ]}
          >
            {counselor.available ? "Available" : "Busy"}
          </Text>
        </View>
      </View>

      <View style={styles.metaContainer}>
        <View style={styles.metaRow}>
          <Ionicons name="person-circle-outline" size={15} color="#666" />
          <Text style={styles.metaText}>{counselor.specialty}</Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={15} color="#666" />
          <Text style={styles.metaText}>{counselor.experience}</Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={15} color="#666" />
          <Text style={styles.metaText}>{counselor.availability}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardActions}>
        <ActionButton icon="chatbubble-outline" label="Chat" primary />
        <ActionButton icon="videocam-outline" label="Video" />
        <ActionButton icon="mic-outline" label="Voice" />
      </View>

      <TouchableOpacity
        style={styles.viewProfile}
        activeOpacity={0.7}
        onPress={onViewProfile}
      >
        <Text style={styles.viewProfileText}>View Full Profile</Text>
        <Ionicons name="chevron-forward" size={14} color="#2CA6A4" />
      </TouchableOpacity>
    </View>
  );
};

export default function SupportScreen() {
  const [activeFilter, setActiveFilter] =
    useState<FilterType>("All Counselors");
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [selectedCounselor, setSelectedCounselor] =
    useState<Counselor | null>(null);
  const [profileVisible, setProfileVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const filters: FilterType[] = [
    "All Counselors",
    "Available Now",
    "Top Rated",
  ];

  useEffect(() => {
    fetchCounselors();
  }, []);

  const fetchCounselors = async () => {
    try {
      const response = await ngrokFetch(`${BASE_URL}/api/counselors`);
      const data = await response.json();

      if (!response.ok) {
        console.log("Counselor fetch failed:", data);
        setCounselors([]);
        return;
      }

      setCounselors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Fetch counselors error:", error);
      setCounselors([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openProfile = (counselor: Counselor) => {
    setSelectedCounselor(counselor);
    setProfileVisible(true);
  };

  const closeProfile = () => {
    setProfileVisible(false);
    setSelectedCounselor(null);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCounselors();
  };

  const filteredCounselors = counselors.filter((c) => {
    if (activeFilter === "Available Now") return c.available;
    if (activeFilter === "Top Rated") return c.topRated;
    return true;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2CA6A4" />
        <Text style={styles.loadingText}>Loading counselors...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CounselorProfileModal
        visible={profileVisible}
        counselor={selectedCounselor}
        onClose={closeProfile}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}>
                <Ionicons name="heart" size={18} color="#fff" />
              </View>

              <View>
                <Text style={styles.logoTitle}>HopeHub</Text>
                <Text style={styles.logoSubtitle}>Connect with Counselors</Text>
              </View>
            </View>
          </View>

          <View style={styles.heroBanner}>
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color="#fff"
              style={{ marginBottom: 6 }}
            />
            <Text style={styles.heroTitle}>Professional Support Available</Text>
            <Text style={styles.heroBody}>
              Connect with counselors who specialize in addiction recovery.
              All conversations are confidential and secure.
            </Text>
          </View>
        </View>

        <View style={styles.filterContainer}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterBtn,
                activeFilter === f && styles.filterBtnActive,
              ]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === f && styles.filterTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.resultCount}>
          {filteredCounselors.length} counselor
          {filteredCounselors.length !== 1 ? "s" : ""} found
        </Text>

        <View style={styles.cardList}>
          {filteredCounselors.length > 0 ? (
            filteredCounselors.map((c) => (
              <CounselorCard
                key={c._id}
                counselor={c}
                onViewProfile={() => openProfile(c)}
              />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="people-outline" size={45} color="#A8CACA" />
              <Text style={styles.emptyTitle}>No counselors found</Text>
              <Text style={styles.emptyText}>
                Create a counselor account first, then refresh this page.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.emergencyBanner}>
          <Ionicons name="warning" size={20} color="#e26d36" />

          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.emergencyTitle}>Need Immediate Help?</Text>
            <Text style={styles.emergencyBody}>
              If you're in crisis, call the HopeHub Helpline:{" "}
              <Text style={styles.emergencyNumber}>1-800-662-4357</Text>
            </Text>
          </View>
        </View>
      </ScrollView>

      <AICounsellingFAB />
    </View>
  );
}

const styles = StyleSheet.create({
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
    shadowOffset: { width: 0, height: 4 },
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

  actionBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },

  actionBtnTextPrimary: {
    color: "#fff",
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

  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F7F7",
    justifyContent: "center",
    alignItems: "center",
  },

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

  profileSecondaryBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#2CA6A4",
  },

  profileSecondaryBtnText: {
    color: "#2CA6A4",
    fontWeight: "900",
    fontSize: 14,
  },
});

const aiStyles = StyleSheet.create({
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
    shadowOffset: { width: 0, height: 6 },
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