import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export const ngrokFetch = async (url: string, options: RequestInit = {}) => {
  const token = await AsyncStorage.getItem("token");
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

export { BASE_URL };