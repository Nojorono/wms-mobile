// components/UnloadingCardList.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/FontAwesome5";

interface ItemDetail {
  do_number: string;
  po_number: string;
  quantity_plan: number;
  quantity_scanned: number;
  quantity_inspected?: number;
  uom: string;
}

interface Item {
  item_id: string;
  sku: string;
  description: string;
  uom: string;
  inspection_status: string;
  quantity_plan: number;
  quantity_scanned: number;
  quantity_inspected?: number;
  quantities: {
  [uom: string]: {
    plan: number;
    scan: number;
    inspected: number;
  };
}
  details: ItemDetail[];
}

interface Props {
  items: Item[];
  onCheck?: (item: Item) => void;
}

const GoodReceivedCardList: React.FC<Props> = ({ items, onCheck }) => {
  return (
    <View style={{ paddingBottom: 20 }}>
      {items.map((item, index) => {
        const isReady = item.quantity_plan === item.quantity_scanned;

        return (
          <View style={styles.card} key={index}>
            {/* Header */}
            <View style={styles.row}>
              <Ionicons name="tag" size={18} color="#FF6B00" />
              <Text style={styles.itemName}>{item.description}</Text>
            </View>

            {/* Quantity Info */}
            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Plan</Text>
              <Text style={styles.quantityValue}>
                {/* {item.quantity_plan} {item.uom} */}
                {Object.entries(item.quantities)
                            .sort(([a], [b]) => (a === "DUS" ? -1 : b === "DUS" ? 1 : 0)) // urutan: DUS dulu
                            .map(([uom, q]) => `${q.plan} ${uom}`)
                            .join(", ")}
              </Text>
              <Text style={styles.quantityLabel}>Approved</Text>
              <Text style={styles.quantityValue}>
                {Object.entries(item.quantities)
                            .sort(([a], [b]) => (a === "DUS" ? -1 : b === "DUS" ? 1 : 0)) // urutan: DUS dulu
                            .map(([uom, q]) => `${q.inspected} ${uom}`)
                            .join(", ")}
              </Text>
            </View>

            {/* Breakdown DO/PO */}
            <View style={styles.detailsContainer}>
              {item.details.map((detail, idx) => (
                <View key={idx} style={styles.detailRow}>
                  <Text style={styles.detailText}>
                    DO <Text style={styles.bold}>{detail.do_number}</Text>{" "}
                    PO <Text style={styles.bold}>{detail.po_number}</Text>{" "}
                    <Text style={styles.detailQty}>
                      {detail.quantity_inspected ?? detail.quantity_scanned} {detail.uom}
                      {/* {detail.quantity_scanned} {detail.uom} */}
                    </Text>
                  </Text>
                </View>
              ))}
            </View>

            {/* Status */}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isReady ? "#E6F9F0" : "#FFF3E6" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: isReady ? "#10B981" : "#FF6B00" },
                ]}
              >
                {/* {isReady ? "Ready to Receive" : "Pending"} */}
                {item.inspection_status?.toUpperCase() || "PENDING"}
              </Text>
            </View>

            {/* Check Button */}
            <TouchableOpacity
              style={styles.checkButton}
              onPress={() => onCheck?.(item)}
            >
              <Text style={styles.checkText}>Check</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

export default GoodReceivedCardList;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
    color: "#1F2937",
  },
  quantityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  quantityLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  quantityValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 10,
    marginTop: 6,
  },
  detailRow: {
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: "#374151",
  },
  detailQty: {
    fontWeight: "600",
    color: "#FF6B00",
  },
  bold: {
    fontWeight: "600",
  },
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  checkButton: {
    backgroundColor: "#FF6B00",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 16,
    alignItems: "center",
  },
  checkText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
