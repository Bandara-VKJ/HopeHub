import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/app/FirebaceConfig/firebaseConfig';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontLoard] = useFonts({
    Kavoon: require('../assets/fonts/Kavoon-Regular.ttf'),
    Koulen: require('../assets/fonts/Koulen-Regular.ttf')
  });

   const [user,setUser] = useState<User | null>(null);
   const [loading,setLoading] = useState(true);
   const [completed,setCompleted] = useState(false)
   const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect (()=>{
    const unsubscribe = onAuthStateChanged (auth,(user) => {
    setUser(user);
    setLoading(false);

    });
    return unsubscribe;
  },[]);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        if (user) {
          const res = await fetch(
            `http://192.168.43.251:5000/api/questionnaire/status/${user.uid}`
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

    if (user) {
      checkStatus();
    } else {
      setCheckingStatus(false);
    }
  }, [user]);
  
  useEffect (() =>{
    if(!loading)
    {
      if(!user)
      {
        router.replace('/(auth)/Login/login')
      }
      else if(!completed){
        router.replace('/(questionnaire)/questionnaire')
      }
      else{
        router.replace('/(tabs)/Home/home')
      }
    }
  }, [user,loading,completed]);

  if(!fontLoard || loading)
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
