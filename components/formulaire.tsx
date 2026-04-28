/* eslint-disable react/no-unescaped-entities */
import { Feather } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert, // Zedna loading spinner
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// --- IMPORT FIREBASE HNA ---
// import { auth, db } from "./firebaseConfig";
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { doc, setDoc } from "firebase/firestore";

interface FormulaireProps {
  onSubmit?: (data: any) => void;
}

export default function Formulaire({ onSubmit }: FormulaireProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(""); // Champ jdid na9es
  const [role, setRole] = useState("client");
  const [status, setStatus] = useState("actif");
  const [loading, setLoading] = useState(false); // State lel loading

  const handleAddUser = async () => {
    if (!email || !password || !fullName) {
      Alert.alert("Erreur", "Veuillez remplir les champs obligatoires.");
      return;
    }

    setLoading(true);

    try {
      // 1. Création fi Firebase Authentication (HEDHI ELI NA9SA)
      // const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // const user = userCredential.user;

      // 2. Préparation mta3 el data kima fel image mta3 "Amine"
      const userData = {
        fullName: fullName,
        name: fullName.toLowerCase(),
        email: email,
        phoneNumber: phone,
        role: role,
        password: password, // Normalement ma n7otouch el password fi Firestore, hna bark pour test
        status: status,
        emailVerified: false,
        createdAt: new Date().toISOString(),
      };

      // 3. Enregistrement fi Firestore (bil UID mta3 el Auth)
      // await setDoc(doc(db, "users", user.uid), userData);

      console.log("Utilisateur ajouté avec succès:", userData);

      if (onSubmit) {
        onSubmit(userData);
      }

      Alert.alert("Succès", "Compte créé avec succès !");
    } catch (error: any) {
      console.error(error);
      Alert.alert("Erreur", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.card}>
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>C'est rapide et facile.</Text>

        {/* Nom Complet */}
        <Text style={styles.label}>Nom complet</Text>
        <View style={styles.inputContainer}>
          <Feather name="user" size={20} color="#94a3b8" style={styles.icon} />
          <TextInput
            placeholder="Jean Dupont"
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        {/* Adresse E-mail */}
        <Text style={styles.label}>Adresse e-mail</Text>
        <View style={styles.inputContainer}>
          <Feather name="mail" size={20} color="#94a3b8" style={styles.icon} />
          <TextInput
            placeholder="jean@exemple.com"
            style={styles.input}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Numéro de Téléphone (Jdid) */}
        <Text style={styles.label}>Numéro de téléphone</Text>
        <View style={styles.inputContainer}>
          <Feather name="phone" size={20} color="#94a3b8" style={styles.icon} />
          <TextInput
            placeholder="98 123 456"
            style={styles.input}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        {/* Rôle */}
        <Text style={styles.label}>Rôle souhaité</Text>
        <View style={styles.inputContainer}>
          <Feather name="users" size={20} color="#94a3b8" style={styles.icon} />
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={role}
              onValueChange={(val) => setRole(val)}
              style={styles.picker}
            >
              <Picker.Item label="Client" value="client" />
              <Picker.Item label="Admin" value="admin" />
            </Picker>
          </View>
        </View>

        {/* Statut */}
        <Text style={styles.label}>Statut</Text>
        <View style={styles.inputContainer}>
          <Feather
            name="activity"
            size={20}
            color="#94a3b8"
            style={styles.icon}
          />
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={status}
              onValueChange={(val) => setStatus(val)}
              style={styles.picker}
            >
              <Picker.Item label="Actif" value="actif" />
              <Picker.Item label="Inactif" value="inactif" />
            </Picker>
          </View>
        </View>

        {/* Mot de passe */}
        <Text style={styles.label}>Mot de passe</Text>
        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color="#94a3b8" style={styles.icon} />
          <TextInput
            placeholder="........"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Bouton S'inscrire */}
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleAddUser}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>S'inscrire</Text>
              <Feather
                name="arrow-right"
                size={20}
                color="#fff"
                style={{ marginLeft: 10 }}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ... Les styles yab9aw kima houma (sal7etlek bark el phone icon w loading)
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  card: {
    backgroundColor: "#fff",
    width: Platform.OS === "web" ? 480 : "100%",
    borderRadius: 30,
    padding: 30,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  title: { fontSize: 32, fontWeight: "800", color: "#0f172a", marginBottom: 8 },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 30,
    fontWeight: "500",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
    marginTop: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  icon: { marginRight: 12 },
  input: { flex: 1, color: "#1e293b", fontSize: 15, fontWeight: "500" },
  pickerWrapper: { flex: 1, height: 55, justifyContent: "center" },
  picker: { width: "100%", color: "#1e293b", backgroundColor: "transparent" },
  button: {
    backgroundColor: "#2563eb",
    flexDirection: "row",
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    shadowColor: "#2563eb",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
