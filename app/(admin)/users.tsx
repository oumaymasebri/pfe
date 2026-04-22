import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
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
import { db } from "@/configFirebase";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";

// Type utilisateur pour corriger les erreurs "implicitly has any type"
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  arrivalDate: string;
}

const isWeb = Platform.OS === "web";

export default function UserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const handleDelete = async (id: string, name: string) => {
    if (isWeb && !window.confirm(`Supprimer ${name} ?`)) return;
    try {
      await deleteDoc(doc(db, "users", id));
      setUsers(users.filter((u) => u.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView style={styles.container as ViewStyle}>
      <View style={styles.header as ViewStyle}>
        <View>
          <Text style={styles.title as TextStyle}>Gestion Utilisateurs</Text>
          <Text style={styles.subtitle as TextStyle}>
            Gérez les accès et les profils de votre plateforme.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton as any}
          onPress={() => router.push("/addUser")}
        >
          <Feather name="user-plus" size={18} color="#fff" />
          <Text style={styles.addButtonText as TextStyle}>Nouveau</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer as ViewStyle}>
        <Feather name="search" size={20} color="#94a3b8" />
        <TextInput
          placeholder="Chercher un nom, un email..."
          style={styles.searchInput as any}
          onChangeText={setSearch}
        />
      </View>

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
              const is_admin = user.role.toLowerCase() === "admin";
              const roleColor = is_admin ? "#a855f7" : "#3b82f6";

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
                            [styles.dot, { backgroundColor: roleColor }] as any
                          }
                        />
                        <Text
                          style={[styles.roleText, { color: roleColor }] as any}
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
                    <TouchableOpacity style={styles.editButton as any}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: isWeb ? 40 : 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
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
  },
  searchInput: { flex: 1, marginLeft: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 20 },
  // Correction de l'erreur width calc() pour TypeScript
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
  label: { fontSize: 10, fontWeight: "800", color: "#94a3b8", marginBottom: 4 },
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
