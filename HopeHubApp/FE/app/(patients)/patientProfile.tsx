import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { patientProfileStyles } from './patientProfile.Styles'
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

const LEVELS = ["Low", "Mid", "High"];

export default function PatientProfile() {

  const { patientId } = useLocalSearchParams();
  const BASE_URL = "https://connector-removed-stoneware.ngrok-free.dev";


  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLaoding] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [updatingLevel, setUpdatingLevel] = useState(false);


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

            <View style={{ flexDirection: "row", gap: 8, marginTop: 6, marginBottom: 10 }}>
                {LEVELS.map((lvl) => {
                    const isSelected = patient.level === lvl;
                    return (
                        <TouchableOpacity
                            key={lvl}
                            disabled={updatingLevel}
                            onPress={() => updateLevel(lvl)}
                            style={{
                                paddingVertical: 6,
                                paddingHorizontal: 14,
                                borderRadius: 20,
                                borderWidth: 1,
                                borderColor: isSelected ? "#4CAF50" : "#ccc",
                                backgroundColor: isSelected ? "#4CAF50" : "transparent",
                                opacity: updatingLevel ? 0.6 : 1,
                            }}
                        >
                            <Text
                                style={{
                                    color: isSelected ? "#fff" : "#555",
                                    fontWeight: isSelected ? "600" : "400",
                                }}
                            >
                                {lvl}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
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