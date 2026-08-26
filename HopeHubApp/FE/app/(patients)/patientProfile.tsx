import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Modal, FlatList } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { patientProfileStyles } from './patientProfile.Styles'
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";


   type Patient = {
    _id : string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    profilePic?: string;
    level: string;
  }

  type Task = {
  _id: string;
  title: string;
  description: string;
  status: string;
  family_status: string;
  date?: string;
};

const LEVELS = [ "No risk", "Very Low", "Low", "Moderate", "High", "Very High", "Severe Addiction" ];

export default function PatientProfile() {

  const { patientId } = useLocalSearchParams();
  const BASE_URL = "https://connector-removed-stoneware.ngrok-free.dev";


  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLaoding] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [updatingLevel, setUpdatingLevel] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);


  const ngrokFetch = (url: string, options: RequestInit = {}) =>
  fetch(url, {
    ...options,
    headers: {
      ...(options.headers || { }),
      "ngrok-skip-browser-warning": "true",
    },
  });

  useEffect ( ()=>{
    getPatientById(),
    getTasks()
  },[])

  const getTasks = async () => {
    try {
        const counselorId = await AsyncStorage.getItem("counselorId")
        const response = await ngrokFetch(`${BASE_URL}/api/taks/tasks?userId=${patientId}&counselorId=${counselorId}`);

        const data = await response.json();
        setTasks(data.response);

    } catch (error) {
         console.log("Get tasks error:", error);
    }
  }
  const getPatientById = async () => {
    try {
        const response = await ngrokFetch(`${BASE_URL}/api/counselors/patient/${patientId}`);

        const data = await response.json();
        setPatient(data.patient)


    } catch (error) {
         console.log("Get patient error:", error);
    }
    finally
    {
        setLaoding(false)
    }
  }

  const updateLevel = async (newLevel: string) => {
    if (!patient || newLevel === patient.level || updatingLevel) return;

    const previousLevel = patient.level;

    setPatient({ ...patient, level: newLevel });
    setUpdatingLevel(true);

    try {
        const counselorId = await AsyncStorage.getItem("counselorId");
        const response = await ngrokFetch(
            `${BASE_URL}/api/risk/level/${patient._id}/${counselorId}`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ level: newLevel }),
            }
        );

        if (!response.ok) {
            throw new Error(`Failed with status ${response.status}`);
        }
    } catch (error) {
        console.log("Update level error:", error);
        setPatient((prev) => prev ? { ...prev, level: previousLevel } : prev);
    } finally {
        setUpdatingLevel(false);
    }
  }

   if(loading)
      {
          return(
              <View>
                  <ActivityIndicator size = "large"/>
              </View>
          );
      }

    return (
    <View>
         <View style={patientProfileStyles.container}>

        <Text style={patientProfileStyles.title}>
        Patient Profile
        </Text>


        {
        patient && (
            <View style={patientProfileStyles.profileCard}> 

                <View style={patientProfileStyles.avatarPlaceholder}>
                    <Text style={patientProfileStyles.avatarText}>
                    {patient.firstName.charAt(0)}
                    </Text>
                </View>



            <Text style={patientProfileStyles.name}>
                {patient.firstName} {patient.lastName}
            </Text>


            <Text style={patientProfileStyles.infoText}>
                Email: {patient.email}
            </Text>


            <Text style={patientProfileStyles.infoText}>
                Phone: {patient.mobile}
            </Text>

            <Text style={patientProfileStyles.infoText}>
                Addiction level:
            </Text>

           <View style={{ marginTop: 6, marginBottom: 10 }}>
            <TouchableOpacity
                disabled={updatingLevel}
                onPress={() => setDropdownOpen(true)}
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "#ccc",
                    opacity: updatingLevel ? 0.6 : 1,
                }}
            >
                <Text style={{ color: "#333", fontWeight: "500" }}>
                    {patient.level || "Select level"}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#555" />
            </TouchableOpacity>

            <Modal
                visible={dropdownOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setDropdownOpen(false)}
            >
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", padding: 24 }}
                    activeOpacity={1}
                    onPress={() => setDropdownOpen(false)}
                >
                    <View style={{ backgroundColor: "#fff", borderRadius: 12, paddingVertical: 8 }}>
                        <FlatList
                            data={LEVELS}
                            keyExtractor={(item) => item}
                            renderItem={({ item: lvl }) => {
                                const isSelected = patient.level === lvl;
                                return (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setDropdownOpen(false);
                                            updateLevel(lvl);
                                        }}
                                        style={{
                                            paddingVertical: 12,
                                            paddingHorizontal: 16,
                                            backgroundColor: isSelected ? "#4CAF50" : "transparent",
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: isSelected ? "#fff" : "#333",
                                                fontWeight: isSelected ? "600" : "400",
                                            }}
                                        >
                                            {lvl}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }}
                            ItemSeparatorComponent={() => (
                                <View style={{ height: 1, backgroundColor: "#eee" }} />
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>

            <TouchableOpacity 
            style={patientProfileStyles.taskButton}
            onPress={() => 
                router.push({
                    pathname : '/(task)/task',
                    params :  { patientId: patient?._id }
                })
            }
            >
                <Text style={patientProfileStyles.taskButtonText}>
                Add Tasks
                </Text>
            </TouchableOpacity>
            </View>
        )
        }

    </View>
    <View style={patientProfileStyles.tasksContainer}>
    <Text style={patientProfileStyles.tasksTitle}>
        Patient's Tasks
    </Text>

    <ScrollView
        style={patientProfileStyles.tasksScroll}
        showsVerticalScrollIndicator={false}
    >
        {tasks.length === 0 ? (
        <Text style={patientProfileStyles.emptyText}>
            No tasks assigned yet.
        </Text>
        ) : (
        tasks.map((task) => (
            <View key={task._id} style={patientProfileStyles.taskCard}>
            <Text style={patientProfileStyles.taskTitle}>
                {task.title}
            </Text>

            <Text style={patientProfileStyles.taskDescription}>
                {task.description}
            </Text>

           <View style={patientProfileStyles.statusContainer}>
            <Text style={patientProfileStyles.statusText}>
                Status: {task.status}
            </Text>
            <Text style={patientProfileStyles.statusText}>
                Family member status: {task.family_status}
            </Text>
        </View>
            {task.date && (
                <Text style={patientProfileStyles.dueDate}>
                Due: {new Date(task.date).toLocaleDateString()}
                </Text>
            )}
            </View>
        ))
        )}
    </ScrollView>
    </View>
    </View>    
   
    );
}