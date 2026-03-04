import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, Alert } from "react-native";
import {
  Text,
  Card,
  Button,
  TextInput,
  SegmentedButtons,
  ActivityIndicator,
  Divider,
} from "react-native-paper";
import { ThemedView } from "@/components/ui/themed-view";
import {
  getTrades,
  getPortfolio,
  postTrade,
  formatTs,
  type Trade,
  type PortfolioState,
} from "@/services/api";

const TICKER = "TD.TO";

export default function TradeScreen() {
  const [portfolio, setPortfolio] = useState<PortfolioState | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [action, setAction] = useState<"BUY" | "SELL">("BUY");
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("");
  const [commission, setCommission] = useState("9.99");
  const [notes, setNotes] = useState("");

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [portfolioDocs, tradeDocs] = await Promise.all([
        getPortfolio(TICKER),
        getTrades(TICKER),
      ]);
      setPortfolio(portfolioDocs[0] ?? null);
      setTrades(tradeDocs);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async () => {
    const sharesNum = parseFloat(shares);
    const priceNum = parseFloat(price);
    const commissionNum = parseFloat(commission) || 0;

    if (!shares || isNaN(sharesNum) || sharesNum <= 0) {
      Alert.alert("Validation", "Enter a valid number of shares");
      return;
    }
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("Validation", "Enter a valid price");
      return;
    }
    if (action === "SELL" && portfolio && sharesNum > portfolio.shares) {
      Alert.alert(
        "Validation",
        `Cannot sell ${sharesNum} shares — only ${portfolio.shares} held`
      );
      return;
    }

    setSubmitting(true);
    try {
      await postTrade({
        ticker: TICKER,
        action,
        shares: sharesNum,
        price: priceNum,
        commission: commissionNum,
        notes,
        ts: new Date().toISOString(),
      });
      // Reset form
      setShares("");
      setPrice("");
      setNotes("");
      await loadData();
      Alert.alert("Success", `${action} trade recorded`);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to record trade");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Portfolio summary */}
        {loading ? (
          <ActivityIndicator animating style={{ marginTop: 24 }} />
        ) : (
          <>
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            {portfolio && (
              <Card style={styles.card}>
                <Card.Title title="Portfolio" subtitle={portfolio.ticker} />
                <Card.Content>
                  <View style={styles.row}>
                    <Text style={styles.label}>Cash</Text>
                    <Text style={styles.value}>${portfolio.cash.toFixed(2)}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Shares held</Text>
                    <Text style={styles.value}>{portfolio.shares}</Text>
                  </View>
                  {portfolio.avg_cost != null && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Avg cost</Text>
                      <Text style={styles.value}>${portfolio.avg_cost.toFixed(4)}</Text>
                    </View>
                  )}
                </Card.Content>
              </Card>
            )}

            {/* Trade entry form */}
            <Card style={styles.card}>
              <Card.Title title="Record Trade" />
              <Card.Content>
                <SegmentedButtons
                  value={action}
                  onValueChange={(v: string) => setAction(v as "BUY" | "SELL")}
                  buttons={[
                    { value: "BUY", label: "BUY" },
                    { value: "SELL", label: "SELL" },
                  ]}
                  style={styles.segment}
                />
                <TextInput
                  label="Shares"
                  value={shares}
                  onChangeText={setShares}
                  keyboardType="decimal-pad"
                  style={styles.input}
                  mode="outlined"
                />
                <TextInput
                  label="Price per share"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  style={styles.input}
                  mode="outlined"
                />
                <TextInput
                  label="Commission"
                  value={commission}
                  onChangeText={setCommission}
                  keyboardType="decimal-pad"
                  style={styles.input}
                  mode="outlined"
                />
                <TextInput
                  label="Notes (optional)"
                  value={notes}
                  onChangeText={setNotes}
                  style={styles.input}
                  mode="outlined"
                />
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={submitting}
                  disabled={submitting}
                  style={styles.submitBtn}
                >
                  Submit {action}
                </Button>
              </Card.Content>
            </Card>

            {/* Recent trades */}
            {trades.length > 0 && (
              <Card style={styles.card}>
                <Card.Title title="Recent Trades" />
                <Card.Content>
                  {trades.map((t, idx) => (
                    <View key={`${t.ts}-${idx}`}>
                      {idx > 0 && <Divider style={{ marginVertical: 8 }} />}
                      <View style={styles.row}>
                        <Text
                          style={[
                            styles.actionBadge,
                            t.action === "BUY" ? styles.buy : styles.sell,
                          ]}
                        >
                          {t.action}
                        </Text>
                        <Text style={styles.tradeDetail}>
                          {t.shares} @ ${t.price.toFixed(2)}
                        </Text>
                      </View>
                      <Text style={styles.tradeTs}>{formatTs(t.ts)}</Text>
                      {t.notes ? (
                        <Text style={styles.tradeNotes}>{t.notes}</Text>
                      ) : null}
                    </View>
                  ))}
                </Card.Content>
              </Card>
            )}
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 12, paddingBottom: 32 },
  card: { marginBottom: 16 },
  input: { marginBottom: 10 },
  segment: { marginBottom: 12 },
  submitBtn: { marginTop: 4 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  label: { flex: 1, opacity: 0.6 },
  value: { fontWeight: "bold" },
  errorText: { color: "red", marginBottom: 12 },
  actionBadge: {
    fontWeight: "bold",
    fontSize: 13,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
    marginRight: 8,
  },
  buy: { backgroundColor: "#d4edda", color: "#155724" },
  sell: { backgroundColor: "#f8d7da", color: "#721c24" },
  tradeDetail: { fontSize: 14 },
  tradeTs: { opacity: 0.5, fontSize: 12, marginBottom: 2 },
  tradeNotes: { opacity: 0.6, fontSize: 12, fontStyle: "italic" },
});
