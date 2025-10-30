// components/UnloadingCardList.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/FontAwesome5";
import { ItemDetail } from "../../screen/page/inbound/service/inboundService";

interface Item {
  id: string;
  name: string;
  quantityPlan: number;
  quantityScan: number;
  status?: string;
  item: ItemDetail;
  uom: string;
}

interface Props {
  items: Item[];
  onCheck?: (item: Item) => void;
}

const UnloadingCardList: React.FC<Props> = ({ items, onCheck }) => {
  return (
    <View style={{ paddingBottom: 20 }}>
      {items.map((item,i) => (
        <View style={styles.card} key={item.id+i}>
          {/* Header Row */}
          <View style={[styles.row, { justifyContent: "space-between" }]}>
            <View style={styles.row}>
              <Ionicons name="tag" size={22} color="#FF6B00" />
              <Text style={styles.itemName}>{item.item.sku}</Text>
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
           Quantity Plan: {item.quantityPlan} {item.uom}
          </Text>
          {/* <Text style={styles.quantityText}>
            Scan: {item.quantityScan}
          </Text> */}

          {/* Status Badge */}
          {item.status && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {item.status}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

export default UnloadingCardList;

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
