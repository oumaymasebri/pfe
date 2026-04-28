// app/(admin)/gestion-bus.tsx   (ou le nom que tu utilises)
import { Feather } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

// --- TYPES ET DONNÉES DE TEST ---
interface Bus {
  id: string;
  modele: string;
  capacite: string;
  ligne: string;
  statut: "Actif" | "Maintenance" | "Hors-service";
}

const mockBuses: Bus[] = [
  {
    id: "B101",
    modele: "Volvo 7900",
    capacite: "80 places",
    ligne: "Ligne 1",
    statut: "Actif",
  },
  {
    id: "B102",
    modele: "Mercedes Citaro",
    capacite: "85 places",
    ligne: "Ligne 2",
    statut: "Actif",
  },
  {
    id: "B103",
    modele: "MAN Lion City",
    capacite: "75 places",
    ligne: "N/A",
    statut: "Maintenance",
  },
  {
    id: "B104",
    modele: "Volvo 7900",
    capacite: "80 places",
    ligne: "Ligne 4",
    statut: "Actif",
  },
  {
    id: "B105",
    modele: "Mercedes Citaro",
    capacite: "85 places",
    ligne: "N/A",
    statut: "Hors-service",
  },
];

// --- Fonctions Utilitaires ---
const getStatusStyle = (statut: string) => {
  switch (statut) {
    case "Actif":
      return { bg: "#dcfce7", text: "#166534" };
    case "Maintenance":
      return { bg: "#fef3c7", text: "#92400e" };
    case "Hors-service":
      return { bg: "#f1f5f9", text: "#475569" };
    default:
      return { bg: "#eee", text: "#333" };
  }
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },

  topBar: {
    paddingHorizontal: 15,
    paddingTop: 15,
    marginBottom: 10,
  },

  header: {
    justifyContent: "space-between",
    marginBottom: 30,
    paddingHorizontal: 15,
  },
  title: { fontSize: 28, fontWeight: "800", color: "#0f172a" },
  subtitle: { fontSize: 16, color: "#64748b", marginTop: 4 },

  addButton: {
    backgroundColor: "#2563eb",
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addButtonText: { color: "#fff", fontWeight: "600", fontSize: 15 },

  mainCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: Platform.OS === "web" ? 20 : 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 45,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14 },

  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 8,
    width: 45,
    height: 45,
  },
  filterText: { fontWeight: "600", color: "#1e293b" },

  tableContainer: { width: "100%" },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    marginBottom: 5,
  },
  columnHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 0.5,
  },
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
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    padding: 15,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardModele: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 15,
  },
  cardInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  cardInfoLabel: { fontSize: 14, color: "#64748b", fontWeight: "500" },
  cardInfoValue: { fontSize: 14, color: "#1e293b", fontWeight: "600" },

  idBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  idText: { fontSize: 13, fontWeight: "700", color: "#475569" },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  statusText: { fontSize: 12, fontWeight: "700" },

  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 5 },
  actionIcon: { padding: 8, backgroundColor: "#f8fafc", borderRadius: 8 },
});

// --- COMPOSANTS INTERNES ---
const IdBadge = ({ id }: { id: string }) => (
  <View style={styles.idBadge}>
    <Text style={styles.idText}>{id}</Text>
  </View>
);

const StatusBadge = ({ statut }: { statut: string }) => {
  const colors = getStatusStyle(statut);
  return (
    <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.statusText, { color: colors.text }]}>{statut}</Text>
    </View>
  );
};

const ActionButtons = () => (
  <View style={styles.actions}>
    <TouchableOpacity style={styles.actionIcon}>
      <Feather name="edit-2" size={18} color="#94a3b8" />
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionIcon}>
      <Feather name="trash-2" size={18} color="#94a3b8" />
    </TouchableOpacity>
  </View>
);

// --- COMPOSANT PRINCIPAL ---
export default function GestionBusResponsive() {
  const navigation = useNavigation(); // Pour le drawer

  const [search, setSearch] = useState("");
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const filteredBuses = mockBuses.filter(
    (bus) =>
      bus.id.toLowerCase().includes(search.toLowerCase()) ||
      bus.modele.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <ScrollView style={[styles.container, { padding: isMobile ? 15 : 40 }]}>
      {/* Bouton Menu (comme dans le Dashboard) */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Feather name="menu" size={28} color="#0f172a" />
        </TouchableOpacity>
      </View>

      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
          },
        ]}
      >
        <View style={{ marginBottom: isMobile ? 20 : 0 }}>
          <Text style={styles.title}>Gestion des Bus</Text>
          <Text style={styles.subtitle}>
            Consultez et gérez la flotte de véhicules.
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { width: isMobile ? "100%" : "auto" }]}
        >
          <Feather name="plus" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Ajouter un Bus</Text>
        </TouchableOpacity>
      </View>

      {/* Contenu principal */}
      <View style={styles.mainCard}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Feather name="search" size={18} color="#94a3b8" />
            <TextInput
              placeholder="Rechercher par ID ou Modèle..."
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Feather name="filter" size={18} color="#1e293b" />
            {!isMobile && <Text style={styles.filterText}>Filtres</Text>}
          </TouchableOpacity>
        </View>

        {isMobile ? (
          <View style={styles.mobileList}>
            {filteredBuses.map((bus) => (
              <View key={bus.id} style={styles.busCard}>
                <View style={styles.cardHeader}>
                  <IdBadge id={bus.id} />
                  <ActionButtons />
                </View>
                <Text style={styles.cardModele}>{bus.modele}</Text>

                <View style={styles.cardInfoRow}>
                  <Text style={styles.cardInfoLabel}>Capacité:</Text>
                  <Text style={styles.cardInfoValue}>{bus.capacite}</Text>
                </View>
                <View style={styles.cardInfoRow}>
                  <Text style={styles.cardInfoLabel}>Ligne:</Text>
                  <Text style={styles.cardInfoValue}>{bus.ligne}</Text>
                </View>
                <View
                  style={[
                    styles.cardInfoRow,
                    { borderBottomWidth: 0, paddingBottom: 0, marginTop: 10 },
                  ]}
                >
                  <StatusBadge statut={bus.statut} />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.columnHeader, { flex: 1 }]}>
                IDENTIFIANT
              </Text>
              <Text style={[styles.columnHeader, { flex: 2 }]}>MODÈLE</Text>
              <Text style={[styles.columnHeader, { flex: 1.5 }]}>CAPACITÉ</Text>
              <Text style={[styles.columnHeader, { flex: 1.5 }]}>
                LIGNE ACTUELLE
              </Text>
              <Text style={[styles.columnHeader, { flex: 1.5 }]}>STATUT</Text>
              <Text
                style={[styles.columnHeader, { flex: 1, textAlign: "right" }]}
              >
                ACTIONS
              </Text>
            </View>

            {filteredBuses.map((bus) => (
              <View key={bus.id} style={styles.tableRow}>
                <View style={{ flex: 1 }}>
                  <IdBadge id={bus.id} />
                </View>
                <Text style={[styles.cellText, { flex: 2, fontWeight: "600" }]}>
                  {bus.modele}
                </Text>
                <Text style={[styles.cellText, { flex: 1.5 }]}>
                  {bus.capacite}
                </Text>
                <Text style={[styles.cellText, { flex: 1.5 }]}>
                  {bus.ligne}
                </Text>
                <View style={{ flex: 1.5 }}>
                  <StatusBadge statut={bus.statut} />
                </View>
                <ActionButtons />
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
