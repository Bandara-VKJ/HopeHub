import { Text, View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { homeStyles } from "./homeStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";


  const STATUS_STYLE: Record<string, { label: string; color: string }> = {
    completed: { label: "Completed", color: "#17db1a" },
    confirmed: { label: "Confirmed by Family", color: "#2CA6A4" },
    pending: { label: "Pending", color: "#f09c00" },
    rejected: { label: "Rejected", color: "#e26d36" },
    expired: { label: "Expired", color: "#e0362e" },
  };

const LEVEL_INFO: Record<string, { description: string; color: string }> = {
    "Level 1 - No Risk": {
      description: "No signs of risk detected. Keep up your daily habits.",
      color: "#17db1a",
    },
    "Level 2 - Very Low": {
      description: "You're doing well. Keep up with your daily tasks and check-ins.",
      color: "#3ecf4a",
     
    },
    "Level 3 - Low": {
      description: "Low risk overall. Stay mindful of your habits and triggers.",
      color: "#8bd100",
      
    },
    "Level 4 - Moderate": {
      description: "Stay alert to your triggers. Do not forget to contact your counselor every week.",
      color: "#f09c00",
    },
    "Level 5 - High": {
      description: "Elevated risk. Reach out to your counselor and stay close to your support system.",
      color: "#e26d36",
      
    },
    "Level 6 - Very High": {
      description: "Stay connect with your counselor & connect your family member to help.",
      color: "#e0362e",
    
    },
    "Level 7 - Severe Addiction": {
      description: "This needs immediate attention. Please contact your counselor right away.",
      color: "#b0021f",
     
    },
};

const RISK_COLORS: Record<string, string> = {
  "Level 1 - No Risk": "#17db1a",
  "Level 2 - Very Low": "#3ecf4a",
  "Level 3 - Low": "#8bd100",
  "Level 4 - Moderate": "#f09c00",
  "Level 5 - High": "#e26d36",
  "Level 6 - Very High": "#e0362e",
  "Level 7 - Severe Addiction": "#b0021f",
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

const BASE_URL = "https://connector-removed-stoneware.ngrok-free.dev";

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


        // Get profile
        const res = await fetch(
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
  const getGreeting = () =>{
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning 👋"
    if (hour < 18) return "Good afternoon ☀️"
    return "Good evening 🌙"
  }

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

    const response = await fetch(
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
      setTasks(data.tasks  || []);
    }

  } catch (error) {
    console.log("Get tasks error:", error);
    setTasks([]);
  }
};
  const  handleSendInvite = async () => {

    if(!familyName.trim())
    {
      Alert.alert("Missing name", "Please enter the family member's role.")
      return
    }
    if(!familyEmail.trim())
    {
      Alert.alert("Invalid email", "Please enter a valid email address.")
      return
    }
    if(!familyPhone.trim())
    {
      Alert.alert("Missing contact number", "Please enter a contact number.")
      return
    }

    setSubmitting(true)
    try {
      const userId = await AsyncStorage.getItem('userId')
      
      const res = await fetch(`${BASE_URL}/api/family/invite`,{
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

      if(res.ok)
      {
        Alert.alert("Invite sent", `An invite was sent to ${familyEmail}.`)
        resetInviteForm();
      }
      else{
        Alert.alert("Error", data.error || "Could not send invite. Try again.")
      }
    } catch (error) {
       console.log("Error sending invite:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

    const markComplete = async (taskId: string) => {
    try {
      setUpdatingId(taskId);

      const response = await fetch(`${BASE_URL}/api/taks/${taskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ status: "completed" }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.error || "Failed to update task");
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
      Alert.alert("Error", "Failed to update task");
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";

    try {
      setUpdatingId(taskId);

      const response = await fetch(`${BASE_URL}/api/taks/${taskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
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

      const response = await fetch(
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
        <Text style={homeStyles.name}>{loading ? "Welcome..." : `Welcome ,${firstName || "User"}`}</Text>

        <View style={homeStyles.streakCard}>
          <View style={homeStyles.streakIconWrap}>
            <Ionicons name="ribbon" size={22} color="#fff" />
          </View>
          <View>
            <Text style={homeStyles.streakLabel}>Sobriety Streak</Text>
            <Text style={homeStyles.streakValue}>50 Days!</Text>
          </View>
        </View>
      </View>

      <View style={homeStyles.content}>
        
        {/* Risk Banner */}
        <View
          style={[
            homeStyles.riskCard,
            { backgroundColor: `${RISK_COLORS[level] ?? "#c96a00"}20`, borderLeftWidth: 4, borderLeftColor: RISK_COLORS[level] ?? "#c96a00" },
          ]}
        >
          <View style={[homeStyles.riskIconWrap, { backgroundColor: `${RISK_COLORS[level] ?? "#c96a00"}30` }]}>
            <Ionicons name="warning" size={22} color={RISK_COLORS[level] ?? "#c96a00"} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={homeStyles.riskLevel}>RISK LEVEL</Text>
            <Text style={[homeStyles.riskValue, { color: RISK_COLORS[level] ?? "#c96a00" }]}>{level || "Not set"}</Text>
              {levelSource === "counselor" && (
                <Text style={{ fontSize: 11, color: "#888" }}>Set by your counselor</Text>
              )}
              <Text style={homeStyles.riskSub}>
                {LEVEL_INFO[level]?.description ?? "Level not set yet. contact counselor to see your risk analysis."}
              </Text>
          </View>
        </View>
        <View style={homeStyles.mailCard}>
          {/* Invite Banner */}
          <View style={homeStyles.inviteRow}>
            <Text style={homeStyles.cardTitleText}>{!inviteFormOpen ? "Invite Family Member" : "Invite mail"}</Text>

            {!inviteFormOpen && (
            <TouchableOpacity style={homeStyles.inviteBtn}>
              <Text style={homeStyles.inviteBtnText} onPress={() => setInviteFormOpen(true)}>Send</Text>
            </TouchableOpacity>
            )}
          </View>
            {inviteFormOpen && (
              <View>
                <Text>Role</Text>
                <TextInput
                  style={homeStyles.input}
                  placeholder="e.g. mother "
                  value= {familyName}
                  onChangeText={setFamilyName}
                />
                <Text>Email</Text>
                <TextInput
                  style={homeStyles.input}
                  placeholder="e.g. kamala@gmail.com"
                  value= {familyEmail}
                  onChangeText={setFamilyEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text>Phone</Text>
                <TextInput
                  style={homeStyles.input}
                  placeholder="e.g. 07x xxxxxxx"
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
                      <Text style={homeStyles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[homeStyles.submitBtn, submitting && { opacity: 0.6 }]}
                    onPress={handleSendInvite}
                    disabled={submitting}
                  >
                    <Text>
                      {submitting ? "Sending..." : "Send invite"}
                    </Text>
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
              Daily Tasks
            </Text>
          </View>
          <View style={homeStyles.badge}>
            <Text style={homeStyles.badgeText}>
              {tasks.filter(t => t.status === "completed").length} / {tasks.length} Complete
            </Text>
          </View>
        </View>
        {tasks.length === 0 ? (

          <Text>
            No tasks assigned for today
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
            Family review: {task.family_status}
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
            <Text style={homeStyles.cardTitleText}>Task Status Breakdown</Text>
          </View>
        </View>

        {!statusStats || statusStats.totalTasks === 0 ? (
          <Text>No task data yet</Text>
        ) : (
          Object.entries(statusStats.percentages)
            .filter(([, value]) => value > 0)
            .map(([key, value]) => (
              <View key={key} style={homeStyles.progressRow}>
                <View style={homeStyles.progressMeta}>
                  <Text style={homeStyles.progressLabel}>
                    {STATUS_STYLE[key]?.label ?? key}
                  </Text>
                  <Text style={homeStyles.progressPct}>{value}%</Text>
                </View>
                <ProgressBar value={value} color={STATUS_STYLE[key]?.color ?? "#999"} />
              </View>
            ))
        )}
      </View>
      </View>
    </ScrollView>
  );
}