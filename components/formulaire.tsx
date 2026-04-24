// app/components/Formulaire.tsx
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface FormulaireProps {
  onSubmit: (email: String, password: String) => void;
}

export default function Formulaire({onSubmit}: FormulaireProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);

  // Activer les champs
  const handleActivate = () => {
    setIsDisabled(false);
  };

  // Se connecter
  const handleLogin = () => {
    if (email && password) {
      onSubmit(email, password);
    } else {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
    }
  };

  return (
    <View style={styles.formContainer}>
      {/* Champ Email */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, isDisabled && styles.inputDisabled]}
        placeholder={isDisabled ? "Champ désactivé" : "Entrez votre email"}
        value={email}
        onChangeText={setEmail}
        editable={!isDisabled}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Champ Mot de passe */}
      <Text style={styles.label}>Mot de passe</Text>
      <TextInput
        style={[styles.input, isDisabled && styles.inputDisabled]}
        placeholder={
          isDisabled ? "Champ désactivé" : "Entrez votre mot de passe"
        }
        value={password}
        onChangeText={setPassword}
        editable={!isDisabled}
        secureTextEntry
      />

      {/* Boutons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.activateButton,
            !isDisabled && styles.buttonDisabled,
          ]}
          onPress={handleActivate}
          disabled={!isDisabled}
        >
          <Text style={styles.buttonText}>Activer les champs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.loginButton,
            (isDisabled || !email || !password) && styles.buttonDisabled,
          ]}
          onPress={handleLogin}
          disabled={isDisabled || !email || !password}
        >
          <Text style={styles.buttonText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
    marginTop: 15,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputDisabled: {
    backgroundColor: "#f0f0f0",
    color: "#999",
    borderColor: "#ddd",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 35,
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  activateButton: {
    backgroundColor: "#10b981", // vert
  },
  loginButton: {
    backgroundColor: "#3b82f6", // bleu
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
