/* eslint-disable react/no-unescaped-entities */
import { db } from "@/configFirebase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PageAlertesPassager = () => {
  const navigation = useNavigation();

  // --- 1. STATES ---
  const [adminResponses, setAdminResponses] = useState<any[]>([]);
  const [mySignals, setMySignals] = useState<any[]>([]);
  const [isReportVisible, setIsReportVisible] = useState(false);
  const [reportType, setReportType] = useState("");
  const [reportBus, setReportBus] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [isSending, setIsSending] = useState(false);

  // --- 2. REAL-TIME DATA (HOOKS) ---
  useEffect(() => {
    // Écouter les réponses Admin
    const qAdmin = query(
      collection(db, "responses"),
      orderBy("timestamp", "desc"),
    );
    const unsubAdmin = onSnapshot(qAdmin, (snapshot) => {
      setAdminResponses(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    });

    // Écouter mes propres signalements (Boite d'envoi)
    const qSignals = query(
      collection(db, "passenger_signals"),
      orderBy("timestamp", "desc"),
    );
    const unsubSignals = onSnapshot(qSignals, (snapshot) => {
      setMySignals(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubAdmin();
      unsubSignals();
    };
  }, []);

  // --- 3. FONCTIONS ---
  const handleSendReport = async () => {
    if (!reportType || !reportDesc || !reportBus) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setIsSending(true);
    try {
      await addDoc(collection(db, "passenger_signals"), {
        type: reportType,
        message: reportDesc,
        busId: reportBus,
        timestamp: serverTimestamp(),
      });
      Alert.alert("Succès", "Signalement envoyé à l'administration.");
      setIsReportVisible(false);
      setReportType("");
      setReportBus("");
      setReportDesc("");
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible d'envoyer le signalement.");
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (ts: any) => {
    if (!ts) return "...";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Alertes & Réponses</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* SECTION 1: RÉPONSES DE L'ADMIN */}
        <Text style={styles.sectionTitle}>Réponses de l'Admin</Text>
        {adminResponses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Aucune réponse reçue.</Text>
          </View>
        ) : (
          adminResponses.map((res) => (
            <View key={res.id} style={styles.responseCard}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialCommunityIcons
                    name="comment-check-outline"
                    size={18}
                    color="#28A745"
                  />
                  <Text style={styles.adminTag}>
                    {res.adminName || "Admin"}
                  </Text>
                </View>
                <Text style={styles.timeText}>{formatTime(res.timestamp)}</Text>
              </View>
              <Text style={styles.messageText}>{res.message}</Text>
            </View>
          ))
        )}

        {/* SECTION 2: MA BOITE D'ENVOI */}
        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>
          Mes Signalements (Boite d'envoi)
        </Text>
        {mySignals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Historique d'envoi vide.</Text>
          </View>
        ) : (
          mySignals.map((sig) => (
            <View key={sig.id} style={styles.sentCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.typeTag}>
                  {sig.type} (Bus {sig.busId})
                </Text>
                <Text style={styles.timeText}>{formatTime(sig.timestamp)}</Text>
              </View>
              <Text style={styles.messageText}>{sig.message}</Text>
            </View>
          ))
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#6B4EFF"
          />
          <Text style={styles.infoText}>
            L'admin vous répondra ici dès que possible.
          </Text>
        </View>
      </ScrollView>

      {/* Bouton FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsReportVisible(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.fabText}>Nouveau Signalement</Text>
      </TouchableOpacity>

      {/* Modal de Signalement */}
      <Modal visible={isReportVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <KeyboardAvoidingView behavior="padding" style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Signaler un problème</Text>
              <TouchableOpacity onPress={() => setIsReportVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Type de problème</Text>
              <TextInput
                style={styles.input}
                value={reportType}
                onChangeText={setReportType}
                placeholder="Objet perdu, retard..."
              />
              <Text style={styles.label}>N° du Bus</Text>
              <TextInput
                style={styles.input}
                value={reportBus}
                onChangeText={setReportBus}
                placeholder="Ex: 102"
              />
              <Text style={styles.label}>Détails</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                multiline
                value={reportDesc}
                onChangeText={setReportDesc}
                placeholder="Décrivez le problème..."
              />
              <TouchableOpacity
                style={styles.btnSend}
                onPress={handleSendReport}
                disabled={isSending}
              >
                {isSending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnSendText}>Envoyer</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? 40 : 20,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  scrollContent: { padding: 20, paddingBottom: 120 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  timeText: { fontSize: 11, color: "#888", fontWeight: "600" },
  responseCard: {
    backgroundColor: "#EFFFF4",
    padding: 15,
    borderRadius: 15,
    borderLeftWidth: 5,
    borderLeftColor: "#28A745",
    marginBottom: 12,
    elevation: 2,
  },
  sentCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    borderLeftWidth: 5,
    borderLeftColor: "#6b46c1",
    marginBottom: 12,
    elevation: 2,
  },
  adminTag: {
    marginLeft: 8,
    fontWeight: "bold",
    color: "#28A745",
    fontSize: 13,
  },
  typeTag: { fontWeight: "bold", color: "#6b46c1", fontSize: 13 },
  messageText: { fontSize: 15, color: "#2C3E50", lineHeight: 20 },
  emptyCard: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyText: { color: "#999" },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#F0EFFF",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  infoText: { flex: 1, marginLeft: 10, color: "#6b46c1", fontSize: 13 },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    left: 20,
    height: 55,
    backgroundColor: "#6b46c1",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  fabText: { color: "#fff", fontWeight: "bold", marginLeft: 10 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    height: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold" },
  label: { fontWeight: "bold", marginTop: 15, marginBottom: 5 },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  btnSend: {
    backgroundColor: "#6b46c1",
    padding: 16,
    borderRadius: 12,
    marginTop: 25,
    alignItems: "center",
  },
  btnSendText: { color: "#fff", fontWeight: "bold" },
});

export default PageAlertesPassager;
