import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Navigation - Minimalist Floating Style */}
      <View style={styles.navBar}>
        <Text style={styles.logo}>SYNGEN</Text>
        <View style={styles.navLinks}>
          <Text style={styles.navLinkActive}>Home</Text>

          <Pressable onPress={() => router.push("/explore")}>
            <Text style={styles.navLink}>Generate</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/modal")}>
            <Text style={styles.navLink}>Pricing</Text>
          </Pressable>
        </View>
      </View>

      {/* Hero Section - The "Workspace" Look */}
      <View style={styles.hero}>
        <View style={styles.pillTag}>
          <Text style={styles.pillText}>Privacy-First Data Generation</Text>
        </View>
        <Text style={styles.title}>Synthetic data,{"\n"}real-world logic.</Text>
        <Text style={styles.subtitle}>
          Build, test, and scale without touching sensitive user info. The
          modern standard for privacy-compliant development.
        </Text>

        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push("/explore")}
          >
            <Text style={styles.buttonText}>Start Generating</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Documentation</Text>
          </Pressable>
        </View>

        {/* Feature Preview - Clean Glassmorphism effect */}
        <View style={styles.previewCard}>
          <View style={styles.codeHeader}>
            <View style={[styles.dot, { backgroundColor: "#FF5F56" }]} />
            <View style={[styles.dot, { backgroundColor: "#FFBD2E" }]} />
            <View style={[styles.dot, { backgroundColor: "#27C93F" }]} />
          </View>
          <Text style={styles.codeText}>
            // Generating 10k realistic users...
          </Text>
          <Text style={styles.codeTextPrimary}>
            status: "Success", accuracy: 99.8%
          </Text>
        </View>
      </View>

      {/* Features - Grid Layout */}
      <View style={styles.featuresSection}>
        <View style={styles.featureGrid}>
          {["LLM Driven", "Schema Parsing", "Zero-Risk"].map((feature, i) => (
            <View key={i} style={styles.featureCard}>
              <View style={styles.iconCircle} />
              <Text style={styles.featureCardTitle}>{feature}</Text>
              <Text style={styles.featureCardText}>
                Automated relationship mapping and logical consistency across
                all datasets.
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 25,
  },
  logo: { fontWeight: "900", letterSpacing: 2, fontSize: 18, color: "#111" },
  navLinks: { flexDirection: "row", gap: 25 },
  navLink: { color: "#666", fontSize: 14, fontWeight: "500" },
  navLinkActive: { color: "#111", fontSize: 14, fontWeight: "700" },

  hero: { paddingHorizontal: 25, paddingTop: 40, alignItems: "center" },
  pillTag: {
    backgroundColor: "#F0F4FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  pillText: { color: "#3182ce", fontSize: 12, fontWeight: "600" },
  title: {
    fontSize: 42,
    fontWeight: "800",
    textAlign: "center",
    color: "#111",
    lineHeight: 48,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 17,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
    lineHeight: 26,
    maxWidth: 340,
  },

  buttonContainer: { flexDirection: "row", gap: 12, marginTop: 35 },
  primaryButton: {
    backgroundColor: "#111", // Sleeker than blue
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  secondaryButtonText: { color: "#111", fontWeight: "600" },

  previewCard: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    marginTop: 50,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  codeHeader: { flexDirection: "row", gap: 6, marginBottom: 15 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  codeText: { color: "#666", fontFamily: "monospace", fontSize: 13 },
  codeTextPrimary: {
    color: "#27C93F",
    fontFamily: "monospace",
    fontSize: 13,
    marginTop: 5,
  },

  featuresSection: { padding: 30, marginTop: 40 },
  featureGrid: { gap: 20 },
  featureCard: {
    backgroundColor: "#F9FAFB",
    padding: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E7FF",
    marginBottom: 15,
  },
  featureCardTitle: {
    fontWeight: "700",
    fontSize: 18,
    color: "#111",
    marginBottom: 8,
  },
  featureCardText: { color: "#666", fontSize: 14, lineHeight: 20 },
});
