import React, { useEffect, useState } from "react";
import { ThemedScrollView } from "@/components/ui/themed-scroll-view";
import { Card, Text, ActivityIndicator } from "react-native-paper";
import { getBars, type Bar, formatTs } from "@/services/api";

export default function Bars() {
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getBars();
        if (mounted) setBars(data.slice(0, 10));
      } catch (e: any) {
        setError(e?.message ?? "Failed to load bars");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ThemedScrollView style={{ padding: 12 }}>
      {loading && <ActivityIndicator animating style={{ marginTop: 24 }} />}
      {error && (
        <Text
          accessibilityRole="alert"
          style={{ color: "red", marginBottom: 12 }}
        >
          {error}
        </Text>
      )}
      {bars.map((bar, idx) => (
        <Card
          key={`${bar.ticker}-${bar.ts}-${idx}`}
          style={{ marginBottom: 12 }}
        >
          <Card.Title title={`${bar.ticker}`} subtitle={`${bar.interval}`} />
          <Card.Content>
            <Text>Time: {formatTs(bar.ts)}</Text>
            <Text>Close: {bar.close}</Text>
          </Card.Content>
        </Card>
      ))}
    </ThemedScrollView>
  );
}
