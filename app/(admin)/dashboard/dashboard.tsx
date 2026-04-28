/* eslint-disable react/no-unescaped-entities */
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router"; // Zidna useRouter
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Dashboard() {
  const navigation = useNavigation();
  const router = useRouter(); // Initialisation mta3 el router
  const { width } = useWindowDimensions();
  const isWeb = width > 1024;

  // Responsive logic mta3 el cards
  const cardWidth = isWeb ? "23.5%" : width > 768 ? "48%" : "100%";

  return (
    <SafeAreaView style={styles.container}>
      {/* --- 1. FIXED HEADER --- */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <Ionicons name="menu-outline" size={26} color="#64748b" />
          </TouchableOpacity>
          <View style={[styles.searchBar, { width: isWeb ? 450 : 200 }]}>
            <Ionicons name="search-outline" size={18} color="#94a3b8" />
            <TextInput
              placeholder="Rechercher des lignes, des bus..."
              style={styles.searchInput}
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notifIcon}>
            <Ionicons name="notifications-outline" size={24} color="#64748b" />
            <View style={styles.redDot} />
          </TouchableOpacity>

          {/* --- AVATAR CLICKABLE (Yhez lel Profile) --- */}
          <TouchableOpacity
            style={styles.profileInfo}
            onPress={() => router.push("/profile")} // Baddel el path hasb esm el ficher mte3ek
            activeOpacity={0.7}
          >
            <View style={styles.adminText}>
              <Text style={styles.adminTitle}>Panel d'administration</Text>
              <Text style={styles.onlineStatus}>EN LIGNE</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>SB</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- 2. SCROLLABLE CONTENT --- */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* --- A. APERÇU DU SYSTÈME (STAT CARDS) --- */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionMainTitle}>Aperçu du système</Text>
              <Text style={styles.sectionSubtitle}>
                État en temps réel du réseau SmartBus
              </Text>
            </View>
            <View style={styles.filterTabs}>
              <TouchableOpacity style={styles.tabActive}>
                <Text style={styles.tabTextActive}>Aujourd'hui</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab}>
                <Text style={styles.tabText}>Hebdomadaire</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab}>
                <Text style={styles.tabText}>Mensuel</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <StatCard
              label="Bus Actifs"
              value="24"
              trend="+2 DEPUIS 1H"
              icon="bus"
              color="#3b82f6"
              bg="#eff6ff"
              width={cardWidth}
            />
            <StatCard
              label="Lignes aujourd'hui"
              value="18"
              trend="STABLE"
              icon="map"
              color="#22c55e"
              bg="#f0fdf4"
              width={cardWidth}
            />
            <StatCard
              label="Incidents"
              value="02"
              trend="-1 RÉSOLU"
              icon="warning"
              color="#ef4444"
              bg="#fef2f2"
              width={cardWidth}
            />
            <StatCard
              label="Taux de charge"
              value="76%"
              trend="HEURE DE POINTE"
              icon="stats-chart"
              color="#f59e0b"
              bg="#fffbe3"
              width={cardWidth}
            />
          </View>

          {/* --- B. ÉTAT DU RÉSEAU (MAP IN THE MIDDLE) --- */}
          <View style={styles.mapSection}>
            <View style={styles.mapHeader}>
              <Text style={styles.sectionMainTitle}>
                État du réseau en direct
              </Text>
              <TouchableOpacity>
                <Text style={styles.fullScreenBtn}>Plein écran</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.mapPlaceholder}>
              <Ionicons
                name="navigate-circle-outline"
                size={60}
                color="#cbd5e1"
              />
              <Text
                style={{ color: "#94a3b8", marginTop: 10, fontWeight: "500" }}
              >
                Chargement de la carte interactive...
              </Text>
            </View>
          </View>

          {/* --- C. PERFORMANCE DU SYSTÈME (CHART AT THE BOTTOM) --- */}
          <Text style={[styles.sectionMainTitle, { marginBottom: 15 }]}>
            Performance du système
          </Text>
          <View style={styles.chartCard}>
            <View style={styles.chartContent}>
              <View style={styles.yAxis}>
                {["100", "75", "50", "25", "0"].map((v) => (
                  <Text key={v} style={styles.axisLabel}>
                    {v}
                  </Text>
                ))}
              </View>
              <View style={styles.graphBody}>
                {/* Simulation Curve Point */}
                <View style={styles.tooltipContainer}>
                  <View style={styles.tooltip}>
                    <Text style={styles.tooltipTime}>10:00</Text>
                    <Text style={styles.tooltipLoad}>load : 78</Text>
                  </View>
                  <View style={styles.blueDot} />
                  <View style={styles.verticalLine} />
                </View>
                {/* Grid Simulation */}
                {[1, 2, 3, 4].map((i) => (
                  <View key={i} style={styles.gridLine} />
                ))}
              </View>
            </View>
            <View style={styles.xAxis}>
              {[
                "08:00",
                "10:00",
                "12:00",
                "14:00",
                "16:00",
                "18:00",
                "20:00",
              ].map((t) => (
                <Text key={t} style={styles.axisLabel}>
                  {t}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-Component StatCard
function StatCard({ label, value, trend, icon, color, bg, width }: any) {
  return (
    <View style={[styles.card, { width }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardValue}>{value}</Text>
        <Text
          style={[
            styles.cardTrend,
            { color: trend === "STABLE" ? "#94a3b8" : color },
          ]}
        >
          {trend}
        </Text>
      </View>
      <View style={[styles.cardIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    height: 70,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginLeft: 20,
    height: 42,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 13, color: "#475569" },
  headerRight: { flexDirection: "row", alignItems: "center" },
  notifIcon: { marginRight: 20 },
  redDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 7,
    height: 7,
    backgroundColor: "#ef4444",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#fff",
  },
  profileInfo: { flexDirection: "row", alignItems: "center" },
  adminText: { alignItems: "flex-end", marginRight: 10 },
  adminTitle: { fontSize: 13, fontWeight: "700", color: "#1e293b" },
  onlineStatus: { fontSize: 9, fontWeight: "800", color: "#94a3b8" },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#2563eb", fontWeight: "bold" },

  scroll: { flex: 1 },
  content: { padding: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 15,
  },
  sectionMainTitle: { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  sectionSubtitle: { fontSize: 13, color: "#64748b", marginTop: 4 },

  filterTabs: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    padding: 3,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 8,
    elevation: 2,
  },
  tab: { paddingHorizontal: 15, paddingVertical: 6 },
  tabTextActive: { fontSize: 12, fontWeight: "700", color: "#2563eb" },
  tabText: { fontSize: 12, fontWeight: "600", color: "#64748b" },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 35,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    elevation: 1,
  },
  cardLabel: { fontSize: 13, color: "#64748b", fontWeight: "600" },
  cardValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1e293b",
    marginVertical: 3,
  },
  cardTrend: { fontSize: 10, fontWeight: "700" },
  cardIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  mapSection: { marginBottom: 40 },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  fullScreenBtn: { color: "#2563eb", fontWeight: "700", fontSize: 13 },
  mapPlaceholder: {
    height: 350,
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },

  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  chartContent: { flexDirection: "row", height: 220 },
  yAxis: { justifyContent: "space-between", paddingRight: 15 },
  graphBody: {
    flex: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
    position: "relative",
  },
  gridLine: {
    position: "absolute",
    width: "100%",
    height: 1,
    backgroundColor: "#f8fafc",
    top: "25%",
  },
  xAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 40,
    marginTop: 15,
  },
  axisLabel: { fontSize: 11, color: "#94a3b8", fontWeight: "500" },
  tooltipContainer: {
    position: "absolute",
    left: "22%",
    top: "15%",
    alignItems: "center",
  },
  tooltip: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 10,
    elevation: 4,
    shadowOpacity: 0.1,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  tooltipTime: { fontSize: 11, fontWeight: "700", textAlign: "center" },
  tooltipLoad: { fontSize: 11, color: "#3b82f6", fontWeight: "600" },
  blueDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3b82f6",
    borderWidth: 2,
    borderColor: "#fff",
  },
  verticalLine: { width: 1, height: 150, backgroundColor: "#f1f5f9" },
});
