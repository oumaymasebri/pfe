import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router"; // 1. Import el router
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function WelcomePage() {
  const router = useRouter(); // 2. Initialisation mte3 el router

  return (
    <View style={styles.container}>
      {/* Section Illustration */}
      <View style={styles.imageContainer}>
        <LinearGradient
          colors={["#d1a3f2", "#cdc9d3"]}
          style={styles.circleDecor}
        />
        <View style={styles.iconCircle}>
          <Feather name="truck" size={60} color="#fff" />
        </View>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>Smart Bus</Text>
        <Text style={styles.subtitle}>
          Voyagez intelligemment. Suivez votre bus en temps réel et simplifiez
          vos trajets quotidiens.
        </Text>
      </View>

      {/* Section Boutons avec Navigation */}
      <View style={styles.buttonContainer}>
        {/* BOUTON SIGN IN */}
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => router.push("../signin")} // 3. Ihez lel page signin
        >
          <Text style={styles.signInText}>Se connecter</Text>
          <Feather name="arrow-right" size={20} color="#fff" />
        </TouchableOpacity>

        {/* BOUTON SIGN UP */}
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => router.push("../signup")} // 4. Ihez lel page signup
        >
          <Text style={styles.signUpText}>Créer un compte</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>Version 1.0.0 • © 2024 Smart Bus</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 50,
  },
  imageContainer: {
    height: height * 0.4,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  circleDecor: {
    position: "absolute",
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: (width * 1.2) / 2,
    top: -width * 0.5,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  textContainer: { paddingHorizontal: 40, alignItems: "center" },
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "#05080d",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
  },
  buttonContainer: { width: "100%", paddingHorizontal: 30, gap: 15 },
  signInButton: {
    backgroundColor: "#8348a9",
    height: 65,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  signInText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  signUpButton: {
    height: 65,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#f1f5f9",
    backgroundColor: "#f8fafc",
  },
  signUpText: { color: "#1e293b", fontSize: 18, fontWeight: "700" },
  footerText: { color: "#94a3b8", fontSize: 12 },
});
