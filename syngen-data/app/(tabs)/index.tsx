import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
} from "react-native";
import { router } from "expo-router";

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Top Page Navigation Links */}
      <View style={styles.navBar}>
        <Text style={styles.navLinkActive}>Home</Text>
        <Text style={styles.navLink}>About us</Text>
        <Pressable onPress={() => router.push("/explore")}>
          <Text style={styles.navLink}>Generate</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/modal")}>
          <Text style={styles.navLink}>Pricing</Text>
        </Pressable>
      </View>

      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.title}>Heading</Text>
        <Text style={styles.subtitle}>
          Generate logically consistent, realistic synthetic datasets without
          accessing real user data. Protect privacy while accelerating testing.
        </Text>
        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push("/explore")}
          >
            <Text style={styles.buttonText}>Get Started →</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.push("/modal")}
          >
            <Text style={styles.secondaryButtonText}>Learn More</Text>
          </Pressable>
        </View>
        <View style={styles.heroImagePlaceholder}>
          <Text style={styles.placeholderText}>
            [ Architecture Map Preview ]
          </Text>
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>Feature Heading</Text>
        <Text style={styles.featuresSubtitle}>
          Automated schema parsing, relationship mapping, and LLM-driven
          constraints.
        </Text>

        <View style={styles.featureGrid}>
          {[1, 2, 3].map((num) => (
            <View key={num} style={styles.featureCard}>
              <View style={styles.featureImagePlaceholder} />
              <Text style={styles.featureCardTitle}>Feature {num}</Text>
              <Text style={styles.featureCardText}>
                Lorem ipsum dolor sit amet nulla adipiscing elit. Nunc maximus,
                nec ut commodo.
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  navBar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
  },
  navLink: { color: "#4a5568", fontSize: 16 },
  navLinkActive: { color: "#3182ce", fontSize: 16, fontWeight: "bold" },
  hero: { padding: 60, alignItems: "center", backgroundColor: "#e2e8f0" },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2d3748",
  },
  subtitle: {
    fontSize: 16,
    color: "#4a5568",
    marginBottom: 30,
    textAlign: "center",
    maxWidth: 600,
    lineHeight: 24,
  },
  buttonContainer: { flexDirection: "row", gap: 15, marginBottom: 40 },
  primaryButton: {
    backgroundColor: "#3182ce",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  secondaryButton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#cbd5e0",
  },
  secondaryButtonText: { color: "#4a5568", fontWeight: "bold", fontSize: 16 },
  heroImagePlaceholder: {
    width: "80%",
    height: 350,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  placeholderText: { color: "#a0aec0", fontWeight: "bold" },
  featuresSection: { padding: 60, alignItems: "center" },
  featuresTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2d3748",
  },
  featuresSubtitle: {
    fontSize: 16,
    color: "#718096",
    marginBottom: 40,
    textAlign: "center",
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 30,
    justifyContent: "center",
  },
  featureCard: {
    width: 300,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#edf2f7",
  },
  featureImagePlaceholder: {
    height: 150,
    backgroundColor: "#edf2f7",
    borderRadius: 4,
    marginBottom: 20,
  },
  featureCardTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
    color: "#2d3748",
  },
  featureCardText: { color: "#718096", lineHeight: 22, fontSize: 14 },
});
