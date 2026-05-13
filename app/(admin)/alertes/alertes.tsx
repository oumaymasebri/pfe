/* eslint-disable react/no-unescaped-entities */
import { db } from "@/configFirebase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
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
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AdminAlertsPage = () => {
  const navigation = useNavigation();

  // États pour les données
  const [iotAlert, setIotAlert] = useState<any>(null);
  const [passengerSignals, setPassengerSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // États pour la réponse
  const [selectedSignal, setSelectedSignal] = useState<any>(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [isReplyVisible, setIsReplyVisible] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);

  // 1. Fetch IoT Alerts (FastAPI)
  // const fetchIotData = async () => {
  //   try {
  //     const response = await fetch("https://paz-unpedigreed-eloise.ngrok-free.dev/mpu",{
  //       method: "GET",
  //     });
  //     console.log(response);
      
  //     const data = await response.json();
  //     setIotAlert(data);
  //   } catch (error) {
  //     console.error("Erreur Fetch IoT:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
// 1. Fetch IoT Alerts (FastAPI)
const fetchIotData = async () => {
  try {
    // Pour développement web seulement
    if (Platform.OS === 'web') {
      // Utiliser un proxy ou mode no-cors
      const response = await fetch("https://paz-unpedigreed-eloise.ngrok-free.dev/mpu", {
        method: "GET",
        mode: 'no-cors', // ⚠️ Attention: ne donne pas accès à response.json()
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      // Avec 'no-cors', on ne peut pas lire la réponse
      // Solution alternative: utiliser un proxy
      const data = await response.json();
      // setIotAlert(data);
      if(data) {console.log(data); setIotAlert(data);  }
    } else {
      // Pour mobile (iOS/Android), CORS n'est pas applicable
      const response = await fetch("https://paz-unpedigreed-eloise.ngrok-free.dev/mpu", {
        method: "GET",
      });
      const data = await response.json();
      setIotAlert(data);
    }
  } catch (error) {
    console.error("Erreur Fetch IoT:", error);
  } finally {
    setLoading(false);
  }
};
  // 2. Real-time Listener (Firestore)
  useEffect(() => {
    fetchIotData();
    const interval = setInterval(fetchIotData, 10000);

    const q = query(
      collection(db, "passenger_signals"),
      orderBy("timestamp", "desc"),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const signals = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPassengerSignals(signals);
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  // 3. Envoyer la réponse au passager
  const handleSendResponse = async () => {
    if (!adminMessage.trim()) {
      Alert.alert("Erreur", "Veuillez écrire un message.");
      return;
    }

    setIsSendingReply(true);
    try {
      await addDoc(collection(db, "responses"), {
        signalId: selectedSignal.id,
        message: adminMessage,
        adminName: "Direction SmartBus",
        timestamp: serverTimestamp(),
      });

      Alert.alert("Succès", "Réponse envoyée au passager.");
      setIsReplyVisible(false);
      setAdminMessage("");
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible d'envoyer la réponse.");
    } finally {
      setIsSendingReply(false);
    }
  };

  const renderIotHeader = () => {
    if (!iotAlert) return null;
    const isCritical = iotAlert.analysis_3min_window.traffic_jam.is_jammed;

    return (
      <View
        style={[
          styles.card,
          isCritical ? styles.borderWarning : styles.borderNormal,
        ]}
      >
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons
            name={(isCritical ? "traffic-light" : "bus-check") as any}
            size={24}
            color={isCritical ? "#F1C40F" : "#2ECC71"}
          />
          <Text style={styles.cardTitle}>
            Bus: {iotAlert.mpu_latest.device_id}
          </Text>
        </View>
        <Text style={styles.desc}>
          Vitesse: {iotAlert.gps_latest.current_speed} m/s | Traffic:{" "}
          {isCritical ? "Embouteillage" : "Fluide"}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER AVEC SIDEBAR LOGIC */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Ionicons name="menu-outline" size={26} color="#64748b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alertes & Signaux</Text>
        <MaterialCommunityIcons name="bell-outline" size={26} color="#333" />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#3498DB"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          ListHeaderComponent={renderIotHeader}
          data={passengerSignals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.passengerCard}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons
                  name="account-alert"
                  size={22}
                  color="#3498DB"
                />
                <Text style={styles.passengerType}>
                  {item.type || "Signal"}
                </Text>
              </View>
              <Text style={styles.desc}>{item.message}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.timeText}>Bus: {item.busId}</Text>
                <TouchableOpacity
                  style={styles.btnSmall}
                  onPress={() => {
                    setSelectedSignal(item);
                    setIsReplyVisible(true);
                  }}
                >
                  <Text style={styles.btnText}>Répondre</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>Aucun signal passager.</Text>
          }
        />
      )}

      {/* MODAL POUR RÉPONDRE AU PASSAGER */}
      <Modal visible={isReplyVisible} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Réponse à : {selectedSignal?.type}
            </Text>
            <Text style={styles.modalSub}>
              Message passager : "{selectedSignal?.message}"
            </Text>

            <TextInput
              style={styles.input}
              multiline
              numberOfLines={4}
              placeholder="Ex: Objet trouvé, il est à l'agence Barcelone."
              value={adminMessage}
              onChangeText={setAdminMessage}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.btnModal, styles.btnCancel]}
                onPress={() => setIsReplyVisible(false)}
              >
                <Text style={styles.btnTextBlack}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnModal, styles.btnConfirm]}
                onPress={handleSendResponse}
                disabled={isSendingReply}
              >
                {isSendingReply ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>Envoyer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7F6" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#fff",
    elevation: 2,
    paddingTop: Platform.OS === "android" ? 40 : 20,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#2C3E50" },
  list: { padding: 15 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
  },
  passengerCard: {
    backgroundColor: "#EBF5FB",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: "#3498DB",
  },
  borderWarning: { borderLeftWidth: 5, borderLeftColor: "#F1C40F" },
  borderNormal: { borderLeftWidth: 5, borderLeftColor: "#2ECC71" },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginLeft: 10 },
  passengerType: {
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#2980B9",
  },
  desc: { fontSize: 14, color: "#566573", marginBottom: 10 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeText: { fontSize: 12, color: "#7F8C8D" },
  btnSmall: {
    backgroundColor: "#3498DB",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  btnTextBlack: { color: "#000", fontWeight: "bold" },
  empty: { textAlign: "center", marginTop: 20, color: "#95A5A6" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  modalSub: {
    fontSize: 13,
    color: "#666",
    marginBottom: 15,
    fontStyle: "italic",
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    textAlignVertical: "top",
    height: 100,
  },
  modalButtons: { flexDirection: "row", gap: 10, marginTop: 20 },
  btnModal: { flex: 1, padding: 15, borderRadius: 10, alignItems: "center" },
  btnCancel: { backgroundColor: "#EEE" },
  btnConfirm: { backgroundColor: "#28A745" },
});

export default AdminAlertsPage;
