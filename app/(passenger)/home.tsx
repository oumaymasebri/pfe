import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location"; // hedha lil GPS
import { router } from "expo-router";
import React, { useEffect, useState } from "react"; // useState w useEffect
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

const HomeScreen = () => {
  const weatherData = {
    temp: "22°C",
    condition: "Pluie légère",
    rainChance: "40%",
    icon: "rainy" as const, // Nom de l'icône Ionicons
    color: "#4A90E2", // Bleu Rainbow.ai
  };
  const user = useSelector((state: any) => state.user.user);
  const [weather, setWeather] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  const fetchWeather = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      let location = await Location.getCurrentPositionAsync({});
      const API_KEY = "eabbf5801dd6df7ef8bcd1628036ddbc";
      const response = await fetch(
        "https://api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=eabbf5801dd6df7ef8bcd1628036ddbc&units=metric"
      );
      const data = await response.json();
      setWeather({
        temp: Math.round(data.main.temp),
        condition: data.weather[0].description,
        rainChance: data.clouds ? data.clouds.all : 0,
        icon: data.weather[0].main === "Rain" ? "rainy" : "sunny",
      });
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);
  const suggestions = [
    {
      id: 1,
      title: "Aller au travail",
      line: "LIGNE 24 • 8:15",
      icon: "briefcase" as const,
    },
    {
      id: 2,
      title: "Rentrer à la maison",
      line: "LIGNE 10A • 17:30",
      icon: "home" as const,
    },
  ];

  const nearbyBuses = [
    {
      id: 1,
      number: "24",
      name: "Uptown Express",
      arrival: "4 min",
      status: "À l’heure",
      color: "#a83bc4",
    },
    {
      id: 2,
      number: "10A",
      name: "Riverside Drive",
      arrival: "12 min",
      status: "Retard 2min",
      color: "#444",
    },
  ];

  const favorites = [
    {
      id: 1,
      name: "Ligne 42",
      desc: "Crosstown Link • Fréquent : Lun-Ven",
      icon: "star",
    },
    {
      id: 2,
      name: "Gare Centrale",
      desc: "250m • 8 correspondances",
      icon: "location",
    },
  ];

  // Navigation vers la page Profil
  const goToProfile = () => {
    router.push("/profile");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>SMART APP BUS</Text>

        {/* Bouton Profil */}
        <TouchableOpacity onPress={goToProfile}>
          <View style={styles.profileCircle}>
            <Ionicons name="person" size={22} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Greeting */}
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>
          Bonjour, {user?.name || "Alex"} 👋
        </Text>
        <Text style={styles.subGreeting}>Où allons-nous aujourd’hui ?</Text>
      </View>
      {/* --- SECTION MÉTÉO --- */}
      <View style={styles.weatherWidget}>
        {loadingWeather ? (
          <ActivityIndicator color="#fff" />
        ) : (
          weather && (
            <>
              <View style={styles.weatherMain}>
                <Ionicons name={weather.icon} size={32} color="#fff" />
                <View style={styles.weatherTextContainer}>
                  <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
                  <Text style={styles.weatherCondition}>
                    {weather.condition}
                  </Text>
                </View>
              </View>
              <View style={styles.weatherDetails}>
                <Text style={styles.rainChanceText}>
                  🌧 {weather.rainChance}% nuages
                </Text>
                <Text style={styles.precisText}>PRÉCISION RAINBOW.AI</Text>
              </View>
            </>
          )
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={20}
            color="#888"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un bus ou une ligne"
            placeholderTextColor="#888"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={22} color="#6B4EFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Suggestions */}
        <Text style={styles.sectionTitle}>SUGGESTIONS</Text>
        <View style={styles.suggestionsRow}>
          {suggestions.map((item) => (
            <TouchableOpacity key={item.id} style={styles.suggestionCard}>
              <Ionicons name={item.icon} size={28} color="#6B4EFF" />
              <Text style={styles.suggestionTitle}>{item.title}</Text>
              <Text style={styles.suggestionLine}>{item.line}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bus Proches */}

        
        <View style={styles.sectionHeader}>
  <Text style={styles.sectionTitle}>BUS PROCHES</Text>
  {/* Zid el onPress hna */}
  <TouchableOpacity onPress={() => router.push("/(passenger)/trajets")}>  
    <Text style={styles.seeMapText}>Voir carte →</Text>
  </TouchableOpacity>
</View>

        {nearbyBuses.map((bus) => (
          <View key={bus.id} style={styles.busCard}>
            <View
              style={[styles.busNumberCircle, { backgroundColor: bus.color }]}
            >
              <Text style={styles.busNumber}>{bus.number}</Text>
            </View>
            <View style={styles.busInfo}>
              <Text style={styles.busName}>{bus.name}</Text>
              <Text style={styles.busArrival}>{bus.arrival}</Text>
            </View>
            <View style={styles.statusContainer}>
              <Text
                style={[
                  styles.statusText,
                  {
                    color: bus.status.includes("Retard")
                      ? "#FF3B30"
                      : "#34C759",
                  },
                ]}
              >
                {bus.status}
              </Text>
            </View>
          </View>
        ))}

        {/* Favoris */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>FAVORIS</Text>
          <TouchableOpacity>
            <Text style={styles.manageText}>Gérer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.favoritesRow}>
          {favorites.map((fav, index) => (
            <TouchableOpacity key={index} style={styles.favoriteCard}>
              <Ionicons
                name={fav.icon as any}
                size={28}
                color={index === 0 ? "#FFD700" : "#6B4EFF"}
              />
              <Text style={styles.favoriteName}>{fav.name}</Text>
              <Text style={styles.favoriteDesc}>{fav.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* --- BOUTON CHATBOT AJOUTÉ --- */}
      <TouchableOpacity
        style={styles.chatFab}
        onPress={() => router.push("../(passenger)/chatbot")}
      >
        <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
        <View style={styles.chatBadge} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // ---  styles Météo ---
 weatherWidget: {
    backgroundColor: "#9575CD",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    minHeight: 100, //  hedha bech dima ykoun fih height
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    elevation: 5,
  },
  weatherMain: { flexDirection: "row", alignItems: "center" },
  weatherTextContainer: { marginLeft: 12 },
  weatherTemp: { fontSize: 22, fontWeight: "800", color: "#fff" },
  weatherCondition: {
    fontSize: 14,
    color: "#fff",
    textTransform: "capitalize",
  },
  weatherDetails: { alignItems: "flex-end" },
  rainChanceText: { fontSize: 12, fontWeight: "bold", color: "#fff" },
  precisText: { fontSize: 8, color: "#ddd", marginTop: 2 },
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "#fff",
  },


  appTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6b46c1",
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6b46c1",
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: { paddingHorizontal: 20, paddingVertical: 10 },
  greetingText: { fontSize: 26, fontWeight: "bold", color: "#000" },
  subGreeting: { fontSize: 16, color: "#666", marginTop: 4 },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    elevation: 3,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, fontSize: 16 },
  filterButton: {
    width: 50,
    height: 50,
    backgroundColor: "#fff",
    marginLeft: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    elevation: 3,
  },
  scrollContent: { paddingBottom: 100 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 20,
    marginBottom: 12,
  },
  suggestionsRow: {
    flexDirection: "row",
    paddingHorizontal: 15,
    gap: 12,
    marginBottom: 25,
  },
  suggestionCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    elevation: 3,
  },
  suggestionTitle: { fontSize: 15, fontWeight: "600", marginTop: 10 },
  suggestionLine: { fontSize: 13, color: "#666", marginTop: 4 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  seeMapText: { color: "#6B4EFF", fontWeight: "600" },
  manageText: { color: "#6B4EFF", fontWeight: "600" },
  busCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    elevation: 4,
  },
  busNumberCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  busNumber: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  busInfo: { flex: 1 },
  busName: { fontSize: 16, fontWeight: "600" },
  busArrival: { fontSize: 15, color: "#333", marginTop: 4 },
  statusContainer: { alignItems: "flex-end" },
  statusText: { fontWeight: "600", fontSize: 14 },
  favoritesRow: {
    flexDirection: "row",
    paddingHorizontal: 15,
    gap: 12,
  },
  favoriteCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
  },
  favoriteName: { fontSize: 16, fontWeight: "600" },
  favoriteDesc: { fontSize: 13, color: "#666", marginTop: 4 },

  // Nouveaux styles pour le ChatBot
  chatFab: {
    position: "absolute",
    bottom: 25,
    right: 20,
    backgroundColor: "#6B4EFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6B4EFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 1000,
  },
  chatBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 15,
    height: 15,
    backgroundColor: "#34C759",
    borderRadius: 7.5,
    borderWidth: 2,
    borderColor: "#fff",
  },
});

export default HomeScreen;
