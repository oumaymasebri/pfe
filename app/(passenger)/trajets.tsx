 
 
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";


// Firebase
import { db } from "@/configFirebase";
import { collection, getDocs } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import NativeMap from "@/components/NativeMap.web";

// Helpers
const formatDuree = (minutes: number): string => {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}min`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
};

export default function LignesStationsPassenger() {
  const [lignes, setLignes] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedLines, setExpandedLines] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lignesSnap, stationsSnap] = await Promise.all([
        getDocs(collection(db, "lignes")),
        getDocs(collection(db, "stations")),
      ]);

      setLignes(lignesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setStations(stationsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedLines);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setExpandedLines(newSet);
  };

  const getStationsForLine = (codeLigne: string) => {
    return stations.filter(
      (s) =>
        s.ligneAssociee === codeLigne || s.ligneAssociee?.includes(codeLigne),
    );
  };

  const filteredLignes = lignes.filter(
    (l) =>
      l.nom?.toLowerCase().includes(search.toLowerCase()) ||
      l.code?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.mainTitle}>Lignes & Stations</Text>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#ADB5BD" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une ligne..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* MAP */}
        <View style={styles.mapWrapper}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="map-outline" size={18} color="#1A73E8" /> Vue en
            Temps Réel
          </Text>
          <NativeMap style={styles.map} stations={stations} />
        </View>

        {/* LIST OF LINES */}
        <Text style={styles.sectionTitle}>Lignes Disponibles</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#1A73E8" />
        ) : (
          <View style={styles.listContainer}>
            {filteredLignes.map((ligne) => {
              const lineStations = getStationsForLine(ligne.code);
              const isExpanded = expandedLines.has(ligne.id);

              return (
                <View key={ligne.id} style={styles.lineCard}>
                  {/* Ligne Header */}
                  <TouchableOpacity
                    style={styles.lineHeader}
                    onPress={() => toggleExpand(ligne.id)}
                  >
                    <View style={styles.busIconContainer}>
                      <MaterialCommunityIcons
                        name="bus"
                        size={28}
                        color="white"
                      />
                    </View>

                    <View style={styles.cardInfo}>
                      <Text style={styles.lineName}>
                        {ligne.code} - {ligne.nom}
                      </Text>
                      <Text style={styles.lineRoute}>
                        {ligne.depart} → {ligne.destination}
                      </Text>
                      <Text style={styles.lineDetails}>
                        {ligne.distance} km • {formatDuree(ligne.duree)} •{" "}
                        {ligne.heureDepart} → {ligne.heureArrivee}
                      </Text>
                    </View>

                    <MaterialCommunityIcons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={26}
                      color="#666"
                    />
                  </TouchableOpacity>

                  {/* Expanded Stations */}
                  {isExpanded && (
                    <View style={styles.stationsContainer}>
                      <Text style={styles.stationsTitle}>
                        Stations sur cette ligne :
                      </Text>

                      {lineStations.length > 0 ? (
                        lineStations.map((station, idx) => (
                          <View key={station.id} style={styles.stationItem}>
                            <Text style={styles.stationNumber}>{idx + 1}.</Text>
                            <Text style={styles.stationName}>
                              {station.nom}
                            </Text>
                            <View style={styles.timeContainer}>
                              <Text style={styles.stationTime}>
                                {station.horairePassage || "—"}
                              </Text>
                            </View>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noStations}>
                          Aucune station associée pour le moment
                        </Text>
                      )}

                      {/* Bouton Voir sur la carte */}
                      <TouchableOpacity style={styles.mapButton}>
                        <Ionicons name="map" size={18} color="white" />
                        <Text style={styles.mapButtonText}>
                          Voir sur la carte
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
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

  mapWrapper: { marginBottom: 25 },
  map: { width: "100%", height: 220, borderRadius: 15 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#002140",
    marginBottom: 12,
  },

  listContainer: { gap: 12 },

  lineCard: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E9F0",
  },

  lineHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },

  busIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#1A73E8",
    justifyContent: "center",
    alignItems: "center",
  },

  cardInfo: { marginLeft: 15, flex: 1 },
  lineName: { fontSize: 17, fontWeight: "bold", color: "#002140" },
  lineRoute: { fontSize: 14, color: "#6C757D", marginTop: 2 },
  lineDetails: { fontSize: 13, color: "#888", marginTop: 4 },

  stationsContainer: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E9F0",
  },
  stationsTitle: {
    fontWeight: "600",
    color: "#444",
    marginBottom: 12,
  },
  stationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F5",
  },
  stationNumber: {
    width: 24,
    color: "#888",
    fontWeight: "500",
  },
  stationName: {
    flex: 1,
    fontSize: 15.5,
    color: "#002140",
  },
  timeContainer: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stationTime: {
    color: "#1A73E8",
    fontWeight: "700",
    fontSize: 15,
  },

  noStations: {
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
    padding: 15,
  },

  mapButton: {
    backgroundColor: "#1A73E8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
  },
  mapButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
});
