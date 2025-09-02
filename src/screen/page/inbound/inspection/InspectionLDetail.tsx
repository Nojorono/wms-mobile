import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Dropdown } from "react-native-element-dropdown";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const rejectionOptions = [
  { label: "Expired", value: "expired" },
  { label: "Damaged", value: "damaged" },
  { label: "Wrong Item", value: "wrong_item" },
];

type InspectionDetailParams = {
  palletId: string;
  items: { name: string; qty: number }[];
};

type RootStackParamList = {
  InspectionDetail: InspectionDetailParams;
};

import type { RouteProp } from "@react-navigation/native";

export default function InspectionDetail() {
  const route = useRoute<RouteProp<RootStackParamList, "InspectionDetail">>();
  const navigation = useNavigation();
  const { palletId, items } = route.params;

  const [rejections, setRejections] = useState<{ [key: number]: string }>({});

  return (
    <View style={styles.container}>
  

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Pallet Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Pallet ID</Text>
          <Text style={styles.palletId}>PALLET - {palletId}</Text>

          {items.map((item, idx) => (
            <View key={idx}>
              <View style={styles.itemRow}>
                <Icon name="checkbox-blank-outline" size={24} color="#FB923C" />
                <Text style={styles.itemText}>{item.name}</Text>
                <Text style={styles.qty}>{item.qty}</Text>
              </View>

              <Dropdown
                style={styles.dropdown}
                data={rejectionOptions}
                labelField="label"
                valueField="value"
                placeholder="Rejection Status"
                value={rejections[idx]}
                onChange={(opt) =>
                  setRejections({ ...rejections, [idx]: opt.value })
                }
              />
            </View>
          ))}
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn}>
          <Icon name="content-save" size={20} color="#fff" />
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 12,
    color: "#FB923C",
  },
  scrollContent: { padding: 16 },

  card: {
    backgroundColor: "#F2F6FF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardLabel: { fontSize: 14, color: "#6B7280", textAlign: "center" },
  palletId: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
    color: "#111",
  },
  itemRow: { flexDirection: "row", alignItems: "center", marginVertical: 12 },
  itemText: { fontSize: 18, flex: 1, marginLeft: 8, color: "#222" },
  qty: { fontSize: 18, fontWeight: "700", color: "#111" },

  dropdown: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  saveBtn: {
    flexDirection: "row",
    backgroundColor: "#FB923C",
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  saveText: { fontSize: 18, fontWeight: "700", color: "#fff", marginLeft: 8 },
});
