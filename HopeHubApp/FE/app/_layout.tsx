import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontLoard] = useFonts({
    Kavoon: require('../assets/fonts/Kavoon-Regular.ttf'),
    Koulen: require('../assets/fonts/Koulen-Regular.ttf')
  });

   const [userId, setUserId] = useState<string | null>(null);
   const [loading, setLoading] = useState(true);
   const [completed, setCompleted] = useState(false);
   const [checkingStatus, setCheckingStatus] = useState(true);
   const [role, setRole] = useState<'user' | 'counselor' | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        const storedRole = await AsyncStorage.getItem("role");

        if (storedUserId) {
          setUserId(storedUserId);
          setRole(storedRole as 'user' | 'counselor');
        } else {
          setUserId(null);
          setRole(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (loading) return;

    const checkStatus = async () => {
      try {
        if (userId && role === 'user') {
          const res = await fetch(
            `https://connector-removed-stoneware.ngrok-free.dev/api/questionnaire/status/${userId}`
          );
          const data = await res.json();
          setCompleted(data.completed);
        }
      } catch (error) {
        console.log("Status error:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    if (userId) {
      checkStatus();
    } else {
      setCheckingStatus(false);
    }
  }, [userId, role, loading]);
  
  useEffect(() => {
      if (loading || checkingStatus) return;

      if (!userId) {
        router.replace('/(auth)/Login/login');
        return;
      }

      if (role === 'counselor') {
        router.replace('/(counselor)/counselor');
        return;
      }

      if (!completed) {
        router.replace('/(questionnaire)/questionnaire');
        return;
      }

      router.replace('/(tabs)/Home/home');

  }, [userId, loading, checkingStatus, completed, role]);

  if(!fontLoard || loading || checkingStatus)
  {
    return(
      <View style={{ flex:1,justifyContent:'center',alignItems:'center'}}>
        <ActivityIndicator size="large"/>
      </View>
    )
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
