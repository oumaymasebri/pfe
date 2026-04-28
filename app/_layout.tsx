import { auth, db } from "@/configFirebase";
import { Stack } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { store } from "../redux/store";

export default function RootLayout() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().role === "admin") {
            setIsAdmin(true);
          }
        } catch (e) {
          console.error("Erreur role:", e);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null;

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Si Admin, on charge le Layout Drawer du dossier (admin) */}
          {isAdmin ? (
            <Stack.Screen name="(admin)" />
          ) : (
            <Stack.Screen name="(auth)/signin" />
          )}
          {/* Optionnel: page index ou passager */}
          <Stack.Screen name="index" />
        </Stack>
      </GestureHandlerRootView>
    </Provider>
  );
}
