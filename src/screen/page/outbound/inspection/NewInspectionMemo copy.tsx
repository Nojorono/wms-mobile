import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import { useAuthStore } from '../../../../store/useAuthStore.ts';
import GlobalStyles from '../../../../util/GlobalStyles.ts';
import Colors from '../../../../constants/Colors.ts';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useLoadingDialogStore } from '../../../../store/useLoadingStore.ts';
import { useDialogStore } from '../../../../store/useGlobalDialog.ts';

import { InspectionParamList } from '../../../navigation/outbound/InspectionNavigator.tsx';
import OutboundService from '../../../../service/outboundService.ts';
import MemoGroupCard from '../../../../components/outbound/MemoGroupCard.tsx';
import { Picker } from '@react-native-picker/picker';

type NavigationProp = StackNavigationProp<
  InspectionParamList,
  'InspectionDoMain'
>;

function NewInspectionMemo() {
  const [refreshing, setRefreshing] = useState(false);
  const [memoList, setMemoList] = useState<any>([]);
  const route = useRoute();
  const itemBefore = route.params as any;

  const styles = GlobalStyles();
  const navigation = useNavigation<NavigationProp>();
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const showDialog = useDialogStore((s) => s.showDialog);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedSku, setSelectedSku] = useState<string | null>(null);


  const fetchInspection = async () => {
    try {
      setRefreshing(true);
      showLoadingDialog("Loading...");

      const data = { limit: 100, transaction_picking_status: "PENDING" };
      const response = await OutboundService.getOutboundDoList(data);

      const list = response?.data || [];
      const matched = list.find((i: any) => i.id === itemBefore.item.id);
      const memos = matched?.outbound_memos || [];

      // Proses memo items + picking scan
      const processed = memos.map((memo: any) => {
        const memoItems = memo?.outbound_memo_items || [];
        const pickings = memo?.transaction_pickings || [];

        const mergedItems = pickings.map((picking: any) => {
          // ✅ match item_id + uom
          const memoItem = memoItems.find(
            (itm: any) =>
              itm.item_id === picking.item_id &&
              itm.uom === picking.uom
          );

          const scans = picking.transactionScanPicking || [];

          const totalQtyPicked = scans.reduce(
            (sum: number, s: any) => sum + (s.quantity_picked || 0),
            0
          );

          return {
            // identity
            picking_id: picking.id,
            item_id: picking.item_id,

            // item info
            item: picking.item || memoItem?.item,

            // ✅ aligned plan
            quantity_plan: memoItem?.quantity_plan ?? 0,
            uom: picking.uom,

            // scan
            is_scanned: scans.length > 0,
            picked_quantity: totalQtyPicked,
            scan_detail: scans,

            // raw objects (optional)
            transaction_picking: picking,
            outbound_memo_item: memoItem,
          };
        });

        return {
          memo,
          items: mergedItems,
        };
      });
      console.log("Processed Memo List: ", processed);


      setMemoList(processed);
    } catch (e) {
      showDialog("error", "Error while fetching data!");
    } finally {
      hideLoadingDialog();
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInspection();
    }, [])
  );

  const filteredMemoList = useMemo(() => {
    if (!searchKeyword) return memoList;

    const keyword = searchKeyword.toUpperCase();

    return memoList
      .map((group: any) => {
        const filteredItems = group.items.filter(
          (i: any) => i.item?.sku?.toUpperCase() === keyword
        );

        if (filteredItems.length === 0) return null;

        return {
          ...group,
          items: filteredItems,
        };
      })
      .filter(Boolean);
  }, [memoList, searchKeyword]);

  const skuOptions = useMemo(() => {
    const set = new Set<string>();

    memoList.forEach((group: any) => {
      group.items.forEach((i: any) => {
        if (i.item?.sku) {
          set.add(i.item.sku);
        }
      });
    });

    return Array.from(set);
  }, [memoList]);



  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView
        contentContainerStyle={styles.menuContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchInspection}
            colors={[Colors.primeColor]}
          />
        }
      >
        <View style={styles.menuCard}>
          <View style={[styles.activitiesHeader, { borderBottomWidth: 2, borderBottomColor: "#ccc" }]}>
            <Text style={styles.activitiesHeaderText}>List Inspection Memo</Text>
          </View>
          <View style={{ marginVertical: 12 }}>
            <View style={stylesLocal.pickerWrapper}>
              <Picker
                selectedValue={selectedSku}
                onValueChange={(value) => {
                  setSelectedSku(value);
                  setSearchKeyword(value ?? "");
                }}
              >
                <Picker.Item label="-- Select SKU --" value={null} />
                {skuOptions.map((sku) => (
                  <Picker.Item key={sku} label={sku} value={sku} />
                ))}
              </Picker>
            </View>
          </View>

          {/* LIST MEMO */}
          {filteredMemoList.length === 0 ? (
            <Text style={{ textAlign: "center", marginTop: 30, color: "#777" }}>
              No memo found.
            </Text>
          ) : (
            filteredMemoList.map((m: any, index: number) => (
              <MemoGroupCard
                key={`${m.memo.outbound_memo_number}-${index}`}
                memo={m.memo}
                items={m.items}
                onRefresh={fetchInspection}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Button */}
      {memoList.length > 0 &&
        memoList.some((m: any) =>
          m.items.some((item: any) =>
            item.scan_detail.some(
              (s: any) =>
                s.status === "INSPECTION" || s.status === "INSPECTION_APPROVED"
            )
          )
        ) && (
          <TouchableOpacity
            style={stylesLocal.fab}
            onPress={() =>
              Alert.alert(
                "Approve All",
                "Are you sure you want to approve all tasks?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "OK",
                    onPress: async () => {
                      try {
                        await OutboundService.updateStatusWhenCompleteInspection(itemBefore.item.id, "IN_PROGRESS");
                        showDialog("success", "All tasks approved successfully!");
                        navigation.goBack();
                      } catch (error) {
                        showDialog("error", "Failed to approve tasks!");
                      }
                    },
                  },
                ]
              )
            }
          >
            <Text style={stylesLocal.fabText}>Approved Task</Text>
          </TouchableOpacity>
        )
      }
      {memoList.length > 0 &&
        memoList.every((m: any) =>
          m.items.every(
            (item: any) =>
              item.scan_detail.length > 0 &&
              item.scan_detail.every((s: any) => s.status === "INSPECTION_APPROVED")
          )
        ) && (
          <>
            {/* Floating Button */}
            <TouchableOpacity
              style={stylesLocal.fabApproved}
              onPress={() =>
                Alert.alert(
                  "Approve All",
                  "Are you sure you want to approve all tasks?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "OK",
                      onPress: async () => {
                        try {
                          for (const memoGroup of memoList) {
                            for (const item of memoGroup.items) {
                              console.log("Item Scan Detail:", item);
                              console.log("Updating picking id:", item.transaction_picking?.id);
                              await OutboundService.updateStatusWhenCompleteInspection(itemBefore.item.id, "COMPLETED");
                            }
                          }
                          showDialog("success", "All tasks approved successfully!");
                          navigation.goBack();
                        } catch (error) {
                          showDialog("error", "Failed to approve tasks!");
                        }
                      },
                    },
                  ]
                )
              }
            >
              <Text style={stylesLocal.fabText}>Completed Task</Text>
            </TouchableOpacity>
          </>
        )
      }
    </View>
  );
}

export default NewInspectionMemo;

const stylesLocal = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 30,
    left: 30,
    backgroundColor: "#F26E1F",
    width: 140,
    height: 50,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  fabText: {
    color: "white",
    fontWeight: "700",
  },
  fabApproved: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#1f46f2ff",
    width: 140,
    height: 50,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  pickerWrapper: {
  backgroundColor: "#f2f2f2",
  borderRadius: 10,
  overflow: "hidden",
},
  searchInput: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#333",
  },
  goButton: {
    backgroundColor: Colors.primeColor,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  goButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

});
