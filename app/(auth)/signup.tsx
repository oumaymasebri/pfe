// app/(auth)/signup.tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Firebase
import { auth, db } from "@/configFirebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// Redux
import { setLoadingFalse, setLoadingTrue } from "@/redux/slices/loadingSlice";
import type { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";

const SignUpScreen = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States pour les erreurs de validation
  const [errors, setErrors] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const dispatch = useDispatch();
  const isLoading = useSelector((state: RootState) => state.loading.isLoading);

  // Fonction de validation et inscription
  const onSubmit = async () => {
    // Reset des erreurs
    const newErrors = {
      fullName: false,
      email: false,
      password: false,
      confirmPassword: false,
    };

    let hasError = false;

    if (!fullName.trim()) {
      newErrors.fullName = true;
      hasError = true;
    }

    if (!email.trim()) {
      newErrors.email = true;
      hasError = true;
    } else if (!email.includes("@") || !email.includes(".")) {
      newErrors.email = true;
      hasError = true;
    }

    if (!password) {
      newErrors.password = true;
      hasError = true;
    } else if (password.length < 6) {
      newErrors.password = true;
      hasError = true;
    }

    if (!confirmPassword || password !== confirmPassword) {
      newErrors.confirmPassword = true;
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) {
      Alert.alert(
        "Erreur de validation",
        "Veuillez corriger les champs marqués en rouge",
      );
      return;
    }

    if (!agreeTerms) {
      Alert.alert("Erreur", "Vous devez accepter les conditions d'utilisation");
      return;
    }

    // ====================== INSCRIPTION FIREBASE ======================
    try {
      dispatch(setLoadingTrue());

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      await sendEmailVerification(user);

      await setDoc(doc(db, "users", user.uid), {
        fullName: fullName.trim(),
        createdAt: new Date().toISOString(),
        emailVerified: false,
        role: "client",
      });

      Alert.alert(
        "Inscription réussie ✓",
        "Un email de vérification a été envoyé.\nVeuillez vérifier votre boîte mail.",
      );

      router.replace("/(auth)/signin");
    } catch (error: any) {
      console.error("Erreur d'inscription :", error);

      let message = "Une erreur est survenue. Veuillez réessayer.";

      if (error.code === "auth/email-already-in-use")
        message = "Cet email est déjà utilisé.";
      else if (error.code === "auth/invalid-email")
        message = "Adresse email invalide.";
      else if (error.code === "auth/weak-password")
        message = "Le mot de passe est trop faible.";

      Alert.alert("Échec de l'inscription", message);
    } finally {
      dispatch(setLoadingFalse());
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          <View style={styles.busIcon}>
            <Text style={styles.busIconText}>🚌</Text>
          </View>
        </View>

        <Text style={styles.title}>Join Smart Urban Bus</Text>
        <Text style={styles.subtitle}>
          Sign up to start planning your journeys efficiently with real-time
          transit data.
        </Text>

        {/* Full Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View
            style={[styles.inputWrapper, errors.fullName && styles.inputError]}
          >
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (errors.fullName) setErrors({ ...errors, fullName: false });
              }}
            />
          </View>
          {errors.fullName && (
            <Text style={styles.errorText}>Le nom est obligatoire</Text>
          )}
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <View
            style={[styles.inputWrapper, errors.email && styles.inputError]}
          >
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: false });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {errors.email && (
            <Text style={styles.errorText}>Email invalide ou vide</Text>
          )}
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View
            style={[styles.inputWrapper, errors.password && styles.inputError]}
          >
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: false });
              }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.errorText}>
              Le mot de passe doit contenir au moins 6 caractères
            </Text>
          )}
        </View>

        {/* Confirm Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <View
            style={[
              styles.inputWrapper,
              errors.confirmPassword && styles.inputError,
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Repeat your password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword)
                  setErrors({ ...errors, confirmPassword: false });
              }}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={styles.errorText}>
              Les mots de passe ne correspondent pas
            </Text>
          )}
        </View>

        {/* Terms */}
        <TouchableOpacity
          style={styles.termsContainer}
          onPress={() => setAgreeTerms(!agreeTerms)}
        >
          <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
            {agreeTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.termsText}>
            I agree to the <Text style={styles.linkText}>Terms of Service</Text>{" "}
            and <Text style={styles.linkText}>Privacy Policy</Text>.
          </Text>
        </TouchableOpacity>

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[styles.signUpButton, isLoading && { opacity: 0.7 }]}
          onPress={onSubmit}
          disabled={isLoading}
        >
          <Text style={styles.signUpButtonText}>
            {isLoading ? "Création du compte..." : "Sign Up"}
          </Text>
        </TouchableOpacity>

        {/* OR SIGN UP WITH */}
        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR SIGN UP WITH</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialText}>G Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialText}> Apple</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/signin")}>
            <Text style={styles.loginLink}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  scrollContent: { padding: 24, paddingTop: 10 },

  backButton: { marginBottom: 20 },
  backIcon: { fontSize: 28, color: "#333" },

  iconContainer: { alignItems: "center", marginBottom: 16 },
  busIcon: {
    width: 64,
    height: 64,
    backgroundColor: "#e0e7ff",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  busIconText: { fontSize: 32 },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: "#444", marginBottom: 8, fontWeight: "500" },

  inputWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    position: "relative",
  },

  inputError: {
    borderColor: "#ef4444",
    borderWidth: 2,
  },

  input: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    paddingRight: 50,
  },

  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 15,
  },

  errorText: {
    color: "#ef4444",
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },

  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#999",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: { backgroundColor: "#6b46c1", borderColor: "#6b46c1" },
  checkmark: { color: "#fff", fontSize: 14 },
  termsText: { flex: 1, fontSize: 14, color: "#555", lineHeight: 20 },
  linkText: { color: "#6b46c1", fontWeight: "500" },

  signUpButton: {
    backgroundColor: "#6b46c1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },
  signUpButtonText: { color: "#fff", fontSize: 18, fontWeight: "600" },

  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },
  line: { flex: 1, height: 1, backgroundColor: "#ddd" },
  orText: { marginHorizontal: 15, color: "#888", fontSize: 13 },

  socialButtons: { flexDirection: "row", gap: 12, marginBottom: 30 },
  socialButton: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    alignItems: "center",
  },
  socialText: { fontSize: 16, fontWeight: "500" },

  loginContainer: { flexDirection: "row", justifyContent: "center" },
  loginText: { color: "#666", fontSize: 15 },
  loginLink: { color: "#6b46c1", fontWeight: "600", fontSize: 15 },
});

export default SignUpScreen;
