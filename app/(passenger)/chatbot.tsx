/* eslint-disable @typescript-eslint/no-unused-vars */
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// REMPLACE PAR TON ADRESSE IP LOCALE (Tape 'ipconfig' dans ton terminal Windows)
const API_URL = "http://192.168.100.13:8001/ask_mobile";

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Bonjour ! Je suis l'assistant SMART BUS. Comment puis-je vous aider ?",
      sender: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    // 1. Ajouter le message de l'utilisateur
    const userMsg = {
      id: Date.now().toString(),
      text: input,
      sender: "user" as const,
    };
    setMessages((prev) => [...prev, userMsg]);
    const currentQuestion = input;
    setInput("");
    setLoading(true);

    try {
      // 2. Appel à l'API FastAPI
      const formData = new FormData();
      formData.append("question", currentQuestion);
      console.log("Envoi de la question à l'API:", formData.get("question"));

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Réponse de l'API:", data);

      // 3. Ajouter la réponse de l'IA
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: data.answer,
          sender: "ai",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "Désolé, je n'arrive pas à joindre le serveur. Vérifiez votre connexion.",
          sender: "ai",
        },
      ]);
    } finally {
      setLoading(false);
      // Scroll vers le bas automatique
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assistant SMART BUS</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.sender === "user" ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text
              style={item.sender === "user" ? styles.userText : styles.aiText}
            >
              {item.text}
            </Text>
          </View>
        )}
      />

      {loading && (
        <ActivityIndicator color="#6b46c1" style={{ marginBottom: 10 }} />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Posez votre question..."
          placeholderTextColor="#888"
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={styles.sendBtn}
          disabled={loading}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#6b46c1" },
  bubble: { padding: 12, borderRadius: 20, marginBottom: 10, maxWidth: "85%" },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#6b46c1",
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 2,
    elevation: 2,
  },
  userText: { color: "#fff", fontSize: 15 },
  aiText: { color: "#333", fontSize: 15 },
  inputContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: {
    flex: 1,
    backgroundColor: "#F1F3F5",
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 45,
    fontSize: 16,
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: "#6b46c1 ",
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
  },
});
