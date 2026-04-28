// app/(tabs)/parametres.tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const ParametresScreen = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleGoBack = () => {
    router.back();
  };

  // Définition claire du type pour éviter les erreurs TypeScript
  type SettingItem = {
    icon: string;
    title: string;
    subtitle?: string;
    isSwitch?: boolean;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    onPress?: () => void;
  };

  const settingsSections = [
    {
      title: "Compte",
      items: [
        {
          icon: "person-outline",
          title: "Informations personnelles",
          onPress: () =>
            Alert.alert("Informations personnelles", "À venir bientôt"),
        },
        {
          icon: "lock-closed-outline",
          title: "Sécurité & Confidentialité",
          onPress: () => Alert.alert("Sécurité", "À venir bientôt"),
        },
      ] as SettingItem[],
    },
    {
      title: "Préférences",
      items: [
        {
          icon: "moon-outline",
          title: "Mode sombre",
          isSwitch: true,
          value: isDarkMode,
          onValueChange: setIsDarkMode,
        },
        {
          icon: "notifications-outline",
          title: "Notifications push",
          isSwitch: true,
          value: notificationsEnabled,
          onValueChange: setNotificationsEnabled,
        },
        {
          icon: "language-outline",
          title: "Langue",
          subtitle: "Français",
          onPress: () => Alert.alert("Langue", "À venir bientôt"),
        },
      ] as SettingItem[],
    },
    {
      title: "Application",
      items: [
        {
          icon: "information-circle-outline",
          title: "À propos de l'application",
          onPress: () => Alert.alert("SMART APP BUS", "Version 1.0.0"),
        },
        {
          icon: "help-circle-outline",
          title: "Centre d'aide",
          onPress: () => Alert.alert("Centre d'aide", "À venir bientôt"),
        },
        {
          icon: "star-outline",
          title: "Évaluer l'application",
          onPress: () => Alert.alert("Évaluer", "Merci pour votre soutien !"),
        },
      ] as SettingItem[],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>

            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.settingItem}
                  onPress={item.onPress}
                  disabled={!!item.isSwitch} // Désactive le clic si c'est un Switch
                >
                  <View style={styles.settingIconContainer}>
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color="#6B4EFF"
                    />
                  </View>

                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    {item.subtitle && (
                      <Text style={styles.settingSubtitle}>
                        {item.subtitle}
                      </Text>
                    )}
                  </View>

                  {item.isSwitch ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onValueChange}
                      trackColor={{ false: "#D1D5DB", true: "#6B4EFF" }}
                      thumbColor="#fff"
                    />
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Version */}
        <Text style={styles.versionText}>Version 1.0.0 • SMART APP BUS</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginTop: 25,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B4EFF",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  sectionContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingIconContainer: {
    width: 40,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: "#333",
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
  },
  versionText: {
    textAlign: "center",
    marginTop: 40,
    color: "#999",
    fontSize: 13,
  },
});

export default ParametresScreen;
