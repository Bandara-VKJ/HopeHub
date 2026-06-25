import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CounselorStyles as styles } from "../(counselor)/counselorStyles";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const BASE_URL = "https://connector-removed-stoneware.ngrok-free.dev";

const ngrokFetch = (url: string, options: RequestInit = {}) =>
  fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "ngrok-skip-browser-warning": "true",
    },
  });

type Counselor = {
  _id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  mobile: string;
  title: string;
  specialty: string;
  experience: string;
  availability: string;
  rating: number;
  reviews: number;
  available: boolean;
  avatar: string;
  avatarColor: string;
};

export default function CounselorScreen() {
  const [counselor, setCounselor] = useState<Counselor | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  useEffect(() => {
    loadCounselor();
  }, []);

  const goToCounselorLogin = () => {
    router.replace({
      pathname: "/(auth)/Login/login",
      params: { role: "counselor" },
    });
  };

  const loadCounselor = async () => {
    try {
      const saved = await AsyncStorage.getItem("counselor");
      const role = await AsyncStorage.getItem("role");

      if (role !== "counselor" || !saved) {
        goToCounselorLogin();
        return;
      }

      const parsedCounselor = JSON.parse(saved);
      setCounselor(parsedCounselor);
    } catch (error) {
      console.log("Load counselor error:", error);
      goToCounselorLogin();
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    if (!counselor || updatingAvailability) return;

    const oldCounselor = counselor;
    const nextAvailable = !counselor.available;

    const tempCounselor: Counselor = {
      ...counselor,
      available: nextAvailable,
      availability: nextAvailable ? "Available Today" : "Busy",
    };

    setCounselor(tempCounselor);
    setUpdatingAvailability(true);

    try {
      const response = await ngrokFetch(
        `${BASE_URL}/api/counselors/${counselor._id}/availability`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            available: nextAvailable,
          }),
        }
      );

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        setCounselor(oldCounselor);
        console.log("Availability update failed:", data);
        Alert.alert("Error", data.message || "Failed to update availability");
        return;
      }

      const updatedCounselor = data.counselor || data.user;

      setCounselor(updatedCounselor);
      await AsyncStorage.setItem("counselor", JSON.stringify(updatedCounselor));

      Alert.alert(
        "Status Updated",
        updatedCounselor.available
          ? "You are now Available"
          : "You are now Busy"
      );
    } catch (error) {
      setCounselor(oldCounselor);
      console.log("Availability update error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "role",
        "counselor",
        "counselorId",
        "userId",
        "token",
        "loginRole",
      ]);

      goToCounselorLogin();
    } catch (error) {
      console.log("Logout error:", error);
      Alert.alert("Error", "Logout failed. Please try again.");
    }
  };

  const confirmLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2CA6A4" />
        <Text style={styles.loadingText}>Loading counselor profile...</Text>
      </View>
    );
  }

  const isAvailable = counselor?.available ?? false;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2CA6A4" />

      <View style={styles.header}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.greeting}>Welcome Back 👋</Text>
            <Text style={styles.name}>{counselor?.name || "Counselor"}</Text>
          </View>

          <TouchableOpacity style={styles.profileBtn} onPress={confirmLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{counselor?.avatar || "CN"}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{counselor?.name}</Text>
            <Text style={styles.profileTitle}>{counselor?.title}</Text>

            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#FFC107" />
              <Text style={styles.ratingText}>
                {counselor?.rating || 0} Rating · {counselor?.reviews || 0} Reviews
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View style={styles.statusBox}>
          <View>
            <Text style={styles.statusLabel}>Current Status</Text>
            <Text
              style={[
                styles.statusText,
                { color: isAvailable ? "#16A34A" : "#DC2626" },
              ]}
            >
              {isAvailable ? "● Available" : "● Busy"}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.statusButton,
              {
                backgroundColor: isAvailable ? "#FDE8E8" : "#E6F9EE",
              },
            ]}
            onPress={toggleAvailability}
            disabled={updatingAvailability}
            activeOpacity={0.75}
          >
            {updatingAvailability ? (
              <ActivityIndicator
                size="small"
                color={isAvailable ? "#DC2626" : "#16A34A"}
              />
            ) : (
              <>
                <Ionicons
                  name={
                    isAvailable
                      ? "pause-circle-outline"
                      : "checkmark-circle-outline"
                  }
                  size={20}
                  color={isAvailable ? "#DC2626" : "#16A34A"}
                />

                <Text
                  style={[
                    styles.statusButtonText,
                    { color: isAvailable ? "#DC2626" : "#16A34A" },
                  ]}
                >
                  {isAvailable ? "Set Busy" : "Set Available"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="heart-outline" size={28} color="#2CA6A4" />
            <Text style={styles.statNumber}>
              {counselor?.specialty ? "1" : "0"}
            </Text>
            <Text style={styles.statLabel}>Specialty</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={28} color="#2CA6A4" />
            <Text style={styles.statNumber}>{isAvailable ? "Yes" : "No"}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="chatbubble-outline" size={28} color="#2CA6A4" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Messages</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Profile Details</Text>

          <View style={styles.infoCard}>
            <InfoRow
              icon="mail-outline"
              label="Email"
              value={counselor?.email || "-"}
            />

            <InfoRow
              icon="call-outline"
              label="Mobile"
              value={counselor?.mobile || "-"}
            />

            <InfoRow
              icon="briefcase-outline"
              label="Title"
              value={counselor?.title || "-"}
            />

            <InfoRow
              icon="heart-outline"
              label="Specialty"
              value={counselor?.specialty || "-"}
            />

            <InfoRow
              icon="school-outline"
              label="Experience"
              value={counselor?.experience || "-"}
            />

            <InfoRow
              icon="time-outline"
              label="Availability"
              value={counselor?.availability || "-"}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Ionicons name="calendar" size={26} color="#fff" />
              </View>
              <Text style={styles.actionText}>Schedule</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: "#FF9800" }]}>
                <Ionicons name="chatbubble" size={26} color="#fff" />
              </View>
              <Text style={styles.actionText}>Chats</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: "#9C27B0" }]}>
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={26}
                  color="#fff"
                />
              </View>
              <Text style={styles.actionText}>Reports</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: "#E91E63" }]}>
                <FontAwesome5 name="users" size={22} color="#fff" />
              </View>
              <Text style={styles.actionText}>Patients</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton}onPress={async () => {
          await AsyncStorage.removeItem("userId");
          await AsyncStorage.removeItem("role");
          router.replace('/(auth)/Login/login');
        }}>
          <Ionicons name="log-out-outline" size={22} color="#E05C5C" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.quoteCard}>
          <Ionicons name="heart" size={28} color="#fff" />
          <Text style={styles.quoteText}>
            "Healing takes time, and asking for help is a courageous step."
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={19} color="#2CA6A4" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}