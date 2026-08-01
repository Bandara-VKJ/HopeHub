import {
   View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
    Image,
} from "react-native";
import { useEffect, useState } from "react";
import { patientsStyles } from "./patientsStyles";

const BASE_URL = "https://connector-removed-stoneware.ngrok-free.dev";

const ngrokFetch = (url: string, options: RequestInit = {}) =>
  fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "ngrok-skip-browser-warning": "true",
    },
  });


type Patient = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: String;
  profilePic?: string;
};


export default function Patients() {

    const [loading, setLaoding] = useState(true)
    const [patient, setPatients] = useState<Patient []>([])


    useEffect(()=>{
        getPatients();
    },[])

    const getPatients = async () =>{
        try {
            const response = await ngrokFetch(`${BASE_URL}/api/counselors/all-patients`)

            const data = await response.json()

            setPatients(data.patients)

        } catch (error) {
            console.log("Patient loading error:", error);
        }
        finally {
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
 return(
        <View style={patientsStyles.container}>

            <Text style={patientsStyles.title}>
            All Patients
            </Text>


            <FlatList
            data={patient}
            keyExtractor={(item)=>item._id}

            renderItem={({item})=>(

               <TouchableOpacity style={patientsStyles.patientCard}>

                {item.profilePic ? (
                    <Image
                    source={{ uri: item.profilePic }}
                    style={patientsStyles.avatar}
                    />
                ) : (
                    <View style={patientsStyles.avatarPlaceholder}>
                    <Text style={patientsStyles.avatarText}>
                        {item.firstName.charAt(0)}
                    </Text>
                    </View>
                )}

                <View>
                    <Text style={patientsStyles.patientName}>
                    {item.firstName} {item.lastName}
                    </Text>

                    <Text style={patientsStyles.patientEmail}>
                    {item.email}
                    </Text>
                </View>

                </TouchableOpacity>
            )}

            />

        </View>
        )
}