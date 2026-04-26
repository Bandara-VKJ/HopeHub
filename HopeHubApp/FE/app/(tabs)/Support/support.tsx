import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ─── Types ────────────────────────────────────────────────────────────────────
type FilterType = "All Counselors" | "Available Now" | "Top Rated";

interface Counselor {
  id: number;
  name: string;
  title: string;
  rating: number;
  reviews: number;
  specialty: string;
  experience: string;
  availability: string;
  available: boolean;
  topRated: boolean;
  avatar: string; // initials fallback
  avatarColor: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const COUNSELORS: Counselor[] = [
  {
    id: 1,
    name: "Dr. Emily Chen",
    title: "Licensed Addiction Counselor",
    rating: 4.9,
    reviews: 234,
    specialty: "Substance Abuse & Behavioral Therapy",
    experience: "12 years experience",
    availability: "Available Today",
    available: true,
    topRated: true,
    avatar: "EC",
    avatarColor: "#2CA6A4",
  },
  {
    id: 2,
    name: "Dr. Marcus Reid",
    title: "Clinical Psychologist",
    rating: 4.8,
    reviews: 187,
    specialty: "Trauma & Recovery Coaching",
    experience: "9 years experience",
    availability: "Available Today",
    available: true,
    topRated: true,
    avatar: "MR",
    avatarColor: "#5B8DEF",
  },
  {
    id: 3,
    name: "Sarah Nguyen",
    title: "Certified Recovery Specialist",
    rating: 4.6,
    reviews: 112,
    specialty: "Relapse Prevention & Mindfulness",
    experience: "6 years experience",
    availability: "Available Tomorrow",
    available: false,
    topRated: false,
    avatar: "SN",
    avatarColor: "#E26D9A",
  },
  {
    id: 4,
    name: "Dr. James Okafor",
    title: "Addiction Psychiatrist",
    rating: 4.9,
    reviews: 305,
    specialty: "Dual Diagnosis & Medication-Assisted Treatment",
    experience: "15 years experience",
    availability: "Available Today",
    available: true,
    topRated: true,
    avatar: "JO",
    avatarColor: "#F09C00",
  },
];

// ─── AI Counselling FAB ───────────────────────────────────────────────────────
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

// ─── Sub-components ───────────────────────────────────────────────────────────
const StarRating = ({ rating }: { rating: number }) => (
  <View style={styles.ratingRow}>
    <Ionicons name="star" size={14} color="#F09C00" />
    <Text style={styles.ratingText}>{rating}</Text>
  </View>
);

const ActionButton = ({
  icon,
  label,
  primary,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  primary?: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    style={[styles.actionBtn, primary && styles.actionBtnPrimary]}
    onPress={onPress}
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

const CounselorCard = ({ counselor }: { counselor: Counselor }) => (
  <View style={styles.card}>
    {/* Header row */}
    <View style={styles.cardHeader}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: counselor.avatarColor + "22" }]}>
        <Text style={[styles.avatarText, { color: counselor.avatarColor }]}>
          {counselor.avatar}
        </Text>
      </View>

      {/* Name & title */}
      <View style={styles.cardInfo}>
        <Text style={styles.counselorName}>{counselor.name}</Text>
        <Text style={styles.counselorTitle}>{counselor.title}</Text>
        <View style={styles.ratingReviewRow}>
          <StarRating rating={counselor.rating} />
          <Text style={styles.reviewCount}>({counselor.reviews} reviews)</Text>
        </View>
      </View>

      {/* Availability badge */}
      <View
        style={[
          styles.availBadge,
          { backgroundColor: counselor.available ? "#e6f9ee" : "#fde8e8" },
        ]}
      >
        <View
          style={[
            styles.availDot,
            { backgroundColor: counselor.available ? "#22c55e" : "#ef4444" },
          ]}
        />
        <Text
          style={[
            styles.availText,
            { color: counselor.available ? "#16a34a" : "#dc2626" },
          ]}
        >
          {counselor.available ? "Available" : "Busy"}
        </Text>
      </View>
    </View>

    {/* Meta row */}
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

    {/* Divider */}
    <View style={styles.divider} />

    {/* Action buttons */}
    <View style={styles.cardActions}>
      <ActionButton icon="chatbubble-outline" label="Chat" primary />
      <ActionButton icon="videocam-outline" label="Video" />
      <ActionButton icon="mic-outline" label="Voice" />
    </View>

    {/* View profile link */}
    <TouchableOpacity style={styles.viewProfile} activeOpacity={0.7}>
      <Text style={styles.viewProfileText}>View Full Profile</Text>
      <Ionicons name="chevron-forward" size={14} color="#2CA6A4" />
    </TouchableOpacity>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SupportScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All Counselors");
  const filters: FilterType[] = ["All Counselors", "Available Now", "Top Rated"];

  const filteredCounselors = COUNSELORS.filter((c) => {
    if (activeFilter === "Available Now") return c.available;
    if (activeFilter === "Top Rated") return c.topRated;
    return true;
  });

  return (
    <View style={{ flex: 1 }}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
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

        {/* Hero banner */}
        <View style={styles.heroBanner}>
          <Ionicons
            name="shield-checkmark-outline"
            size={22}
            color="#fff"
            style={{ marginBottom: 6 }}
          />
          <Text style={styles.heroTitle}>Professional Support Available</Text>
          <Text style={styles.heroBody}>
            Connect with licensed counselors who specialize in addiction
            recovery. All conversations are confidential and secure.
          </Text>
        </View>
      </View>

      {/* ── Filter Tabs ── */}
      <View style={styles.filterContainer}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, activeFilter === f && styles.filterBtnActive]}
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

      {/* ── Result count ── */}
      <Text style={styles.resultCount}>
        {filteredCounselors.length} counselor
        {filteredCounselors.length !== 1 ? "s" : ""} found
      </Text>

      {/* ── Counselor Cards ── */}
      <View style={styles.cardList}>
        {filteredCounselors.map((c) => (
          <CounselorCard key={c.id} counselor={c} />
        ))}
      </View>

      {/* ── Emergency Banner ── */}
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

    {/* ── AI Counselling FAB (fixed, doesn't scroll) ── */}
    <AICounsellingFAB />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4fafa",
  },

  // Header
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

  // Filters
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

  // Result count
  resultCount: {
    fontSize: 12,
    color: "#999",
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
  },

  // Card list
  cardList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 14,
  },

  // Card
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

  // Availability badge
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

  // Meta
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
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 14,
  },

  // Action buttons
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

  // View profile
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

  // Emergency banner
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
});

// ─── AI FAB Styles ────────────────────────────────────────────────────────────
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