import { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { taskStyles } from "./taskStyles";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";

type TaskDraft = {
  id: string;
  title: string;
  description: string;
};
type DaysDraft = {
    id : string;
    date : string;
}

export default function Tasks() {
  const BASE_URL = "https://connector-removed-stoneware.ngrok-free.dev";
  const { patientId } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [taskDrafts, setTaskDrafts] = useState<TaskDraft[]>([{ id: "1", title: "", description: "" },]);
  const [taskDaysDrafts, setTaskDaysDrafts] = useState<DaysDraft[]>([{id: '1', date : ''},]);

  const ngrokFetch = (url: string, options: RequestInit = {}) =>
    fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        "ngrok-skip-browser-warning": "true",
      },
    });

  const addNewDay = () => {
    setTaskDaysDrafts = ((prev) => [
        ...prev,
        {id : Date.now().toString(), date: ""},
    ]);
  };
  const removeNewDay = (id : string) => {
    setTaskDaysDrafts = ((prev) => prev.filter((t) => t.id !== id));
  };
  const addTaskRow = () => {
    setTaskDrafts((prev) => [
      ...prev,
      { id: Date.now().toString(), title: "", description: "" },
    ]);
  };

  const removeTaskRow = (id: string) => {
    setTaskDrafts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTaskRow = (id: string, field: "title" | "description", value: string) => {
    setTaskDrafts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const isValidDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

  const addTasks = async () => {
    const validTasks = taskDrafts
      .map((t) => ({ title: t.title.trim(), description: t.description.trim() }))
      .filter((t) => t.title.length > 0);

    if (validTasks.length === 0) {
      Alert.alert("No tasks", "Add at least one task title.");
      return;
    }
    if (!isValidDate(startDate)) {
      Alert.alert("Invalid date", "Enter the week start date as YYYY-MM-DD.");
      return;
    }
    if (!patientId) {
      Alert.alert("Missing patient", "No patient selected for this task list.");
      return;
    }

    setSubmitting(true);
    try {
      const counselorId = await AsyncStorage.getItem("userId"); // counselor's own id

      const response = await ngrokFetch(`${BASE_URL}/api/tasks/weekly`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: patientId,
          counselorId,
          startDate,
          tasks: validTasks,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", `${data.tasks?.length || 0} task entries created for the week.`);
        setTaskDrafts([{ id: "1", title: "", description: "" }]);
        setStartDate("");
      } else {
        Alert.alert("Error", data.error || "Could not create tasks.");
      }
    } catch (error) {
      console.log("Error adding tasks:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={taskStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#2CA6A4" />
        <Text style={taskStyles.loadingText}>Loading</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
        Assign Weekly Tasks
      </Text>

    {taskDaysDrafts.map((date) => (
        <Text style={{ fontSize: 13, fontWeight: "600", marginBottom: 4 }}>
        Week Start Date (YYYY-MM-DD)
      </Text>
      <TextInput
        placeholder="2026-08-03"
        placeholderTextColor="#999"
        value={startDate}
        onChangeText={setStartDate}
        style={{
          borderWidth: 1,
          borderColor: "#e0e0e0",
          borderRadius: 10,
          padding: 10,
          marginBottom: 16,
        }}
      />

      {taskDrafts.map((task, index) => (
        <View
          key={task.id}
          style={{
            borderWidth: 1,
            borderColor: "#eee",
            borderRadius: 10,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontWeight: "600" }}>Task {index + 1}</Text>
            {taskDrafts.length > 1 && (
              <TouchableOpacity onPress={() => removeTaskRow(task.id)}>
                <Ionicons name="close-circle" size={20} color="#c00" />
              </TouchableOpacity>
            )}
          </View>

          <TextInput
            placeholder="Task title (e.g. Morning meditation)"
            placeholderTextColor="#999"
            value={task.title}
            onChangeText={(v) => updateTaskRow(task.id, "title", v)}
            style={{
              borderWidth: 1,
              borderColor: "#e0e0e0",
              borderRadius: 8,
              padding: 8,
              marginTop: 8,
            }}
          />
          <TextInput
            placeholder="Description (optional)"
            placeholderTextColor="#999"
            value={task.description}
            onChangeText={(v) => updateTaskRow(task.id, "description", v)}
            style={{
              borderWidth: 1,
              borderColor: "#e0e0e0",
              borderRadius: 8,
              padding: 8,
              marginTop: 8,
            }}
          />
        </View>
      ))}

    ))}
      <TouchableOpacity onPress={addTaskRow} style={{ marginBottom: 20 }}>
        <Text style={{ color: "#2CA6A4", fontWeight: "600" }}>+ Add another task</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={addTasks}
        disabled={submitting}
        style={{
          backgroundColor: "#17db1a",
          padding: 14,
          borderRadius: 10,
          alignItems: "center",
          opacity: submitting ? 0.6 : 1,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          {submitting ? "Saving..." : "Save"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}