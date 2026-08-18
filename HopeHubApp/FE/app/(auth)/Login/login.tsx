import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState, useCallback } from "react";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { loginStyles } from "./loginStyles";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://connector-removed-stoneware.ngrok-free.dev";

const ngrokFetch = (url: string, options: RequestInit = {}) =>
  fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "ngrok-skip-browser-warning": "true",
    },
  });

type LoginRole = "user" | "counselor" | "family";

const ROLE_SUBTITLES: Record<LoginRole, string> = {
  user: "Log in to continue your recovery journey",
  counselor: "Log in to your professional counselor account",
  family: "Log in to support and track your loved one",
};

const ROLE_TITLES: Record<LoginRole, string> = {
  user: "User Login",
  counselor: "Counselor Login",
  family: "Family Member Login",
};

export default function Login() {
  const params = useLocalSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showpassword, setshowpassword] = useState(false);
  const [logrole, setLogrole] = useState<LoginRole>("user");
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const applyRole = async () => {
        if (params.role === "counselor") {
          setLogrole("counselor");
          return;
        }
        if (params.role === "user") {
          setLogrole("user");
          return;
        }
        if (params.role === "family") {
          setLogrole("family");
          return;
        }

        const stored = await AsyncStorage.getItem("loginRole");
        if (stored === "counselor") {
          setLogrole("counselor");
        } else if (stored === "family") {
          setLogrole("family");
        } else {
          setLogrole("user");
        }
      };

      applyRole();

      setEmail("");
      setPassword("");
    }, [params.role])
  );

  const selectRole = async (role: LoginRole) => {
    setLogrole(role);
    await AsyncStorage.setItem("loginRole", role);
  };

  const handleLogin = async () => {
    if (loading) return;

    try {
      if (!email || !password) {
        Alert.alert("Error", "Please enter email and password");
        return;
      }

      setLoading(true);

      if (logrole === "family") {
        const response = await ngrokFetch(`${BASE_URL}/api/family/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          Alert.alert("Error", data.error || "Login failed");
          return;
        }

        await AsyncStorage.setItem("role", "family");
        await AsyncStorage.setItem("familyToken", data.token);
        await AsyncStorage.setItem("familyName", data.name || "");
        await AsyncStorage.setItem("userId", data.ownerId.toString());

        router.replace("/(family)/familyDash");
        return;
      }

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

  return (
    <ScrollView style={loginStyles.page} showsVerticalScrollIndicator={false}>
      <View style={loginStyles.header}>
        <View>
          <Text style={loginStyles.smallTitle}>Welcome back to</Text>
          <Text style={loginStyles.brand}>HopeHub</Text>
          <Text style={loginStyles.subtitle}>{ROLE_SUBTITLES[logrole]}</Text>
        </View>

        <Image
          source={require("../../../assets/images/logo.png")}
          style={loginStyles.logo}
        />
      </View>

      <View style={loginStyles.roleSwitch}>
        <TouchableOpacity
          style={[loginStyles.roleBtn, logrole === "user" && loginStyles.roleBtnActive]}
          onPress={() => selectRole("user")}
        >
          <Text style={[loginStyles.roleText, logrole === "user" && loginStyles.roleTextActive]}>
            User
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[loginStyles.roleBtn, logrole === "counselor" && loginStyles.roleBtnActive]}
          onPress={() => selectRole("counselor")}
        >
          <Text
            style={[loginStyles.roleText, logrole === "counselor" && loginStyles.roleTextActive]}
          >
            Counselor
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[loginStyles.roleBtn, logrole === "family" && loginStyles.roleBtnActive]}
          onPress={() => selectRole("family")}
        >
          <Text
            style={[loginStyles.roleText, logrole === "family" && loginStyles.roleTextActive]}
          >
            Family
          </Text>
        </TouchableOpacity>
      </View>

      <View style={loginStyles.card}>
        <Text style={loginStyles.cardTitle}>{ROLE_TITLES[logrole]}</Text>

        <View style={loginStyles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#7A9A9A" />
          <TextInput
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={loginStyles.input as any}
          />
        </View>

        <View style={loginStyles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#7A9A9A" />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showpassword}
            style={loginStyles.input as any}
          />
          <TouchableOpacity onPress={() => setshowpassword(!showpassword)}>
            <Ionicons
              name={showpassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#7A9A9A"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[loginStyles.button, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={loginStyles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        {logrole !== "family" && (
          <Text style={loginStyles.bottomText}>
            Don't have an account?{" "}
            <Text
              style={loginStyles.loginText}
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
        )}
      </View>
    </ScrollView>
  );
}