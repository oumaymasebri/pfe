 
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";

// Firebase Config
import { db } from "@/configFirebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc
} from "firebase/firestore";

// --- TYPES ---
interface Bus {
  id: string; // Document ID fi Firestore
  busId: string; // Ex: B101
  modele: string;
  capacite: string;
  ligne: string;
  statut: string;
}

const isWeb = Platform.OS === "web";

export default function GestionBus() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // States
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(false);

  // Modals States
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Form States
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [busId, setBusId] = useState("");
  const [modele, setModele] = useState("");
  const [capacite, setCapacite] = useState("");
  const [ligne, setLigne] = useState("");
  const [statut, setStatut] = useState("Actif");

  // ─── FETCH DATA ──────────────────────────────────────────
  const fetchBuses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "buses"));
      const busList: Bus[] = [];
      querySnapshot.forEach((doc) => {
        busList.push({ id: doc.id, ...doc.data() } as Bus);
      });
      setBuses(busList);
    } catch (e) {
      console.error("Error fetching buses: ", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  // ─── ACTIONS (CRUD) ───────────────────────────────────────

  const handleAddBus = async () => {
    if (!busId || !modele) {
      alert("Veuillez remplir les champs obligatoires");
      return;
    }
    setUpdating(true);
    try {
      await addDoc(collection(db, "buses"), {
        busId,
        modele,
        capacite,
        ligne: ligne || "N/A",
        statut,
        createdAt: new Date().toISOString(),
      });
      setAddModalVisible(false);
      resetForm();
      fetchBuses();
      alert("Bus ajouté avec succès !");
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateBus = async () => {
    if (!selectedBus) return;
    setUpdating(true);
    try {
      const busRef = doc(db, "buses", selectedBus.id);
      await updateDoc(busRef, {
        busId,
        modele,
        capacite,
        ligne,
        statut,
      });
      setEditModalVisible(false);
      fetchBuses();
      alert("Bus mis à jour !");
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = isWeb
      ? window.confirm(`Supprimer le bus ${name} ?`)
      : true;

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "buses", id));
      setBuses(buses.filter((b) => b.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setBusId("");
    setModele("");
    setCapacite("");
    setLigne("");
    setStatut("Actif");
    setSelectedBus(null);
  };

  const openEditModal = (bus: Bus) => {
    setSelectedBus(bus);
    setBusId(bus.busId);
    setModele(bus.modele);
    setCapacite(bus.capacite);
    setLigne(bus.ligne);
    setStatut(bus.statut);
    setEditModalVisible(true);
  };

  // ─── HELPERS DESIGN ───────────────────────────────────────
  const getStatusStyle = (s: string) => {
    switch (s) {
      case "Actif":
        return { bg: "#dcfce7", text: "#166534" };
      case "Maintenance":
        return { bg: "#fef3c7", text: "#92400e" };
      default:
        return { bg: "#f1f5f9", text: "#475569" };
    }
  };

  // ─── RENDER ───────────────────────────────────────────────
  return (
    <ScrollView style={styles.container}>
      {/* Top Bar Navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Feather name="menu" size={28} color="#0f172a" />
        </TouchableOpacity>
      </View>

      {/* Header Section */}
      <View
        style={[
          styles.header,
          {
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
          },
        ]}
      >
        <View>
          <Text style={styles.title}>Gestion des Bus</Text>
          <Text style={styles.subtitle}>
            Gérez votre flotte et suivez les trajets.
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.addButton,
            { width: isMobile ? "100%" : "auto", marginTop: isMobile ? 20 : 0 },
          ]}
          onPress={() => {
            resetForm();
            setAddModalVisible(true);
          }}
        >
          <Feather name="plus" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Nouveau Bus</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.mainCard}>
        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Feather name="search" size={18} color="#94a3b8" />
            <TextInput
              placeholder="Rechercher un bus..."
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#2563eb"
            style={{ marginVertical: 50 }}
          />
        ) : isMobile ? (
          /* Mobile View */
          <View style={styles.mobileList}>
            {buses
              .filter(
                (b) =>
                  b.modele.toLowerCase().includes(search.toLowerCase()) ||
                  b.busId.toLowerCase().includes(search.toLowerCase()),
              )
              .map((bus) => (
                <View key={bus.id} style={styles.busCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.idBadge}>
                      <Text style={styles.idText}>{bus.busId}</Text>
                    </View>
                    <View style={styles.actions}>
                      <TouchableOpacity
                        onPress={() => openEditModal(bus)}
                        style={styles.actionIcon}
                      >
                        <Feather name="edit-2" size={16} color="#64748b" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(bus.id, bus.busId)}
                        style={styles.actionIcon}
                      >
                        <Feather name="trash-2" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.cardModele}>{bus.modele}</Text>
                  <View style={styles.cardInfoRow}>
                    <Text style={styles.cardInfoLabel}>Ligne:</Text>
                    <Text style={styles.cardInfoValue}>{bus.ligne}</Text>
                  </View>
                  <View
                    style={[
                      styles.cardInfoRow,
                      { borderBottomWidth: 0, marginTop: 10 },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusStyle(bus.statut).bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusStyle(bus.statut).text },
                        ]}
                      >
                        {bus.statut}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
          </View>
        ) : (
          /* Web/Desktop Table */
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.columnHeader, { flex: 1 }]}>ID</Text>
              <Text style={[styles.columnHeader, { flex: 2 }]}>MODÈLE</Text>
              <Text style={[styles.columnHeader, { flex: 1.5 }]}>LIGNE</Text>
              <Text style={[styles.columnHeader, { flex: 1.5 }]}>STATUT</Text>
              <Text
                style={[styles.columnHeader, { flex: 1, textAlign: "right" }]}
              >
                ACTIONS
              </Text>
            </View>
            {buses
              .filter((b) =>
                b.modele.toLowerCase().includes(search.toLowerCase()),
              )
              .map((bus) => (
                <View key={bus.id} style={styles.tableRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.idText}>{bus.busId}</Text>
                  </View>
                  <Text
                    style={[styles.cellText, { flex: 2, fontWeight: "600" }]}
                  >
                    {bus.modele}
                  </Text>
                  <Text style={[styles.cellText, { flex: 1.5 }]}>
                    {bus.ligne}
                  </Text>
                  <View style={{ flex: 1.5 }}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusStyle(bus.statut).bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusStyle(bus.statut).text },
                        ]}
                      >
                        {bus.statut}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.actions,
                      { flex: 1, justifyContent: "flex-end" },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => openEditModal(bus)}
                      style={styles.actionIcon}
                    >
                      <Feather name="edit-2" size={16} color="#64748b" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(bus.id, bus.busId)}
                      style={styles.actionIcon}
                    >
                      <Feather name="trash-2" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
          </View>
        )}
      </View>

      {/* ── MODALS (AJOUT / EDIT) ── */}
      <Modal
        visible={addModalVisible || editModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.sheet}>
            <View style={modalStyles.handle} />
            <View style={modalStyles.sheetHeader}>
              <Text style={modalStyles.sheetTitle}>
                {editModalVisible ? "Modifier Bus" : "Nouveau Bus"}
              </Text>
              <Pressable
                onPress={() => {
                  setAddModalVisible(false);
                  setEditModalVisible(false);
                }}
                style={modalStyles.closeBtn}
              >
                <MaterialIcons name="close" size={20} color="#64748b" />
              </Pressable>
            </View>

            <ScrollView style={modalStyles.sheetBody}>
              <View style={modalStyles.fieldGroup}>
                <Text style={modalStyles.fieldLabel}>IDENTIFIANT DU BUS</Text>
                <TextInput
                  style={modalStyles.input}
                  value={busId}
                  onChangeText={setBusId}
                  placeholder="Ex: B202"
                />
              </View>
              <View style={modalStyles.fieldGroup}>
                <Text style={modalStyles.fieldLabel}>MODÈLE</Text>
                <TextInput
                  style={modalStyles.input}
                  value={modele}
                  onChangeText={setModele}
                  placeholder="Ex: Mercedes Citaro"
                />
              </View>
              <View style={modalStyles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={modalStyles.fieldLabel}>CAPACITÉ</Text>
                  <TextInput
                    style={modalStyles.input}
                    value={capacite}
                    onChangeText={setCapacite}
                    placeholder="Ex: 80 places"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={modalStyles.fieldLabel}>STATUT</Text>
                  <View style={modalStyles.pickerWrap}>
                    <Picker
                      selectedValue={statut}
                      onValueChange={(v) => setStatut(v)}
                    >
                      <Picker.Item label="Actif" value="Actif" />
                      <Picker.Item label="Maintenance" value="Maintenance" />
                      <Picker.Item label="Hors-service" value="Hors-service" />
                    </Picker>
                  </View>
                </View>
              </View>
              <View style={modalStyles.fieldGroup}>
                <Text style={modalStyles.fieldLabel}>LIGNE AFFECTÉE</Text>
                <TextInput
                  style={modalStyles.input}
                  value={ligne}
                  onChangeText={setLigne}
                  placeholder="Ex: Ligne 05"
                />
              </View>

              <View style={modalStyles.actionRow}>
                <TouchableOpacity
                  style={modalStyles.saveBtn}
                  onPress={editModalVisible ? handleUpdateBus : handleAddBus}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={modalStyles.saveBtnText}>Sauvegarder</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

// ─── STYLES (Mix entre GestionBus design et Users logic) ───────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  topBar: { padding: 20, paddingTop: 40 },
  header: {
    paddingHorizontal: 25,
    marginBottom: 25,
    justifyContent: "space-between",
  },
  title: { fontSize: 28, fontWeight: "800", color: "#0f172a" },
  subtitle: { fontSize: 16, color: "#64748b" },
  addButton: {
    backgroundColor: "#2563eb",
    flexDirection: "row",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  addButtonText: { color: "#fff", fontWeight: "700" },
  mainCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchRow: { marginBottom: 20 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 48,
  },
  searchInput: { flex: 1, marginLeft: 10 },
  tableContainer: { width: "100%" },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  columnHeader: { fontSize: 12, fontWeight: "700", color: "#94a3b8" },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  cellText: { fontSize: 14, color: "#1e293b" },
  mobileList: { gap: 15 },
  busCard: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardModele: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  cardInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  cardInfoLabel: { color: "#64748b" },
  cardInfoValue: { fontWeight: "600" },
  idBadge: { backgroundColor: "#f1f5f9", padding: 5, borderRadius: 6 },
  idText: { fontWeight: "bold", color: "#475569" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 8 },
  actionIcon: { padding: 8, backgroundColor: "#f8fafc", borderRadius: 8 },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "90%",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#e2e8f0",
    alignSelf: "center",
    marginBottom: 15,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sheetTitle: { fontSize: 20, fontWeight: "800" },
  closeBtn: { backgroundColor: "#f1f5f9", padding: 8, borderRadius: 20 },
  sheetBody: { gap: 15 },
  fieldGroup: { marginBottom: 15 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#94a3b8",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 15,
  },
  row: { flexDirection: "row", gap: 10, marginBottom: 15 },
  pickerWrap: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
  },
  actionRow: { marginTop: 20 },
  saveBtn: {
    backgroundColor: "#2563eb",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
