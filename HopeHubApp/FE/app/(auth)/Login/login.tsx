import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState, useCallback } from "react";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { loginStyles } from "./loginStyles";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ngrokFetch } from "@/utill/ngrokFetch";
import LottieView from "lottie-react-native";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

type LoginRole = "user" | "counselor" | "family";

export default function Login() {
  const params = useLocalSearchParams();
  const { t } = useLanguage();

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
        Alert.alert(t.common.error, t.login.enterCredentials);
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
          Alert.alert(t.common.error, data.error || t.login.loginFailed);
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
        Alert.alert(t.common.error, data.message || t.login.loginFailed);
        return;
      }

      if (logrole === "counselor") {
        await AsyncStorage.setItem("role", "counselor");
        await AsyncStorage.setItem("loginRole", "counselor");
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("counselorId", data.counselor._id);
        await AsyncStorage.setItem(
          "counselor",
          JSON.stringify(data.counselor)
        );

        router.replace("/(counselor)/counselor");
        return;
      }

      const userId = data.user._id || data.user.id;

      await AsyncStorage.setItem("role", "user");
      await AsyncStorage.setItem("loginRole", "user");
      await AsyncStorage.setItem("userId", userId);
      await AsyncStorage.setItem("token", data.token);

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
      Alert.alert(t.common.error, t.common.networkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={loginStyles.page}
      contentContainerStyle={loginStyles.pageContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={loginStyles.hero}>
        <LanguageToggle />

        <LottieView
          source={require("../../../assets/animations/Login.json")}
          autoPlay
          loop
          style={loginStyles.heroAnimation}
        />

        <View style={loginStyles.heroContent}>
          <Text style={loginStyles.smallTitle}>{t.login.welcome}</Text>

          <Text style={loginStyles.brand}>HopeHub</Text>
        </View>
      </View>

      <View style={loginStyles.roleSwitch}>
        <TouchableOpacity
          style={[
            loginStyles.roleBtn,
            logrole === "user" && loginStyles.roleBtnActive,
          ]}
          onPress={() => selectRole("user")}
        >
          <Text
            style={[
              loginStyles.roleText,
              logrole === "user" && loginStyles.roleTextActive,
            ]}
          >
            {t.common.user}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            loginStyles.roleBtn,
            logrole === "counselor" && loginStyles.roleBtnActive,
          ]}
          onPress={() => selectRole("counselor")}
        >
          <Text
            style={[
              loginStyles.roleText,
              logrole === "counselor" && loginStyles.roleTextActive,
            ]}
          >
            {t.common.counselor}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            loginStyles.roleBtn,
            logrole === "family" && loginStyles.roleBtnActive,
          ]}
          onPress={() => selectRole("family")}
        >
          <Text
            style={[
              loginStyles.roleText,
              logrole === "family" && loginStyles.roleTextActive,
            ]}
          >
            {t.common.family}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={loginStyles.card}>
        <Text style={loginStyles.cardTitle}>
          {logrole === "user"
            ? t.login.userLogin
            : logrole === "counselor"
            ? t.login.counselorLogin
            : t.login.familyLogin}
        </Text>

        <View style={loginStyles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#7A9A9A" />

          <TextInput
            placeholder={t.common.email}
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
            placeholder={t.common.password}
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
            <Text style={loginStyles.buttonText}>{t.common.login}</Text>
          )}
        </TouchableOpacity>

        {logrole !== "family" && (
          <Text style={loginStyles.bottomText}>
            {t.login.noAccount}{" "}
            <Text style={loginStyles.loginText} onPress={() =>
              router.push({
                pathname:
                  "/(auth)/CreateAccount/createAccount",
                params: { role: logrole },
              })
            }
            >{t.login.createNow}</Text>
          </Text>
        )}
      </View>
    </ScrollView>
  );
}