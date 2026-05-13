import Icon from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, TouchableOpacity } from "react-native";
import { useFavorites } from "../context/FavoritesContext";

type Props = {
  item: any;
  size?: number;
};

const AnimatedHeart = ({ item, size = 28 }: Props) => {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const [liked, setLiked] = useState(isFavorite(item.id));
  const scale = new Animated.Value(1);

  useEffect(() => {
    setLiked(isFavorite(item.id));
  }, [item.id]);

  const handlePress = async () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.4,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    if (liked) {
      await removeFromFavorites(item.id);
    } else {
      const success = await addToFavorites({
        id: item.id,
        name: item.name,
        subtitle: item.subtitle,
        type: item.type || "stop",
        lat: item.lat,
        lng: item.lng,
      });
      if (success) {
        // Animation supplémentaire si tu veux
      }
    }
    setLiked(!liked);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.button}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Icon
          name={liked ? "heart" : "heart-outline"}
          size={size}
          color={liked ? "#e30613" : "#888"}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});

export default AnimatedHeart;
