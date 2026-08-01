import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { patientProfileStyles } from './patientProfile.Styles'


   type Patient = {
    _id : string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    profilePic?: string;
  }

export default function PatientProfile() {

  const { patientId } = useLocalSearchParams();
  const BASE_URL = "https://connector-removed-stoneware.ngrok-free.dev";


  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLaoding] = useState(true)

  const ngrokFetch = (url: string, options: RequestInit = {}) =>
  fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "ngrok-skip-browser-warning": "true",
    },
  });

  useEffect ( ()=>{
    getPatientById()
  },[])

  const getPatientById = async () =>{
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
   if(loading)
      {
          return(
              <View>
                  <ActivityIndicator size = "large"/>
              </View>
          );
      }

    return (
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



            <TouchableOpacity style={patientProfileStyles.taskButton}>
                <Text style={patientProfileStyles.taskButtonText}>
                Add Tasks
                </Text>
            </TouchableOpacity>
            </View>
        )
        }

    </View>
    );
}