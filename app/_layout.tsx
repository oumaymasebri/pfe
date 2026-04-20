import { router, Slot, Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as ReduxProvider } from "react-redux";

import { AuthProvider } from "../context/authcontext";
import { store } from "../redux/store";
import { use, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  useEffect(() => {
    const getToken = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if(token) {
        router.push("/(admin)/dashboard");
      } else {
        router.push("/(auth)/signin");
      }
    }
    getToken();
  },[]);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReduxProvider store={store}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Slot />
          </Stack>
        </AuthProvider>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
}
