import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

export default function Layout() {
  
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarShowLabel: false }}>
      <Tabs.Screen name="Home/home" options={{ tabBarIcon: ({ color, size, focused }) => ( <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} /> ), }} />
      <Tabs.Screen name="Dashboard/dashboard"  options={{ tabBarIcon: ({ color, size, focused }) => (<Ionicons name={focused ?  "grid" : "grid-outline"} size={size} color={color}/>),}}/>
      <Tabs.Screen name="Support/support" options={{ tabBarIcon: ({ color, size, focused }) => (<Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} size={size} color={color}/>),}}/>
      <Tabs.Screen name="Lifebuild/lifebuild" options={{ tabBarIcon: ({ color, size, focused }) => (<Ionicons name={focused ? "trophy" : "trophy-outline"} size={size} color={color}/>),}} />
      <Tabs.Screen name="Profile/profile" options={{ tabBarIcon: ({ color, size, focused }) => ( <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />),}}/>
    </Tabs>
  );
}
