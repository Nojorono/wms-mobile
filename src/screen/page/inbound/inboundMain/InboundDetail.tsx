// screens/InboundDetail.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from "react-native";

/* ========================
   1. Type & Merge Function
   ======================== */
type InboundItem = {
  id: string;
  inbound_do_id: string;
  item_id: string;
  quantity: number;
  uom: string;
};

type InboundDo = {
  id: string;
  inbound_do_number: string;
  inbound_do_date: string;
  inbound_items: InboundItem[];
};

function mergeInboundDos(data: InboundDo[]): InboundDo[] {
  const map = new Map<string, InboundDo>();

  data.forEach((doItem) => {
    if (map.has(doItem.id)) {
      const existing = map.get(doItem.id)!;
      existing.inbound_items = [
        ...existing.inbound_items,
        ...doItem.inbound_items,
      ];
    } else {
      map.set(doItem.id, { ...doItem });
    }
  });

  return Array.from(map.values());
}

/* ========================
   2. Screen Component
   ======================== */
export default function InboundDetail() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // contoh dummy payload
  const payload = {
    inboundPlanningNumber: "CWH02-IN-0625-0001",
    vehicleNumber: "K 9985 AT",
    inbound_dos: [
      {
        id: "a170b223-a023-47fa-9a77-134ecaa52f11",
        inbound_do_number: "188258",
        inbound_do_date: "2025-03-07T10:00:00.000Z",
        inbound_items: [
          { id: "sku-1", inbound_do_id: "a170b223", item_id: "Class Mild 16", quantity: 200, uom: "DUS" },
          { id: "sku-2", inbound_do_id: "a170b223", item_id: "Aroma Royal Tea 12", quantity: 100, uom: "DUS" },
        ],
      },
      {
        id: "a170b223-a023-47fa-9a77-134ecaa52f11", // sama → akan digabung
        inbound_do_number: "188259",
        inbound_do_date: "2025-03-07T10:00:00.000Z",
        inbound_items: [
          { id: "sku-3", inbound_do_id: "a170b223", item_id: "Aroma 16", quantity: 100, uom: "DUS" },
        ],
      },
      {
        id: "random-uuid-2",
        inbound_do_number: "188260",
        inbound_do_date: "2025-03-07T10:00:00.000Z",
        inbound_items: [
          { id: "sku-4", inbound_do_id: "random-uuid-2", item_id: "JayZ 16", quantity: 50, uom: "DUS" },
        ],
      },
    ],
  };

const mergedData = mergeInboundDos(payload.inbound_dos);

// Support multiple expanded cards
const [expandedIds, setExpandedIds] = useState<string[]>([]);

const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
        prev.includes(id)
            ? prev.filter((itemId) => itemId !== id)
            : [...prev, id]
    );
};

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbound Planning Number</Text>
        <Text style={styles.headerNumber}>{payload.inboundPlanningNumber}</Text>
        <Text style={styles.vehicle}>{payload.vehicleNumber}</Text>
      </View>

      {/* List Delivery Orders */}
      <FlatList
        data={mergedData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => toggleExpand(item.id)}
            >
              <Text style={styles.cardTitle}>
                Delivery Order {item.inbound_do_number}
              </Text>
              <Text style={styles.cardDate}>
                {new Date(item.inbound_do_date).toISOString().split("T")[0]}
              </Text>
            </TouchableOpacity>

            {expandedIds.includes(item.id) && (
              <View style={styles.cardBody}>
                {item.inbound_items.map((sku, index) => (
                  <View key={sku.id} style={styles.skuRow}>
                    <Text style={styles.skuText}>
                      {index + 1}. {sku.item_id}
                    </Text>
                    <Text style={styles.skuQty}>
                      {sku.quantity} {sku.uom}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.declineBtn}>
          <Text style={styles.declineText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.approveBtn}>
          <Text style={styles.approveText}>Approve</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ========================
   3. Styles
   ======================== */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F8FAFC" },
  header: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: { fontSize: 14, color: "#6B7280" },
  headerNumber: { fontSize: 18, fontWeight: "700", marginTop: 4 },
  vehicle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    color: "#DC2626",
    textAlign: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  cardDate: { fontSize: 12, color: "#6B7280" },
  cardBody: { padding: 16, borderTopWidth: 1, borderColor: "#E5E7EB" },
  skuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  skuText: { fontSize: 14, color: "#374151" },
  skuQty: { fontSize: 14, fontWeight: "600" },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  declineBtn: {
    flex: 1,
    marginRight: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#F87171",
  },
  approveBtn: {
    flex: 1,
    marginLeft: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#F97316",
  },
  declineText: { textAlign: "center", fontSize: 16, color: "white" },
  approveText: { textAlign: "center", fontSize: 16, color: "white" },
});
