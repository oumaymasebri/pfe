/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-expressions */
// app/(admin)/utilisateurs.tsx
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

// Firebase
import Formulaire from "@/components/formulaire";
import { auth, db } from "@/configFirebase";
import { Picker } from "@react-native-picker/picker";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { deleteUser } from "@/redux/actions/deleteUser";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  arrivalDate: string;
}

const isWeb = Platform.OS === "web";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getRoleColors(role: string) {
  const isAdmin = role.toLowerCase() === "admin";
  return {
    bg: isAdmin ? "#EDE9FE" : "#DBEAFE",
    text: isAdmin ? "#5B21B6" : "#1D4ED8",
    dot: isAdmin ? "#7C3AED" : "#2563EB",
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function UserManagement() {
  const navigation = useNavigation();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addUserModal, setAddUserModal] = useState(false);
  const [editUserModal, setEditUserModal] = useState(false);

  const [updating, setUpdating] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("client");
  const [status, setStatus] = useState("actif");

  // ── Fetch list ──────────────────────────────────────────────────────────

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usersList.push({
          id: doc.id,
          name: data.fullName || "Utilisateur",
          email: data.email || "",
          role: data.role || "Éditeur",
          arrivalDate: data.createdAt || "2024-01-15",
        });
      });
      setUsers(usersList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ── Delete ──────────────────────────────────────────────────────────────

  const handleDelete = async (id: string, name: string) => {
    if (isWeb && !window.confirm(`Supprimer ${name} ?`)) return;
    try {
      
      await deleteDoc(doc(db, "users", id));
      await deleteUser(id)
      setUsers(users.filter((u) => u.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  // ── Add ─────────────────────────────────────────────────────────────────

  const handleAddUser = async (data: any) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber || "",
        role: data.role,
        status: data.status,
        createdAt: new Date().toISOString(),
      });

      if (Platform.OS === "web") {
        alert("Utilisateur ajouté avec succès !");
      } else {
        Alert.alert("Succès", "Utilisateur ajouté !");
      }
      setAddUserModal(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Erreur lors de l'ajout :", error);
      let errorMessage = "Une erreur est survenue.";
      if (error.code === "auth/email-already-in-use")
        errorMessage = "Cet email est déjà utilisé.";
      if (error.code === "auth/weak-password")
        errorMessage = "Le mot de passe est trop faible.";
      alert(errorMessage);
    }
  };

  // ── Fetch single user for edit ──────────────────────────────────────────

  const fetchUser = async (id: string) => {
    if (!id) return;
    try {
      const userDoc = await getDoc(doc(db, "users", id));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setName(data.fullName || data.name || "");
        setEmail(data.email || "");
        setRole(data.role || "client");
        setStatus(data.status || "actif");
        setSelectedUserId(id);
      }
    } catch (e) {
      console.error("Erreur lors du chargement :", e);
    }
  };

  // ── Update ──────────────────────────────────────────────────────────────

  const validateForm = () => {
    if (!name.trim() || !email.trim()) {
      const msg = "Le nom et l'email sont obligatoires.";
      Platform.OS === "web" ? alert(msg) : Alert.alert("Erreur", msg);
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm() || !selectedUserId) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, "users", selectedUserId), {
        fullName: name,
        email: email.toLowerCase().trim(),
        role,
        status,
      });
      if (Platform.OS === "web") {
        alert("Utilisateur mis à jour !");
      } else {
        Alert.alert("Succès ✅", "Utilisateur mis à jour !");
      }
      setEditUserModal(false);
      fetchUsers();
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

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <ScrollView style={styles.container as ViewStyle}>
      {/* Top bar */}
      <View style={styles.topBar as ViewStyle}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Feather name="menu" size={28} color="#0f172a" />
        </TouchableOpacity>
      </View>

      {/* Header */}
      <View style={styles.header as ViewStyle}>
        <View>
          <Text style={styles.title as TextStyle}>Gestion Utilisateurs</Text>
          <Text style={styles.subtitle as TextStyle}>
            Gérez les accès et les profils de votre plateforme.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton as any}
          onPress={() => setAddUserModal(true)}
        >
          <Feather name="user-plus" size={18} color="#fff" />
          <Text style={styles.addButtonText as TextStyle}>Nouveau</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer as ViewStyle}>
        <Feather name="search" size={20} color="#94a3b8" />
        <TextInput
          placeholder="Chercher un nom, un email..."
          style={styles.searchInput as any}
          onChangeText={setSearch}
        />
      </View>

      {/* Users grid */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2563eb"
          style={{ marginTop: 50 }}
        />
      ) : (
        <View style={styles.grid as ViewStyle}>
          {users
            .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
            .map((user) => {
              const roleColors = getRoleColors(user.role);
              return (
                <View key={user.id} style={styles.card as ViewStyle}>
                  <View style={styles.cardHeader as ViewStyle}>
                    <View style={styles.avatarPlaceholder as ViewStyle}>
                      <Feather name="user" size={24} color="#94a3b8" />
                    </View>
                    <View>
                      <Text style={styles.userName as TextStyle}>
                        {user.name}
                      </Text>
                      <Text style={styles.userEmail as TextStyle}>
                        {user.email}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.roleContainer as ViewStyle}>
                    <View>
                      <Text style={styles.label as TextStyle}>RÔLE</Text>
                      <View style={styles.roleBadge as ViewStyle}>
                        <View
                          style={
                            [
                              styles.dot,
                              { backgroundColor: roleColors.dot },
                            ] as any
                          }
                        />
                        <Text
                          style={
                            [styles.roleText, { color: roleColors.text }] as any
                          }
                        >
                          {user.role}
                        </Text>
                      </View>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.label as TextStyle}>ARRIVÉE</Text>
                      <Text style={styles.dateText as TextStyle}>
                        {user.arrivalDate}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardActions as ViewStyle}>
                    <TouchableOpacity
                      style={styles.editButton as any}
                      onPress={() => {
                        fetchUser(user.id);
                        setEditUserModal(true);
                      }}
                    >
                      <Feather name="edit-2" size={16} color="#334155" />
                      <Text style={styles.editButtonText as TextStyle}>
                        Modifier
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton as any}
                      onPress={() => handleDelete(user.id, user.name)}
                    >
                      <Feather name="trash-2" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
        </View>
      )}

      {/* ── MODAL: Ajouter un utilisateur ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addUserModal}
        onRequestClose={() => setAddUserModal(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.sheet}>
            {/* Handle */}
            <View style={modalStyles.handle} />

            {/* Header */}
            <View style={modalStyles.sheetHeader}>
              <View>
                <Text style={modalStyles.sheetTitle}>Nouveau utilisateur</Text>
                <Text style={modalStyles.sheetSubtitle}>
                  Remplissez les informations ci-dessous
                </Text>
              </View>
              <Pressable
                style={modalStyles.closeBtn}
                onPress={() => setAddUserModal(false)}
              >
                <MaterialIcons name="close" size={18} color="#64748b" />
              </Pressable>
            </View>

            {/* Body */}
            <View style={modalStyles.sheetBody}>
              <Formulaire onSubmit={handleAddUser} />
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL: Modifier un utilisateur ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editUserModal}
        onRequestClose={() => setEditUserModal(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.sheet, { paddingBottom: 32 }]}>
            {/* Handle */}
            <View style={modalStyles.handle} />

            {/* Header */}
            <View style={modalStyles.sheetHeader}>
              <View>
                <Text style={modalStyles.sheetTitle}>
                  Modifier l'utilisateur
                </Text>
                <Text style={modalStyles.sheetSubtitle}>
                  Mettre à jour les accès et le profil
                </Text>
              </View>
              <Pressable
                style={modalStyles.closeBtn}
                onPress={() => setEditUserModal(false)}
              >
                <MaterialIcons name="close" size={18} color="#64748b" />
              </Pressable>
            </View>

            {/* User recap card */}
            {name ? (
              <View style={modalStyles.userCard}>
                <View style={modalStyles.avatarCircle}>
                  <Text style={modalStyles.avatarText}>
                    {getInitials(name)}
                  </Text>
                </View>
                <View>
                  <Text style={modalStyles.userCardName}>{name}</Text>
                  <Text style={modalStyles.userCardEmail}>{email}</Text>
                </View>
              </View>
            ) : null}

            {/* Divider */}
            <View style={modalStyles.divider} />

            {/* Form */}
            <View style={modalStyles.sheetBody}>
              {/* Nom */}
              <View style={modalStyles.fieldGroup}>
                <Text style={modalStyles.fieldLabel}>NOM COMPLET</Text>
                <TextInput
                  style={modalStyles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex: Jean Dupont"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              {/* Pickers row */}
              <View style={modalStyles.row}>
                <View style={[modalStyles.fieldGroup, { flex: 1 }]}>
                  <Text style={modalStyles.fieldLabel}>RÔLE</Text>
                  <View style={modalStyles.pickerWrap}>
                    <Picker
                      selectedValue={role}
                      onValueChange={(val) => setRole(val)}
                      style={modalStyles.picker}
                    >
                      <Picker.Item label="Admin" value="admin" />
                      <Picker.Item label="Client" value="client" />
                    </Picker>
                  </View>
                </View>

                <View style={[modalStyles.fieldGroup, { flex: 1 }]}>
                  <Text style={modalStyles.fieldLabel}>STATUT</Text>
                  <View style={modalStyles.pickerWrap}>
                    <Picker
                      selectedValue={status}
                      onValueChange={(val) => setStatus(val)}
                      style={modalStyles.picker}
                    >
                      <Picker.Item label="Actif" value="actif" />
                      <Picker.Item label="Inactif" value="inactif" />
                    </Picker>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={modalStyles.actionRow}>
                <TouchableOpacity
                  style={modalStyles.cancelBtn}
                  onPress={() => setEditUserModal(false)}
                >
                  <Text style={modalStyles.cancelBtnText}>Annuler</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[modalStyles.saveBtn, updating && { opacity: 0.7 }]}
                  onPress={handleUpdate}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Feather name="check" size={16} color="#fff" />
                      <Text style={modalStyles.saveBtnText}>Sauvegarder</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ─── Styles: liste ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: isWeb ? 40 : 20 },
  topBar: {
    paddingHorizontal: isWeb ? 40 : 20,
    paddingTop: 15,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: isWeb ? 40 : 20,
  },
  title: { fontSize: 28, fontWeight: "800", color: "#0f172a" },
  subtitle: { color: "#64748b", fontSize: 16 },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 12,
    gap: 8,
    ...Platform.select({ web: { cursor: "pointer" } as any }),
  },
  addButtonText: { color: "#fff", fontWeight: "bold" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginHorizontal: isWeb ? 40 : 20,
  },
  searchInput: { flex: 1, marginLeft: 10 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    paddingHorizontal: isWeb ? 40 : 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    width: isWeb ? "48%" : "100%",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  userName: { fontSize: 18, fontWeight: "700", color: "#1e293b" },
  userEmail: { color: "#64748b", fontSize: 14 },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94a3b8",
    marginBottom: 4,
  },
  roleBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  roleText: { fontWeight: "700", fontSize: 14 },
  dateText: { fontWeight: "700", color: "#1e293b", fontSize: 14 },
  cardActions: { flexDirection: "row", gap: 10 },
  editButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    height: 48,
  },
  editButtonText: { fontWeight: "600", color: "#334155" },
  deleteButton: {
    width: 48,
    height: 48,
    backgroundColor: "#fff1f2",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
});

// ─── Styles: modals ───────────────────────────────────────────────────────────

const modalStyles = StyleSheet.create({
  // Overlay semi-transparent qui couvre tout l'écran
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: isWeb ? "center" : "flex-end",
    alignItems: isWeb ? "center" : "stretch",
  },

  // Sheet blanc — centré sur web, bottom sheet sur mobile
  sheet: {
    backgroundColor: "#fff",
    borderRadius: isWeb ? 20 : 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
    width: isWeb ? 520 : "100%",
    maxHeight: isWeb ? "90%" : "95%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: isWeb ? 8 : -4 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },

  // Poignée de drag
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },

  // Header du sheet
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  sheetSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },

  // Bouton fermeture circulaire
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  // Carte récap utilisateur (modal edit)
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 14,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#5B21B6",
  },
  userCardName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
  },
  userCardEmail: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 1,
  },

  // Séparateur
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginHorizontal: 24,
    marginBottom: 4,
  },

  // Corps du sheet (formulaire)
  sheetBody: {
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 14,
    ...(isWeb ? { overflowY: "auto" as any, maxHeight: 520 } : {}),
  },

  // Champ de saisie
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 0.8,
  },
  input: {
    height: 50,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#1e293b",
  },

  // Ligne de pickers côte à côte
  row: {
    flexDirection: "row",
    gap: 12,
  },
  pickerWrap: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    height: 50,
    justifyContent: "center",
  },
  picker: {
    height: 50,
    color: "#1e293b",
  },

  // Boutons d'action (Annuler + Sauvegarder)
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
  },
  saveBtn: {
    flex: 2,
    height: 52,
    backgroundColor: "#2563eb",
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
