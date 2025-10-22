import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { UnloadingParamList } from "../../../navigation/inbound/UnloadingNavigator";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuthStore } from "../../../../store/useAuthStore";
import { ItemDetail } from "../service/inboundService";
import InboundServices from "../../../../service/inboundServices";
import { useLoadingDialogStore } from "../../../../store/useLoadingStore";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDialogStore } from "../../../../store/useGlobalDialog";
import { useConfirmationStore } from "../../../../store/useConfirmationStore";

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
  palletCode: string;
  qty: number;
  weekNumber: number;
  stagingArea: string;
  stagingAreaName: string;
  productionDate: string;
  status: string;
};

const UnloadingScanScreen = () => {
  const [pallets, setPallets] = useState<PalletItem[]>([]);
  const { user } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { item, payload } = route.params as RouteParams;
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const showDialog = useDialogStore((state) => state.showDialog);
  const confirm = useConfirmationStore();


  const fetchData = async () => {
    try {
      showLoadingDialog("Loading Pallets");

      const res = await InboundServices.getUnloadingScanList(
        item.inbound_id,
        item.item.id
      );
      if (res?.data) {
        const mapped: PalletItem[] = res.data.map((d: any) => ({
          id: d.id,
          palletCode: d.pallet?.pallet_code || "-",
          qty: d.quantity,
          weekNumber: d.week_number,
          status: d.status,
          stagingArea: d.m_warehouse_sub_id || "-",
          stagingAreaName: d.warehouseSub.name || "-",
          productionDate: d.production_date || "-",
        }));
        console.log("Fetched Pallets:", mapped);
        setPallets(mapped);
      }
    } catch (err) {
      showDialog('error', 'Error while Fetching Pallets!');
    } finally {
      hideLoadingDialog();
    }
  };
  useEffect(() => {
    fetchData();

    // Trigger fetchData on mount and when coming back to this screen
    const unsubscribe = navigation.addListener("focus", fetchData);

    return unsubscribe;
  }, [navigation, item.inbound_id]);

  const updateStatusAll = async () => {
    const totalQtyScan = pallets.reduce((sum, p) => sum + p.qty, 0);

    // Cek apakah total qty melebihi plan
    if (totalQtyScan > item.quantityPlan) {
      showDialog("error", "Quantity melebihi jumlah plan!");
      return;
    }

    // Ambil hanya pallet yang status-nya OPEN
    const createdPallets = pallets.filter(p => p.status === "OPEN");

    // Kalau tidak ada pallet dengan status OPEN
    if (createdPallets.length === 0) {
      showDialog("error", "Semua data sudah dikirim ke SPV!");
      return;
    }

    try {
      const payloadToSend = {
        ids: createdPallets.map(p => p.id),
      };
      showLoadingDialog("Sending...");
      await InboundServices.postStatusBulkbyIdScan("PENDING", payloadToSend);

      showDialog("success", "Status pallet OPEN berhasil diupdate!");
    } catch (error) {
      console.error("Error while updating:", error);
      showDialog("error", "Error while Sending Status!");
    } finally {
      await fetchData();
    }
  };

  const handleRemove = (palletId: string) => {
    confirm.show("decline", "Are you sure Remove this pallet ?", async () => {
      try {
        showLoadingDialog("Removing Pallet... ");
        await InboundServices.deleteUnloadingById(palletId);
      } catch (error) {
        console.error('Error Removing pallets:', error);
        showDialog('error', 'Error while Removing pallets!');
      } finally {
        await fetchData();
      }
    }, false);
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
            {/* Left Icon */}
            <View style={styles.iconWrapper}>
              <Ionicons name="pricetag" size={28} color="#f97316" />
            </View>

            {/* Right Content */}
            <View style={[styles.cardContent, { flexDirection: "column", flex: 1 }]}>
              {/* Delete Icon in top right */}
              {item.status !== "PENDING" && item.status !== "COMPLETED" && (
                <TouchableOpacity
                  style={{ position: "absolute", top: 0, right: 0, zIndex: 1, padding: 4 }}
                  onPress={() => {
                    handleRemove(item.id);
                  }}
                >
                  <Ionicons name="remove-circle" size={22} color="#FF3B30" />
                </TouchableOpacity>
              )}
              <Text style={styles.palletCode}>{item.palletCode}</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Staging:</Text>
                <Text style={styles.infoValue}>{item.stagingAreaName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Qty Scan:</Text>
                <Text style={styles.infoValue}>{item.qty}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Code:</Text>
                <Text style={styles.infoValue}>{item.productionDate}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Week:</Text>
                <Text style={styles.infoValue}>{item.weekNumber}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status:</Text>
                <Text style={styles.infoValue}>{item.status}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Belum ada data pending</Text>
        }
      />

      {/* Footer */}
      <View style={[styles.footer, { justifyContent: "space-between" }]}>
        <TouchableOpacity
          style={[
            styles.scanBtn,
            { flexDirection: "row", alignItems: "center", backgroundColor: "#22c55e" }
          ]}
          onPress={async () => {
            updateStatusAll()
          }}
        >
          <Ionicons name="send" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.btnText}>Send to SPV</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.scanBtn, { flexDirection: "row", alignItems: "center" }]}
          onPress={() =>
            navigation.navigate("CameraScreen", {
              item: item,
              dataExist: pallets,
            })
          }
        >
          <Ionicons name="qr-code-outline" size={28} color="#fff" />
        </TouchableOpacity>


      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  title: { fontSize: 16, fontWeight: "500", marginBottom: 2, color: "#888" },
  number: { fontSize: 20, fontWeight: "700", marginBottom: 10, color: "#222" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  label: { fontSize: 16, color: "#888" },
  value: { fontSize: 16, fontWeight: "500", color: "#222" },

  palletCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6f6f6",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 0,
    shadowColor: "transparent",
  },
  iconWrapper: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardContent: { flex: 1 },
  palletCode: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
    color: "#222",
  },
  infoRow: { flexDirection: "row", marginBottom: 3 },
  infoLabel: { fontSize: 15, color: "#aaa", width: 70 },
  infoValue: { fontSize: 15, fontWeight: "500", color: "#222" },

  empty: { textAlign: "center", color: "#bbb", marginTop: 24, fontSize: 15 },
  footer: {
    flexDirection: "row",
    marginTop: 24,
    justifyContent: "flex-end",
  },
  scanBtn: {
    backgroundColor: "#FF6B00",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "flex-end",
    elevation: 0,
  },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});

export default UnloadingScanScreen;
