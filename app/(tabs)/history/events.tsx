import React, { useEffect, useState } from "react";
import { ThemedScrollView } from "@/components/ui/themed-scroll-view";
import { Card, Text, ActivityIndicator } from "react-native-paper";
import { getEvents, type Event, formatTs } from "@/services/api";

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getEvents();
        if (mounted) setEvents(data.slice(0, 10));
      } catch (e: any) {
        setError(e?.message ?? "Failed to load events");
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
      {events.map((ev, idx) => (
        <Card key={`${ev.ticker}-${ev.ts}-${idx}`} style={{ marginBottom: 12 }}>
          <Card.Title
            title={`${ev.type}`}
            subtitle={`${ev.ticker} • ${ev.interval}`}
          />
          <Card.Content>
            <Text>Time: {formatTs(ev.ts)}</Text>
            <Text>Price: {ev.price ?? "—"}</Text>
            <Text>Ticker: {ev.ticker}</Text>
          </Card.Content>
        </Card>
      ))}
    </ThemedScrollView>
  );
}
