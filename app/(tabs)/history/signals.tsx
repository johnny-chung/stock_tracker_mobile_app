import React, { useEffect, useState } from "react";
import { ThemedScrollView } from "@/components/ui/themed-scroll-view";
import { Card, Text, ActivityIndicator } from "react-native-paper";
import { getSignals, type Signal, formatTs } from "@/services/api";

export default function Signals() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getSignals();
        if (mounted) setSignals(data.slice(0, 10));
      } catch (e: any) {
        setError(e?.message ?? "Failed to load signals");
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
      {signals.map((sig, idx) => (
        <Card
          key={`${sig.ticker}-${sig.ts}-${idx}`}
          style={{ marginBottom: 12 }}
        >
          <Card.Title
            title={`${sig.action}`}
            subtitle={`${sig.ticker} • ${sig.interval}`}
          />
          <Card.Content>
            <Text>Time: {formatTs(sig.ts)}</Text>
            <Text>Price: {sig.price ?? "—"}</Text>
            <Text>Reason: {sig.reason}</Text>
            <Text>Ticker: {sig.ticker}</Text>
          </Card.Content>
        </Card>
      ))}
    </ThemedScrollView>
  );
}
