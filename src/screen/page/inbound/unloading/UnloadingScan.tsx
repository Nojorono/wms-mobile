import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import DatePicker from "react-native-date-picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { UnloadingParamList } from "../../../navigation/inbound/UnloadingNavigator";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuthStore } from "../../../../store/useAuthStore";
import { ItemDetail } from "../service/inboundService";

type ItemType = {
  inbound_id: string;
  uom: string;
  id: string;
  name: string;
  quantityPlan: number;
  quantityScan: number;
  item: ItemDetail;
};

type PayloadType = {
  inbound_number: string;
};

type RouteParams = {
  item: ItemType;
  payload: PayloadType;
};

type NavigationProp = StackNavigationProp<
  UnloadingParamList,
  "UnloadingMain"
>;

type PalletItem = {
  id: string;
  palletNo: string;
  qty: string;
  production_date: string; // format YYYY-MM-DD
};

const UnloadingScanScreen = () => {
  const [pallets, setPallets] = useState<PalletItem[]>([]);
  const [openPicker, setOpenPicker] = useState(false);
  const [activePallet, setActivePallet] = useState<string | null>(null);
  const [tempDate, setTempDate] = useState(new Date());
  const { user } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { item, payload } = route.params as RouteParams;

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleScanResult = (data: string[]) => {
    setPallets((prev) => [
      ...prev,
      ...data.map((scan) => ({
        id: scan,
        palletNo: `Pallet ${scan}`,
        qty: "",
        production_date: "",
      })),
    ]);
  };

  const updatePallet = (
    id: string,
    field: "qty" | "production_date",
    value: string
  ) => {
    setPallets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const removePallet = (id: string) => {
    setPallets((prev) => prev.filter((p) => p.id !== id));
  };

  const handleOpenPicker = (id: string, currentDate?: string) => {
    setActivePallet(id);
    setTempDate(currentDate ? new Date(currentDate) : new Date());
    setOpenPicker(true);
  };

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.card}>
        <Text style={styles.title}>Inbound Planning Number</Text>
        <Text style={styles.number}>{payload.inbound_number}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>SKU Number</Text>
          <Text style={styles.value}>{item.item.sku}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Qty Plan</Text>
          <Text style={styles.value}>{item.quantityPlan}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>UoM</Text>
          <Text style={styles.value}>{item.uom}</Text>
        </View>
      </View>


      <FlatList
        data={pallets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.palletCard}>

            <Text style={styles.palletTitle}>{item.palletNo}</Text>

            <View style={styles.rowInput}>
              <TextInput
                style={styles.input}
                placeholder="Qty"
                keyboardType="numeric"
                value={item.qty}
                onChangeText={(val) => updatePallet(item.id, "qty", val)}
                textAlign="right"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Production Date */}
            <TouchableOpacity
              style={[styles.input, { justifyContent: "center", marginTop: 8 }]}
              onPress={() => handleOpenPicker(item.id, item.production_date)}
            >
              <Text
                style={{
                  color: item.production_date ? "#111" : "#9ca3af",
                  textAlign: "right",
                }}
              >
                {item.production_date || "Select Production Date"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Belum ada data scan</Text>
        }
      />



      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={() =>
            navigation.navigate("CameraScreen", {
              onScanFinish: handleScanResult,
              item: item,
            })
          }
        >
          <Text style={styles.btnText}>Scan Pallet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => {
            if (!user) {
              console.warn("User information is missing.");
              return;
            }
            const payloads = pallets.map((pallet) => ({
              production_date: pallet.production_date,
              inbound_id: item.inbound_id,
              item_id: item.id,
              quantity: Number(pallet.qty),
              uom: item.uom,
              user_id: user.id,
              user_name: user.username,
              pallet_code: pallet.palletNo,
              status: "READY TO RECEIVE",
            }));
            console.log("Payload kirim:", payloads);
          }}
        >
          <Text style={styles.btnText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  title: { fontSize: 14, fontWeight: "600", marginBottom: 4, color: "#6b7280" },
  number: { fontSize: 16, fontWeight: "700", marginBottom: 12, color: "#111" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { fontSize: 14, color: "#6b7280" },
  value: { fontSize: 14, fontWeight: "600", color: "#111" },
  palletCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    position: "relative", // supaya absolute child bisa ditempatkan
  },
  palletTitle: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  removeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ef4444",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  rowInput: { flexDirection: "row", alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },

  empty: { textAlign: "center", color: "#9ca3af", marginTop: 20 },
  footer: { flexDirection: "row", marginTop: 20 },
  scanBtn: {
    flex: 1,
    backgroundColor: "#f97316",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 8,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#9ca3af",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginLeft: 8,
  },
  btnText: { color: "#fff", fontWeight: "600" },
});

export default UnloadingScanScreen;
