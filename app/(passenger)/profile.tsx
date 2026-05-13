import { auth, db } from "@/configFirebase";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/userSlice";

// ─── Composant champ de saisie ─────────────────────────────────────────────
interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: any;
  autoCapitalize?: any;
  icon: string;
  secureTextEntry?: boolean;
  toggleSecure?: () => void;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "sentences",
  icon,
  secureTextEntry = false,
  toggleSecure,
  error,
}) => (
  <View style={fieldStyles.wrapper}>
    <Text style={fieldStyles.label}>{label}</Text>
    <View
      style={[
        fieldStyles.inputRow,
        !!error && fieldStyles.inputError,
      ]}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={error ? "#FF3B30" : "#6b46c1"}
        style={fieldStyles.icon}
      />
      <TextInput
        style={fieldStyles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#B0B0B0"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
      />
      {toggleSecure && (
        <TouchableOpacity onPress={toggleSecure} style={fieldStyles.eyeBtn}>
          <Ionicons
            name={secureTextEntry ? "eye-outline" : "eye-off-outline"}
            size={20}
            color="#999"
          />
        </TouchableOpacity>
      )}
    </View>
    {!!error && <Text style={fieldStyles.errorText}>{error}</Text>}
  </View>
);

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    marginBottom: 6,
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F4FF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E8E6FF",
    paddingHorizontal: 14,
    height: 54,
  },
  inputError: {
    borderColor: "#FF3B30",
    backgroundColor: "#FFF5F5",
  },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#222",
  },
  eyeBtn: { padding: 4 },
  errorText: {
    fontSize: 12,
    color: "#FF3B30",
    marginTop: 4,
    marginLeft: 4,
  },
});

// ─── Écran principal ───────────────────────────────────────────────────────
const ProfileScreen = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);

  const profileData = user || {
    name: "Alex Ben Ammar",
    email: "alex@smartbus.tn",
    phoneNumber: "+216 98 123 456",
    avatar: null,
    trips: 124,
    points: 2450,
    memberSince: "2024",
  };

  // ── État formulaire profil ──
  const [profileForm, setProfileForm] = useState({
    name: profileData.name,
    email: profileData.email,
    phone: profileData.phoneNumber,
    currentPassword: "",
  });
  const [showCurrentProfile, setShowCurrentProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState<any>({});
  const [savingProfile, setSavingProfile] = useState(false);

  // ── État formulaire mot de passe ──
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<any>({});
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Sections ouvertes/fermées ──
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

const handleLogout = () => {
  // Sur Web, Alert.alert utilise window.confirm automatiquement.
  Alert.alert(
    "Déconnexion", 
    "Êtes-vous sûr de vouloir vous déconnecter ?", 
    [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          try {
            // 1. Supprimer le token du stockage local (indispensable d'attendre ici)
            await AsyncStorage.removeItem("userToken");

            // 2. Mettre à jour l'état global Redux
            dispatch(logout()); 

            // 3. Rediriger vers la page de connexion
            // On utilise replace pour vider la pile de navigation
            router.replace("/(auth)/signin");
          } catch (error) {
            console.error("Erreur lors de la déconnexion :", error);
            // En cas d'échec du storage, on force quand même le retour au login
            router.replace("/(auth)/signin");
          }
        },
      },
    ]
  );
};

  // ─── Validation profil ─────────────────────────────────────────────────────
  const validateProfile = (): boolean => {
    const errors: any = {};
    if (!profileForm.name.trim()) errors.name = "Le nom est obligatoire";
    else if (profileForm.name.trim().length < 3)
      errors.name = "Minimum 3 caractères";
    if (!profileForm.email.trim()) errors.email = "L'email est obligatoire";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email))
      errors.email = "Adresse email invalide";
    if (!profileForm.phone.trim()) errors.phone = "Numéro obligatoire";
    else if (!/^(\+216\s?)?[0-9\s]{8,}$/.test(profileForm.phone))
      errors.phone = "Numéro invalide";
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── Validation mot de passe ───────────────────────────────────────────────
  const validatePassword = (): boolean => {
    const errors: any = {};
    if (!passwordForm.currentPassword)
      errors.currentPassword = "Mot de passe actuel requis";
    if (!passwordForm.newPassword)
      errors.newPassword = "Nouveau mot de passe requis";
    else if (passwordForm.newPassword.length < 8)
      errors.newPassword = "Minimum 8 caractères";
    else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(passwordForm.newPassword))
      errors.newPassword = "Doit contenir une majuscule et un chiffre";
    if (!passwordForm.confirmPassword)
      errors.confirmPassword = "Confirmation requise";
    else if (passwordForm.newPassword !== passwordForm.confirmPassword)
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

const handleSaveProfile = async () => {
  if (!validateProfile()) return;
  setSavingProfile(true);

  const currentUser = auth.currentUser;

  if (!currentUser || !currentUser.email) {
    Alert.alert("❌ Erreur", "Utilisateur non connecté.");
    setSavingProfile(false);
    return;
  }

  try {
    const emailChanged = profileForm.email.trim() !== currentUser.email.trim();
    // ── Si l'email a changé → ré-auth obligatoire ──
    if (emailChanged) {
      if (!profileForm.currentPassword) {
        setProfileErrors((e: any) => ({
          ...e,
          currentPassword: "Mot de passe requis pour changer l'email",
        }));
        setSavingProfile(false);
        return;
      }

      const credential = EmailAuthProvider.credential(
        currentUser.email,
        profileForm.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);
      await verifyBeforeUpdateEmail(currentUser, profileForm.email.trim());
      
    }

    // ── Mettre à jour Firestore ──
    await updateDoc(doc(db, "users", currentUser.uid), {
      fullName: profileForm.name,
      phoneNumber: profileForm.phone,
      ...(emailChanged && { email: profileForm.email.trim() }),
    });

    setProfileForm((p) => ({ ...p, currentPassword: "" }));
    setEditOpen(false);

    if (emailChanged) {
      Alert.alert(
        "📧 Vérification requise",
        `Un email de confirmation a été envoyé à ${profileForm.email}. Validez-le pour appliquer le changement.`
      );
    } else {
      Alert.alert("✅ Succès", "Profil mis à jour avec succès !");
    }

  } catch (error: any) {
    switch (error.code) {
      case "auth/wrong-password":
      case "auth/invalid-credential":
        setProfileErrors((e: any) => ({
          ...e,
          currentPassword: "Mot de passe incorrect ❌",
        }));
        break;
      case "auth/email-already-in-use":
        setProfileErrors((e: any) => ({
          ...e,
          email: "Cet email est déjà utilisé",
        }));
        break;
      case "auth/requires-recent-login":
        Alert.alert("❌ Session expirée", "Veuillez vous reconnecter.");
        break;
      default:
        Alert.alert("❌ Erreur", error.message || "Une erreur est survenue.");
    }
  } finally {
    setSavingProfile(false);
  }
};
  const handleSavePassword = async () => {
  if (!validatePassword()) return;
  setSavingPassword(true);
  try {
    const currentUser = auth.currentUser;

    if (!currentUser || !currentUser.email) {
      Alert.alert("❌ Erreur", "Utilisateur non connecté.");
      return;
    }

    // Ré-authentifier avec le mot de passe actuel
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      passwordForm.currentPassword
    );
    await reauthenticateWithCredential(currentUser, credential);

    await updatePassword(currentUser, passwordForm.newPassword);

    Alert.alert("✅ Succès", "Mot de passe modifié avec succès !");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordOpen(false);
    AsyncStorage.removeItem("userToken");
    router.replace("/(auth)/signin");

  } catch (error: any) {
    switch (error.code) {
      case "auth/wrong-password":
      case "auth/invalid-credential":
        Alert.alert("❌ Erreur", "Le mot de passe actuel est incorrect.");
        break;
      case "auth/too-many-requests":
        Alert.alert("❌ Erreur", "Trop de tentatives. Réessayez plus tard.");
        break;
      case "auth/requires-recent-login":
        Alert.alert("❌ Session expirée", "Veuillez vous reconnecter et réessayer.");
        break;
      case "auth/network-request-failed":
        Alert.alert("❌ Erreur réseau", "Vérifiez votre connexion internet.");
        break;
      default:
        Alert.alert("❌ Erreur", error.message || "Une erreur est survenue.");
    }
  } finally {
    setSavingPassword(false);
  }
};
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { level: 0, label: "", color: "#E0E0E0" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 2) return { level: score, label: "Faible", color: "#FF3B30" };
    if (score <= 3) return { level: score, label: "Moyen", color: "#FF9500" };
    return { level: score, label: "Fort", color: "#34C759" };
  };
  const strength = getPasswordStrength(passwordForm.newPassword);

  const menuItems = [
    {
      icon: "person-outline",
      title: "Modifier le profil",
      onPress: () => {
        setEditOpen((v) => !v);
        setPasswordOpen(false);
      },
      active: editOpen,
    },
    {
      icon: "notifications-outline",
      title: "Notifications",
      onPress: () => router.push("/(passenger)/alertes"),
      active: false,
    },
    {
      icon: "heart-outline",
      title: "Favoris",
      onPress: () => router.push("/(passenger)/favoris"),
      active: false,
    },
    {
      icon: "lock-closed-outline",
      title: "Changer le mot de passe",
      onPress: () => {
        setPasswordOpen((v) => !v);
        setEditOpen(false);
      },
      active: passwordOpen,
    },
    {
      icon: "settings-outline",
      title: "Paramètres",
      onPress: () => router.push("/(passenger)/parametres"),
      active: false,
    },
    {
      icon: "help-circle-outline",
      title: "Support & Aide",
      onPress: () => Alert.alert("Support"),
      active: false,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── En-tête avec photo de profil ── */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              {profileData.avatar ? (
                <Image
                  source={{ uri: profileData.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Ionicons name="person" size={60} color="#6b46c1" />
                </View>
              )}
              <TouchableOpacity
                style={styles.editAvatarButton}
                onPress={() => {
                  setEditOpen(true);
                  setPasswordOpen(false);
                }}
              >
                <Ionicons name="camera" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{profileData.name}</Text>
            <Text style={styles.userEmail}>{profileData.email}</Text>
            <Text style={styles.userPhone}>{profileData.phoneNumber}</Text>
          </View>

          {/* ── Statistiques ── */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{profileData.trips}</Text>
              <Text style={styles.statLabel}>Trajets complétés</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{profileData.points}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{profileData.memberSince}</Text>
              <Text style={styles.statLabel}>Membre depuis</Text>
            </View>
          </View>

          {/* ── Menu des options ── */}
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={[
                    styles.menuItem,
                    item.active && styles.menuItemActive,
                  ]}
                  onPress={item.onPress}
                >
                  <View style={styles.menuIconContainer}>
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={item.active ? "#6b46c1" : "#6b46c1"}
                    />
                  </View>
                  <Text
                    style={[
                      styles.menuTitle,
                      item.active && styles.menuTitleActive,
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Ionicons
                    name={
                      (item.title === "Modifier le profil" ||
                        item.title === "Changer le mot de passe") &&
                      item.active
                        ? "chevron-down"
                        : "chevron-forward"
                    }
                    size={20}
                    color={item.active ? "#6b46c1" : "#ccc"}
                  />
                </TouchableOpacity>

                {/* ════════════════════════════════════════
                    FORMULAIRE — Modifier le profil
                ════════════════════════════════════════ */}
                {item.title === "Modifier le profil" && editOpen && (
                  <View style={styles.formPanel}>
                    <InputField
                      label="Nom complet"
                      value={profileForm.name}
                      onChangeText={(t) =>
                        setProfileForm((p) => ({ ...p, name: t }))
                      }
                      placeholder="Votre nom complet"
                      icon="person-outline"
                      error={profileErrors.name}
                    />
                    <InputField
                      label="Adresse email"
                      value={profileForm.email}
                      onChangeText={(t) =>
                        setProfileForm((p) => ({ ...p, email: t }))
                      }
                      placeholder="votre@email.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      icon="mail-outline"
                      error={profileErrors.email}
                    />
                    <InputField
                      label="Mot de passe actuel (requis pour changer l'email)"
                      value={profileForm.currentPassword}
                      onChangeText={(t) => setProfileForm((p) => ({ ...p, currentPassword: t }))}
                      placeholder="Confirmez votre identité"
                      icon="lock-closed-outline"
                      secureTextEntry={!showCurrentProfile}
                      toggleSecure={() => setShowCurrentProfile((v) => !v)}
                      autoCapitalize="none"
                      error={profileErrors.currentPassword}
                    />
                    <InputField
                      label="Numéro de téléphone"
                      value={profileForm.phone}
                      onChangeText={(t) =>
                        setProfileForm((p) => ({ ...p, phone: t }))
                      }
                      placeholder="+216 XX XXX XXX"
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                      icon="call-outline"
                      error={profileErrors.phone}
                    />
                    <View style={styles.formButtons}>
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => setEditOpen(false)}
                      >
                        <Text style={styles.cancelBtnText}>Annuler</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.saveBtn,
                          savingProfile && { opacity: 0.75 },
                        ]}
                        onPress={handleSaveProfile}
                        disabled={savingProfile}
                      >
                        {savingProfile ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <>
                            <Ionicons name="checkmark" size={18} color="#fff" />
                            <Text style={styles.saveBtnText}>Sauvegarder</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* ════════════════════════════════════════
                    FORMULAIRE — Changer le mot de passe
                ════════════════════════════════════════ */}
                {item.title === "Changer le mot de passe" && passwordOpen && (
                  <View style={styles.formPanel}>
                    <InputField
                      label="Mot de passe actuel"
                      value={passwordForm.currentPassword}
                      onChangeText={(t) =>
                        setPasswordForm((p) => ({ ...p, currentPassword: t }))
                      }
                      placeholder="Entrez votre mot de passe actuel"
                      icon="lock-closed-outline"
                      secureTextEntry={!showCurrent}
                      toggleSecure={() => setShowCurrent((v) => !v)}
                      autoCapitalize="none"
                      error={passwordErrors.currentPassword}
                    />
                    <InputField
                      label="Nouveau mot de passe"
                      value={passwordForm.newPassword}
                      onChangeText={(t) =>
                        setPasswordForm((p) => ({ ...p, newPassword: t }))
                      }
                      placeholder="Minimum 8 caractères"
                      icon="key-outline"
                      secureTextEntry={!showNew}
                      toggleSecure={() => setShowNew((v) => !v)}
                      autoCapitalize="none"
                      error={passwordErrors.newPassword}
                    />

                    {/* Indicateur de force */}
                    {passwordForm.newPassword.length > 0 && (
                      <View style={styles.strengthRow}>
                        <View style={styles.strengthBars}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <View
                              key={i}
                              style={[
                                styles.strengthBar,
                                {
                                  backgroundColor:
                                    i <= strength.level
                                      ? strength.color
                                      : "#E0E0E0",
                                },
                              ]}
                            />
                          ))}
                        </View>
                        <Text
                          style={[
                            styles.strengthLabel,
                            { color: strength.color },
                          ]}
                        >
                          {strength.label}
                        </Text>
                      </View>
                    )}

                    {/* Règles */}
                    <View style={styles.rulesBox}>
                      {[
                        {
                          ok: passwordForm.newPassword.length >= 8,
                          text: "Au moins 8 caractères",
                        },
                        {
                          ok: /[A-Z]/.test(passwordForm.newPassword),
                          text: "Une lettre majuscule",
                        },
                        {
                          ok: /[0-9]/.test(passwordForm.newPassword),
                          text: "Un chiffre",
                        },
                        {
                          ok: /[^A-Za-z0-9]/.test(passwordForm.newPassword),
                          text: "Un caractère spécial (recommandé)",
                        },
                      ].map((r, i) => (
                        <View key={i} style={styles.ruleRow}>
                          <Ionicons
                            name={
                              r.ok ? "checkmark-circle" : "ellipse-outline"
                            }
                            size={15}
                            color={r.ok ? "#34C759" : "#C0C0C0"}
                          />
                          <Text
                            style={[
                              styles.ruleText,
                              r.ok && styles.ruleTextOk,
                            ]}
                          >
                            {r.text}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <InputField
                      label="Confirmer le nouveau mot de passe"
                      value={passwordForm.confirmPassword}
                      onChangeText={(t) =>
                        setPasswordForm((p) => ({
                          ...p,
                          confirmPassword: t,
                        }))
                      }
                      placeholder="Répétez le nouveau mot de passe"
                      icon="shield-checkmark-outline"
                      secureTextEntry={!showConfirm}
                      toggleSecure={() => setShowConfirm((v) => !v)}
                      autoCapitalize="none"
                      error={passwordErrors.confirmPassword}
                    />

                    <View style={styles.formButtons}>
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => setPasswordOpen(false)}
                      >
                        <Text style={styles.cancelBtnText}>Annuler</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.saveBtn,
                          savingPassword && { opacity: 0.75 },
                        ]}
                        onPress={handleSavePassword}
                        disabled={savingPassword}
                      >
                        {savingPassword ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <>
                            <Ionicons
                              name="lock-closed"
                              size={18}
                              color="#fff"
                            />
                            <Text style={styles.saveBtnText}>Modifier</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </React.Fragment>
            ))}

            {/* Bouton Déconnexion */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
              <Text style={styles.logoutText}>Déconnexion</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // ── Header ──
  header: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    elevation: 5,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#6b46c1",
  },
  avatarFallback: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F0EFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#6b46c1",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#6b46c1",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
  },
  userPhone: {
    fontSize: 15,
    color: "#888",
    marginTop: 2,
  },

  // ── Stats ──
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    width: "30%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    elevation: 3,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#6b46c1",
  },
  statLabel: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },

  // ── Menu ──
  menuContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuItemActive: {
    backgroundColor: "#F8F6FF",
  },
  menuIconContainer: {
    width: 40,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  menuTitleActive: {
    color: "#6b46c1",
    fontWeight: "600",
  },

  // ── Panneau formulaire (accordéon) ──
  formPanel: {
    backgroundColor: "#FAFBFF",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  // ── Boutons du formulaire ──
  formButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    color: "#888",
    fontWeight: "500",
  },
  saveBtn: {
    flex: 2,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#6b46c1",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#6b46c1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  saveBtnText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "700",
  },

  // ── Indicateur de force ──
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: -8,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  strengthBars: {
    flexDirection: "row",
    gap: 5,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 5,
    borderRadius: 3,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 36,
    textAlign: "right",
  },

  // ── Règles ──
  rulesBox: {
    backgroundColor: "#F0EFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 6,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ruleText: {
    fontSize: 12,
    color: "#A0A0A0",
  },
  ruleTextOk: {
    color: "#34C759",
    fontWeight: "500",
  },

  // ── Déconnexion ──
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    marginHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFF0F0",
    borderRadius: 16,
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "600",
  },
});

export default ProfileScreen;