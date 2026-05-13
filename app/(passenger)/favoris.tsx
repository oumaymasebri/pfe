import AnimatedHeart from "@/components/AnimatedHeart";
import { useFavorites } from "@/context/FavoritesContext";
import Icon from "@expo/vector-icons/Ionicons";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const FavoritesScreen = ({ navigation }: any) => {
  const { favorites } = useFavorites();

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("StopDetails", { item })}
    >
      <View style={styles.iconBox}>
        <Icon
          name={item.type === "stop" ? "location-sharp" : "bus-sharp"}
          size={28}
          color={item.type === "stop" ? "#e30613" : "#0066cc"}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        {item.nextArrival && (
          <Text style={styles.next}>🕒 {item.nextArrival}</Text>
        )}
      </View>
      <AnimatedHeart item={item} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes Favoris</Text>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="heart-outline" size={110} color="#e0e0e0" />
          <Text style={styles.emptyTitle}>Pas encore de favoris</Text>
          <Text style={styles.emptySubtitle}>
            Ajoute tes arrêts et lignes préférés
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "web" ? 20 : 60,
    paddingBottom: 15,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6f6f6f",
    marginBottom: 4,
  },
  next: {
    fontSize: 13,
    color: "#3a3a3a",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#7a7a7a",
    textAlign: "center",
    marginTop: 10,
  },
});

export default FavoritesScreen;
