import { ThemedView } from "@/components/ui/themed-view";
import { Link } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";

export default function History() {
  return (
    <ThemedView style={styles.container}>
      <Link href="/history/signals" asChild>
        <Button mode="contained" style={styles.button}>View latest Signals</Button>
      </Link>
      <Link href="/history/events" asChild>
        <Button mode="contained" style={styles.button}>View latest Events</Button>
      </Link>
      <Link href="/history/bars" asChild>
        <Button mode="contained" style={styles.button}>View latest Bars</Button>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    marginVertical: 8,
    minWidth: 240,
  },
});
