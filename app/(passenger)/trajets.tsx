/* eslint-disable react-hooks/exhaustive-deps */
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker } from "react-native-maps"; // Thabet enek sabitha: npx expo install react-native-maps

// Firebase Config
import { db } from "@/configFirebase";
import { collection, getDocs } from "firebase/firestore";

export default function LignesStationsPassenger() {
  const [activeTab, setActiveTab] = useState("Lines");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const colName = activeTab === "Lines" ? "lignes" : "stations";
      const querySnapshot = await getDocs(collection(db, colName));
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setData(list);
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER & SEARCH */}
        <Text style={styles.mainTitle}>Lignes & Stations</Text>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#ADB5BD" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a line or station"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* TOGGLE LINES/STATIONS */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              activeTab === "Lines" && styles.toggleActive,
            ]}
            onPress={() => setActiveTab("Lines")}
          >
            <Text
              style={[
                styles.toggleText,
                activeTab === "Lines" && styles.toggleTextActive,
              ]}
            >
              Lines
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              activeTab === "Stations" && styles.toggleActive,
            ]}
            onPress={() => setActiveTab("Stations")}
          >
            <Text
              style={[
                styles.toggleText,
                activeTab === "Stations" && styles.toggleTextActive,
              ]}
            >
              Stations
            </Text>
          </TouchableOpacity>
        </View>

        {/* --- MAP INTEGRATION --- */}
        <View style={styles.mapWrapper}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="map-outline" size={18} color="#1A73E8" /> Live Map
            View
          </Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 36.8065, // Tunis
              longitude: 10.1815,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {/* Markers dynamiques selon les stations mel Firebase */}
            {activeTab === "Stations" &&
              data.map((station) => (
                <Marker
                  key={station.id}
                  coordinate={{
                    latitude: station.lat || 36.8065,
                    longitude: station.lng || 10.1815,
                  }}
                  title={station.nom}
                  description={station.localisation}
                />
              ))}
          </MapView>
        </View>

        {/* LIST DATA[cite: 1] */}
        <Text style={styles.sectionTitle}>
          {activeTab === "Lines" ? "Available Lines" : "Nearby Stations"}
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#1A73E8" />
        ) : (
          <View style={styles.listContainer}>
            {data
              .filter((item) =>
                item.nom?.toLowerCase().includes(search.toLowerCase()),
              )
              .map((item) =>
                activeTab === "Lines" ? (
                  <View key={item.id} style={styles.lineCard}>
                    <View style={styles.busIconContainer}>
                      <MaterialCommunityIcons
                        name="bus"
                        size={24}
                        color="white"
                      />
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.lineName}>
                        Line {item.code || item.nom}
                      </Text>
                      <Text style={styles.lineRoute}>
                        {item.depart} → {item.destination}
                      </Text>
                    </View>
                    <View style={styles.liveBadge}>
                      <Text style={styles.liveText}>LIVE</Text>
                    </View>
                  </View>
                ) : (
                  <View key={item.id} style={styles.stationCard}>
                    <View style={styles.stationIconContainer}>
                      <MaterialCommunityIcons
                        name="map-marker-outline"
                        size={22}
                        color="#ADB5BD"
                      />
                    </View>
                    <View style={styles.stationInfo}>
                      <Text style={styles.stationName}>{item.nom}</Text>
                      <Text style={styles.distanceText}>
                        {item.localisation || "200m"}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#EEE" />
                  </View>
                ),
              )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBFDFF" },
  scrollContent: { padding: 20 },
  mainTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#002140",
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F4F8",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15 },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F4F8",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  toggleActive: { backgroundColor: "white", elevation: 2, shadowOpacity: 0.05 },
  toggleText: { fontWeight: "600", color: "#6C757D" },
  toggleTextActive: { color: "#1A73E8" },

  // Map Styling[cite: 1]
  mapWrapper: { marginBottom: 25 },
  map: { width: "100%", height: 200, borderRadius: 15, marginTop: 10 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#002140",
    marginBottom: 10,
  },

  listContainer: { gap: 12 },
  lineCard: {
    flexDirection: "row",
    backgroundColor: "#EBF4FF",
    borderRadius: 18,
    padding: 15,
    alignItems: "center",
  },
  busIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: "#1A73E8",
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: { marginLeft: 15, flex: 1 },
  lineName: { fontSize: 16, fontWeight: "bold", color: "#002140" },
  lineRoute: { fontSize: 12, color: "#6C757D", marginTop: 2 },
  liveBadge: {
    backgroundColor: "#2CCFBC",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  liveText: { color: "white", fontSize: 10, fontWeight: "bold" },

  stationCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 18,
    padding: 15,
    elevation: 1,
    shadowOpacity: 0.05,
    alignItems: "center",
  },
  stationIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  stationInfo: { flex: 1, marginLeft: 15 },
  stationName: { fontSize: 15, fontWeight: "bold", color: "#002140" },
  distanceText: { fontSize: 12, color: "#ADB5BD", marginTop: 2 },
});
