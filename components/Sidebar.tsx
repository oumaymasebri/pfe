import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/userSlice";

export default function Sidebar(props: any) {
  const router = useRouter();
  const dispatch = useDispatch();

  // ✅ Function Déconnexion
  const handleLogout = () => {
    Alert.alert("Déconnexion", "Voulez-vous vraiment vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          try {
            // 1. Update Redux
            dispatch(logout());
            // 2. Clear Storage
            await AsyncStorage.clear();
            // 3. Redirect lel Sign-in
            router.replace("/(auth)/signin");
          } catch (error) {
            console.error("Erreur de déconnexion:", error);
          }
        },
      },
    ]);
  };

  // ✅ Composant Item lel Menu
  const MenuItem = ({ icon, label, path, isLogout = false }: any) => (
    <TouchableOpacity
      style={[styles.menuItem, isLogout && styles.logoutItem]}
      onPress={() => (isLogout ? handleLogout() : router.push(path))}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={22}
        color={isLogout ? "#ef4444" : "#94a3b8"} // A7mer fage3 lel logout
      />
      <Text style={[styles.menuText, isLogout && styles.logoutText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <DrawerContentScrollView
      {...props}
      style={{ backgroundColor: "#0f172a" }} // Dark background kima el tsawra
      contentContainerStyle={{ flex: 1 }}
    >
      {/* Header Sidebar */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>SB</Text>
        </View>
        <Text style={styles.brandName}>SmartBus Admin</Text>
      </View>

      {/* Menu List */}
      <View style={styles.menuList}>
        <MenuItem
          icon="grid-outline"
          label="Tableau de bord"
          path="/(admin)/dashboard/dashboard"
        />

        <MenuItem
          icon="bus-outline"
          label="Gestion des Bus"
          path="/(admin)/gestionbus/gestionbus"
        />

        <MenuItem
          icon="map-outline"
          label="Lignes et Stations"
          path="/(admin)/lignes-stations/lignes-stations"
        />

        {/* ←←← AJOUT ICI ←←← */}
        <MenuItem
          icon="alert-circle-outline"
          label="Alertes"
          path="/(admin)/alertes/alertes"
        />

        <MenuItem
          icon="people-outline"
          label="Utilisateurs"
          path="/(admin)/utilisateurs/users"
        />

        <View style={styles.separator} />

        <MenuItem
          icon="person-outline"
          label="Mon Profil"
          path="/(admin)/profile"
        />
        <MenuItem
          icon="settings-outline"
          label="Paramètres"
          path="/(admin)/parametres"
        />

        <View style={styles.separator} />

        <MenuItem icon="exit-outline" label="Déconnexion" isLogout={true} />
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 30,
    alignItems: "center",
    marginBottom: 10,
  },
  logoCircle: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    // Shadow sghira bech yben kima el design
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  logoText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  brandName: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  menuList: { flex: 1, paddingHorizontal: 20 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 5,
  },
  menuText: {
    color: "#94a3b8",
    marginLeft: 15,
    fontSize: 16,
    fontWeight: "500",
  },

  logoutItem: {
    marginTop: 10,
  },
  logoutText: {
    color: "#ef4444", // Couleur rouge kima el tsawra
    fontWeight: "bold",
  },

  separator: {
    height: 1,
    backgroundColor: "#1e293b",
    marginVertical: 15,
    opacity: 0.5,
  },
});
