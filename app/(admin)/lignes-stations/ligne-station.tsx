import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LignesStations() {
  const [activeTab, setActiveTab] = useState("lignes"); // 'lignes' ou 'stations'

  // Data Simple lel test
  const lignes = [
    {
      id: "1",
      code: "L24",
      name: "Tunis - Ariana",
      status: "Actif",
      color: "#3b82f6",
    },
    {
      id: "2",
      code: "L52",
      name: "Marsa - Centre Ville",
      status: "Ralenti",
      color: "#f59e0b",
    },
  ];

  const stations = [
    { id: "1", name: "Station Passage", lines: "12 lignes", commuters: "High" },
    {
      id: "2",
      name: "Station Barcelone",
      lines: "08 lignes",
      commuters: "Medium",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Réseau SmartBus</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Modern Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "lignes" && styles.activeTab]}
          onPress={() => setActiveTab("lignes")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "lignes" && styles.activeTabText,
            ]}
          >
            Lignes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "stations" && styles.activeTab]}
          onPress={() => setActiveTab("stations")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "stations" && styles.activeTabText,
            ]}
          >
            Stations
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94a3b8" />
        <TextInput
          placeholder={`Rechercher une ${activeTab === "lignes" ? "ligne" : "station"}...`}
          style={styles.searchInput}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {activeTab === "lignes"
          ? lignes.map((item) => (
              <View key={item.id} style={styles.card}>
                <View
                  style={[styles.lineBadge, { backgroundColor: item.color }]}
                >
                  <Text style={styles.lineCode}>{item.code}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardStatus}>{item.status}</Text>
                </View>
                <TouchableOpacity>
                  <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                </TouchableOpacity>
              </View>
            ))
          : stations.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.stationIcon}>
                  <Ionicons name="pin" size={24} color="#3b82f6" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardSubText}>
                    {item.lines} desservies
                  </Text>
                </View>
                <View style={styles.commutersBadge}>
                  <Text style={styles.commutersText}>{item.commuters}</Text>
                </View>
              </View>
            ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "800", color: "#0f172a" },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    gap: 5,
  },
  addButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  activeTab: { backgroundColor: "#fff", elevation: 2 },
  tabText: { color: "#64748b", fontWeight: "600" },
  activeTabText: { color: "#3b82f6" },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 20,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15 },

  listContent: { paddingHorizontal: 20 },
  card: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  lineBadge: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  lineCode: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  stationIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: { flex: 1, marginLeft: 15 },
  cardName: { fontSize: 16, fontWeight: "700", color: "#1e293b" },
  cardStatus: {
    color: "#22c55e",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  cardSubText: { color: "#64748b", fontSize: 13, marginTop: 2 },
  commutersBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  commutersText: { fontSize: 11, color: "#475569", fontWeight: "700" },
});
