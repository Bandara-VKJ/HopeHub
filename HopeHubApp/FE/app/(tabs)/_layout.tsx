import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen name="Home" options={{ title: "Home" }} />
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="support" />
      <Tabs.Screen name="lifebuild" options={{ title: "Life Build" }} />
    </Tabs>
  );
}
