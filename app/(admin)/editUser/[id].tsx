import { db } from "@/configFirebase";
import { Feather } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker"; // Import du Picker
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View
} from "react-native";

export default function EditUser() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("client"); // Valeur par défaut
  const [status, setStatus] = useState("actif"); // Valeur par défaut

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", id as string));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setName(data.fullName || "");
          setEmail(data.email || "");
          setRole(data.role || "client");
          setStatus(data.status || "actif");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  /*const handleUpdate = async () => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, "users", id as string), {
        name,
        email,
        role,
        status,
      });
      router.back();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };*/
  const handleSaveProfile = async () => {
    if (!validateProfile()) return;
    setSavingProfile(true);
  
    const currentUser = auth.currentUser;
  
    if (!currentUser || !currentUser.email) {
      Alert.alert("❌ Erreur", "Utilisateur non connecté.");
      setSavingProfile(false);
      return;
    }
  
    try {
      const emailChanged = profileForm.email.trim() !== currentUser.email.trim();
      // ── Si l'email a changé → ré-auth obligatoire ──
      if (emailChanged) {
        if (!profileForm.currentPassword) {
          setProfileErrors((e: any) => ({
            ...e,
            currentPassword: "Mot de passe requis pour changer l'email",
          }));
          setSavingProfile(false);
          return;
        }
  
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          profileForm.currentPassword
        );
        await reauthenticateWithCredential(currentUser, credential);
        await verifyBeforeUpdateEmail(currentUser, profileForm.email.trim());
        
      }
  
      // ── Mettre à jour Firestore ──
      await updateDoc(doc(db, "users", currentUser.uid), {
        fullName: profileForm.name,
        phoneNumber: profileForm.phone,
        ...(emailChanged && { email: profileForm.email.trim() }),
      });
  
      setProfileForm((p) => ({ ...p, currentPassword: "" }));
      setEditOpen(false);
  
      if (emailChanged) {
        Alert.alert(
          "📧 Vérification requise",
          `Un email de confirmation a été envoyé à ${profileForm.email}. Validez-le pour appliquer le changement.`
        );
      } else {
        Alert.alert("✅ Succès", "Profil mis à jour avec succès !");
      }
  
    } catch (error: any) {
      switch (error.code) {
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setProfileErrors((e: any) => ({
            ...e,
            currentPassword: "Mot de passe incorrect ❌",
          }));
          break;
        case "auth/email-already-in-use":
          setProfileErrors((e: any) => ({
            ...e,
            email: "Cet email est déjà utilisé",
          }));
          break;
        case "auth/requires-recent-login":
          Alert.alert("❌ Session expirée", "Veuillez vous reconnecter.");
          break;
        default:
          Alert.alert("❌ Erreur", error.message || "Une erreur est survenue.");
      }
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading)
    return (
      <ActivityIndicator style={{ flex: 1 }} size="large" color="#2563eb" />
    );

  return (
    <View style={styles.container}>
      <View style={styles.modalContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title as TextStyle}>Édition</Text>
            <Text style={styles.subtitle as TextStyle}>
              Informations du profil utilisateur.
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="x" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        <Text style={styles.inputLabel as TextStyle}>NOM COMPLET</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.inputLabel as TextStyle}>ADRESSE EMAIL</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} />

        <View style={styles.row}>
          {/* Liste pour le RÔLE */}
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.inputLabel as TextStyle}>RÔLE</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={role}
                onValueChange={(itemValue) => setRole(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Admin" value="admin" />
                <Picker.Item label="Client" value="client" />
              </Picker>
            </View>
          </View>

          {/* Liste pour le STATUT */}
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.inputLabel as TextStyle}>STATUT</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={status}
                onValueChange={(itemValue) => setStatus(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Actif" value="actif" />
                <Picker.Item label="Inactif" value="inactif" />
              </Picker>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleUpdate}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.updateButtonText as TextStyle}>
              Mettre à jour
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  title: { fontSize: 32, fontWeight: "900", color: "#2563eb" },
  subtitle: { color: "#64748b", fontSize: 16, fontWeight: "600" },
  inputLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#94a3b8",
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    backgroundColor: "#f8fafc",
    height: 60,
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  // Style pour encadrer le Picker comme tes Inputs
  pickerContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    overflow: "hidden", // Pour que l'arrondi fonctionne sur Android
    height: 60,
    justifyContent: "center",
  },
  picker: {
    height: 60,
    width: "100%",
    color: "#1e293b",
    fontWeight: "600",
  },
  updateButton: {
    backgroundColor: "#2563eb",
    height: 60,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  updateButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
