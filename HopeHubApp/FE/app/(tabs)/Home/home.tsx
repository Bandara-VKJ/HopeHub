import { Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { homeStyles } from "./homeStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";

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
  const [inviteFormOpen, setInviteFormOpen] = useState(false)
  const [familyName, setFamilyName] = useState('')
  const [familyEmail, setFamilyEmail] = useState('')
  const [familyPhone, setFamilyPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const resetInviteForm = () => {
    setFamilyName("");
    setFamilyEmail("");
    setFamilyPhone("");
    setInviteFormOpen(false);
  }

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
                <Text>Full Name</Text>
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