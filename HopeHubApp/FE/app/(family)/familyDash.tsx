import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Text,
  View
} from "react-native";


const BASE_URL = "https://connector-removed-stoneware.ngrok-free.dev";

const ngrokFetch = (url: string, options: RequestInit = {}) =>
        fetch(url, {
            ...options,
            headers: {
            ...(options.headers || {}),
            "ngrok-skip-browser-warning": "true",
            },
        });
type Task = {
  _id: string;
  title: string;
  description: string;
  status: string;
  date: string;
};

export default function FamilyLogin() {

    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect (()=> {
        getTasks();
    },[]);

   const getTasks = async () => {
    try {
        const userId = await AsyncStorage.getItem("userId");

        if (!userId) return;

        const response = await ngrokFetch(
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
    return(
        <View>
            <Text>Family dashboard</Text>
        </View>
    )
}