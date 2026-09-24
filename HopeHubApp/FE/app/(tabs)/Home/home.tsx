import { Text, View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { homeStyles } from "./homeStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";
import { ngrokFetch } from "@/utill/ngrokFetch";
import { useLanguage } from "@/i18n/LanguageContext";

const LEVEL_ORDER = [
  "Level 1 - No Risk",
  "Level 2 - Very Low",
  "Level 3 - Low",
  "Level 4 - Moderate",
  "Level 5 - High",
  "Level 6 - Very High",
  "Level 7 - Severe Addiction",
];

const LEVEL_COLORS = ["#17db1a", "#3ecf4a", "#8bd100", "#f09c00", "#e26d36", "#e0362e", "#b0021f"];

const STATUS_COLORS: Record<string, string> = {
  completed: "#17db1a",
  confirmed: "#2CA6A4",
  pending: "#f09c00",
  rejected: "#e26d36",
  expired: "#e0362e",
};

type Task = {
  _id: string;
  title: string;
  description: string;
  status: string;
  family_status: string;
  date: string;
};

const ProgressBar = ({ value, color }: { value: number; color: string }) => (
  <View style={homeStyles.progressTrack}>
    <View style={[homeStyles.progressFill, { width: `${value}%`, backgroundColor: color }]} />
  </View>
);

export default function HomeScreen() {

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [firstName, setFirstName] = useState('')
  const [loading, setLoading] = useState(true);
  const [inviteFormOpen, setInviteFormOpen] = useState(false)
  const [familyName, setFamilyName] = useState('')
  const [familyEmail, setFamilyEmail] = useState('')
  const [familyPhone, setFamilyPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [level, setLevel] = useState('')
  const [levelSource, setLevelSource] = useState('')
  const [statusStats, setStatusStats] = useState<{
  percentages: Record<string, number>;
  counts: Record<string, number>;
  totalTasks: number;
  } | null>(null);
  const [journeyDays, setJourneyDays] = useState(0);

  const { t } = useLanguage();
  const home = t.home;
  const levelIndex = LEVEL_ORDER.indexOf(level);
  const levelColor = levelIndex >= 0 ? LEVEL_COLORS[levelIndex] : "#c96a00";
  const levelInfo = levelIndex >= 0 ? home.levels[levelIndex] : null;
  

  const resetInviteForm = () => {
    setFamilyName("");
    setFamilyEmail("");
    setFamilyPhone("");
    setInviteFormOpen(false);
  }

  useEffect(() => {
    const loadData = async () => {
      try {

        const userId = await AsyncStorage.getItem("userId");

        if (!userId) return;

        const questionnaireRes = await ngrokFetch(
        `${BASE_URL}/api/questionnaire/status/${userId}`
        );

        const questionnaireData = await questionnaireRes.json();

        if (questionnaireRes.ok && questionnaireData.completedAt) {
          setJourneyDays(calculateJourneyDays(questionnaireData.completedAt));
        }

        // Get profile
       const res = await ngrokFetch(
          `${BASE_URL}/api/profile/${userId}`,
          {
            headers:{
              "ngrok-skip-browser-warning":"true",
            },
          }
        );

        const data = await res.json();

       if(res.ok && data.profile){
        setFirstName(data.profile.firstName || "");
        setLevel(data.profile.level || "");
        setLevelSource(data.profile.levelSource || "");
      }

        await getTasks();
        await getTaskStats();

      } catch(error){
        console.log("Loading error:", error);
      }
      finally{
        setLoading(false);
      }
    };

    loadData();

  }, []);

  const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return home.greetingMorning;
  if (hour < 18) return home.greetingAfternoon;
  return home.greetingEvening;
};

 const toggle = (id: string) =>
  setTasks((prev) =>
    prev.map((task) =>
      task._id === id
        ? {
            ...task,
            status: task.status === "completed"
              ? "pending"
              : "completed"
          }
        : task
    )
  );

  const doneCount = tasks.filter(
    (task) => task.status === "completed"
  ).length;

const getTasks = async () => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) return;

    const response = await ngrokFetch(
      `${BASE_URL}/api/taks/user-tasks?userId=${userId}`
    );
   

    const data = await response.json();
    console.log("Tasks response:", data);

    if (response.ok) {
      setTasks(data.tasks || []);
    }
  } catch (error) {
    console.log("Get tasks error:", error);
    setTasks([]);
  }
};
  const  handleSendInvite = async () => {

   if (!familyName.trim()) {
  Alert.alert(home.missingNameTitle, home.missingNameMsg);
    return;
  }
  if (!familyEmail.trim()) {
    Alert.alert(home.invalidEmailTitle, home.invalidEmailMsg);
    return;
  }
  if (!familyPhone.trim()) {
    Alert.alert(home.missingPhoneTitle, home.missingPhoneMsg);
    return;
  }

    setSubmitting(true)
    try {
      const userId = await AsyncStorage.getItem('userId')
      
      const res = await ngrokFetch(`${BASE_URL}/api/family/invite`,{
        method : "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body :JSON.stringify({
          userId,
          name: familyEmail.trim(),
          email:familyEmail.trim(),
          phone:familyPhone.trim()
        }),
      })

      const data = await res.json();

      if (res.ok) {
      Alert.alert(home.inviteSentTitle, home.inviteSentMsg(familyEmail));
      resetInviteForm();
    } else {
      Alert.alert(t.common.error, data.error || home.inviteFailed);
    }
    } catch (error) {
      console.log("Error sending invite:", error);
      Alert.alert(t.common.error, home.somethingWrong);
    }finally {
      setSubmitting(false);
    }
  };

    const markComplete = async (taskId: string) => {
    try {
      setUpdatingId(taskId);

      const response = await ngrokFetch(`${BASE_URL}/api/taks/${taskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ status: "completed" }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(t.common.error, data.error || home.taskUpdateFailed);
        return;
      }

      setTasks((prev) =>
        prev.map((task) =>
          task._id === taskId
            ? { ...task, status: "completed", family_status: "pending_confirmation" }
            : task
        )
      );
    } catch (error) {
      console.log("Mark complete error:", error);
      Alert.alert(t.common.error, home.taskUpdateFailed);
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
  const newStatus = currentStatus === "completed" ? "pending" : "completed";

  try {
    setUpdatingId(taskId);

    const response = await ngrokFetch(`${BASE_URL}/api/taks/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
    });

    const data = await response.json();

    if (!response.ok) {
      Alert.alert("Error", data.error || "Failed to update task");
      return;
    }

    setTasks((prev) =>
      prev.map((task) =>
        task._id === taskId
          ? {
              ...task,
              status: newStatus,
              family_status: newStatus === "completed" ? "pending_confirmation" : task.family_status,
            }
          : task
      )
    );
  } catch (error) {
    console.log("Toggle task status error:", error);
    Alert.alert("Error", "Failed to update task");
  } finally {
    setUpdatingId(null);
  }
};

  const getTaskStats = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      const response = await ngrokFetch(
        `${BASE_URL}/api/taks/taks/stats?userId=${userId}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatusStats(data);
      }
    } catch (error) {
      console.log("Get task stats error:", error);
    }
  };

  const calculateJourneyDays = (completedAt: string | Date) => {
    const start = new Date(completedAt);
    const today = new Date();

    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return Math.floor(
      (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
  };
  return (
    <ScrollView style={homeStyles.container} showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={homeStyles.header}>
        <LottieView
          source={require("../../../assets/animations/mascot.json")}
          autoPlay
          loop
          resizeMode="cover"
          style={homeStyles.headerLottie}
        />
         <View style={homeStyles.headerCircleLarge} />
        <View style={homeStyles.headerCircleSmall} />
        <Text style={homeStyles.greeting}>{getGreeting()}</Text>
       <Text style={homeStyles.name}>
        {loading ? home.welcomeLoading : home.welcome(firstName || home.defaultUser)}
      </Text>

        <View style={homeStyles.streakCard}>
          <View style={homeStyles.streakIconWrap}>
            <Ionicons name="ribbon" size={22} color="#fff" />
          </View>
          <View>
            <Text style={homeStyles.streakLabel}>{home.sobrietyStreak}</Text>
            <Text style={homeStyles.streakValue}>{home.streakDays(journeyDays)}</Text>
          </View>
        </View>
      </View>

      <View style={homeStyles.content}>
        
        <View
          style={[
            homeStyles.riskCard,
            { backgroundColor: `${levelColor}20`, borderLeftWidth: 4, borderLeftColor: levelColor },
          ]}
        >
          <View style={[homeStyles.riskIconWrap, { backgroundColor: `${levelColor}30` }]}>
            <Ionicons name="warning" size={22} color={levelColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={homeStyles.riskLevel}>{home.riskLevelLabel}</Text>
            <Text style={[homeStyles.riskValue, { color: levelColor }]}>
              {levelInfo ? levelInfo.label : home.levelNotSet}
            </Text>
            {levelSource === "counselor" && (
              <Text style={{ fontSize: 11, color: "#888" }}>{home.setByCounselor}</Text>
            )}
            <Text style={homeStyles.riskSub}>
              {levelInfo?.description ?? home.levelNoData}
            </Text>
          </View>
        </View>
        <View style={homeStyles.mailCard}>
          {/* Invite Banner */}
          <View style={homeStyles.inviteRow}>
          <Text style={homeStyles.cardTitleText}>{home.inviteFamily}</Text>

            {!inviteFormOpen && (
            <TouchableOpacity style={homeStyles.inviteBtn}>
             <Text style={homeStyles.inviteBtnText} onPress={() => setInviteFormOpen(true)}>{home.send}</Text>
            </TouchableOpacity>
            )}
          </View>
            {inviteFormOpen && (
              <View>
                <Text>{home.role}</Text>
                <TextInput
                  style={homeStyles.input}
                  placeholder={home.rolePlaceholder}
                  value= {familyName}
                  onChangeText={setFamilyName}
                />
               <Text>{home.email}</Text>
                <TextInput
                  style={homeStyles.input}
                  placeholder={home.emailPlaceholder}
                  value= {familyEmail}
                  onChangeText={setFamilyEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text>{home.phone}</Text>
                <TextInput
                  style={homeStyles.input}
                  placeholder={home.phonePlaceholder}
                  value= {familyPhone}
                  onChangeText={setFamilyPhone}
                  keyboardType="phone-pad"
                />
                <View style={homeStyles.actionsRow}>
                  <TouchableOpacity 
                     style={homeStyles.cancelBtn}
                     onPress={resetInviteForm}
                     disabled={submitting}
                    >
                      <Text style={homeStyles.cancelBtnText}>{home.cancel}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[homeStyles.submitBtn, submitting && { opacity: 0.6 }]}
                    onPress={handleSendInvite}
                    disabled={submitting}
                  >
                    <Text>{submitting ? home.sending : home.sendInvite}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
        </View>
        {/* Daily Tasks */}
        <View style={homeStyles.card_task}>
        <View style={homeStyles.cardHeader}>
          <View style={homeStyles.cardTitle}>
            <Ionicons name="checkbox" size={20} color="#17db1a" />
            <Text style={homeStyles.cardTitleText}>
              {home.dailyTasks}
            </Text>
          </View>
          <View style={homeStyles.badge}>
            <Text style={homeStyles.badgeText}>
              {tasks.filter(t => t.status === "completed").length} / {tasks.length} {home.complete}
            </Text>
          </View>
        </View>
        {tasks.length === 0 ? (

            <Text>
              {home.noTasks}
            </Text>

        ) : (

          tasks.map((task)=>(
    <View key={task._id} style={homeStyles.taskItem}>
      <TouchableOpacity
        onPress={() => toggleTaskStatus(task._id, task.status)}
        disabled={updatingId === task._id}
        style={[
          homeStyles.checkbox,
          task.status === "completed" && homeStyles.checkboxDone,
        ]}
      >
        {updatingId === task._id ? (
          <ActivityIndicator size="small" color="#17db1a" />
        ) : (
          task.status === "completed" && (
            <Ionicons name="checkmark" size={14} color="#fff" />
          )
        )}
      </TouchableOpacity>

      <View>
        <Text
          style={[
            homeStyles.taskLabel,
            task.status === "completed" && homeStyles.taskLabelDone,
          ]}
        >
          {task.title}
        </Text>

        <Text>{task.description}</Text>

        {task.status === "completed" && (
          
          <Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
            {home.familyReview(task.family_status)}
          </Text>
        )}
      </View>
    </View>
          ))

        )}

      </View>
            {/* Task Status Breakdown */}
      <View style={homeStyles.card}>
        <View style={[homeStyles.cardHeader, { marginBottom: 16 }]}>
          <View style={homeStyles.cardTitle}>
            <Ionicons name="stats-chart" size={20} color="#2CA6A4" />
            <Text style={homeStyles.cardTitleText}>{home.taskBreakdown}</Text>
          </View>
        </View>

      {!statusStats || statusStats.totalTasks === 0 ? (
        <Text>{home.noTaskData}</Text>
      ) : (
        Object.entries(statusStats.percentages)
          .filter(([, value]) => value > 0)
          .map(([key, value]) => (
            <View key={key} style={homeStyles.progressRow}>
              <View style={homeStyles.progressMeta}>
                <Text style={homeStyles.progressLabel}>
                  {home.statusLabels[key as keyof typeof home.statusLabels] ?? key}
                </Text>
                <Text style={homeStyles.progressPct}>{value}%</Text>
              </View>
              <ProgressBar value={value} color={STATUS_COLORS[key] ?? "#999"} />
            </View>
          ))
      )}
      </View>
      </View>
    </ScrollView>
  );
}