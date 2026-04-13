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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(".csv");

  // --- API CALLS ---

  // STEP 1: Upload Schema
  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (!result.canceled) {
        setIsLoading(true);
        const asset = result.assets[0];

        const formData = new FormData();

        // Handle web vs mobile file uploads
        if (Platform.OS === "web" && asset.file) {
          formData.append("file", asset.file);
        } else {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          formData.append("file", blob, asset.name);
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

  // STEP 2: Generate Data
  const handleGenerate = async () => {
    if (!sessionId) return;
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/generate-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          rows_per_table: 100, // Default rows, can be made dynamic later
        }),
      });

      if (res.ok) {
        setStep(3);
      } else {
        const errorData = await res.json();
        alert("Generation failed: " + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error("Generate error:", error);
      alert("Error generating data.");
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 3: Download
  const handleDownload = () => {
    if (!sessionId) return;

    let endpoint = "";
    if (selectedFormat === ".csv") endpoint = "/download/csv";
    if (selectedFormat === ".sql") endpoint = "/download/sql";
    if (selectedFormat === ".json") {
      alert("JSON download endpoint pending in backend!");
      return;
    }

    const downloadUrl = `${API_BASE_URL}${endpoint}?session_id=${sessionId}`;

    // Trigger download in browser
    if (Platform.OS === "web") {
      window.open(downloadUrl, "_blank");
    } else {
      // Mobile fallback logic would go here
    }
  };

  // Reset function
  const handleReset = () => {
    setSessionId(null);
    setStep(1);
  };

  // --- UI RENDER ---

  return (
    <ScrollView style={styles.container}>
      <View style={styles.navBar}>
        <Pressable onPress={() => router.push("/")}>
          <Text style={styles.navLink}>Home</Text>
        </Pressable>
        <Text style={styles.navLink}>About us</Text>
        <Text style={styles.navLinkActive}>Generate</Text>
        <Pressable onPress={() => router.push("/modal")}>
          <Text style={styles.navLink}>Pricing</Text>
        </Pressable>
      </View>

      <View style={styles.contentContainer}>
        {/* Progress Stepper */}
        <View style={styles.stepperContainer}>
          {[
            { id: 1, title: "Step 1", desc: "Upload a file" },
            { id: 2, title: "Step 2", desc: "Wait for generation" },
            { id: 3, title: "Step 3", desc: "Download your dataset" },
          ].map((s, index) => (
            <React.Fragment key={s.id}>
              <View style={styles.stepBox}>
                <View
                  style={[
                    styles.circle,
                    step >= s.id ? styles.activeCircle : styles.inactiveCircle,
                  ]}
                >
                  <Text style={styles.circleText}>{s.id}</Text>
                </View>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
              {index < 2 && <View style={styles.stepLine} />}
            </React.Fragment>
          ))}
        </View>

        {/* Dynamic Content Area */}
        <View style={styles.card}>
          {step === 1 && (
            <View style={styles.uploadSection}>
              <Pressable style={styles.dropZone} onPress={handleFileUpload}>
                <Text style={styles.uploadIcon}>↑_</Text>
                <Text style={styles.dropZoneText}>
                  {isLoading ? "Uploading..." : "Click to upload .sql schema"}
                </Text>
              </Pressable>
              <View style={styles.actionArea}>
                <Text style={styles.actionTitle}>Upload your file here</Text>
                <Text style={styles.subText}>
                  Syngen will parse your DDL and detect relationships
                  automatically.
                </Text>
                <View style={{ flexDirection: "row", gap: 15, marginTop: 20 }}>
                  <Pressable
                    style={[
                      styles.primaryButton,
                      isLoading && { opacity: 0.7 },
                    ]}
                    onPress={handleFileUpload}
                    disabled={isLoading}
                  >
                    <Text style={styles.buttonText}>
                      {isLoading ? "Processing..." : "Upload Schema →"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.loadingSection}>
              <Text style={styles.actionTitle}>Ready to Generate Data</Text>
              <Text style={styles.subText}>
                Schema parsed successfully. Session ID: {sessionId}
              </Text>

              {isLoading ? (
                <ActivityIndicator
                  size="large"
                  color="#3182ce"
                  style={{ marginTop: 30 }}
                />
              ) : (
                <Pressable
                  style={[styles.primaryButton, { marginTop: 30 }]}
                  onPress={handleGenerate}
                >
                  <Text style={styles.buttonText}>Start Generation Engine</Text>
                </Pressable>
              )}
            </View>
          )}

          {step === 3 && (
            <View style={styles.downloadSection}>
              <View style={styles.downloadLeft}>
                <Text style={styles.actionTitle}>
                  Thank you for using Syngen
                </Text>
                <Text style={styles.subText}>
                  Your mathematically sound synthetic data is ready.
                </Text>

                <Pressable
                  style={[
                    styles.primaryButton,
                    { width: "100%", alignItems: "center", marginTop: 20 },
                  ]}
                  onPress={handleDownload}
                >
                  <Text style={styles.buttonText}>↓ Download</Text>
                </Pressable>

                <View style={styles.formatSelector}>
                  <Text style={styles.formatLabel}>Choose format:</Text>
                  {[".csv", ".sql", ".json"].map((fmt) => (
                    <Pressable key={fmt} onPress={() => setSelectedFormat(fmt)}>
                      <Text
                        style={[
                          styles.formatChip,
                          selectedFormat === fmt && styles.activeFormat,
                        ]}
                      >
                        {fmt}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Pressable
                  style={styles.generateAgainButton}
                  onPress={handleReset}
                >
                  <Text style={styles.generateAgainText}>↻ Generate again</Text>
                </Pressable>
              </View>

              <View style={styles.feedbackForm}>
                <Text style={styles.feedbackTitle}>Feedback</Text>
                <View style={{ flexDirection: "row", gap: 15 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Name</Text>
                    <TextInput style={styles.input} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput style={styles.input} />
                  </View>
                </View>
                <Text style={styles.inputLabel}>Message</Text>
                <TextInput
                  multiline
                  numberOfLines={4}
                  style={[styles.input, { height: 100 }]}
                />
                <Pressable style={styles.primaryButton} onPress={handleReset}>
                  <Text style={styles.buttonText}>Submit</Text>
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
  contentContainer: { padding: 60, alignItems: "center" },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    width: "100%",
    maxWidth: 900,
    marginBottom: 50,
  },
  stepBox: { alignItems: "center", width: 150 },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  activeCircle: { backgroundColor: "#1a202c" },
  inactiveCircle: { backgroundColor: "#e2e8f0" },
  circleText: { fontWeight: "bold", color: "#fff", fontSize: 18 },
  stepTitle: { fontSize: 18, fontWeight: "bold", color: "#2d3748" },
  stepDesc: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
    marginTop: 4,
  },
  stepLine: {
    height: 2,
    flex: 1,
    backgroundColor: "#cbd5e0",
    marginTop: 25,
    marginHorizontal: -20,
  },
  card: {
    width: "100%",
    maxWidth: 1000,
    padding: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  uploadSection: {
    flexDirection: "row",
    gap: 50,
    alignItems: "center",
    flexWrap: "wrap",
  },
  dropZone: {
    flex: 1,
    minWidth: 300,
    height: 250,
    borderWidth: 1,
    borderColor: "#cbd5e0",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    cursor: "pointer",
  },
  uploadIcon: { fontSize: 60, color: "#4a5568", marginBottom: 10 },
  dropZoneText: { fontSize: 18, color: "#2d3748" },
  actionArea: { flex: 1, minWidth: 300 },
  actionTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2d3748",
  },
  subText: { color: "#718096", lineHeight: 22 },
  primaryButton: {
    backgroundColor: "#3182ce",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  secondaryButton: {
    backgroundColor: "#edf2f7",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  secondaryButtonText: { color: "#4a5568", fontWeight: "bold", fontSize: 16 },
  loadingSection: { alignItems: "center", paddingVertical: 60 },
  downloadSection: { flexDirection: "row", gap: 50, flexWrap: "wrap" },
  downloadLeft: { flex: 1, minWidth: 300, justifyContent: "center" },
  formatSelector: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: 10,
  },
  formatLabel: { fontWeight: "bold", color: "#2d3748" },
  formatChip: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: "#edf2f7",
    borderRadius: 4,
    color: "#4a5568",
  },
  activeFormat: { backgroundColor: "#3182ce", color: "#fff" },
  feedbackForm: {
    flex: 1,
    minWidth: 350,
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2d3748",
  },
  inputLabel: { fontSize: 12, color: "#718096", marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e0",
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
    outlineStyle: "solid",
  },
  generateAgainButton: {
    marginTop: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#edf2f7",
    borderRadius: 4,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#cbd5e0",
  },
  generateAgainText: { color: "#4a5568", fontWeight: "bold", fontSize: 14 },
});
