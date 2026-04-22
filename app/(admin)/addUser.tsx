import Formulaire from "@/components/formulaire";
import { db } from "@/configFirebase";
import { useRouter } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { Alert, Platform, StyleSheet, View } from "react-native";

export default function AddUserPage() {
  const router = useRouter();

  // Cette fonction sera appelée par le composant Formulaire
  const handleAddUser = async (data: any) => {
    try {
      // 1. Enregistrement dans Firebase
      await addDoc(collection(db, "users"), {
        ...data,
        createdAt: new Date().toISOString(), // Ajoute la date actuelle
      });

      // 2. Notification de succès
      if (Platform.OS === "web") {
        alert("Utilisateur ajouté avec succès !");
      } else {
        Alert.alert("Succès", "Utilisateur ajouté !");
      }

      // 3. Retour à la liste des utilisateurs
      router.replace("/users");
    } catch (error) {
      console.error("Erreur lors de l'ajout :", error);
      alert("Une erreur est survenue lors de l'ajout.");
    }
  };

  return (
    <View style={styles.container}>
      <Formulaire onSubmit={handleAddUser} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: Platform.OS === "web" ? 40 : 20,
  },
});
