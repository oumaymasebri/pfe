/* eslint-disable react-hooks/exhaustive-deps */
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Firebase Logic[cite: 1]
import { db } from "@/configFirebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

export default function LignesStationsPage() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("Lignes");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  // Modal States[cite: 1]
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Champs Formulaire[cite: 1]
  const [code, setCode] = useState("");
  const [nom, setNom] = useState("");
  const [depart, setDepart] = useState("");
  const [destination, setDestination] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [zone, setZone] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const colName = activeTab === "Lignes" ? "lignes" : "stations";
      const querySnapshot = await getDocs(collection(db, colName));
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setData(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleSave = async () => {
    const colName = activeTab === "Lignes" ? "lignes" : "stations";
    const payload =
      activeTab === "Lignes"
        ? { code, nom, depart, destination, statut: "ACTIVE" }
        : { nom, localisation, zone, statut: "ACTIVE" };
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
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer cet élément ?")) {
      try {
        await deleteDoc(
          doc(db, activeTab === "Lignes" ? "lignes" : "stations", id),
        );
        fetchData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const resetForm = () => {
    setCode("");
    setNom("");
    setDepart("");
    setDestination("");
    setLocalisation("");
    setZone("");
    setSelectedId(null);
  };

  const openEdit = (item: any) => {
    setIsEditing(true);
    setSelectedId(item.id);
    setNom(item.nom);
    if (activeTab === "Lignes") {
      setCode(item.code);
      setDepart(item.depart);
      setDestination(item.destination);
    } else {
      setLocalisation(item.localisation);
      setZone(item.zone);
    }
    setModalVisible(true);
  };

  return (
    <View style={styles.mainContainer}>
      {/* ── HEADER[cite: 1] ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <MaterialCommunityIcons name="menu" size={26} color="#333" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Lignes & Stations Management</Text>
            <Text style={styles.headerSubtitle}>
              SUPERVISION ET GESTION EN TEMPS RÉEL
            </Text>
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
        {/* ── 1. COMPTEURS (STATS)[cite: 1] ── */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>
              {activeTab === "Lignes" ? data.length : "3"}
            </Text>
            <Text style={styles.statLab}>TOTAL LIGNES</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>
              {activeTab === "Stations" ? data.length : "6"}
            </Text>
            <Text style={styles.statLab}>TOTAL STATIONS</Text>
          </View>
        </View>

        {/* ── 2. TABLEAU DYNAMIQUE[cite: 1] ── */}
        <View style={styles.whiteCard}>
          <View style={styles.tabContainer}>
            {["Lignes", "Stations"].map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setActiveTab(t)}
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

          <View style={styles.actionRow}>
            <TextInput
              style={styles.searchBar}
              placeholder={`Rechercher ${activeTab}...`}
              value={search}
              onChangeText={setSearch}
            />
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => {
                setIsEditing(false);
                resetForm();
                setModalVisible(true);
              }}
            >
              <Text style={styles.addBtnTxt}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color="#1A73E8" />
          ) : (
            data
              .filter((i) =>
                i.nom?.toLowerCase().includes(search.toLowerCase()),
              )
              .map((item) => (
                <View key={item.id} style={styles.tableRow}>
                  <View style={{ flex: 2 }}>
                    <Text style={{ fontWeight: "700" }}>{item.nom}</Text>
                    <Text style={{ fontSize: 11, color: "#999" }}>
                      {activeTab === "Lignes"
                        ? `${item.code} | ${item.depart} → ${item.destination}`
                        : item.localisation}
                    </Text>
                  </View>
                  <View style={styles.rowActions}>
                    <TouchableOpacity onPress={() => openEdit(item)}>
                      <Feather name="edit-2" size={16} color="#777" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                      <Feather name="trash-2" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
          )}
        </View>

        {/* ── 3. MAP ── */}
        <View style={styles.whiteCard}>
          <Text style={styles.cardTitle}>
            <MaterialCommunityIcons
              name="map-marker"
              size={18}
              color="#1A73E8"
            />{" "}
            Vue en Temps Réel
          </Text>
          <View style={styles.mapBox}>
            <Text style={{ color: "#999" }}>
              Carte interactive (Simulation)
            </Text>
          </View>
        </View>

        {/* ── 4. STATUT DU RÉSEAU (E5ER HAJA)[cite: 1] ── */}
        <View style={styles.networkCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.networkTitle}>Statut du Réseau</Text>
            <Text style={styles.networkSubtitle}>
              Le système fonctionne de manière optimale. Tous les capteurs IoT
              sont actifs.
            </Text>
            <View style={styles.miniStatsRow}>
              <View>
                <Text style={styles.miniLabel}>PRÉCISION GPS</Text>
                <Text style={styles.miniValue}>99.2%</Text>
              </View>
              <View style={{ marginLeft: 30 }}>
                <Text style={styles.miniLabel}>UPTIME SERVEUR</Text>
                <Text style={styles.miniValue}>99.98%</Text>
              </View>
            </View>
          </View>
          <MaterialCommunityIcons
            name="bus-side"
            size={70}
            color="rgba(255,255,255,0.2)"
          />
        </View>
      </ScrollView>

      {/* ── MODAL ── */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? "Modifier" : "Ajouter"} {activeTab}
            </Text>
            {activeTab === "Lignes" ? (
              <>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Code (ex: L01)"
                  value={code}
                  onChangeText={setCode}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Nom"
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
              </>
            ) : (
              <>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Nom Station"
                  value={nom}
                  onChangeText={setNom}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Localisation"
                  value={localisation}
                  onChangeText={setLocalisation}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Zone"
                  value={zone}
                  onChangeText={setZone}
                />
              </>
            )}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnTxt}>Sauvegarder</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
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
  tabActive: { borderBottomWidth: 2, borderBottomColor: "#1A73E8" },
  tabTxt: { color: "#888", fontWeight: "bold" },
  tabTxtActive: { color: "#1A73E8" },
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
    backgroundColor: "#1A73E8",
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: "center",
  },
  addBtnTxt: { color: "white", fontWeight: "bold" },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F8F9FA",
    alignItems: "center",
  },
  rowActions: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 15,
  },
  cardTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 15 },
  mapBox: {
    height: 150,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  networkCard: {
    backgroundColor: "#1A73E8",
    borderRadius: 15,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  networkTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  networkSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    marginVertical: 8,
  },
  miniStatsRow: { flexDirection: "row", marginTop: 10 },
  miniLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 8,
    fontWeight: "bold",
  },
  miniValue: { color: "white", fontSize: 14, fontWeight: "bold" },
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
    backgroundColor: "#1A73E8",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  saveBtnTxt: { color: "white", fontWeight: "bold" },
});
