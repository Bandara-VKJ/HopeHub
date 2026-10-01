import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export const ngrokFetch = async (
  url: string,
  options: RequestInit = {}
) => {
  const token = await AsyncStorage.getItem("token");

  const isFormData = options.body instanceof FormData;

  const headers = new Headers(options.headers);

  // Only set JSON content type for non-FormData requests
  if (!isFormData) {
    headers.set("Content-Type", "application/json");
  } else {
    // IMPORTANT:
    // Do not manually set Content-Type for FormData.
    // fetch will add multipart/form-data + boundary automatically.
    headers.delete("Content-Type");
  }

  headers.set("ngrok-skip-browser-warning", "true");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

export { BASE_URL };