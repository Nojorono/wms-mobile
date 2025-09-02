import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { InspectionParamList } from "../../../navigation/inbound/InspectionNavigator";


 type NavigationProp = StackNavigationProp<InspectionParamList,'InspectionMain'>;
export default function InspectionList() {
  const navigation = useNavigation<NavigationProp>();

  const pallets = [
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
    {
      id: 3,
      items: [
        { name: "Aroma Royal Tea 16’s", qty: 11 },
        { name: "Aroma Slim 16’s", qty: 9 },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Planning ID */}
        <View style={styles.cardPlanning}>
          <Text style={styles.planningLabel}>Inbound Planning ID</Text>
          <Text style={styles.planningId}>CWH02-IN-0625-0002</Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>188258</Text>
          </View>
        </View>

        {/* Pallets */}
        {pallets.map((pallet) => (
          <View key={pallet.id} style={styles.cardPallet}>
            <View style={styles.palletHeader}>
              <Text style={styles.palletTitle}>Pallet - {pallet.id}</Text>

              <TouchableOpacity
                style={styles.detailButton}
                onPress={() =>
                  navigation.navigate("InspectionDetail", {
                    palletId: pallet.id.toString(),
                    items: pallet.items,
                  })
                }
              >
                <Text style={styles.detailText}>Detail</Text>
              </TouchableOpacity>
            </View>

            {pallet.items.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>{item.qty}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Approve Button */}
        <TouchableOpacity style={styles.approveButton}>
          <Text style={styles.approveText}>Approve</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scrollContent: { padding: 16 },

  cardPlanning: {
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    elevation: 2,
  },
  planningLabel: { fontSize: 14, color: "#6B7280", fontWeight: "500" },
  planningId: { fontSize: 18, fontWeight: "700", color: "#1F2937", marginTop: 4 },
  badge: {
    backgroundColor: "#FFEDD5",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  badgeText: { fontSize: 16, fontWeight: "600", color: "#EA580C" },

  cardPallet: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  palletHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  palletTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  detailButton: {
    backgroundColor: "#FB923C",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  detailText: { color: "#FFFFFF", fontWeight: "500", fontSize: 14 },

  itemRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  itemName: { fontSize: 16, color: "#374151" },
  itemQty: { fontSize: 18, fontWeight: "700", color: "#111827" },

  approveButton: {
    marginTop: 24,
    backgroundColor: "#FB923C",
    paddingVertical: 14,
    borderRadius: 16,
    elevation: 3,
  },
  approveText: { textAlign: "center", fontSize: 18, fontWeight: "700", color: "#FFFFFF" },
});
