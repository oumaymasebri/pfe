// components/Sidebar.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Sidebar() {
  const router = useRouter();
  const segments = useSegments();

  // Fix du type 'never'
  const firstSegment = segments[0] as string | undefined;
  const isPassenger =
    firstSegment === "(passenger)" || segments.some((s) => s === "(passenger)");
  const isAdmin =
    firstSegment === "(admin)" || segments.some((s) => s === "(admin)");

  return (
    <View style={styles.sidebar}>
      <Text style={styles.title}>SMART BUS</Text>

      {/* Menu Passenger */}
      {isPassenger && (
        <>
          <TouchableOpacity
            style={styles.item}
            onPress={() => router.replace("/(tabs)/(passenger)/home")}
          >
            <Text style={styles.itemText}>🏠 Accueil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => router.replace("/(tabs)/(passenger)/trajets")}
          >
            <Text style={styles.itemText}>🚌 Trajets</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => router.replace("/(tabs)/(passenger)/alertes")}
          >
            <Text style={styles.itemText}>🚨 Alertes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => router.replace("/(tabs)/(passenger)/favoris")}
          >
            <Text style={styles.itemText}>⭐ Favoris</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => router.replace("/(tabs)/(passenger)/profile")}
          >
            <Text style={styles.itemText}>👤 Profil</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Menu Admin */}
      {isAdmin && (
        <TouchableOpacity
          style={styles.item}
          onPress={() => router.replace("/(tabs)/(admin)/shboard")}
        >
          <Text style={styles.itemText}>📊 Dashboard Admin</Text>
        </TouchableOpacity>
      )}

      {/* Déconnexion (exemple) */}
      <TouchableOpacity
        style={[styles.item, styles.logout]}
        onPress={() => {
          // TODO: dispatch logout action + redirect
          AsyncStorage.removeItem("userToken");
          router.replace("/(auth)/signin");
        }}
      >
        <Text style={styles.logoutText}>🚪 Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 250,
    backgroundColor: "#1e2937",
    paddingTop: 60,
    paddingHorizontal: 20,
    height: "100%",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 50,
  },
  item: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  itemText: {
    color: "#e2e8f0",
    fontSize: 17,
  },
  logout: {
    marginTop: "auto",
    borderBottomWidth: 0,
    paddingBottom: 30,
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 17,
  },
});
