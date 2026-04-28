// app/(admin)/_layout.tsx
import Sidebar from "@/components/Sidebar"; // ← Chemin correct
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function AdminLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <Sidebar {...props} />}
        screenOptions={{
          headerShown: false,
          drawerType: "front",
          drawerStyle: {
            width: 300, // Largeur du sidebar
            backgroundColor: "#0f172a",
          },
        }}
      >
        {/* Masquer les items par défaut du drawer */}
        <Drawer.Screen
          name="dashboard/dashboard"
          options={{ drawerItemStyle: { display: "none" } }}
        />
        <Drawer.Screen
          name="gestionbus/gestionbus"
          options={{ drawerItemStyle: { display: "none" } }}
        />
        <Drawer.Screen
          name="utilisateurs/users"
          options={{ drawerItemStyle: { display: "none" } }}
        />
        <Drawer.Screen
          name="lignes-stations/ligne-station"
          options={{ drawerItemStyle: { display: "none" } }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
