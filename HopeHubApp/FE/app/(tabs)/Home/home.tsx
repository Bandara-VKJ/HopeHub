import { Text, View, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { homeStyles } from "./homeStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TASKS = [
  { id: "1", label: "Morning meditation", done: true },
  { id: "2", label: "Evening journal entry", done: false },
  { id: "3", label: "Call support partner", done: false },
  { id: "4", label: "10-minute walk", done: false },
  { id: "5", label: "Drink 8 glasses of water", done: false },
];

const RISK_FACTORS = [
  { label: "High Stress Levels", value: 70, color: "#e26d36" },
  { label: "Social Triggers", value: 50, color: "#f09c00" },
  { label: "Sleep Quality", value: 30, color: "#2CA6A4" },
  { label: "Support Network", value: 80, color: "#17db1a" },
];

const ProgressBar = ({ value, color }: { value: number; color: string }) => (
  <View style={homeStyles.progressTrack}>
    <View style={[homeStyles.progressFill, { width: `${value}%`, backgroundColor: color }]} />
  </View>
);

export default function HomeScreen() {
  const [tasks, setTasks] = useState(TASKS);

  const BASE_URL = "https://connector-removed-stoneware.ngrok-free.dev";

  const [firstName, setFirstName] = useState('')
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadusername = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");

        if (!userId) return;

        const res = await fetch(`${BASE_URL}/api/profile/${userId}`, {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        });

        const data = await res.json();

        if (res.ok && data.profile) {
          setFirstName(data.profile.firstName || '');
        }

      } catch (error) {
        console.log("Error loading name:", error);
      } finally {
        setLoading(false);
      }
    };

    loadusername();
  }, []);

  const getGreeting = () =>{
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning 👋"
    if (hour < 18) return "Good afternoon ☀️"
    return "Good evening 🌙"
  }

  const toggle = (id: string) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <ScrollView style={homeStyles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={homeStyles.header}>
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
        <View style={homeStyles.riskCard}>
          <View style={homeStyles.riskIconWrap}>
            <Ionicons name="warning" size={22} color="#c96a00" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={homeStyles.riskLevel}>RISK LEVEL</Text>
            <Text style={homeStyles.riskValue}>Moderate Risk</Text>
            <Text style={homeStyles.riskSub}>Some areas need attention below</Text>
          </View>
        </View>

        {/* Daily Tasks */}
        <View style={homeStyles.card_task}>
          <View style={homeStyles.cardHeader}>
            <View style={homeStyles.cardTitle}>
              <Ionicons name="checkbox" size={20} color="#17db1a" />
              <Text style={homeStyles.cardTitleText}>Daily Tasks</Text>
            </View>
            <View style={homeStyles.badge}>
              <Text style={homeStyles.badgeText}>{doneCount} / {tasks.length} Complete</Text>
            </View>
          </View>

          {tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={[homeStyles.taskItem, task.done && homeStyles.taskItemDone]}
              onPress={() => toggle(task.id)}
              activeOpacity={0.7}
            >
              <View style={[homeStyles.checkbox, task.done && homeStyles.checkboxDone]}>
                {task.done && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={[homeStyles.taskLabel, task.done && homeStyles.taskLabelDone]}>
                {task.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Risk Factors */}
        <View style={homeStyles.card}>
          <View style={[homeStyles.cardHeader, { marginBottom: 16 }]}>
            <View style={homeStyles.cardTitle}>
              <Ionicons name="heart" size={20} color="#e26d36" />
              <Text style={homeStyles.cardTitleText}>Risk Factor Analysis</Text>
            </View>
          </View>

          {RISK_FACTORS.map((factor) => (
            <View key={factor.label} style={homeStyles.progressRow}>
              <View style={homeStyles.progressMeta}>
                <Text style={homeStyles.progressLabel}>{factor.label}</Text>
                <Text style={homeStyles.progressPct}>{factor.value}%</Text>
              </View>
              <ProgressBar value={factor.value} color={factor.color} />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}