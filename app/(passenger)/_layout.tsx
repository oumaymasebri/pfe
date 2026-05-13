import Icon from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import React from "react";

export default function PassengerLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#e30613", // Rouge Transtu
        tabBarInactiveTintColor: "#777",
        tabBarStyle: {
          height: 68,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: "#eee",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="trajets"
        options={{
          title: "Trajets",
          tabBarIcon: ({ color, size }) => (
            <Icon name="bus-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="favoris"
        options={{
          title: "Favoris",
          tabBarIcon: ({ color, size }) => (
            <Icon name="heart" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="alertes"
        options={{
          title: "Alertes",
          tabBarIcon: ({ color, size }) => (
            <Icon name="notifications-outline" size={size} color={color} />
          ),
          tabBarBadge: 3, // Nombre rouge comme dans l'image
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Icon name="person-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Chatbot si tu veux l'ajouter */}
      <Tabs.Screen
        name="chatbot"
        options={{
          title: "Chatbot",
          tabBarIcon: ({ color, size }) => (
            <Icon
              name="chatbubble-ellipses-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
