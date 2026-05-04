import { Text, View, TextInput, TouchableOpacity, Image } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { loginStyles } from './loginStyles'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = "https://connector-removed-stoneware.ngrok-free.dev";

const ngrokFetch = (url: string, options: RequestInit = {}) =>
  fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "ngrok-skip-browser-warning": "true",
    },
  });

export default function Login() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showpassword, setshowpassword] = useState(false)
  const [logrole, setLogrole] = useState<'user' | 'counselor'>('user');

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        alert("Please enter email and password");
        return;
      }

      const response = await ngrokFetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      const role = data.user.role;
      const userId = data.user._id; // ✅ correct — from your backend response

      await AsyncStorage.setItem("userId", userId);
      await AsyncStorage.setItem("role", role);

      // Role validation
      if (logrole === 'counselor' && role !== 'counselor') {
        alert("This account is not a counselor account");
        return;
      }
      if (logrole === 'user' && role === 'counselor') {
        alert("Please use counselor login option");
        return;
      }

      // Counselor goes directly — no questionnaire check needed
      if (role === 'counselor') {
        router.replace('/(counselor)/counselor');
        return;
      }

      // Regular user — check questionnaire status
      const statusRes = await ngrokFetch(
        `${BASE_URL}/api/questionnaire/status/${userId}` // ✅ fixed: userId not user.uid
      );
      const statusData = await statusRes.json(); // ✅ fixed: separate variable

      if (statusData.completed) {
        router.replace('/(tabs)/Home/home');
      } else {
        router.replace('/(questionnaire)/questionnaire');
      }

    } catch (error) {
      console.log(error);
      alert("Network error");
    }
  };

  return (
    <View style={loginStyles.container}>
      <Text style={loginStyles.name}>HopeHub</Text>
      <View style={loginStyles.innerContainer}>
        <Image source={require('../../../assets/images/logo.png')} style={loginStyles.logo} resizeMode="contain" />
        <Text style={loginStyles.title}>{logrole === 'counselor' ? 'Counselor Login' : 'User Login'}</Text>
        <View style={loginStyles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="gray" style={loginStyles.icon} />
          <TextInput placeholder="Enter Email" value={email} onChangeText={setEmail} style={loginStyles.input as any} />
        </View>
        <View style={loginStyles.inputWrapper}>
          <Ionicons name='lock-closed-outline' size={20} color='gray' style={loginStyles.icon} />
          <TextInput secureTextEntry={!showpassword} placeholder='Enter Password' value={password} onChangeText={setPassword} style={loginStyles.input as any} />
          <TouchableOpacity onPress={() => setshowpassword(!showpassword)}>
            <Ionicons name={showpassword ? "eye-off-outline" : "eye-outline"} size={20} color="gray" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleLogin} style={loginStyles.button}>
          <Text style={loginStyles.buttonText}>Login</Text>
        </TouchableOpacity>
        <Text style={loginStyles.last}>
          Don't have an account ?
          <Text style={loginStyles.createAccount} onPress={() => router.push('/(auth)/CreateAccount/createAccount')}>
            Create now
          </Text>
        </Text>
      </View>
      <TouchableOpacity onPress={() => setLogrole(logrole === 'user' ? 'counselor' : 'user')}>
        <Text style={{ color: '#007AFF', marginBottom: 10 }}>
          {logrole === 'user' ? "Login as Counselor?" : "Login as User?"}
        </Text>
      </TouchableOpacity>
    </View>
  )
}