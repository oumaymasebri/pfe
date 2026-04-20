// app/(admin)/dashboard.web.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardWeb() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          AsyncStorage.removeItem("userToken");
          router.replace("/(auth)/signin");
        }}>
          <Ionicons name="menu" size={28} color="#007BFF" />
        </TouchableOpacity>
        <Text style={styles.logoText}>SmartBus - Admin</Text>
        <View style={styles.onlineBadge}>
          <Text style={styles.onlineText}>EN LIGNE</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Aperçu du système</Text>
        <Text style={styles.subtitle}>
          État en temps réel du réseau SmartBus
        </Text>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="bus" size={32} color="#007BFF" />
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Bus Actifs</Text>
            <Text style={styles.statSub}>+2 depuis la dernière heure</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="map" size={32} color="#00C853" />
            <Text style={styles.statNumber}>18</Text>
            <Text style={styles.statLabel}>Lignes aujourd hui</Text>
            <Text style={styles.statSub}>STABLE</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="warning" size={32} color="#FF5252" />
            <Text style={styles.statNumber}>02</Text>
            <Text style={styles.statLabel}>Incidents</Text>
            <Text style={styles.statSub}>-1 résolu</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={32} color="#FF9800" />
            <Text style={styles.statNumber}>76%</Text>
            <Text style={styles.statLabel}>Taux de charge</Text>
            <Text style={styles.statSub}>Heure de pointe approche</Text>
          </View>
        </View>

        {/* Map Placeholder for Web */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>État du réseau en direct</Text>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={80} color="#ccc" />
            <Text style={styles.placeholderText}>
              Carte non disponible sur Web
            </Text>
            <Text style={styles.placeholderSub}>
              Testez sur Expo Go (mobile) pour voir la vraie carte en direct
            </Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance du système</Text>
          <LineChart
            data={{
              labels: [
                "08:00",
                "10:00",
                "12:00",
                "14:00",
                "16:00",
                "18:00",
                "20:00",
              ],
              datasets: [{ data: [45, 78, 85, 62, 94, 88, 42] }],
            }}
            width={350}
            height={220}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
              labelColor: () => "#666",
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  logoText: { fontSize: 20, fontWeight: "700", color: "#007BFF" },
  onlineBadge: {
    backgroundColor: "#00C853",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  onlineText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  scroll: { flex: 1 },
  title: { fontSize: 24, fontWeight: "700", marginLeft: 15, marginTop: 15 },
  subtitle: { fontSize: 15, color: "#666", marginLeft: 15, marginBottom: 15 },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    gap: 12,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    width: "48%",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    elevation: 5,
  },
  statNumber: { fontSize: 32, fontWeight: "700", marginVertical: 8 },
  statLabel: { fontSize: 16, fontWeight: "600" },
  statSub: { fontSize: 13, color: "#666", marginTop: 4 },
  section: { marginTop: 20, paddingHorizontal: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  mapPlaceholder: {
    height: 280,
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 15,
  },
  placeholderText: { fontSize: 18, color: "#999", marginTop: 10 },
  placeholderSub: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 20,
  },
});
