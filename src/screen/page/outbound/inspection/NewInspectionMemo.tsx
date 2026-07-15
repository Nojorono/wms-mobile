import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';

import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Picker } from '@react-native-picker/picker';

// Import store & services Anda
import { useLoadingDialogStore } from '../../../../store/useLoadingStore.ts';
import { useDialogStore } from '../../../../store/useGlobalDialog.ts';
import Colors from '../../../../constants/Colors.ts';
import OutboundService from '../../../../service/outboundService.ts';
import MemoGroupCard from '../../../../components/outbound/MemoGroupCard.tsx';
import { InspectionParamList } from '../../../navigation/outbound/InspectionNavigator.tsx';

type NavigationProp = StackNavigationProp<InspectionParamList, 'InspectionDoMain'>;

function NewInspectionMemo() {
  const [refreshing, setRefreshing] = useState(false);
  const [memoList, setMemoList] = useState<any>([]);
  const route = useRoute();
  const itemBefore = route.params as any;

  const navigation = useNavigation<NavigationProp>();
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const showDialog = useDialogStore((s) => s.showDialog);
  const [statusDO, setStatusDO] = useState<string | null>(null);

  const [selectedPalletUse, setSelectedPalletUse] = useState<string | null>(null);

  // LOGIK - TETAP SAMA
  const fetchInspection = async () => {
    try {

      setRefreshing(true);
      showLoadingDialog("Loading...");

      const data = { transaction_picking_status: "PENDING" };
      console.log("Fetching with data:", itemBefore.item.id);

      const response = await OutboundService.getOutboundDoListById(itemBefore.item.id);

      const list = response?.data || [];
      setStatusDO(list?.status || null);

      const memos = list?.outbound_memos || [];

      const processed = memos.map((memo: any) => {
        const memoItems = memo?.outbound_memo_items || [];
        const pickings = memo?.transaction_pickings || [];
        const mergedItems = pickings.map((picking: any) => {
          const memoItem = memoItems.find((itm: any) => itm.item_id === picking.item_id && itm.uom === picking.uom);
          const scans = picking.transactionScanPicking || [];
          const totalQtyPicked = scans.reduce((sum: number, s: any) => sum + (s.quantity_picked || 0), 0);
          return {
            picking_id: picking.id,
            item_id: picking.item_id,
            item: picking.item || memoItem?.item,
            quantity_plan: memoItem?.quantity_plan ?? 0,
            uom: picking.uom,
            is_scanned: scans.length > 0,
            picked_quantity: totalQtyPicked,
            scan_detail: scans,
            transaction_picking: picking,
            outbound_memo_item: memoItem,
          };
        });
        return { memo, items: mergedItems };
      });
      console.log("Processed Memo List:", processed);
      setMemoList(processed);
    } catch (e: any) {
      console.error("Error fetching inspection data:", e.data?.message || e.message || e);
      showDialog("error", "Error while fetching data!");
    } finally {
      hideLoadingDialog();
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchInspection(); }, []));

  const filteredMemoList = useMemo(() => {
    if (!selectedPalletUse) return memoList;
    return memoList.map((group: any) => {
      const filteredItems = group.items.filter((item: any) =>
        item.scan_detail?.some((scan: any) => scan.palletUse?.pallet_code === selectedPalletUse)
      );
      return filteredItems.length > 0 ? { ...group, items: filteredItems } : null;
    }).filter(Boolean);
  }, [memoList, selectedPalletUse]);


  const palletUseOptions = useMemo(() => {
    const set = new Set<string>();
    memoList.forEach((group: any) => group.items.forEach((item: any) => {
      item.scan_detail?.forEach((scan: any) => {
        if (scan.palletUse) set.add(scan.palletUse.pallet_code);
      });
    }));
    return Array.from(set);
  }, [memoList]);


 // 1. Cek apakah SEMUA item scan_detail sudah berstatus INSPECTION_APPROVED
  const isAllInspectionApproved = memoList.length > 0 && memoList.every((m: any) =>
    m.items.length > 0 && m.items.every((item: any) =>
      item.scan_detail.length > 0 && item.scan_detail.every((s: any) => s.status === "INSPECTION_APPROVED")
    )
  );

  // 2. Cek apakah SEMUA item transaction_picking sudah berstatus COMPLETED
  const isAllPickingsCompleted = memoList.length > 0 && memoList.every((m: any) =>
    m.items.length > 0 && m.items.every((item: any) => 
      item.transaction_picking?.status === "COMPLETED"
    )
  );

  // 3. Tombol Approve muncul jika: 
  // Belum semua approved, belum semua completed, status DO bukan IN_PROGRESS, dan ada data yang valid
  const showApproveBtn = 
    statusDO !== "IN_PROGRESS" && 
    !isAllPickingsCompleted && 
    !isAllInspectionApproved && 
    memoList.length > 0 && 
    memoList.some((m: any) =>
      m.items.some((item: any) => item.scan_detail.some((s: any) => s.status === "INSPECTION" || s.status === "INSPECTION_APPROVED"))
  );

  // 4. Tombol Complete muncul JIKA:
  // SEMUA sudah INSPECTION_APPROVED, tetapi BELUM SEMUA berstatus COMPLETED
  const showCompleteBtn = isAllInspectionApproved && !isAllPickingsCompleted;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inspection Memo</Text>
        <Text style={styles.headerSubtitle}>Verification and quality control</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchInspection} colors={[Colors.primeColor]} />}
      >
        {/* FILTER SECTION */}
        <View style={styles.filterCard}>
          <Text style={styles.filterLabel}>Filter by Pallet Use</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedPalletUse}
              onValueChange={(value) => setSelectedPalletUse(value)}
              dropdownIconColor={Colors.primeColor}
              style={styles.picker}
            >
              <Picker.Item label="All Pallets" value={null} color="#999" />
              {palletUseOptions.map((use) => (
                <Picker.Item key={use} label={use} value={use} />
              ))}
            </Picker>
          </View>
        </View>

        {/* LIST MEMO */}
        <View style={styles.listSection}>
          {filteredMemoList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No inspection data available.</Text>
            </View>
          ) : (
            filteredMemoList.map((m: any, index: number) => (
              <View key={`${m.memo.outbound_memo_number}-${index}`} style={styles.memoWrapper}>
                <MemoGroupCard
                  memo={m.memo}
                  items={m.items}
                  onRefresh={fetchInspection}
                />
              </View>
            ))
          )}
        </View>

        {/* Spacing for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FOOTER ACTIONS */}
      <View style={styles.fabContainer}>
        {showApproveBtn && (
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: "#F26E1F" }]}
            onPress={() => Alert.alert("Approve All", "Are you sure you want to approve all tasks?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "OK", onPress: async () => {
                  try {
                    await OutboundService.updateStatusWhenCompleteInspection(itemBefore.item.id, "IN_PROGRESS");
                    showDialog("success", "All tasks approved successfully!");
                    navigation.goBack();
                  } catch (error) { showDialog("error", "Failed to approve!"); }
                }
              },
            ])}
          >
            <Text style={styles.fabText}>Approve Tasks</Text>
          </TouchableOpacity>
        )}

        {showCompleteBtn && (
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: "#2196F3" }]}
            onPress={() => Alert.alert("Complete All", "Finalize all inspection data?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "OK", onPress: async () => {
                  try {
                    for (const memoGroup of memoList) {
                      for (const item of memoGroup.items) {
                        await OutboundService.updateTransactionPickingStatus(item.transaction_picking?.id, { status: "COMPLETED" });
                      }
                    }
                    showDialog("success", "All completed!");
                    navigation.goBack();
                  } catch (error) { showDialog("error", "Failed to complete!"); }
                }
              },
            ])}
          >
            <Text style={styles.fabText}>Complete All</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Background off-white lebih modern
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  scrollContainer: {
    padding: 20,
  },
  filterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    // Soft Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  pickerWrapper: {
    backgroundColor: '#F1F3F5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  listSection: {
    flex: 1,
  },
  memoWrapper: {
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  fab: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
});

export default NewInspectionMemo;