import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { familyDashStyles, colors } from "./familyDashStyles";
import { ngrokFetch } from "@/utill/ngrokFetch";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

type Task = {
  _id: string;
  title: string;
  description: string;
  status: string;
  family_status: string;
  date: string;
};

const statusColor = (family_status: string) => {
  switch (family_status) {
    case "completed":
    case "confirmed":
      return "#4CAF50";
    case "rejected":
      return "#E05C5C";
    case "pending_confirmation":
      return "#3C9EE0";
    case "not_required":
      return "#999999";
    default:
      return "#E0A93C";
  }
};

const formatStatus = (value: string) =>
  (value || "").replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export default function FamilyLogin() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    getTasks();
  }, []);

  const getTasks = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const familyToken = await AsyncStorage.getItem("familyToken");

      if (!userId || !familyToken) {
        setLoading(false);
        return;
      }

      const response = await ngrokFetch(
        `${BASE_URL}/api/taks/user-tasks?userId=${userId}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${familyToken}`,
          },
        }
      );

      const data = await response.json();

      console.log("Tasks response:", data);

      if (response.ok) {
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.log("Get tasks error:", error);
      setTasks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    getTasks();
  };

  const respondToTask = async (
    taskId: string,
    family_status: "confirmed" | "rejected"
  ) => {
    try {
      setActioningId(taskId);
      const familyToken = await AsyncStorage.getItem("familyToken");

      const response = await ngrokFetch(
        `${BASE_URL}/api/taks/${taskId}/family-status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${familyToken}`,
          },
          body: JSON.stringify({ family_status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.error || `Failed to update task`);
        return;
      }

      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, family_status } : t))
      );
    } catch (error) {
      console.log(`Update family status error:`, error);
      Alert.alert("Error", `Failed to update task`);
    } finally {
      setActioningId(null);
    }
  };

  const handleConfirm = async (taskId: string) => {
    await respondToTask(taskId, "confirmed");
  };

  const handleReject = (taskId: string) => {
    Alert.alert("Reject task", "Are you sure you want to reject this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: () => respondToTask(taskId, "rejected"),
      },
    ]);
  };

  const logoutHandler = async () => {
    await AsyncStorage.clear();
    router.replace("/(auth)/Login/login");
  };

  const renderTask = ({ item }: { item: Task }) => {
    const canRespond = item.family_status === "pending_confirmation";
    const isActioning = actioningId === item._id;

    return (
      <View
        style={[
          familyDashStyles.taskCard,
          { borderLeftColor: statusColor(item.family_status) },
        ]}
      >
        <View style={familyDashStyles.taskHeader}>
          <Text style={familyDashStyles.taskTitle}>{item.title}</Text>
          <View
            style={[
              familyDashStyles.statusBadge,
              { backgroundColor: statusColor(item.family_status) },
            ]}
          >
            <Text style={familyDashStyles.statusText}>
              {formatStatus(item.family_status)}
            </Text>
          </View>
        </View>

        {!!item.description && (
          <Text style={familyDashStyles.taskDescription}>
            {item.description}
          </Text>
        )}

        <View style={familyDashStyles.familyStatusRow}>
          <Ionicons
            name="person-circle-outline"
            size={16}
            color={colors.textMuted}
          />
          <Text style={familyDashStyles.familyStatusLabel}>Patient review</Text>
          <View
            style={[
              familyDashStyles.statusBadge,
              { backgroundColor: statusColor(item.status) },
            ]}
          >
            <Text style={familyDashStyles.statusText}>
              {formatStatus(item.status)}
            </Text>
          </View>
        </View>

        {canRespond && (
          <View style={familyDashStyles.actionRow}>
            {isActioning ? (
              <ActivityIndicator size="small" color={colors.success} />
            ) : (
              <>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    familyDashStyles.actionButton,
                    familyDashStyles.confirmButton,
                  ]}
                  onPress={() => handleConfirm(item._id)}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  <Text style={familyDashStyles.actionButtonText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    familyDashStyles.actionButton,
                    familyDashStyles.rejectButton,
                  ]}
                  onPress={() => handleReject(item._id)}
                >
                  <Ionicons name="close-circle" size={18} color="#fff" />
                  <Text style={familyDashStyles.actionButtonText}>Reject</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  const pendingCount = tasks.filter(
    (t) => t.family_status === "pending_confirmation"
  ).length;

  const renderSummary = () => (
    <View style={familyDashStyles.summaryRow}>
      <View
        style={[
          familyDashStyles.summaryCard,
          familyDashStyles.summaryCardAccent,
        ]}
      >
        <Text
          style={[
            familyDashStyles.summaryNumber,
            familyDashStyles.summaryNumberAccent,
          ]}
        >
          {pendingCount}
        </Text>
        <Text
          style={[
            familyDashStyles.summaryLabel,
            familyDashStyles.summaryLabelAccent,
          ]}
        >
          Awaiting you
        </Text>
      </View>
      <View style={familyDashStyles.summaryCard}>
        <Text style={familyDashStyles.summaryNumber}>{tasks.length}</Text>
        <Text style={familyDashStyles.summaryLabel}>Total tasks</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={familyDashStyles.safeArea} edges={["top"]}>
      <View style={familyDashStyles.container}>
        <View style={familyDashStyles.headerRow}>
          <View style={familyDashStyles.headerTextWrap}>
            <Text style={familyDashStyles.pageSubtitle}>Welcome back</Text>
            <Text style={familyDashStyles.pageTitle}>Family dashboard</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            style={familyDashStyles.logoutButton}
            onPress={logoutHandler}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            <Text style={familyDashStyles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={familyDashStyles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : tasks.length === 0 ? (
          <>
            <Text style={familyDashStyles.sectionTitle}>Today's Tasks</Text>
            <View style={familyDashStyles.centered}>
              <View style={familyDashStyles.emptyIconWrap}>
                <Ionicons
                  name="checkmark-done-circle-outline"
                  size={44}
                  color={colors.primary}
                />
              </View>
              <Text style={familyDashStyles.emptyText}>No tasks for today</Text>
              <Text style={familyDashStyles.emptySubText}>
                Pull down to refresh
              </Text>
            </View>
          </>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item._id}
            renderItem={renderTask}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={familyDashStyles.listContent}
            ListHeaderComponent={
              <>
                {renderSummary()}
                <Text style={familyDashStyles.sectionTitle}>Today's Tasks</Text>
              </>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}