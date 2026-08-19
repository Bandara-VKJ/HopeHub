import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  date: string;
};

const statusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "#4CAF50";
    case "rejected":
      return "#E05C5C";
    default:
      return "#E0A93C";
  }
};

export default function FamilyLogin() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getTasks();
  }, []);

  const getTasks = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        setLoading(false);
        return;
      }

      const response = await ngrokFetch(
        `${BASE_URL}/api/taks/user-tasks?userId=${userId}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
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

  const logoutHandler = async () => {
    await AsyncStorage.clear();
    router.replace("/(auth)/Login/login");
  };

  const renderTask = ({ item }: { item: Task }) => (
    <View style={familyDashStyles.taskCard}>
      <View style={familyDashStyles.taskHeader}>
        <Text style={familyDashStyles.taskTitle}>{item.title}</Text>
        <View
          style={[
            familyDashStyles.statusBadge,
            { backgroundColor: statusColor(item.status) },
          ]}
        >
          <Text style={familyDashStyles.statusText}>{item.status}</Text>
        </View>
      </View>
      {!!item.description && (
        <Text style={familyDashStyles.taskDescription}>{item.description}</Text>
      )}
    </View>
  );

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