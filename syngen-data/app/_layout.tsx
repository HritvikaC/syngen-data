import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#f8f9fa" },
          headerTintColor: "#2d3748",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        {/* Main Interface */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Pricing Modal */}
        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            title: "Pricing & Plans",
            headerShown: true,
          }}
        />
      </Stack>
    </>
  );
}
