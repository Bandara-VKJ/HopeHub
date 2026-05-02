import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { View, Platform } from "react-native";
import {navStyles} from './layout'

type IconName = React.ComponentProps<typeof Ionicons>["name"];

function TabIcon({
  name,
  focusedName,
  size,
  focused,
}: {
  name: IconName;
  focusedName: IconName;
  size: number;
  focused: boolean;
}) {
  return (
    <View style={[navStyles.iconWrap, focused && navStyles.iconWrapActive]}>
      <Ionicons
        name={focused ? focusedName : name}
        size={size ?? 22}
        color="#2CA6A4"
      />
    </View>
  );
}
export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,

       tabBarBackground: () =>
        Platform.OS === "ios" ? (
          <BlurView intensity={90} tint="light" style={{ flex: 1 }} />
        ) : (
          <View style={{ flex: 1, backgroundColor: "rgba(255, 255, 255, 0.85)" }} />
        ),


        tabBarStyle: navStyles.tabBar,

        tabBarActiveTintColor: "#2CA6A4",
        tabBarInactiveTintColor: "rgba(255,255,255,0.45)",
      }}
    >
      <Tabs.Screen
        name="Home/home"
        options={{
          tabBarIcon: ({ size, focused }) => (
            <TabIcon
              name="home-outline"
              focusedName="home"
              size={size}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Dashboard/dashboard"
        options={{
          tabBarIcon: ({ size, focused }) => (
            <TabIcon
              name="grid-outline"
              focusedName="grid"
              size={size}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Support/support"
        options={{
          tabBarIcon: ({ size, focused }) => (
            <TabIcon
              name="chatbubbles-outline"
              focusedName="chatbubbles"
              size={size}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Lifebuild/lifebuild"
        options={{
          tabBarIcon: ({ size, focused }) => (
            <TabIcon
              name="trophy-outline"
              focusedName="trophy"
              size={size}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Profile/profile"
        options={{
          tabBarIcon: ({ size, focused }) => (
            <TabIcon
              name="person-outline"
              focusedName="person"
              size={size}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
