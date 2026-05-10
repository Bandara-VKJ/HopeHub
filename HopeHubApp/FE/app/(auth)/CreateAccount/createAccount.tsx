import { accountCreateStyles as styles } from "./createAccountStyles";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
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

export default function CreateAccount() {
  const [logrole, setLogrole] = useState<"user" | "counselor">("counselor");

  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const [title, setTitle] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState("Available Today");

  const [password, setPassword] = useState("");
  const [confpassword, setconfPassword] = useState("");
  const [showpassword, setshowpassword] = useState(false);
  const [showconfpassword, setconfShowpassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async () => {
    if (loading) return;

    if (!first || !last || !email || !password || !confpassword) {
      Alert.alert("Error", "Please fill all basic fields");
      return;
    }

    if (password !== confpassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      if (logrole === "counselor") {
        if (!mobile || !title || !specialty || !experience) {
          Alert.alert("Error", "Please fill all counselor details");
          return;
        }

        const response = await ngrokFetch(`${BASE_URL}/api/counselors/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: first,
            lastName: last,
            email: email.trim().toLowerCase(),
            password,
            mobile,
            title,
            specialty,
            experience,
            availability,
          }),
        });

        // Redirect to login
        Alert.alert("Success", "Account created successfully. Please login.");
        router.replace('/(auth)/Login/login')

        await AsyncStorage.setItem("role", "counselor");
        await AsyncStorage.setItem("counselorId", data.counselor._id);
        await AsyncStorage.setItem("counselor", JSON.stringify(data.counselor));

        Alert.alert("Success", "Counselor account created");
        router.replace("/(counselor)/counselor");
        return;
      }

      const response = await ngrokFetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: first,
          lastName: last,
          email: email.trim().toLowerCase(),
          password,
          mobile,
          role: "user",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message || "User registration failed");
        return;
      }

      Alert.alert("Success", "User account created");
      router.replace("/(auth)/Login/login");
    } catch (error) {
      console.log("Create account error:", error);
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.smallTitle}>Welcome to</Text>
          <Text style={styles.brand}>HopeHub</Text>
          <Text style={styles.subtitle}>
            {logrole === "counselor"
              ? "Create your professional counselor profile"
              : "Create your user account"}
          </Text>
        </View>

        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
        />
      </View>

      <View style={styles.roleSwitch}>
        <TouchableOpacity
          style={[styles.roleBtn, logrole === "user" && styles.roleBtnActive]}
          onPress={() => setLogrole("user")}
        >
          <Text style={[styles.roleText, logrole === "user" && styles.roleTextActive]}>
            User
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleBtn, logrole === "counselor" && styles.roleBtnActive]}
          onPress={() => setLogrole("counselor")}
        >
          <Text
            style={[
              styles.roleText,
              logrole === "counselor" && styles.roleTextActive,
            ]}
          >
            Counselor
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {logrole === "counselor" ? "Counselor Details" : "Account Details"}
        </Text>

        <View style={styles.row}>
          <View style={[styles.inputWrapper, { flex: 1 }]}>
            <Ionicons name="person-outline" size={20} color="#7A9A9A" />
            <TextInput
              placeholder="First name"
              value={first}
              onChangeText={setFirst}
              style={styles.input}
            />
          </View>

          <View style={[styles.inputWrapper, { flex: 1 }]}>
            <Ionicons name="person-outline" size={20} color="#7A9A9A" />
            <TextInput
              placeholder="Last name"
              value={last}
              onChangeText={setLast}
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#7A9A9A" />
          <TextInput
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="call-outline" size={20} color="#7A9A9A" />
          <TextInput
            placeholder="Mobile number"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            style={styles.input}
          />
        </View>

        {logrole === "counselor" && (
          <>
            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>Professional Information</Text>

            <View style={styles.inputWrapper}>
              <Ionicons name="briefcase-outline" size={20} color="#7A9A9A" />
              <TextInput
                placeholder="Title e.g. Clinical Psychologist"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="heart-outline" size={20} color="#7A9A9A" />
              <TextInput
                placeholder="Specialty e.g. Addiction Recovery"
                value={specialty}
                onChangeText={setSpecialty}
                style={styles.input}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="school-outline" size={20} color="#7A9A9A" />
              <TextInput
                placeholder="Experience e.g. 5 years experience"
                value={experience}
                onChangeText={setExperience}
                style={styles.input}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="calendar-outline" size={20} color="#7A9A9A" />
              <TextInput
                placeholder="Availability"
                value={availability}
                onChangeText={setAvailability}
                style={styles.input}
              />
            </View>
          </>
        )}

        <View style={styles.divider} />

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#7A9A9A" />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showpassword}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setshowpassword(!showpassword)}>
            <Ionicons
              name={showpassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#7A9A9A"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#7A9A9A" />
          <TextInput
            placeholder="Confirm password"
            value={confpassword}
            onChangeText={setconfPassword}
            secureTextEntry={!showconfpassword}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setconfShowpassword(!showconfpassword)}>
            <Ionicons
              name={showconfpassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#7A9A9A"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleCreateAccount}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {logrole === "counselor" ? "Create Counselor Profile" : "Create Account"}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.bottomText}>
          Already have an account?{" "}
          <Text
            style={styles.loginText}
            onPress={() => router.push("/(auth)/Login/login")}
          >
            Login
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
}