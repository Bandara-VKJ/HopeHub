import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

export default function Layout() {
  
  return (
    <Tabs
  screenOptions={{
    headerShown: false,
    tabBarShowLabel: false,

    tabBarBackground: () => (
      <BlurView intensity={50} style={{ flex: 1 }} />
    ),
    tabBarStyle: {
      position: 'absolute',
      backgroundColor: 'transparent',
      borderTopWidth: 0,
      elevation: 0,
      shadowColor: 'transparent',
    },
  }}
>
      <Tabs.Screen name="Home/home" options={{ tabBarIcon: ({ color, size, focused }) => ( <Ionicons name={focused ? "home" : "home-outline"} size={size} color={"#2CA6A4"} /> ), }} />
      <Tabs.Screen name="Dashboard/dashboard"  options={{ tabBarIcon: ({ color, size, focused }) => (<Ionicons name={focused ?  "grid" : "grid-outline"} size={size} color={"#2CA6A4"}/>),}}/>
      <Tabs.Screen name="Support/support" options={{ tabBarIcon: ({ color, size, focused }) => (<Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} size={size} color={"#2CA6A4"}/>),}}/>
      <Tabs.Screen name="Lifebuild/lifebuild" options={{ tabBarIcon: ({ color, size, focused }) => (<Ionicons name={focused ? "trophy" : "trophy-outline"} size={size} color={"#2CA6A4"}/>),}} />
      <Tabs.Screen name="Profile/profile" options={{ tabBarIcon: ({ color, size, focused }) => ( <Ionicons name={focused ? "person" : "person-outline"} size={size}  color={"#2CA6A4"} />),}}/>
    </Tabs>
  );
}
