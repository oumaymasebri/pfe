import Formulaire from "@/components/formulaire";
import { auth, db } from "@/configFirebase"; // Zid auth hna
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth"; // Importi hedhi
import { doc, setDoc } from "firebase/firestore"; // Badel addDoc b setDoc
import { Alert, Platform, StyleSheet, View } from "react-native";

export default function AddUserPage() {
  const router = useRouter();

  const handleAddUser = async (data: any) => {
    try {
      // 1. Création mta3 el compte fi Authentication
      // Lezem t-passi el auth, l'email, wel password li jeyin mel Formulaire
      console.log("Données reçues du formulaire :", data); // Debug
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );

      const user = userCredential.user;

      // 2. Enregistrement fi Firestore
      // Nestas3mlou setDoc m3a doc(db, "users", user.uid)
      // bech el User ID ykoun houwa bidou mta3 el Auth
      await setDoc(doc(db, "users", user.uid), {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber || "",
        role: data.role,
        status: data.status,
        createdAt: new Date().toISOString(),
      });

      // 3. Notification
      if (Platform.OS === "web") {
        alert("Utilisateur ajouté avec succès dans Auth et Firestore !");
      } else {
        Alert.alert("Succès", "Utilisateur ajouté !");
      }

      router.replace("/users");
    } catch (error: any) {
      console.error("Erreur lors de l'ajout :", error);

      // Error handling bech ta3ref chnouwa el mochkla (email déjà utilisé, etc.)
      let errorMessage = "Une erreur est survenue.";
      if (error.code === "auth/email-already-in-use")
        errorMessage = "Cet email est déjà utilisé.";
      if (error.code === "auth/weak-password")
        errorMessage = "Le mot de passe est trop faible.";

      alert(errorMessage);
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
