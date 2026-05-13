import NativeMap from "@/components/NativeMap.web";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Firebase
import { db } from "@/configFirebase";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    updateDoc,
} from "firebase/firestore";

// ==================== HELPERS ====================
const formatDuree = (minutes: number): string => {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}min`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
};

const addMinutesToTime = (time: string, minutesToAdd: number): string => {
  if (!time || !minutesToAdd) return "—";
  const [hours, minutes] = time.split(":").map(Number);
  let total = hours * 60 + minutes + minutesToAdd;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${newH.toString().padStart(2, "0")}:${newM.toString().padStart(2, "0")}`;
};

export default function LignesStationsPage() {
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState<"Lignes" | "Stations">("Lignes");
  const [loading, setLoading] = useState(true);
  const [lignes, setLignes] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [expandedLines, setExpandedLines] = useState<Set<string>>(new Set());

  // Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentType, setCurrentType] = useState<"Lignes" | "Stations">(
    "Lignes",
  );

  // Lignes Fields
  const [code, setCode] = useState("");
  const [nom, setNom] = useState("");
  const [depart, setDepart] = useState("");
  const [destination, setDestination] = useState("");
  const [distance, setDistance] = useState("");
  const [duree, setDuree] = useState("");
  const [heureDepart, setHeureDepart] = useState("");
  const [nombreStations, setNombreStations] = useState("");
  const [busActifs, setBusActifs] = useState("");
  const [etat, setEtat] = useState<"ACTIVE" | "RETARD" | "HORS_SERVICE">(
    "ACTIVE",
  );

  // Stations Fields
  const [localisation, setLocalisation] = useState("");
  const [ligneAssociee, setLigneAssociee] = useState("");
  const [horairePassage, setHorairePassage] = useState("");
  const [etatStation, setEtatStation] = useState<
    "ACTIVE" | "BUSY" | "MAINTENANCE"
  >("ACTIVE");

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
      console.error(e);
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

  const resetForm = () => {
    setCode("");
    setNom("");
    setDepart("");
    setDestination("");
    setDistance("");
    setDuree("");
    setHeureDepart("");
    setNombreStations("");
    setBusActifs("");
    setEtat("ACTIVE");
    setLocalisation("");
    setLigneAssociee("");
    setHorairePassage("");
    setEtatStation("ACTIVE");
    setSelectedId(null);
    setIsEditing(false);
  };

  const openEdit = (item: any, type: "Lignes" | "Stations") => {
    setCurrentType(type);
    setIsEditing(true);
    setSelectedId(item.id);

    if (type === "Lignes") {
      setCode(item.code || "");
      setNom(item.nom || "");
      setDepart(item.depart || "");
      setDestination(item.destination || "");
      setDistance(item.distance?.toString() || "");
      setDuree(item.duree?.toString() || "");
      setHeureDepart(item.heureDepart || "");
      setNombreStations(item.nombreStations?.toString() || "");
      setBusActifs(item.busActifs?.toString() || "");
      setEtat(item.etat || "ACTIVE");
    } else {
      setNom(item.nom || "");
      setLocalisation(item.localisation || "");
      setLigneAssociee(item.ligneAssociee || "");
      setHorairePassage(item.horairePassage || "");
      setEtatStation(item.etat || "ACTIVE");
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    const colName = currentType === "Lignes" ? "lignes" : "stations";

    const payload =
      currentType === "Lignes"
        ? {
            code,
            nom,
            depart,
            destination,
            distance: parseFloat(distance) || 0,
            duree: parseInt(duree) || 0,
            heureDepart,
            heureArrivee: addMinutesToTime(heureDepart, parseInt(duree) || 0),
            nombreStations: parseInt(nombreStations) || 0,
            busActifs: parseInt(busActifs) || 0,
            etat,
            updatedAt: new Date().toISOString(),
          }
        : {
            nom,
            localisation,
            ligneAssociee,
            horairePassage,
            etat: etatStation,
            updatedAt: new Date().toISOString(),
          };

    try {
      if (isEditing && selectedId) {
        await updateDoc(doc(db, colName, selectedId), payload);
      } else {
        await addDoc(collection(db, colName), {
          ...payload,
          createdAt: new Date().toISOString(),
        });
      }
      setModalVisible(false);
      resetForm();
      fetchData();
      alert("✅ Enregistré avec succès !");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer cet élément ?")) {
      try {
        const colName = activeTab === "Lignes" ? "lignes" : "stations";
        await deleteDoc(doc(db, colName, id));
        fetchData();
      } catch (e) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  return (
    <View style={styles.mainContainer}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <MaterialCommunityIcons name="menu" size={26} color="#333" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Lignes & Stations Management</Text>
            <Text style={styles.headerSubtitle}>SUPERVISION EN TEMPS RÉEL</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.adminInfo}>
            <Text style={styles.adminName}>Admin Centrale</Text>
            <Text style={styles.adminMail}>oumaymasebri7@gmail.com</Text>
          </View>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={20} color="#1A73E8" />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{lignes.length}</Text>
            <Text style={styles.statLab}>TOTAL LIGNES</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{stations.length}</Text>
            <Text style={styles.statLab}>TOTAL STATIONS</Text>
          </View>
        </View>

        <View style={styles.whiteCard}>
          <View style={styles.tabContainer}>
            {["Lignes", "Stations"].map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setActiveTab(t as "Lignes" | "Stations")}
                style={[styles.tabBtn, activeTab === t && styles.tabActive]}
              >
                <Text
                  style={[
                    styles.tabTxt,
                    activeTab === t && styles.tabTxtActive,
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ==================== LIGNES TAB ==================== */}
          {activeTab === "Lignes" && (
            <>
              <View style={styles.actionRow}>
                <TextInput
                  style={styles.searchBar}
                  placeholder="Rechercher une ligne..."
                  value={search}
                  onChangeText={setSearch}
                />
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => {
                    resetForm();
                    setCurrentType("Lignes");
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.addBtnTxt}>+ Ligne</Text>
                </TouchableOpacity>
              </View>

              {lignes
                .filter(
                  (l) =>
                    l.nom?.toLowerCase().includes(search.toLowerCase()) ||
                    l.code?.toLowerCase().includes(search.toLowerCase()),
                )
                .map((ligne) => {
                  const lineStations = getStationsForLine(ligne.code);
                  const isExpanded = expandedLines.has(ligne.id);

                  return (
                    <View key={ligne.id} style={styles.lineCard}>
                      <View style={styles.lineHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: "700", fontSize: 16 }}>
                            {ligne.code} - {ligne.nom}
                          </Text>
                          <Text style={{ color: "#555" }}>
                            {ligne.depart} → {ligne.destination}
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#666",
                              marginTop: 2,
                            }}
                          >
                            {ligne.distance} km • {formatDuree(ligne.duree)} •{" "}
                            {ligne.heureDepart} → {ligne.heureArrivee}
                          </Text>
                        </View>

                        {/* Nombre de bus */}
                        <View style={{ alignItems: "center", marginRight: 15 }}>
                          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                            {ligne.busActifs || 0}
                          </Text>
                          <Text style={{ fontSize: 10, color: "#666" }}>
                            bus
                          </Text>
                        </View>

                        {/* État */}
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                ligne.etat === "ACTIVE"
                                  ? "#10b981"
                                  : ligne.etat === "RETARD"
                                    ? "#f59e0b"
                                    : "#ef4444",
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color: "white",
                              fontSize: 12,
                              fontWeight: "bold",
                            }}
                          >
                            {ligne.etat === "ACTIVE"
                              ? "Actif"
                              : ligne.etat === "RETARD"
                                ? "Retard"
                                : "H.S"}
                          </Text>
                        </View>

                        {/* Actions */}
                        <View
                          style={{
                            flexDirection: "row",
                            gap: 12,
                            marginLeft: 10,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => openEdit(ligne, "Lignes")}
                          >
                            <Feather name="edit-2" size={18} color="#777" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDelete(ligne.id)}
                          >
                            <Feather name="trash-2" size={18} color="#ef4444" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => toggleExpand(ligne.id)}
                          >
                            <MaterialCommunityIcons
                              name={isExpanded ? "chevron-up" : "chevron-down"}
                              size={24}
                              color="#666"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {isExpanded && (
                        <View style={styles.stationsList}>
                          <Text style={{ fontWeight: "600", marginBottom: 10 }}>
                            Stations sur cette ligne :
                          </Text>
                          {lineStations.length > 0 ? (
                            lineStations.map((st, idx) => (
                              <View key={st.id} style={styles.stationRow}>
                                <Text style={{ flex: 1 }}>
                                  {idx + 1}. {st.nom}
                                </Text>
                                <Text
                                  style={{
                                    color: "#1A73E8",
                                    fontWeight: "600",
                                  }}
                                >
                                  {st.horairePassage || "—"}
                                </Text>
                              </View>
                            ))
                          ) : (
                            <Text
                              style={{ color: "#888", fontStyle: "italic" }}
                            >
                              Aucune station associée
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
            </>
          )}

          {/* Stations Tab (vide pour l'instant) */}
          {activeTab === "Stations" && (
            <Text style={{ textAlign: "center", padding: 30, color: "#888" }}>
              Section Stations bientôt disponible...
            </Text>
          )}
        </View>

        {/* MAP */}
        <View style={styles.whiteCard}>
          <Text style={styles.cardTitle}>
            <MaterialCommunityIcons
              name="map-marker"
              size={18}
              color="#1A73E8"
            />{" "}
            Vue en Temps Réel
          </Text>
          <NativeMap style={styles.mapContainer} />
        </View>
      </ScrollView>

      {/* ==================== MODAL ==================== */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? "Modifier" : "Ajouter"} {currentType}
            </Text>

            {currentType === "Lignes" ? (
              /* LIGNES FORM */
              <>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Code Ligne (ex: L01)"
                  value={code}
                  onChangeText={setCode}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Nom de la ligne"
                  value={nom}
                  onChangeText={setNom}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Départ"
                  value={depart}
                  onChangeText={setDepart}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Destination"
                  value={destination}
                  onChangeText={setDestination}
                />

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TextInput
                    style={[styles.modalInput, { flex: 1 }]}
                    placeholder="Distance (km)"
                    value={distance}
                    onChangeText={setDistance}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.modalInput, { flex: 1 }]}
                    placeholder="Durée (minutes)"
                    value={duree}
                    onChangeText={setDuree}
                    keyboardType="numeric"
                  />
                </View>

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TextInput
                    style={[styles.modalInput, { flex: 1 }]}
                    placeholder="Heure Départ (HH:mm)"
                    value={heureDepart}
                    onChangeText={setHeureDepart}
                  />
                  <TextInput
                    style={[styles.modalInput, { flex: 1 }]}
                    placeholder="Nb Stations"
                    value={nombreStations}
                    onChangeText={setNombreStations}
                    keyboardType="numeric"
                  />
                </View>

                <Text
                  style={{
                    color: "#10b981",
                    fontWeight: "600",
                    marginVertical: 8,
                  }}
                >
                  Arrivée estimée :{" "}
                  {addMinutesToTime(heureDepart, parseInt(duree) || 0)}
                </Text>

                <TextInput
                  style={styles.modalInput}
                  placeholder="Nombre de bus actifs"
                  value={busActifs}
                  onChangeText={setBusActifs}
                  keyboardType="numeric"
                />

                <Text
                  style={{ marginTop: 10, marginBottom: 6, fontWeight: "600" }}
                >
                  État de la ligne
                </Text>
                <View
                  style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}
                >
                  {["ACTIVE", "RETARD", "HORS_SERVICE"].map((s: any) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setEtat(s)}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 9,
                        borderRadius: 20,
                        backgroundColor:
                          etat === s
                            ? s === "ACTIVE"
                              ? "#10b981"
                              : s === "RETARD"
                                ? "#f59e0b"
                                : "#ef4444"
                            : "#f1f5f9",
                      }}
                    >
                      <Text
                        style={{
                          color: etat === s ? "white" : "#64748b",
                          fontWeight: "600",
                        }}
                      >
                        {s === "ACTIVE"
                          ? "Active"
                          : s === "RETARD"
                            ? "Retard"
                            : "Hors Service"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              /* STATIONS FORM */
              <>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Nom de la Station"
                  value={nom}
                  onChangeText={setNom}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ligne Associée"
                  value={ligneAssociee}
                  onChangeText={setLigneAssociee}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Localisation GPS"
                  value={localisation}
                  onChangeText={setLocalisation}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Horaire de passage (ex: 06:45)"
                  value={horairePassage}
                  onChangeText={setHorairePassage}
                />

                <Text
                  style={{ marginTop: 12, marginBottom: 6, fontWeight: "600" }}
                >
                  État de la Station
                </Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {["ACTIVE", "BUSY", "MAINTENANCE"].map((s: any) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setEtatStation(s)}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 9,
                        borderRadius: 20,
                        backgroundColor:
                          etatStation === s
                            ? s === "ACTIVE"
                              ? "#10b981"
                              : s === "BUSY"
                                ? "#f59e0b"
                                : "#64748b"
                            : "#f1f5f9",
                      }}
                    >
                      <Text
                        style={{
                          color: etatStation === s ? "white" : "#64748b",
                          fontWeight: "600",
                        }}
                      >
                        {s === "ACTIVE"
                          ? "Active"
                          : s === "BUSY"
                            ? "Occupée"
                            : "Maintenance"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnTxt}>Sauvegarder</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
              style={{ marginTop: 15 }}
            >
              <Text style={{ textAlign: "center", color: "#666" }}>
                Annuler
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ==================== STYLES ==================== */
const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#F4F7FE" },
  header: {
    height: 80,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  titleContainer: {
    borderLeftWidth: 1,
    borderLeftColor: "#EEE",
    paddingLeft: 15,
    marginLeft: 15,
  },
  headerTitle: { fontSize: 16, fontWeight: "bold" },
  headerSubtitle: { fontSize: 9, color: "#999" },
  headerRight: { flexDirection: "row", alignItems: "center" },
  adminInfo: { alignItems: "flex-end", marginRight: 12 },
  adminName: { fontSize: 13, fontWeight: "bold" },
  adminMail: { fontSize: 10, color: "#999" },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#E8F0FE",
    justifyContent: "center",
    alignItems: "center",
  },

  scrollContent: { padding: 20 },
  statsRow: { flexDirection: "row", gap: 15, marginBottom: 20 },
  statItem: {
    flex: 1,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    elevation: 1,
  },
  statVal: { fontSize: 22, fontWeight: "bold" },
  statLab: { fontSize: 9, color: "#888", fontWeight: "bold", marginTop: 4 },

  whiteCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 1,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    marginBottom: 15,
  },
  tabBtn: { paddingVertical: 10, paddingHorizontal: 15, marginRight: 10 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: "#6b46c1" },
  tabTxt: { color: "#888", fontWeight: "bold" },
  tabTxtActive: { color: "#6b46c1" },

  actionRow: { flexDirection: "row", marginBottom: 15, gap: 10 },
  searchBar: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  addBtn: {
    backgroundColor: "#6b46c1",
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: "center",
  },
  addBtnTxt: { color: "white", fontWeight: "bold" },

  lineCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEE",
  },
  lineHeader: { flexDirection: "row", alignItems: "center", padding: 16 },
  stationsList: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  stationRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },

  cardTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 15 },
  mapContainer: {
    height: 280,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#EEE",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: { backgroundColor: "white", borderRadius: 16, padding: 25 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  modalInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  saveBtn: {
    backgroundColor: "#6b46c1",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnTxt: { color: "white", fontWeight: "bold" },
});
