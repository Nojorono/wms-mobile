// components/UnloadingCardList.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/FontAwesome5";

interface Item {
  id: string;
  sku: string;
  quantities: { [uom: string]: { plan: number; scan: number } };
  quantity_plan: number;
  quantity_scan: number;
  status: string;
}

interface Props {
  items: Item[];
  onCheck?: (item: Item) => void;
}

const InspectionCardList: React.FC<Props> = ({ items, onCheck }) => {
  return (
    <View style={{ paddingBottom: 20 }}>
      {items
  .slice() // salin array biar tidak ubah data asli
  .sort((a, b) => {
    // urutkan agar pending muncul duluan
    if (a.status === "PENDING" && b.status !== "PENDING") return -1;
    if (a.status !== "PENDING" && b.status === "PENDING") return 1;
    return 0; // sisanya tetap urutan asli
  })
  .map((item, index) => (
    <View style={styles.card} key={index}>
      {/* Header Row */}
      <View style={[styles.row, { justifyContent: "space-between" }]}>
        <View style={styles.row}>
          <Ionicons name="tag" size={22} color="#FF6B00" />
          <Text style={styles.itemName}>{item.sku}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkButton}
          onPress={() => onCheck?.(item)}
        >
          <Text style={styles.checkText}>Check</Text>
        </TouchableOpacity>
      </View>

      {/* Quantity Info */}
<Text style={styles.quantityText}>
  Quantity Plan:{' '}
  {Object.entries(item.quantities)
    .map(([uom, q]) => `${q.plan} ${uom}`)
    .join(', ')}
</Text>

<Text style={styles.quantityText}>
  Quantity Scan:{' '}
  {Object.entries(item.quantities)
    .map(([uom, q]) => `${q.scan} ${uom}`)
    .join(', ')}
</Text>

      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  ))}

    </View>
  );
};

export default InspectionCardList;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB", // abu-abu soft
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemName: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 8,
    color: "#111827", // abu gelap elegan
  },
  quantityText: {
    fontSize: 16,
    color: "#4B5563",
    marginTop: 6,
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF3E6",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  statusText: {
    color: "#FF6B00",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  checkButton: {
    backgroundColor: "#FF6B00",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: "flex-end",
    marginTop: 14,
  },
  checkText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
