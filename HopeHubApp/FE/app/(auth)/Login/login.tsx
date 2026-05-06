import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { loginStyles } from "./loginStyles";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";

const BASE_URL = "https://connector-removed-stoneware.ngrok-free.dev";

const ngrokFetch = (url: string, options: RequestInit = {}) =>
  fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "ngrok-skip-browser-warning": "true",
    },
  });

export default function Login() {
  const params = useLocalSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showpassword, setshowpassword] = useState(false);
  const [logrole, setLogrole] = useState<"user" | "counselor">("user");
  const [loading, setLoading] = useState(false);

  // ✅ Fixed: useFocusEffect ensures role is re-read every time
  // this screen comes into focus (including after logout redirect)
  useFocusEffect(
    useCallback(() => {
      const applyRole = async () => {
        // Priority 1: role passed via navigation params
        if (params.role === "counselor") {
          setLogrole("counselor");
          return;
        }
        if (params.role === "user") {
          setLogrole("user");
          return;
        }

        // Priority 2: fallback to stored loginRole
        const stored = await AsyncStorage.getItem("loginRole");
        if (stored === "counselor") {
          setLogrole("counselor");
        } else {
          setLogrole("user");
        }
      };

      applyRole();

      // Reset fields on every focus for clean state
      setEmail("");
      setPassword("");
    }, [params.role])
  );

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert("Error", "Please enter email and password");
        return;
      }

      setLoading(true);

      const loginUrl =
        logrole === "counselor"
          ? `${BASE_URL}/api/counselors/login`
          : `${BASE_URL}/api/auth/login`;

      const response = await ngrokFetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message || "Login failed");
        return;
      }

      if (logrole === "counselor") {
        await AsyncStorage.setItem("role", "counselor");
        await AsyncStorage.setItem("loginRole", "counselor");
        await AsyncStorage.setItem("counselorId", data.counselor._id);
        await AsyncStorage.setItem("counselor", JSON.stringify(data.counselor));

        router.replace("/(counselor)/counselor");
        return;
      }

      const userId = data.user._id || data.user.id;

      await AsyncStorage.setItem("role", "user");
      await AsyncStorage.setItem("loginRole", "user");
      await AsyncStorage.setItem("userId", userId);

      const statusRes = await ngrokFetch(
        `${BASE_URL}/api/questionnaire/status/${userId}`
      );

      const statusData = await statusRes.json();

      if (statusData.completed) {
        router.replace("/(tabs)/Home/home");
      } else {
        router.replace("/(questionnaire)/questionnaire");
      }
    } catch (error) {
      console.log("Login error:", error);
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  const toggleLoginRole = async () => {
    const nextRole = logrole === "user" ? "counselor" : "user";
    setLogrole(nextRole);
    await AsyncStorage.setItem("loginRole", nextRole);
  };

  return (
    <View style={loginStyles.container}>
      <Text style={loginStyles.name}>HopeHub</Text>

      <View style={loginStyles.innerContainer}>
        <Image
          source={require("../../../assets/images/logo.png")}
          style={loginStyles.logo}
          resizeMode="contain"
        />

        <Text style={loginStyles.title}>
          {logrole === "counselor" ? "Counselor Login" : "User Login"}
        </Text>

        <View style={loginStyles.inputWrapper}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="gray"
            style={loginStyles.icon}
          />

          <TextInput
            placeholder="Enter Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={loginStyles.input as any}
          />
        </View>

        <View style={loginStyles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="gray"
            style={loginStyles.icon}
          />

          <TextInput
            secureTextEntry={!showpassword}
            placeholder="Enter Password"
            value={password}
            onChangeText={setPassword}
            style={loginStyles.input as any}
          />

          <TouchableOpacity onPress={() => setshowpassword(!showpassword)}>
            <Ionicons
              name={showpassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="gray"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={loginStyles.button}
        >
          <Text style={loginStyles.buttonText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        <Text style={loginStyles.last}>
          Don't have an account?{" "}
          <Text
            style={loginStyles.createAccount}
            onPress={() =>
              router.push({
                pathname: "/(auth)/CreateAccount/createAccount",
                params: { role: logrole },
              })
            }
          >
            Create now
          </Text>
        </Text>
      </View>

      <TouchableOpacity onPress={toggleLoginRole}>
        <Text style={{ color: "#007AFF", marginBottom: 10 }}>
          {logrole === "user" ? "Login as Counselor?" : "Login as User?"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}