import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";

export default function PricingModal() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      features: [
        "Free for one user",
        "2 landing page",
        "2 free domains",
        "No cloud storage",
        "Basic support",
      ],
    },
    {
      name: "Pro",
      price: "$30",
      features: [
        "Free for 10 users",
        "10 landing page",
        "10 free domains",
        "10GB cloud storage",
        "24/7 support",
      ],
      isPopular: true,
    },
    {
      name: "Premium",
      price: "$45",
      features: [
        "Unlimited users",
        "Unlimited landing page",
        "Unlimited free domains",
        "Unlimited cloud storage",
        "24/7 support",
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pricing</Text>
        <Text style={styles.subtitle}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc maximus
          nulla ut commodo sagittis.
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        {plans.map((plan, index) => (
          <View
            key={index}
            style={[styles.card, plan.isPopular && styles.popularCard]}
          >
            <View style={styles.planBadge}>
              <Text style={styles.badgeText}>{plan.name}</Text>
            </View>
            <Text style={styles.price}>
              {plan.price}
              <Text style={styles.month}>/month</Text>
            </Text>
            <Text style={styles.cardDesc}>
              Lorem ipsum dolor sit amet nulla nec ut adipiscing elit.
            </Text>
            <Pressable
              style={[
                styles.button,
                plan.isPopular ? styles.primaryButton : styles.secondaryButton,
              ]}
            >
              <Text
                style={[
                  //styles.buttonText,
                  plan.isPopular
                    ? styles.primaryButtonText
                    : styles.secondaryButtonText,
                ]}
              >
                Let's Started
              </Text>
            </Pressable>
            <View style={styles.featureList}>
              {plan.features.map((feature, idx) => (
                <Text key={idx} style={styles.featureItem}>
                  ✓ {feature}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Testimonials */}
      <View style={styles.testimonialsSection}>
        <Text style={styles.testimonialsTitle}>Testimonials</Text>
        <Text style={styles.subtitle}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </Text>
        <View style={styles.testimonialGrid}>
          {[
            {
              name: "Adam Smith",
              text: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc maximus nulla ut commodo sagittis"',
            },
            {
              name: "Clara Martin",
              text: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc maximus nulla ut commodo sagittis"',
            },
            {
              name: "Edward James",
              text: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc maximus nulla ut commodo sagittis"',
            },
          ].map((t, i) => (
            <View key={i} style={styles.testimonialCard}>
              <View style={styles.avatarPlaceholder} />
              <Text style={styles.quote}>{t.text}</Text>
              <Text style={styles.author}>{t.name}</Text>
              <Text style={styles.designation}>Designation</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { alignItems: "center", padding: 50 },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    maxWidth: 600,
    lineHeight: 24,
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 30,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#fff",
    width: 320,
    padding: 40,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#edf2f7",
  },
  popularCard: { backgroundColor: "#f7fafc", borderColor: "#e2e8f0" },
  planBadge: {
    backgroundColor: "#edf2f7",
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeText: { fontWeight: "bold", color: "#4a5568" },
  price: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2d3748",
  },
  month: { fontSize: 16, color: "#718096", fontWeight: "normal" },
  cardDesc: {
    textAlign: "center",
    color: "#718096",
    marginBottom: 30,
    lineHeight: 22,
    fontSize: 14,
  },
  button: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 30,
  },
  primaryButton: { backgroundColor: "#3182ce" },
  secondaryButton: { backgroundColor: "#edf2f7" },
  primaryButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  secondaryButtonText: { color: "#4a5568", fontWeight: "bold", fontSize: 16 },
  featureList: { alignSelf: "flex-start", width: "100%" },
  featureItem: { color: "#4a5568", marginBottom: 15, fontSize: 14 },
  testimonialsSection: {
    padding: 60,
    alignItems: "center",
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: "#e2e8f0",
  },
  testimonialsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2d3748",
  },
  testimonialGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 30,
    marginTop: 40,
  },
  testimonialCard: {
    width: 300,
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#edf2f7",
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#edf2f7",
    marginBottom: 20,
  },
  quote: { color: "#718096", marginBottom: 20, lineHeight: 22, fontSize: 14 },
  author: { fontWeight: "bold", color: "#2d3748", fontSize: 14 },
  designation: {
    color: "#a0aec0",
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
  },
});
