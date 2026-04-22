import { Link, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <View style={styles.sidebar}>
      <Text style={styles.title}>Admin Panel</Text>

      <Link href="/(admin)/dashboard" asChild>
        <Pressable style={styles.link}>
          <Text
            style={isActive("/(admin)/dashboard") ? styles.active : styles.text}
          >
            📊 Dashboard
          </Text>
        </Pressable>
      </Link>

      <Link href="/(admin)/users" asChild>
        <Pressable style={styles.link}>
          <Text
            style={isActive("/(admin)/users") ? styles.active : styles.text}
          >
            👤 Users
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 250,
    backgroundColor: "#111",
    padding: 20,
    height: "100%",
  },
  title: {
    color: "white",
    fontSize: 20,
    marginBottom: 20,
  },
  link: {
    marginBottom: 15,
  },
  text: {
    color: "#aaa",
    fontSize: 16,
  },
  active: {
    color: "#4da6ff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
