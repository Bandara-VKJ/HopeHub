import { Tabs } from "expo-router";

export default function Layout() {
  
  return (
    <Tabs>
      <Tabs.Screen name="Home/home" options={{ title: "Home" }} />
      <Tabs.Screen name="Dashboard/dashboard"  options={{ title: "Dashboard" }} />
      <Tabs.Screen name="Support/support" options={{ title: "Support" }} />
      <Tabs.Screen name="Lifebuild/lifebuild" options={{ title: "Life Build" }} />
    </Tabs>
  );
}
