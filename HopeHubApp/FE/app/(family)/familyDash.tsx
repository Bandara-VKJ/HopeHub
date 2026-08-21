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
import { Ionicons } from "@expo/vector-icons";
import { familyDashStyles } from "./familyDashStyles";

const BASE_URL = "https://connector-removed-stoneware.ngrok-free.dev";

const ngrokFetch = (url: string, options: RequestInit = {}) =>
  fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "ngrok-skip-browser-warning": "true",
    },
  });

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

const respondToTask = async (taskId: string, family_status: "confirmed" | "rejected") => {
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
      prev.map((t) =>
        t._id === taskId ? { ...t, family_status } : t
      )
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
  Alert.alert(
    "Reject task",
    "Are you sure you want to reject this task?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: () => respondToTask(taskId, "rejected"),
      },
    ]
  );
};

  const logoutHandler = async () => {
    await AsyncStorage.clear();
    router.replace("/(auth)/Login/login");
  };

  const renderTask = ({ item }: { item: Task }) => {
    const canRespond = item.family_status === "pending_confirmation";
    const isActioning = actioningId === item._id;

    return (
      <View style={familyDashStyles.taskCard}>
        <View style={familyDashStyles.taskHeader}>
          <Text style={familyDashStyles.taskTitle}>{item.title}</Text>
          <View
            style={[
              familyDashStyles.statusBadge,
              { backgroundColor: statusColor(item.family_status) },
            ]}
          >
            <Text style={familyDashStyles.statusText}>{item.family_status}</Text>
          </View>
        </View>

        {!!item.description && (
          <Text style={familyDashStyles.taskDescription}>{item.description}</Text>
        )}

        <View style={familyDashStyles.familyStatusRow}>
          <Text style={familyDashStyles.familyStatusLabel}>Patient review:</Text>
          <View
            style={[
              familyDashStyles.statusBadge,
              { backgroundColor: statusColor(item.family_status) },
            ]}
          >
            <Text style={familyDashStyles.statusText}>{item.status}</Text>
          </View>
        </View>

        {canRespond && (
          <View style={familyDashStyles.actionRow}>
            {isActioning ? (
              <ActivityIndicator size="small" color="#4CAF50" />
            ) : (
              <>
                <TouchableOpacity
                  style={[familyDashStyles.actionButton, familyDashStyles.confirmButton]}
                  onPress={() => handleConfirm(item._id)}
                >
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={familyDashStyles.actionButtonText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[familyDashStyles.actionButton, familyDashStyles.rejectButton]}
                  onPress={() => handleReject(item._id)}
                >
                  <Ionicons name="close" size={16} color="#fff" />
                  <Text style={familyDashStyles.actionButtonText}>Reject</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={familyDashStyles.container}>
      <View style={familyDashStyles.headerRow}>
        <Text style={familyDashStyles.pageTitle}>Family dashboard</Text>
        <TouchableOpacity
          style={familyDashStyles.logoutButton}
          onPress={logoutHandler}
        >
          <Ionicons name="log-out-outline" size={22} color="#E05C5C" />
          <Text style={familyDashStyles.loadingText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={familyDashStyles.sectionTitle}>Today's Tasks</Text>

      {loading ? (
        <View style={familyDashStyles.centered}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : tasks.length === 0 ? (
        <View style={familyDashStyles.centered}>
          <Ionicons name="checkmark-done-circle-outline" size={40} color="#999" />
          <Text style={familyDashStyles.emptyText}>No tasks for today</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item._id}
          renderItem={renderTask}
          contentContainerStyle={familyDashStyles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

