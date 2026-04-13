import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { router } from "expo-router";
import * as DocumentPicker from "expo-document-picker";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ExploreScreen() {
  const [step, setStep] = useState(1);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(".csv");

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (!result.canceled) {
        setIsLoading(true);
        const asset = result.assets[0];
        const formData = new FormData();

        if (Platform.OS === "web" && asset.file) {
          formData.append("file", asset.file);
        } else {
          formData.append("file", {
            uri: asset.uri,
            name: asset.name,
            type: asset.mimeType || "application/octet-stream",
          } as any);
        }

        const res = await fetch(`${API_BASE_URL}/upload-schema`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok) {
          setSessionId(data.session_id);
          setStep(2);
        } else {
          alert("Upload failed: " + JSON.stringify(data));
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading file.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/generate-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, rows_per_table: 100 }),
      });
      if (res.ok) setStep(3);
      else alert("Generation failed");
    } catch (error) {
      alert("Error generating data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!sessionId) return;
    const endpoint =
      selectedFormat === ".csv" ? "/download/csv" : "/download/sql";
    const downloadUrl = `${API_BASE_URL}${endpoint}?session_id=${sessionId}`;
    if (Platform.OS === "web") window.open(downloadUrl, "_blank");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Refined NavBar */}
      <View style={styles.navBar}>
        <Text style={styles.logo} onPress={() => router.push("/")}>
          SYNGEN
        </Text>
        <View style={styles.navLinks}>
          <Text style={styles.navLink} onPress={() => router.push("/")}>
            Home
          </Text>
          <Text style={styles.navLinkActive}>Generate</Text>
          <Pressable onPress={() => router.push("/modal")}>
            <Text style={styles.navLink}>Pricing</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.contentContainer}>
        {/* Modern Progress Stepper */}
        <View style={styles.stepperContainer}>
          {[1, 2, 3].map((s, i) => (
            <View key={s} style={styles.stepWrapper}>
              <View
                style={[
                  styles.circle,
                  step >= s ? styles.activeCircle : styles.inactiveCircle,
                ]}
              >
                <Text
                  style={[styles.circleText, step >= s && { color: "#FFF" }]}
                >
                  {s}
                </Text>
              </View>
              {i < 2 && (
                <View
                  style={[
                    styles.stepLine,
                    step > s && { backgroundColor: "#111" },
                  ]}
                />
              )}
            </View>
          ))}
        </View>

        <View style={styles.card}>
          {step === 1 && (
            <View style={styles.uploadSection}>
              <Pressable
                style={[styles.dropZone, isLoading && { opacity: 0.5 }]}
                onPress={handleFileUpload}
              >
                <Text style={styles.uploadIcon}>󰂄</Text>
                <Text style={styles.dropZoneText}>
                  {isLoading ? "Analyzing Schema..." : "Drop SQL Schema here"}
                </Text>
                <Text style={styles.subTextSmall}>Max file size: 10MB</Text>
              </Pressable>

              <View style={styles.actionArea}>
                <Text style={styles.actionTitle}>Define your structure</Text>
                <Text style={styles.subText}>
                  Syngen extracts primary keys, foreign keys, and data types to
                  ensure referential integrity in your synthetic set.
                </Text>
                <Pressable
                  style={styles.primaryButton}
                  onPress={handleFileUpload}
                >
                  <Text style={styles.buttonText}>Select File</Text>
                </Pressable>
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.loadingSection}>
              <Text style={styles.actionTitle}>Engine Standby</Text>
              <Text style={styles.subText}>
                Ready to populate your schema with realistic entries.
              </Text>
              {isLoading ? (
                <View style={styles.loaderBox}>
                  <ActivityIndicator size="small" color="#111" />
                  <Text style={styles.loaderText}>Synthesizing rows...</Text>
                </View>
              ) : (
                <Pressable
                  style={[styles.primaryButton, { marginTop: 30 }]}
                  onPress={handleGenerate}
                >
                  <Text style={styles.buttonText}>Invoke Generation</Text>
                </Pressable>
              )}
            </View>
          )}

          {step === 3 && (
            <View style={styles.downloadSection}>
              <View style={styles.downloadLeft}>
                <Text style={styles.actionTitle}>Generation Complete</Text>
                <Text style={styles.subText}>
                  Your dataset is isolated and ready for export.
                </Text>

                <View style={styles.formatSelector}>
                  {[".csv", ".sql", ".json"].map((fmt) => (
                    <Pressable
                      key={fmt}
                      onPress={() => setSelectedFormat(fmt)}
                      style={[
                        styles.formatChip,
                        selectedFormat === fmt && styles.activeFormat,
                      ]}
                    >
                      <Text
                        style={[
                          styles.formatText,
                          selectedFormat === fmt && { color: "#FFF" },
                        ]}
                      >
                        {fmt}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Pressable
                  style={styles.primaryButtonWide}
                  onPress={handleDownload}
                >
                  <Text style={styles.buttonText}>Download Bundle</Text>
                </Pressable>

                <Pressable style={styles.textButton} onPress={() => setStep(1)}>
                  <Text style={styles.textButtonText}>Start New Session</Text>
                </Pressable>
              </View>

              <View style={styles.feedbackForm}>
                <Text style={styles.feedbackTitle}>Quick Feedback</Text>
                <TextInput
                  placeholder="Name"
                  style={styles.input}
                  placeholderTextColor="#999"
                />
                <TextInput
                  placeholder="How was the data quality?"
                  multiline
                  style={[styles.input, { height: 80, paddingTop: 12 }]}
                  placeholderTextColor="#999"
                />
                <Pressable style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Submit Review</Text>
                </Pressable>
              </View>
            </View>
          )}
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
    padding: 25,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  logo: { fontWeight: "900", letterSpacing: 2, fontSize: 16 },
  navLinks: { flexDirection: "row", gap: 30 },
  navLink: { color: "#666", fontWeight: "500", fontSize: 14 },
  navLinkActive: { color: "#111", fontWeight: "700", fontSize: 14 },

  contentContainer: {
    paddingVertical: 40,
    alignItems: "center",
    paddingHorizontal: 20,
  },

  stepperContainer: {
    flexDirection: "row",
    width: "100%",
    maxWidth: 600,
    justifyContent: "center",
    marginBottom: 60,
  },
  stepWrapper: { flexDirection: "row", alignItems: "center", flex: 1 },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  activeCircle: { backgroundColor: "#111", borderColor: "#111" },
  inactiveCircle: { borderColor: "#EEE", backgroundColor: "#FFF" },
  circleText: { fontSize: 14, fontWeight: "700", color: "#CCC" },
  stepLine: {
    height: 2,
    flex: 1,
    backgroundColor: "#EEE",
    marginHorizontal: 10,
  },

  card: {
    width: "100%",
    maxWidth: 1000,
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 40,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 30,
  },

  uploadSection: { flexDirection: "row", gap: 60, flexWrap: "wrap" },
  dropZone: {
    flex: 1,
    minWidth: 320,
    height: 300,
    borderRadius: 20,
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    backgroundColor: "#FAFAFA",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadIcon: { fontSize: 40, color: "#AAA", marginBottom: 10 },
  dropZoneText: { fontSize: 16, fontWeight: "600", color: "#444" },
  subTextSmall: { fontSize: 12, color: "#999", marginTop: 8 },

  actionArea: { flex: 1, minWidth: 300, justifyContent: "center" },
  actionTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111",
    marginBottom: 15,
    letterSpacing: -0.5,
  },
  subText: { fontSize: 16, color: "#666", lineHeight: 24, marginBottom: 30 },

  primaryButton: {
    backgroundColor: "#111",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  primaryButtonWide: {
    backgroundColor: "#111",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 25,
  },
  buttonText: { color: "#FFF", fontWeight: "600", fontSize: 15 },

  loadingSection: { alignItems: "center", paddingVertical: 40 },
  loaderBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 40,
  },
  loaderText: { color: "#666", fontWeight: "500" },

  downloadSection: { flexDirection: "row", gap: 50, flexWrap: "wrap" },
  downloadLeft: { flex: 1.2, minWidth: 300 },
  formatSelector: { flexDirection: "row", gap: 10, marginVertical: 10 },
  formatChip: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
  },
  activeFormat: { backgroundColor: "#111" },
  formatText: { fontSize: 13, fontWeight: "600", color: "#666" },

  textButton: { marginTop: 20, alignSelf: "center" },
  textButtonText: { color: "#999", fontWeight: "600", fontSize: 14 },

  feedbackForm: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  feedbackTitle: { fontSize: 18, fontWeight: "700", marginBottom: 20 },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#EEE",
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: "#FFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  secondaryButtonText: { fontWeight: "600", color: "#444" },
});
