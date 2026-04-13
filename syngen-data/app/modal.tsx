import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";

export default function PricingModal() {
  const plans = [
    {
      name: "Sandbox",
      price: "$0",
      desc: "For individual developers testing local schemas.",
      features: [
        "1 active session",
        "Up to 5 tables",
        "Standard DDL parsing",
        "CSV export only",
      ],
    },
    {
      name: "Professional",
      price: "$30",
      desc: "For teams building privacy-first applications.",
      features: [
        "Unlimited sessions",
        "Unlimited tables",
        "LLM-driven constraints",
        "SQL & JSON exports",
        "24/7 Priority support",
      ],
      isPopular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "Isolated infrastructure for high-security data.",
      features: [
        "On-premise deployment",
        "Custom PII masking",
        "Direct DB streaming",
        "Dedicated engineer",
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Refined Header */}
      <View style={styles.header}>
        <View style={styles.pillTag}>
          <Text style={styles.pillText}>PLANS & BILLING</Text>
        </View>
        <Text style={styles.title}>Scale your synthesis.</Text>
        <Text style={styles.subtitle}>
          Choose the right volume for your development workflow. All plans
          include our core privacy-preserving engine.
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        {plans.map((plan, index) => (
          <View
            key={index}
            style={[styles.card, plan.isPopular && styles.popularCard]}
          >
            {plan.isPopular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
              </View>
            )}

            <Text style={styles.planName}>{plan.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={[styles.price, plan.isPopular && { color: "#FFF" }]}>
                {plan.price}
              </Text>
              {plan.price !== "Custom" && <Text style={styles.month}>/mo</Text>}
            </View>

            <Text
              style={[styles.cardDesc, plan.isPopular && { color: "#AAA" }]}
            >
              {plan.desc}
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
                {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
              </Text>
            </Pressable>

            <View style={styles.featureList}>
              {plan.features.map((feature, idx) => (
                <View key={idx} style={styles.featureRow}>
                  <Text
                    style={[
                      styles.check,
                      plan.isPopular && { color: "#27C93F" },
                    ]}
                  >
                    ✓
                  </Text>
                  <Text
                    style={[
                      styles.featureItem,
                      plan.isPopular && { color: "#DDD" },
                    ]}
                  >
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Testimonials - Creative Minimalist Style */}
      <View style={styles.testimonialsSection}>
        <Text style={styles.testimonialsTitle}>Trusted by Architects</Text>
        <View style={styles.testimonialGrid}>
          {[
            {
              name: "Adam Smith",
              text: "Syngen cut our staging environment setup time by 60%.",
            },
            {
              name: "Clara Martin",
              text: "Finally, synthetic data that actually respects foreign key logic.",
            },
          ].map((t, i) => (
            <View key={i} style={styles.testimonialCard}>
              <Text style={styles.quote}>{t.text}</Text>
              <View style={styles.authorRow}>
                <View style={styles.smallAvatar} />
                <Text style={styles.author}>{t.name}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: { alignItems: "center", paddingVertical: 80, paddingHorizontal: 20 },
  pillTag: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 15,
  },
  pillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#666",
    letterSpacing: 1,
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: "#111",
    letterSpacing: -1,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    maxWidth: 500,
    marginTop: 15,
    lineHeight: 24,
  },

  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 24,
    paddingBottom: 60,
  },
  card: {
    backgroundColor: "#FFF",
    width: 340,
    padding: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#EEE",
    position: "relative",
    overflow: "hidden",
  },
  popularCard: {
    backgroundColor: "#111",
    borderColor: "#111",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },

  popularBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#3182ce",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderBottomLeftRadius: 15,
  },
  popularBadgeText: { color: "#FFF", fontSize: 10, fontWeight: "900" },

  planName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#666",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 15,
  },
  price: { fontSize: 48, fontWeight: "800", color: "#111", letterSpacing: -2 },
  month: { fontSize: 18, color: "#999", marginLeft: 4 },
  cardDesc: {
    color: "#666",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 30,
    height: 44,
  },

  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 35,
  },
  primaryButton: { backgroundColor: "#FFF" },
  secondaryButton: { backgroundColor: "#111" },
  primaryButtonText: { color: "#111", fontWeight: "700" },
  secondaryButtonText: { color: "#FFF", fontWeight: "700" },

  featureList: { gap: 16 },
  featureRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  check: { color: "#3182ce", fontWeight: "900" },
  featureItem: { color: "#444", fontSize: 14, fontWeight: "500" },

  testimonialsSection: {
    padding: 80,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
  },
  testimonialsTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 40,
    letterSpacing: -0.5,
  },
  testimonialGrid: {
    flexDirection: "row",
    gap: 20,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  testimonialCard: {
    width: 340,
    backgroundColor: "#FFF",
    padding: 30,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  quote: {
    fontSize: 15,
    color: "#444",
    fontStyle: "italic",
    lineHeight: 24,
    marginBottom: 20,
  },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  smallAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EEE",
  },
  author: { fontWeight: "700", fontSize: 14, color: "#111" },
});
