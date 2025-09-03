import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { GoodReceiveParamList } from "../../../navigation/inbound/GoodReceiveNavigator";
import { useNavigation } from "@react-navigation/native";

const data = {
    inboundPlanningId: "CWHO2-IN-0625-0002",
    truckText: "🚚  B 2324 TRS",
    summary: {
        totalPallet: 3,
        totalSKU: 3,
        totalQuantity: 1000,
    },
    pallets: [
        {
            id: 1,
            items: [
                { name: "Aroma 12’s", qty: 11 },
                { name: "Aroma Royal Tea 16’s", qty: 9 },
            ],
        },
        {
            id: 2,
            items: [{ name: "Aroma Royal Tea 16’s", qty: 20 }],
        },
    ],
};


type NavigationProp = StackNavigationProp<GoodReceiveParamList,'GoodReceiveMain'>;
export default function GoodReceivePallet() {
    
      const navigation = useNavigation<NavigationProp>();
    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Good Receiving</Text>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
                <Text style={styles.label}>Inbound Planning ID</Text>
                <Text style={styles.infoValue}>{data.inboundPlanningId}</Text>
                <TouchableOpacity style={styles.truckButton}>
                    <Text style={styles.truckText}>{data.truckText}</Text>
                </TouchableOpacity>

                <View style={styles.summary}>
                    <Text style={styles.summaryText}>Total Pallet: {data.summary.totalPallet}</Text>
                    <Text style={styles.summaryText}>Total SKU: {data.summary.totalSKU}</Text>
                    <Text style={styles.summaryText}>Total Quantity: {data.summary.totalQuantity}</Text>
                </View>
            </View>

            {/* Pallet List */}
            {data.pallets.map((pallet) => (
                <View key={pallet.id} style={styles.card}>
                    <Text style={styles.cardTitle}>Pallet - {pallet.id}</Text>
                    {pallet.items.map((item, idx) => (
                        <View key={idx} style={styles.itemRow}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemQty}>{item.qty}</Text>
                        </View>
                    ))}
                    <TouchableOpacity
                        style={styles.detailButton}
                        onPress={() => navigation.navigate('GoodReceiveDetail', { item: pallet })}
                    >
                        <Text style={styles.detailText}>Detail</Text>
                    </TouchableOpacity>
                </View>
            ))}

            {/* Approve Button */}
            <TouchableOpacity style={styles.approveButton}>
                <Text style={styles.approveText}>Approve</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FF6600",
  },
  infoBox: {
    backgroundColor: "#EAF2FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#555",
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  truckButton: {
    backgroundColor: "#FF6600",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  truckText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  summary: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#FF6600",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  itemQty: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  detailButton: {
    backgroundColor: "#FF6600",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: "flex-end",
    marginTop: 8,
  },
  detailText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  approveButton: {
    backgroundColor: "#999",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 12,
  },
  approveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
});
