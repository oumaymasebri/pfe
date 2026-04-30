// app/auth/signin.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ImageBackground,
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
import { signInWithEmailAndPassword } from "firebase/auth";

// Redux
import { doc, getDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";

const SignInScreen = () => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Gestion des erreurs (bordure rouge + message)
  const [errors, setErrors] = useState({
    email: false,
    password: false,
  });
  useEffect(() => {
    const saveInfo = async () => {
      if (keepLoggedIn) {
        const jsonValue = JSON.stringify({
          email: email,
          password: password,
          keepLoggedIn: keepLoggedIn,
        });
        await AsyncStorage.setItem("keepLoggedIn", jsonValue);
      }
    };
    saveInfo();
  }, [email, keepLoggedIn, password]);
  useEffect(() => {
    const loadInfo = async () => {
      const jsonValue = await AsyncStorage.getItem("keepLoggedIn");
      const info = JSON.parse(jsonValue || "{}");
      setEmail(info?.email || "");
      setPassword(info?.password || "");
      setKeepLoggedIn(info?.keepLoggedIn || false);
    };
    loadInfo();
  }, []);

  const busImageUri =
    "https://www.brookings.edu/wp-content/uploads/2025/09/Bus-station-with-blue-buses.jpg?quality=75";

  // ====================== CONNEXION FIREBASE ======================
  const handleSignIn = async () => {
    // 1. Validation locale (bordure rouge)
    const newErrors = { email: false, password: false };
    let hasError = false;

    if (!email.trim() || !email.includes("@")) {
      newErrors.email = true;
      hasError = true;
    }
    if (!password.trim()) {
      newErrors.password = true;
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) {
      Alert.alert("Erreur", "Veuillez corriger les champs marqués en rouge");
      return;
    }

    try {
      setLoading(true);

      // Connexion avec Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );      
      await AsyncStorage.setItem(
        "userToken",
        userCredential._tokenResponse.idToken,
      );
      const profile = await getDoc(doc(db, "users", userCredential.user.uid));

      const user = userCredential.user;
      if (profile.exists()) {
        dispatch(
          setUser({
            user: {
              id: user.uid,
              email: user.email || email,
              phoneNumber: profile.data().phoneNumber || "",
              name: profile.data().fullName || email.split("@")[0],
              isAdmin: profile.data().role === "admin" ? true : false,
            },
            token: await user.getIdToken(),
          }),
        );

        alert("Connexion réussie ✅Bienvenue dans Smart Urban Bus !");
        if (profile.data().role === "admin") {
          router.replace("/(admin)/dashboard/dashboard");
        } else {
          router.replace("/(passenger)/home");
        }
      }
    } catch (error: any) {
      console.error(error);

      if (error.code === "auth/user-not-found") {
        Alert.alert(
          "Compte non trouvé",
          "Aucun compte n'existe avec cet email.\nVoulez-vous créer un nouveau compte ?",
          [
            { text: "Annuler", style: "cancel" },
            {
              text: "Créer un compte",
              onPress: () => router.push("/(auth)/signup"),
            },
          ],
        );
      } else if (error.code === "auth/wrong-password") {
        Alert.alert(
          "Mot de passe incorrect",
          "Le mot de passe que vous avez saisi est incorrect.",
        );
      } else if (error.code === "auth/invalid-email") {
        Alert.alert(
          "Email invalide",
          "Veuillez entrer une adresse email valide.",
        );
      } else {
        Alert.alert(
          "Erreur de connexion",
          "Une erreur est survenue. Veuillez réessayer.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert(
        "Attention",
        "Veuillez entrer votre email avant de continuer.",
      );
      return;
    }
    router.push("/(auth)/reset-password");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ImageBackground
        source={{ uri: busImageUri }}
        style={styles.headerImage}
        resizeMode="cover"
      >
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>U</Text>
          </View>
        </View>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={[styles.title, { marginTop: 25 }]}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Please enter your details to sign in
          </Text>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
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
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>Email invalide ou vide</Text>
            )}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <View style={styles.passwordHeader}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity
                onPress={handleForgotPassword}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>Forgot?</Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.inputWrapper,
                errors.password && styles.inputError,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="••••••••••"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password)
                    setErrors({ ...errors, password: false });
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
                Le mot de passe est obligatoire
              </Text>
            )}
          </View>

          {/* Keep me logged in */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setKeepLoggedIn(!keepLoggedIn)}
          >
            <View
              style={[styles.checkbox, keepLoggedIn && styles.checkboxChecked]}
            >
              {keepLoggedIn && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>Remember me</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[
              styles.signInButton,
              loading && styles.signInButtonDisabled,
            ]}
            onPress={handleSignIn}
            disabled={loading}
          >
            <Text style={styles.signInButtonText}>
              {loading ? "Connexion en cours..." : "Sign In →"}
            </Text>
          </TouchableOpacity>

          {/* Sign up link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Do not have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text style={styles.signupLink}>Sign up now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerImage: { height: 240 },
  logoContainer: { marginTop: 60, marginLeft: 24 },
  logo: {
    backgroundColor: "#6b46c1",
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: { color: "#fff", fontSize: 26, fontWeight: "bold" },

  scrollContent: { flexGrow: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 50,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -40,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 30 },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    padding: 5,
    marginBottom: 30,
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center", borderRadius: 10 },
  tabActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 4,
  },
  tabText: { fontSize: 16, color: "#666", fontWeight: "500" },
  tabTextActive: { color: "#6b46c1", fontWeight: "600" },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: "#444", marginBottom: 8, fontWeight: "500" },

  inputWrapper: {
    backgroundColor: "#f8f8f8",
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
    paddingVertical: 16,
    fontSize: 16,
    paddingRight: 50,
  },

  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  forgotText: {
    color: "#6b46c1",
    fontSize: 15,
    fontWeight: "600",
  },
  eyeIcon: { position: "absolute", right: 16, top: 16 },

  errorText: {
    color: "#ef4444",
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },

  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#999",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: { backgroundColor: "#6b46c1", borderColor: "#6b46c1" },
  checkmark: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  checkboxText: { marginLeft: 10, fontSize: 15, color: "#555" },

  signInButton: {
    backgroundColor: "#6b46c1",
    borderRadius: 12,
    paddingVertical: 17,
    alignItems: "center",
    marginBottom: 32,
  },
  signInButtonDisabled: { backgroundColor: "#a78bfa" },
  signInButtonText: { color: "#fff", fontSize: 18, fontWeight: "600" },

  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  signupText: { color: "#666", fontSize: 15.5 },
  signupLink: { color: "#6b46c1", fontWeight: "600", fontSize: 15.5 },
});

export default SignInScreen;
