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
import { ngrokFetch } from "@/utill/ngrokFetch";
import YoutubePlayer from "react-native-youtube-iframe";

type TaskDraft = {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
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
  youtubeUrl: "",
});

const makeEmptyDay = (): DayDraft => ({
  id: Date.now().toString() + Math.random(),
  date: null,
  tasks: [makeEmptyTask()],
});

export default function Tasks() {
  const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
  const { patientId } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [dayDrafts, setDayDrafts] = useState<DayDraft[]>([
    makeEmptyDay(),
  ]);

  const [pickerOpenForDayId, setPickerOpenForDayId] =
    useState<string | null>(null);


  const addDay = () => {
    setDayDrafts((prev) => [
      ...prev,
      makeEmptyDay(),
    ]);
  };

  const removeDay = (dayId: string) => {
    setDayDrafts((prev) =>
      prev.filter((d) => d.id !== dayId)
    );
  };

  const setDayDate = (
    dayId: string,
    date: Date
  ) => {
    setDayDrafts((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? {
              ...d,
              date,
            }
          : d
      )
    );
  };

  const addTaskToDay = (dayId: string) => {
    setDayDrafts((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? {
              ...d,
              tasks: [
                ...d.tasks,
                makeEmptyTask(),
              ],
            }
          : d
      )
    );
  };

  const removeTaskFromDay = (
    dayId: string,
    taskId: string
  ) => {
    setDayDrafts((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? {
              ...d,
              tasks: d.tasks.filter(
                (t) => t.id !== taskId
              ),
            }
          : d
      )
    );
  };

  const updateTaskInDay = (
    dayId: string,
    taskId: string,
    field:
      | "title"
      | "description"
      | "youtubeUrl",
    value: string
  ) => {
    setDayDrafts((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? {
              ...d,
              tasks: d.tasks.map((t) =>
                t.id === taskId
                  ? {
                      ...t,
                      [field]: value,
                    }
                  : t
              ),
            }
          : d
      )
    );
  };

  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();

    const mm = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const dd = String(
      date.getDate()
    ).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  };

  const isValidYouTubeUrl = (
    url: string
  ) => {
    if (!url.trim()) return true;

    try {
      const parsedUrl = new URL(
        url.trim()
      );

      const hostname =
        parsedUrl.hostname.toLowerCase();

      return (
        hostname === "youtube.com" ||
        hostname === "www.youtube.com" ||
        hostname === "m.youtube.com" ||
        hostname === "youtu.be" ||
        hostname === "www.youtu.be"
      );
    } catch {
      return false;
    }
  };
  const getYouTubeVideoId = (
    url: string
  ): string | null => {
    try {
      const parsedUrl = new URL(
        url.trim()
      );

      const hostname =
        parsedUrl.hostname.toLowerCase();

      if (
        hostname === "youtube.com" ||
        hostname === "www.youtube.com" ||
        hostname === "m.youtube.com"
      ) {
        return (
          parsedUrl.searchParams.get("v") ||
          null
        );
      }

      if (
        hostname === "youtu.be" ||
        hostname === "www.youtu.be"
      ) {
        return (
          parsedUrl.pathname.split("/")[1] ||
          null
        );
      }

      return null;
    } catch {
      return null;
    }
  };

  const addTasks = async () => {

    for (const day of dayDrafts) {
      if (!day.date) {
        Alert.alert(
          "Missing date",
          "Please pick a date for every day added."
        );
        return;
      }

      const hasTitledTask =
        day.tasks.some(
          (t) =>
            t.title.trim().length > 0
        );

      if (!hasTitledTask) {
        Alert.alert(
          "Missing tasks",
          `Add at least one task for ${formatDate(
            day.date
          )}.`
        );
        return;
      }

      for (const task of day.tasks) {
        if (
          task.youtubeUrl.trim() &&
          !isValidYouTubeUrl(
            task.youtubeUrl
          )
        ) {
          Alert.alert(
            "Invalid YouTube link",
            `Please enter a valid YouTube link for "${
              task.title || "this task"
            }".`
          );
          return;
        }
      }
    }

    if (!patientId) {
      Alert.alert(
        "Missing patient",
        "No patient selected for this task list."
      );
      return;
    }

    setSubmitting(true);

    try {
      const counselorId =
        await AsyncStorage.getItem(
          "counselorId"
        );

      const days = dayDrafts.map(
        (d) => ({
          date: formatDate(
            d.date as Date
          ),

          tasks: d.tasks
            .map((t) => ({
              title:
                t.title.trim(),

              description:
                t.description.trim(),

              youtubeUrl:
                t.youtubeUrl.trim(),
            }))
            .filter(
              (t) =>
                t.title.length > 0
            ),
        })
      );

      const response =
        await ngrokFetch(
          `${BASE_URL}/api/taks/add-tasks`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              userId: patientId,
              counselorId,
              days,
            }),
          }
        );

      const data =
        await response.json();

      if (response.ok) {
        Alert.alert(
          "Success",
          `${
            data.tasks?.length || 0
          } task entries created.`
        );
        setDayDrafts([
          makeEmptyDay(),
        ]);
      } else {
        Alert.alert(
          "Error",
          data.error ||
            "Could not create tasks."
        );
      }
    } catch (error) {
      console.log(
        "Error adding tasks:",
        error
      );
      Alert.alert(
        "Error",
        "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View
        style={
          taskStyles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color="#2CA6A4"
        />

        <Text
          style={
            taskStyles.loadingText
          }
        >
          Loading
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={taskStyles.scrollView}
    >
      <Text
        style={taskStyles.pageTitle}
      >
        Assign Tasks
      </Text>

      {dayDrafts.map(
        (day, dayIndex) => (
          <View
            key={day.id}
            style={
              taskStyles.dayContainer
            }
          >
            {/* DAY HEADER */}

            <View
              style={
                taskStyles.dayHeader
              }
            >
              <Text
                style={
                  taskStyles.dayTitle
                }
              >
                Day {dayIndex + 1}
              </Text>

              {dayDrafts.length > 1 && (
                <TouchableOpacity
                  onPress={() =>
                    removeDay(
                      day.id
                    )
                  }
                >
                  <Ionicons
                    name="trash"
                    size={18}
                    color="#c00"
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* DATE PICKER */}

            <TouchableOpacity
              onPress={() =>
                setPickerOpenForDayId(
                  day.id
                )
              }
              style={
                taskStyles.dateButton
              }
            >
              <Ionicons
                name="calendar"
                size={18}
                color="#2CA6A4"
                style={
                  taskStyles.calendarIcon
                }
              />

              <Text
                style={
                  day.date
                    ? taskStyles.dateText
                    : taskStyles.emptyDateText
                }
              >
                {day.date
                  ? formatDate(
                      day.date
                    )
                  : "Select date"}
              </Text>
            </TouchableOpacity>

            {/* DATE PICKER */}

            {pickerOpenForDayId ===
              day.id &&
              (Platform.OS ===
              "web" ? (
                <input
                  type="date"
                  value={
                    day.date
                      ? formatDate(
                          day.date
                        )
                      : ""
                  }
                  onChange={(e) => {
                    const selected =
                      new Date(
                        e.target.value
                      );

                    setDayDate(
                      day.id,
                      selected
                    );

                    setPickerOpenForDayId(
                      null
                    );
                  }}
                  style={
                    taskStyles.webDateInput
                  }
                />
              ) : (
                <DateTimePicker
                  value={
                    day.date ||
                    new Date()
                  }
                  mode="date"
                  display={
                    Platform.OS ===
                    "ios"
                      ? "inline"
                      : "default"
                  }
                  onChange={(
                    event,
                    selectedDate
                  ) => {
                    setPickerOpenForDayId(
                      null
                    );

                    if (
                      event.type ===
                        "set" &&
                      selectedDate
                    ) {
                      setDayDate(
                        day.id,
                        selectedDate
                      );
                    }
                  }}
                />
              ))}

            {/* TASKS */}

            {day.tasks.map(
              (
                task,
                taskIndex
              ) => {
                const videoId =
                  getYouTubeVideoId(
                    task.youtubeUrl
                  );

                return (
                  <View
                    key={task.id}
                    style={
                      taskStyles.taskContainer
                    }
                  >
                    {/* TASK HEADER */}

                    <View
                      style={
                        taskStyles.taskHeader
                      }
                    >
                      <Text
                        style={
                          taskStyles.taskTitle
                        }
                      >
                        Task{" "}
                        {taskIndex + 1}
                      </Text>

                      {day.tasks
                        .length >
                        1 && (
                        <TouchableOpacity
                          onPress={() =>
                            removeTaskFromDay(
                              day.id,
                              task.id
                            )
                          }
                        >
                          <Ionicons
                            name="close-circle"
                            size={18}
                            color="#c00"
                          />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* TASK TITLE */}

                    <TextInput
                      placeholder="Task title (e.g. Morning meditation)"
                      placeholderTextColor="#999"
                      value={
                        task.title
                      }
                      onChangeText={(
                        value
                      ) =>
                        updateTaskInDay(
                          day.id,
                          task.id,
                          "title",
                          value
                        )
                      }
                      style={
                        taskStyles.textInput
                      }
                    />

                    {/* DESCRIPTION */}

                    <TextInput
                      placeholder="Description (optional)"
                      placeholderTextColor="#999"
                      value={
                        task.description
                      }
                      onChangeText={(
                        value
                      ) =>
                        updateTaskInDay(
                          day.id,
                          task.id,
                          "description",
                          value
                        )
                      }
                      style={
                        taskStyles.textInput
                      }
                    />

                    {/* YOUTUBE URL */}

                    <TextInput
                      placeholder="YouTube link (optional)"
                      placeholderTextColor="#999"
                      value={
                        task.youtubeUrl
                      }
                      onChangeText={(
                        value
                      ) =>
                        updateTaskInDay(
                          day.id,
                          task.id,
                          "youtubeUrl",
                          value
                        )
                      }
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="url"
                      style={
                        taskStyles.textInput
                      }
                    />

                    {/* YOUTUBE PLAYER */}

                    {isValidYouTubeUrl(
                      task.youtubeUrl
                    ) &&
                      videoId && (
                        <View
                          style={
                            taskStyles.youtubeContainer
                          }
                        >
                          <YoutubePlayer
                            height={200}
                            videoId={
                              videoId
                            }
                            webViewProps={{
                              allowsInlineMediaPlayback:
                                true,
                            }}
                          />
                        </View>
                      )}
                  </View>
                );
              }
            )}

            {/* ADD TASK */}

            <TouchableOpacity
              onPress={() =>
                addTaskToDay(
                  day.id
                )
              }
            >
              <Text
                style={
                  taskStyles.addTaskButton
                }
              >
                + Add another task
                for this day
              </Text>
            </TouchableOpacity>
          </View>
        )
      )}

      {/* ADD DAY */}

      <TouchableOpacity
        onPress={addDay}
        style={
          taskStyles.addDayButton
        }
      >
        <Text
          style={
            taskStyles.addDayText
          }
        >
          + Add another day
        </Text>
      </TouchableOpacity>

      {/* SAVE */}

      <TouchableOpacity
        onPress={addTasks}
        disabled={submitting}
        style={[
          taskStyles.saveButton,
          submitting &&
            taskStyles.saveButtonDisabled,
        ]}
      >
        <Text
          style={
            taskStyles.saveButtonText
          }
        >
          {submitting
            ? "Saving..."
            : "Save"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}