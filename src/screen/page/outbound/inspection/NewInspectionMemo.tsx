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

  const fetchInspection = async () => {
    try {
      setRefreshing(true);
      showLoadingDialog("Loading...");

      const data = { limit: 100, transaction_picking_status: "PENDING" };
      const response = await OutboundService.getOutboundDoList(data);

      const list = response?.data || [];
      const matched = list.find((i: any) => i.id === itemBefore.item.id);
      const memos = matched?.outbound_memos || [];
      console.log("Fetched Memos:", memos);
      // Proses memo items + picking scan
      const processed = memos.map((memo: any) => {
        const memoItems = memo?.outbound_memo_items || [];
        const pickings = memo?.transaction_pickings || [];

        const mergedItems = memoItems.map((itm: any) => {
          // cari picking untuk item ini
          const picking = pickings.find((p: any) => p.item_id === itm.item_id);

          // ambil scan array
          const scans = picking?.transactionScanPicking || [];
          const transcation = picking

          // total qty dari semua scan
          const totalQtyPicked = scans.reduce(
            (sum: number, s: any) => sum + (s.quantity_picked || 0),
            0
          );

          return {
            ...itm,
            is_scanned: scans.length > 0,
            picked_quantity: totalQtyPicked,
            transcation_pickig: transcation,
            scan_detail: scans, // simpan semua scan
          };
        });

        return {
          memo,
          items: mergedItems,
        };
      });
      console.log("Processed Memos:", processed);
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

          {/* LIST MEMO */}
          {memoList.length === 0 ? (
            <Text style={{ textAlign: "center", marginTop: 30, color: "#777" }}>
              No memo found.
            </Text>
          ) : (
            memoList.map((m: any, index: number) => (
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
                    const res = await OutboundService.updateStatusWhenCompleteInspection(itemBefore.item.id, "IN_PROGRESS");
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
      {
        // Tampilkan tombol hanya jika SEMUA item sudah picked sesuai quantity_plan
        memoList.every((m: any) =>
          m.items.every(
            (item: any) =>
              item.picked_quantity === item.quantity_plan
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
                          memoList.forEach((memoGroup: any, memoIdx: number) => {
                            memoGroup.items.forEach(async (item: any, itemIdx: number) => {
                              const res = await OutboundService.updateStatusWhenCompleteInspection(item.transcation_pickig?.id, "COMPLETED");
                            });
                          });
                          
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
});
