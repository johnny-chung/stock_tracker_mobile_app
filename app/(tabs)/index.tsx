import { Image } from "expo-image";
import { Platform, StyleSheet } from "react-native";
import { ThemedView } from "@/components/common/themed-view";
import { Link } from "expo-router";
import { ThemedText } from "@/components/common/themed-text";

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Welcome!</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  }, 
});
