import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: "#e2e8f0", height: 80 },
        headerTitleStyle: {
          fontSize: 24,
          fontWeight: "bold",
          color: "#3182ce",
        },
        tabBarStyle:
          Platform.OS === "web" ? styles.webTabBar : styles.mobileTabBar,
        tabBarActiveTintColor: "#3182ce",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: "Syngen Data Generator",
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Generate",
          headerTitle: "Syngen Workspace",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  webTabBar: {
    display: "none", // Hide standard bottom tabs on web, navigation is handled via UI buttons
  },
  mobileTabBar: {
    height: 60,
    paddingBottom: 10,
  },
});
