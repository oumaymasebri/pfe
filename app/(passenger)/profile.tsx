// app/(tabs)/profile.tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/userSlice"; // Ajustez le chemin si nécessaire
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = () => {
  const dispatch = useDispatch();

  // Récupération des données utilisateur depuis Redux
  const user = useSelector((state: any) => state.user.user);

  // Données par défaut si l'utilisateur n'est pas encore chargé
  const profileData = user || {
    name: "Alex Ben Ammar",
    email: "alex@smartbus.tn",
    phone: "+216 98 123 456",
    avatar: null,
    trips: 124,
    points: 2450,
    memberSince: "2024",
  };

  const handleEditProfile = () => {
    Alert.alert(
      "Modifier le profil",
      "L'écran de modification sera ajouté prochainement",
    );
  };

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: () => {
          dispatch(logout());
          AsyncStorage.removeItem("userToken");
          router.replace("/(auth)/signin");
          // Navigation vers l'écran de login selon votre logique
        },
      },
    ]);
  };

  // Menu des options
  const menuItems = [
    {
      icon: "person-outline",
      title: "Modifier le profil",
      onPress: handleEditProfile,
    },
    {
      icon: "notifications-outline",
      title: "Notifications",
      onPress: () => Alert.alert("Notifications"),
    },
    {
      icon: "heart-outline",
      title: "Favoris",
      onPress: () => Alert.alert("Favoris"),
    },
    {
      icon: "settings-outline",
      title: "Paramètres",
      onPress: () => router.push("/(passenger)/parametres"),
    },
    {
      icon: "help-circle-outline",
      title: "Support & Aide",
      onPress: () => Alert.alert("Support"),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* En-tête avec photo de profil */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {profileData.avatar ? (
              <Image
                source={{ uri: profileData.avatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Ionicons name="person" size={60} color="#6B4EFF" />
              </View>
            )}

            {/* Bouton pour changer la photo */}
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={handleEditProfile}
            >
              <Ionicons name="camera" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{profileData.name}</Text>
          <Text style={styles.userEmail}>{profileData.email}</Text>
          <Text style={styles.userPhone}>{profileData.phone}</Text>
        </View>

        {/* Statistiques */}
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

        {/* Menu des options */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon as any} size={24} color="#6B4EFF" />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}

          {/* Bouton Déconnexion */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
    borderColor: "#6B4EFF",
  },
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
    color: "#6B4EFF",
  },
  statLabel: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
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
  menuIconContainer: {
    width: 40,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
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
