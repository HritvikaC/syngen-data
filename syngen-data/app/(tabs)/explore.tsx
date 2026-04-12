import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import { router } from "expo-router";

export default function ExploreScreen() {
  const [step, setStep] = useState(1);

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
              <View style={styles.dropZone}>
                <Text style={styles.uploadIcon}>↑</Text>
                <Text style={styles.dropZoneText}>
                  Upload or select from device files
                </Text>
              </View>
              <View style={styles.actionArea}>
                <Text style={styles.actionTitle}>Upload your file here</Text>
                <Text style={styles.subText}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
                  maximus, nulla ut commodo sagittis.
                </Text>
                <View style={{ flexDirection: "row", gap: 15, marginTop: 20 }}>
                  <Pressable
                    style={styles.primaryButton}
                    onPress={() => setStep(2)}
                  >
                    <Text style={styles.buttonText}>Generate my dataset →</Text>
                  </Pressable>
                  <Pressable style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>Learn more</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.loadingSection}>
              <Text style={styles.actionTitle}>
                Processing DDL & Generating Data...
              </Text>
              <Pressable
                style={[styles.primaryButton, { marginTop: 30 }]}
                onPress={() => setStep(3)}
              >
                <Text style={styles.buttonText}>Simulate Completion</Text>
              </Pressable>
            </View>
          )}

          {step === 3 && (
            <View style={styles.downloadSection}>
              <View style={styles.downloadLeft}>
                <Text style={styles.actionTitle}>
                  Thank you for using Syngen
                </Text>
                <Text style={styles.subText}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
                  maximus, nulla ut commodo.
                </Text>
                <Pressable
                  style={[
                    styles.primaryButton,
                    { width: "100%", alignItems: "center", marginTop: 20 },
                  ]}
                >
                  <Text style={styles.buttonText}>↓ Download</Text>
                </Pressable>
                <View style={styles.formatSelector}>
                  <Text style={styles.formatLabel}>Choose format:</Text>
                  <Text style={styles.formatChip}>.csv</Text>
                  <Text style={[styles.formatChip, styles.activeFormat]}>
                    .db
                  </Text>
                  <Text style={styles.formatChip}>.mdf</Text>
                </View>
                <Pressable
                  style={styles.generateAgainButton}
                  onPress={() => setStep(1)}
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
                    <Text style={styles.inputLabel}>Phone</Text>
                    <TextInput style={styles.input} />
                  </View>
                </View>
                <Text style={styles.inputLabel}>Message</Text>
                <TextInput
                  multiline
                  numberOfLines={4}
                  style={[styles.input, { height: 100 }]}
                />
                <Pressable
                  style={styles.primaryButton}
                  onPress={() => setStep(1)}
                >
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
  generateAgainText: {
    color: "#4a5568",
    fontWeight: "bold",
    fontSize: 14,
  },
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
});
