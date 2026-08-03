import { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { taskStyles } from "./taskStyles";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";

type TaskDraft = {
  id: string;
  title: string;
  description: string;
};

type DayDraft = {
  id: string;
  date: Date | null;
  tasks: TaskDraft[];
};

const makeEmptyTask = (): TaskDraft => ({
  id: Date.now().toString() + Math.random(),
  title: "",
  description: "",
});

const makeEmptyDay = (): DayDraft => ({
  id: Date.now().toString() + Math.random(),
  date: null,
  tasks: [makeEmptyTask()],
});

export default function Tasks() {
  const BASE_URL = "https://connector-removed-stoneware.ngrok-free.dev";
  const { patientId } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dayDrafts, setDayDrafts] = useState<DayDraft[]>([makeEmptyDay()]);
  const [pickerOpenForDayId, setPickerOpenForDayId] = useState<string | null>(null);

  const ngrokFetch = (url: string, options: RequestInit = {}) =>
    fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        "ngrok-skip-browser-warning": "true",
      },
    });

  // --- Day-level actions ---
  const addDay = () => {
    setDayDrafts((prev) => [...prev, makeEmptyDay()]);
  };

  const removeDay = (dayId: string) => {
    setDayDrafts((prev) => prev.filter((d) => d.id !== dayId));
  };

  const setDayDate = (dayId: string, date: Date) => {
    setDayDrafts((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, date } : d))
    );
  };

  // --- Task-level actions (scoped to a specific day) ---
  const addTaskToDay = (dayId: string) => {
    setDayDrafts((prev) =>
      prev.map((d) =>
        d.id === dayId ? { ...d, tasks: [...d.tasks, makeEmptyTask()] } : d
      )
    );
  };

  const removeTaskFromDay = (dayId: string, taskId: string) => {
    setDayDrafts((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, tasks: d.tasks.filter((t) => t.id !== taskId) }
          : d
      )
    );
  };

  const updateTaskInDay = (
    dayId: string,
    taskId: string,
    field: "title" | "description",
    value: string
  ) => {
    setDayDrafts((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? {
              ...d,
              tasks: d.tasks.map((t) =>
                t.id === taskId ? { ...t, [field]: value } : t
              ),
            }
          : d
      )
    );
  };

  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const addTasks = async () => {
    // Validate every day has a date and at least one titled task
    for (const day of dayDrafts) {
      if (!day.date) {
        Alert.alert("Missing date", "Please pick a date for every day added.");
        return;
      }
      const hasTitledTask = day.tasks.some((t) => t.title.trim().length > 0);
      if (!hasTitledTask) {
        Alert.alert("Missing tasks", `Add at least one task for ${formatDate(day.date)}.`);
        return;
      }
    }

    if (!patientId) {
      Alert.alert("Missing patient", "No patient selected for this task list.");
      return;
    }

    setSubmitting(true);
    try {
      const counselorId = await AsyncStorage.getItem("userId"); // counselor's own id

      // Build a flat payload: one entry per day, each with its own date + tasks
      const days = dayDrafts.map((d) => ({
        date: formatDate(d.date as Date),
        tasks: d.tasks
          .map((t) => ({ title: t.title.trim(), description: t.description.trim() }))
          .filter((t) => t.title.length > 0),
      }));

      const response = await ngrokFetch(`${BASE_URL}/api/taks/add-tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: patientId,
          counselorId,
          days,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", `${data.tasks?.length || 0} task entries created.`);
        setDayDrafts([makeEmptyDay()]);
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
        Assign Tasks
      </Text>

      {dayDrafts.map((day, dayIndex) => (
        <View
          key={day.id}
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 12,
            padding: 12,
            marginBottom: 20,
            backgroundColor: "#fafafa",
          }}
        >
          {/* Day header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text style={{ fontWeight: "700", fontSize: 15 }}>Day {dayIndex + 1}</Text>
            {dayDrafts.length > 1 && (
              <TouchableOpacity onPress={() => removeDay(day.id)}>
                <Ionicons name="trash" size={18} color="#c00" />
              </TouchableOpacity>
            )}
          </View>

          {/* Date picker trigger */}
          <TouchableOpacity
            onPress={() => setPickerOpenForDayId(day.id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#e0e0e0",
              borderRadius: 8,
              padding: 10,
              marginBottom: 12,
              backgroundColor: "#fff",
            }}
          >
            <Ionicons name="calendar" size={18} color="#2CA6A4" style={{ marginRight: 8 }} />
            <Text style={{ color: day.date ? "#222" : "#999" }}>
              {day.date ? formatDate(day.date) : "Select date"}
            </Text>
          </TouchableOpacity>

          {pickerOpenForDayId === day.id && (
            Platform.OS === "web" ? (
                <input
                type="date"
                value={day.date ? formatDate(day.date) : ""}
                onChange={(e) => {
                    const selected = new Date(e.target.value);
                    setDayDate(day.id, selected);
                    setPickerOpenForDayId(null);
                }}
                style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 8,
                    padding: 8,
                    marginBottom: 12,
                    fontSize: 14,
                }}
                />
            ) : (
                <DateTimePicker
                value={day.date || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(event, selectedDate) => {
                    setPickerOpenForDayId(null);
                    if (event.type === "set" && selectedDate) {
                    setDayDate(day.id, selectedDate);
                    }
                }}
                />
            )
            )}
          {/* Tasks for this day */}
          {day.tasks.map((task, taskIndex) => (
            <View
              key={task.id}
              style={{
                borderWidth: 1,
                borderColor: "#eee",
                borderRadius: 10,
                padding: 10,
                marginBottom: 10,
                backgroundColor: "#fff",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "600", fontSize: 13 }}>
                  Task {taskIndex + 1}
                </Text>
                {day.tasks.length > 1 && (
                  <TouchableOpacity onPress={() => removeTaskFromDay(day.id, task.id)}>
                    <Ionicons name="close-circle" size={18} color="#c00" />
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                placeholder="Task title (e.g. Morning meditation)"
                placeholderTextColor="#999"
                value={task.title}
                onChangeText={(v) => updateTaskInDay(day.id, task.id, "title", v)}
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
                onChangeText={(v) => updateTaskInDay(day.id, task.id, "description", v)}
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

          <TouchableOpacity onPress={() => addTaskToDay(day.id)}>
            <Text style={{ color: "#2CA6A4", fontWeight: "600" }}>
              + Add another task for this day
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity onPress={addDay} style={{ marginBottom: 20 }}>
        <Text style={{ color: "#0a7d9c", fontWeight: "700" }}>+ Add another day</Text>
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