/* eslint-disable @typescript-eslint/no-unused-vars */
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerActions } from "@react-navigation/native"; // ✅ Import DrawerActions
import { useNavigation, useRouter } from "expo-router"; // ✅ Zidna useNavigation
import React, { useState } from "react";
import {
  Alert,
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
    <View style={[fieldStyles.inputRow, !!error && fieldStyles.inputError]}>
      <Ionicons
        name={icon as any}
        size={20}
        color={error ? "#FF3B30" : "#6B4EFF"}
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

// ─── Écran principal ───────────────────────────────────────────────────────
const ProfileScreen = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const navigation = useNavigation(); // ✅ Initialisation navigation

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

  const [profileForm, setProfileForm] = useState({
    name: profileData.name,
    email: profileData.email,
    phone: profileData.phoneNumber,
  });
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  // ✅ Fonction bech t7el el Sidebar
  const openSidebar = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          try {
            dispatch(logout());
            await AsyncStorage.clear();
            router.replace("/(auth)/signin");
          } catch (error) {
            console.error("Erreur déconnexion:", error);
          }
        },
      },
    ]);
  };

  const menuItems = [
    {
      icon: "person-outline",
      title: "Modifier le profil",
      onPress: () => {
        setEditOpen(!editOpen);
        setPasswordOpen(false);
      },
      active: editOpen,
    },
    {
      icon: "lock-closed-outline",
      title: "Changer le mot de passe",
      onPress: () => {
        setPasswordOpen(!passwordOpen);
        setEditOpen(false);
      },
      active: passwordOpen,
    },
    {
      icon: "settings-outline",
      title: "Paramètres",
      onPress: () => router.push("/(admin)/parametres"),
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

        {/* ✅ BOUTON SIDEBAR (Les 3 lignes) */}
        <TouchableOpacity style={styles.sidebarButton} onPress={openSidebar}>
          <Ionicons name="menu-outline" size={32} color="#333" />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarFallback}>
                <Ionicons name="person" size={60} color="#6B4EFF" />
              </View>
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{profileData.name}</Text>
            <Text style={styles.userEmail}>{profileData.email}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{profileData.trips}</Text>
              <Text style={styles.statLabel}>Trajets</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{profileData.points}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{profileData.memberSince}</Text>
              <Text style={styles.statLabel}>Membre</Text>
            </View>
          </View>

          {/* Menu & Logout */}
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, item.active && styles.menuItemActive]}
                onPress={item.onPress}
              >
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color="#6B4EFF"
                  style={{ width: 35 }}
                />
                <Text
                  style={[
                    styles.menuTitle,
                    item.active && styles.menuTitleActive,
                  ]}
                >
                  {item.title}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#ccc" />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
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
  inputError: { borderColor: "#FF3B30", backgroundColor: "#FFF5F5" },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: "#222" },
  eyeBtn: { padding: 4 },
  errorText: { fontSize: 12, color: "#FF3B30", marginTop: 4, marginLeft: 4 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  // ✅ Style mrigel lel bouton sidebar
  sidebarButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 25,
    left: 20,
    zIndex: 99, // bech iji fou9 el ScrollView
    padding: 10,
  },
  scrollContent: { paddingBottom: 100 },
  header: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatarContainer: { position: "relative", marginBottom: 15 },
  avatarFallback: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F0EFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#6B4EFF",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#6B4EFF",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  userName: { fontSize: 22, fontWeight: "bold", color: "#000" },
  userEmail: { fontSize: 15, color: "#666" },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    width: "30%",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  statNumber: { fontSize: 20, fontWeight: "bold", color: "#6B4EFF" },
  statLabel: { fontSize: 12, color: "#666" },
  menuContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 8,
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
  menuItemActive: { backgroundColor: "#F8F6FF" },
  menuTitle: { flex: 1, fontSize: 15, color: "#333" },
  menuTitleActive: { color: "#6B4EFF", fontWeight: "600" },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFF0F0",
    borderRadius: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: "#FFDDDD",
    marginBottom: 10,
  },
  logoutText: { fontSize: 16, color: "#FF3B30", fontWeight: "600" },
});

export default ProfileScreen;
