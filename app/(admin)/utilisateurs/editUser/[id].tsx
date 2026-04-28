/* eslint-disable react/no-unescaped-entities */
import { db } from "@/configFirebase"; // Assure-toi que auth est exporté de ton configFirebase
import { Feather } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditUser() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // États
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Formulaire
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("client");
  const [status, setStatus] = useState("actif");

  // 1. Récupération des données
  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      try {
        const userDoc = await getDoc(doc(db, "users", id as string));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setName(data.fullName || data.name || "");
          setEmail(data.email || "");
          setRole(data.role || "client");
          setStatus(data.status || "actif");
        }
      } catch (e) {
        console.error("Erreur lors du chargement :", e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  // 2. Validation simple
  const validateForm = () => {
    if (!name.trim() || !email.trim()) {
      const msg = "Le nom et l'email sont obligatoires.";
      Platform.OS === "web" ? alert(msg) : Alert.alert("Erreur", msg);
      return false;
    }
    return true;
  };

  // 3. Mise à jour des données (Logique corrigée)
  const handleUpdate = async () => {
    if (!validateForm()) return;

    setUpdating(true);
    try {
      await updateDoc(doc(db, "users", id as string), {
        fullName: name, // On utilise fullName pour rester cohérent avec ton useEffect
        email: email.toLowerCase().trim(),
        role: role,
        status: status,
      });

      const successMsg = "Utilisateur mis à jour !";
      if (Platform.OS === "web") {
        alert(successMsg);
      } else {
        Alert.alert("Succès ✅", successMsg);
      }

      router.back();
    } catch (e: any) {
      console.error(e);
      const errorMsg = "Impossible de mettre à jour le profil.";
      Platform.OS === "web"
        ? alert(errorMsg)
        : Alert.alert("Erreur ❌", errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.modalContent}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title as TextStyle}>Édition</Text>
            <Text style={styles.subtitle as TextStyle}>
              Modifier les accès de l'utilisateur.
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="x" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* CHAMPS DE SAISIE */}
        <Text style={styles.inputLabel as TextStyle}>NOM COMPLET</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ex: Jean Dupont"
        />

        <Text style={styles.inputLabel as TextStyle}>ADRESSE EMAIL</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* SELECTEURS (PICKERS) */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.inputLabel as TextStyle}>RÔLE</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={role}
                onValueChange={(val) => setRole(val)}
                style={styles.picker}
              >
                <Picker.Item label="Admin" value="admin" />
                <Picker.Item label="Client" value="client" />
              </Picker>
            </View>
          </View>

          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.inputLabel as TextStyle}>STATUT</Text>
            <View style={styles.pickerContainer}>
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
        </View>

        {/* BOUTON DE SAUVEGARDE */}
        <TouchableOpacity
          style={[styles.updateButton, updating && { opacity: 0.7 }]}
          onPress={handleUpdate}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.updateButtonText as TextStyle}>
              Sauvegarder les modifications
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    width: Platform.OS === "web" ? 500 : "100%",
    borderRadius: 30,
    padding: 30,
    // Ombre pour le web et mobile
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  title: { fontSize: 28, fontWeight: "900", color: "#2563eb" },
  subtitle: { color: "#64748b", fontSize: 14, fontWeight: "600" },
  inputLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94a3b8",
    marginBottom: 8,
    marginTop: 20,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: "#f8fafc",
    height: 55,
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#1e293b",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  pickerContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    overflow: "hidden",
    height: 55,
    justifyContent: "center",
  },
  picker: {
    height: 55,
    width: "100%",
    color: "#1e293b",
  },
  updateButton: {
    backgroundColor: "#2563eb",
    height: 60,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  updateButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
