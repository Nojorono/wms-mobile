import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';

import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Colors from '../../../../constants/Colors';
import Ionicons from 'react-native-vector-icons/FontAwesome5';

import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import ScannerService from '../../../../service/palletServices';
import OutboundService from '../../../../service/outboundService';
import { useLoadingDialogStore } from '../../../../store/useLoadingStore';
import { useDialogStore } from '../../../../store/useGlobalDialog';

export default function PickingDetailActivity() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params || {}) as any;

  // normalize params so we always have itemBefore.item like original code expects
  const mode: 'add' | 'edit' = (params.mode as any) || 'add';
  const activity = params.activity;
  // support several shapes: { item } (from screen-add), or { itemBefore } (original)
  let itemBeforeParam = params.itemBefore;
  if (!itemBeforeParam) {
    if (params.item) {
      // caller sent item directly (file1's add case)
      itemBeforeParam = { item: params.item };
    } else if (params.itemBefore && params.itemBefore.item) {
      itemBeforeParam = params.itemBefore;
    } else {
      itemBeforeParam = { item: {} };
    }
  }
  const itemBefore = itemBeforeParam as any; // use itemBefore.item below
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const showDialog = useDialogStore((state) => state.showDialog);
  const [palletSumber, setPalletSumber] = useState('');
  const [palletPicking, setPalletPicking] = useState('');
  const [qtyPicking, setQtyPicking] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchPallet, setSwitchPallet] = useState('');
  const [switchQty, setSwitchQty] = useState('');
  const [foundItem, setFoundItem] = useState<any>(null);
  const [pickingPallet, setPickingPallet] = useState<any>(null);
  const [assignPicking, setAssignPicking] = useState<any>();

  const [doneSumber, setDoneSumber] = useState(false);
  const [donePicking, setDonePicking] = useState(false);
  const [doneSwitch, setDoneSwitch] = useState(false);
  const [switchInfo, setSwitchInfo] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // SCANNER STATES
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanTarget, setScanTarget] =
    useState<'sumber' | 'picking' | 'switching' | null>(null);

  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  const openScanner = async (type: 'sumber' | 'picking' | 'switching') => {
    // disable scanner in edit mode
    if (mode === 'edit') return;
    if (!hasPermission) {
      await requestPermission();
    }
    setScanTarget(type);
    setIsScannerOpen(true);
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'code-128', 'code-39'],
    onCodeScanned: (codes) => {
      if (codes.length === 0) return;
      const value = codes[0].value ?? '';

      if (scanTarget === 'sumber') setPalletSumber(value);
      if (scanTarget === 'picking') setPalletPicking(value);
      if (scanTarget === 'switching') setSwitchPallet(value);

      setIsScannerOpen(false);
      setScanTarget(null);
    },
  });

  const fetchAssign = async () => {
    // guard: require memo_id
    const memoId = itemBefore?.memo_id;
    if (!memoId) return;

    try {
      showLoadingDialog('Loading List Picking SKU');
      const response = await OutboundService.getAssignPickingUser(memoId);
      if (Array.isArray(response.data) && response.data.length > 0) {
        const latest = response.data.reduce((prev: any, curr: any) =>
          new Date(curr.createdAt) > new Date(prev.createdAt) ? curr : prev
        );
        setAssignPicking(latest);
      }
    } catch (error) {
      // don't hide here (finally will hide)
      showDialog('error', 'Error while Fetching Data Picking!');
    } finally {
      hideLoadingDialog();
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAssign();
    }, [itemBefore?.item?.memo_id])
  );

  // when qty or foundItem changes, recalc switch qty if isSwitching and mode add
  useEffect(() => {
    if (isSwitching) {
      if (foundItem && qtyPicking) {
        const picked = Number(qtyPicking);
        const sourceQty = Number(foundItem.current_quantity);
        if (!Number.isNaN(picked) && !Number.isNaN(sourceQty) && picked < sourceQty) {
          setSwitchQty(String(sourceQty - picked));
        }
      }
    }
  }, [qtyPicking, foundItem, isSwitching]);

  // preload fields when editing
  useEffect(() => {
    if (mode === 'edit' && activity) {
      // fill fields from activity safely (guard undefined)
      setPalletSumber(activity.palletSource.pallet_code || '');
      setPalletPicking(activity.palletUse?.pallet_code || '');
      setQtyPicking(activity.quantity_picked != null ? String(activity.quantity_picked) : '');

      // foundItem placeholder (so UI shows info)
      setFoundItem({
        id: activity.palletSource.id,
        item_name: activity.item_name || itemBefore?.item?.item_name,
        current_quantity: activity.palletSource.currentQuantity,
        uom: activity.palletSource.uom || itemBefore?.item?.uom,
        week_number: activity.palletSource.currentWeekNumber || itemBefore?.item?.week_number,
      });

      setPickingPallet({
        id: activity.palletUse?.id || activity.pallet_use_id,
        pallet_code: activity.palletUse?.pallet_code || activity.pallet_use_code,
        week_number: activity.palletUse?.currentWeekNumber || activity.week_number || itemBefore?.item?.week_number,
        uom: activity.palletUse?.uom || activity.uom || itemBefore?.item?.uom,
        current_quantity: activity.palletUse?.currentQuantity,
      });

      if (activity.pallet_switch_id) {
        setIsSwitching(true);
        setSwitchPallet(activity.palletSwitch?.pallet_code || activity.pallet_switch_code || '');
        setSwitchQty(activity.quantity_switch != null ? String(activity.quantity_switch) : '');
        setSwitchInfo({
          id: activity.palletSwitch.id,
          current_quantity: activity.quantity_switch,
          uom: activity.palletSwitch?.uom,
          week_number: activity.palletSwitch?.week_number,
        });
        setDoneSwitch(true);
      }

      // mark checks as done for edit mode (so submit enabled)
      setDoneSumber(true);
      setDonePicking(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, activity]);

  const handleCheckPalletSumber = async () => {
    if (!palletSumber.trim()) {
      showDialog('error', 'Masukkan pallet sumber terlebih dahulu');
      return;
    }

    try {
      const res = await ScannerService.getPalletByCode(palletSumber);
      if (!res.success) {
        showDialog('error', 'Pallet tidak ditemukan atau tidak valid');
        return;
      }

      if(res.data[0].status_inventory !== "READY") {
        showDialog('error', 'Item dalam pallet tidak dalam status ready');
        return;
      }

      // Gabungkan pengecekan item_id, uom, dan week_number
      const found = res.data.find(
        (item: any) =>
          item.item_id === itemBefore.item_id &&
          item.uom === itemBefore.uom &&
          item.week_number === itemBefore.week_number
      );

      if (!found) {
        // Cek apakah item_id ada, jika tidak, error item tidak ditemukan
        const hasItemId = res.data.some((item: any) => item.item_id === itemBefore.item_id);

        if (!hasItemId) {
          showDialog('error', 'Pallet tidak memiliki item yang akan dipicking');
        } else {
          // Jika item_id ada, tapi uom/week_number tidak cocok
          const firstMatch = res.data.find((item: any) => item.item_id === itemBefore.item_id);

          // --- LOGIKA BARU UNTUK FIRSTMATCH ---
          if (!itemBefore?.sourceBin) {
            // Jika sourceBin null, gunakan pengecekan sub-warehouse
            if (firstMatch?.warehouse_sub_code !== itemBefore?.sourceWarehouseSub?.name) {
              showDialog('error', `Invalid, pallet berada di ${firstMatch?.warehouse_sub_code}, seharusnya di ${itemBefore?.sourceWarehouseSub?.name}`);
            } else {
              showDialog('error', `Invalid, pallet memiliki Uom ${firstMatch?.uom} dan week ${firstMatch?.week_number}`);
            }
          } else {
            // Jika sourceBin ada, gunakan pengecekan bin
            if (firstMatch?.warehouse_bin_code !== itemBefore?.sourceBin?.code) {
              showDialog('error', `Invalid, pallet berada di ${firstMatch?.warehouse_bin_code}, seharusnya di ${itemBefore?.sourceBin?.code}`);
            } else {
              showDialog('error', `Invalid, pallet memiliki Uom ${firstMatch?.uom} dan week ${firstMatch?.week_number}`);
            }
          }
        }
        return;
      }

      // --- LOGIKA BARU UNTUK EXACT MATCH (FOUND) ---
      // Jika found, tetap cek lokasinya (apakah pakai bin atau sub-warehouse)
      if (!itemBefore?.sourceBin) {
        if (found.warehouse_sub_code !== itemBefore?.sourceWarehouseSub?.name) {
          showDialog('error', `Invalid, pallet berada di ${found.warehouse_sub_code}, seharusnya di ${itemBefore?.sourceWarehouseSub?.name}`);
          return;
        }
      } else {
        if (found.warehouse_bin_code !== itemBefore?.sourceBin?.code) {
          showDialog('error', `Invalid, pallet berada di ${found.warehouse_bin_code}, seharusnya di ${itemBefore?.sourceBin?.code}`);
          return;
        }
      }

      setFoundItem(found);
      setDoneSumber(true);
      showDialog('success', `Pallet valid ${found.item_name}\nQty ${found.current_quantity} ${found.uom}`);
    } catch (err) {
      showDialog('error', 'Gagal memeriksa pallet');
    }
  };

  const handleCheckPalletPicking = async () => {
    if (!palletPicking.trim()) {
      showDialog('error', 'Masukkan pallet picking terlebih dahulu');
      return;
    }

    // --- TAMBAHKAN LOGIKA VALIDASI DI SINI ---
    if (itemBefore?.sourceWarehouseSub?.name === "PRELOAD") {
      if (palletSumber === palletPicking) {
        showDialog('error', 'Untuk item PRELOAD, Pallet Sumber tidak boleh sama dengan Pallet Picking');
        return;
      }
    }
    // -----------------------------------------

    try {
      const res = await ScannerService.getPalletByCode(palletPicking);
      if (!res.success) {
        showDialog('error', 'Pallet tidak ditemukan atau tidak valid');
        return;
      }
      const hasInInventory = res.data.some((item: any) => item.inventory_status === "IN_INVENTORY" && item.current_quantity !== 0);

      if (hasInInventory) {
        // Jika berstatus IN_INVENTORY dengan qty bukan 0, PalletSumber HARUS sama dengan PalletPicking
        if (palletSumber !== palletPicking) {
          showDialog('error', 'Pallet dengan status IN_INVENTORY hanya bisa digunakan jika sama dengan Pallet Sumber');
          return;
        }
      }

      if (res.data[0].status_inventory !== "READY" && res.data[0].current_quantity !== 0) {
        showDialog('error', 'Item dalam pallet tidak dalam status ready');
        return;
      }

      if (res.data[0].current_quantity === res.data[0].capacity) {
        showDialog('error', 'Pallet picking sudah penuh, tidak bisa digunakan untuk picking');
        return;
      }

      if (Number(res.data[0].quantity) - Number(res.data[0].current_quantity) < Number(qtyPicking)) {
        showDialog('error', `Pallet picking tidak memiliki cukup kapasitas untuk qty picking ${qtyPicking}`);
        return;
      }

      const found = res.data.find(
        (item: any) => {
          const uomMatch = item.uom === itemBefore.uom;
          // Only compare memo_id if item.memo_id is not undefined/null/empty string
          const memoIdPresent = item.memo_id !== undefined && item.memo_id !== null && item.memo_id !== "";
          const memoIdMatch = memoIdPresent ? item.memo_id === itemBefore.memo_id : true;
          return uomMatch && memoIdMatch;
        }
      );
      if (!found) {
        // Cek jika ada item dengan uom sama tapi memo_id berbeda
        const hasOtherMemo = res.data.some(
          (item: any) =>
            item.uom === itemBefore.uom &&
            item.memo_id &&
            item.memo_id !== itemBefore.memo_id
        );
        if (hasOtherMemo) {
          showDialog('error', 'Pallet ini sudah memiliki Memo yang lain');
        } else {
          showDialog('error',
            `Invalid, ${palletPicking} memiliki Uom ${res.data[0].uom} `
          );
        }
        return;
      }
      setPickingPallet(res.data[0]);
      setDonePicking(true);
      showDialog(
        'success',
        `Pallet valid ${res.data[0].week_number
          ? `week ${res.data[0].week_number}`
          : ''
        } | Uom: ${res.data && res.data.length > 0 ? res.data[0].uom ?? '' : ''}`
      );
    } catch (err:any) {
      showDialog('error', err.data.message || 'Gagal memeriksa pallet');
    }
  };

  const handleCheckPalletSwitching = async () => {
    if (!switchPallet.trim()) {
      showDialog('error', 'Masukkan pallet switching terlebih dahulu');
      return;
    }
    try {
      const res = await ScannerService.getPalletByCode(switchPallet);
      if (!res.success) {
        showDialog('error', 'Pallet tidak ditemukan atau tidak valid');
        return;
      }

      const found = res.data.find(
        (item: any) =>
          item.uom === itemBefore.uom
      );
      if (!found) {
        showDialog('error', `Invalid, ${palletPicking} memiliki Uom ${res.data[0].uom} `);
        return;
      }
      setSwitchInfo(res.data[0]);
      setDoneSwitch(true);
      if (res.data[0].current_quantity === 0) {
        showDialog('success', 'Pallet valid');
      } else {
        showDialog('success', `Pallet valid ${res.data[0].item_name}\nQty ${res.data[0].current_quantity} ${res.data[0].uom}`);
      }
    } catch (err) {
      showDialog('error', 'Gagal memeriksa pallet');
    }
  };
  const isSamePallet = palletSumber && palletPicking && palletSumber === palletPicking;

  // validation adapts for edit: since fields are prefilled, checks still valid
  const isSubmitValid = (() => {
    // --- VALIDASI DASAR ---
    const sourceOk = palletSumber && doneSumber && foundItem;
    const pickingOk = palletPicking && donePicking && pickingPallet;
    const qtyOk = qtyPicking && Number(qtyPicking) > 0;

    // --- JIKA PALLET SAMA ---
    if (isSamePallet && foundItem) {
      if (isSwitching) {
        // Jika switching, validasi switching
        const switchOk = switchPallet && doneSwitch && switchInfo;
        const switchQtyOk = switchQty && Number(switchQty) > 0;
        return sourceOk && pickingOk && qtyOk && switchOk && switchQtyOk;
      } else {
        // Jika tidak switching, qty harus sama dengan current_quantity
        if (Number(qtyPicking) !== Number(foundItem.current_quantity)) {
          return false;
        }
      }
    }

    // --- JIKA ADA SWITCHING (PALLET TIDAK SAMA) ---
    if (isSwitching) {
      const switchOk = switchPallet && doneSwitch && switchInfo;
      const switchQtyOk = switchQty && Number(switchQty) > 0;
      return sourceOk && pickingOk && qtyOk && switchOk && switchQtyOk;
    }
    return sourceOk && pickingOk && qtyOk;
  })();

  const handleSubmit = async () => {
    // basic guard
    if (!foundItem) {
      showDialog('error', 'Pallet sumber belum dicek!');
      return;
    }
    if (!pickingPallet) {
      showDialog('error', 'Pallet picking belum dicek!');
      return;
    }

    const userId = assignPicking?.picking_user_id || 'test-user-123';
    const userName = assignPicking?.picking_name || 'test user';

    const payload: any = {
      transaction_picking_id: itemBefore.id,
      pallet_source_id: foundItem?.id,
      pallet_use_id: pickingPallet?.id,
      item_id: itemBefore.item_id,
      quantity_picked: Number(qtyPicking),
      uom: itemBefore.uom,
      week_number: itemBefore.week_number,
      status: 'OPEN',
      user_id: userId,
      user_name: userName,
    };

    if (switchPallet) {
      payload.pallet_switch_id = switchInfo?.id;
    }

    if (switchQty) {
      payload.quantity_switch = Number(switchQty);
    }

    try {
      showLoadingDialog(mode === 'edit' ? 'Updating Activity' : 'Submitting Activity');

      if (mode === 'edit') {
        // Add id for update endpoint
        const idActivity = activity.id;
        // call update API - ensure your OutboundService implements this
        await OutboundService.updateTransactionPickingDetail(idActivity, payload);
        showDialog('success', 'Berhasil memperbarui activity picking');
      } else {
        await OutboundService.postTransactionPicking(payload);
        showDialog('success', 'Berhasil membuat activity picking');
      }

      navigation.goBack();
    } catch (err: any) {
      showDialog('error', mode === 'edit' ? `Gagal update activity, ${err.data.message}` : `Gagal submit picking, ${err.data.message}`);
      console.error('Submit error', err);
    } finally {
      hideLoadingDialog();
    }
  };

  const onChangeQtyPicking = (v: string) => {
    const qty = Number(v);
    // limit: not exceed requested quantity (itemBefore.item.quantity)
    if (itemBefore?.item?.quantity != null && qty > Number(itemBefore.item.quantity)) {
      showDialog('error', 'Qty picking tidak boleh lebih besar dari qty permintaan');
      return;
    }

    if (pickingPallet?.capacity - pickingPallet?.current_quantity < qty) {
      showDialog('error', 'Qty picking tidak boleh lebih besar dari kapasitas pallet picking');
      return;
    }

    if (foundItem?.current_quantity != null && qty > Number(foundItem.current_quantity)) {
      showDialog('error', `Qty picking tidak boleh lebih besar dari qty pallet sumber (${foundItem.current_quantity})`);
      return;
    }

    setQtyPicking(v);
  };



  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={'height'}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* MAIN CARD */}
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: 'bold',
                  color: 'black',
                  textAlign: 'center',
                  backgroundColor: '#FFF5E6',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  elevation: 2,
                  shadowColor: '#F26E1F',
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  flex: 1,
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {mode === 'edit'
                  ? itemBefore?.item?.sku
                  : itemBefore?.item?.item?.sku ||
                  itemBefore?.item?.sku ||
                  'Picking Activity'}
              </Text>
            </View>

            {/* SUGGESTED DESTINATION */}
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <Text
                style={{
                  fontStyle: 'italic',
                  fontSize: 14,
                  color: '#F26E1F',
                  fontWeight: '700',
                }}
              >
                Suggested Destination Location
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 16,
                  color: '#333',
                  fontWeight: '700',
                  marginTop: 4,
                  backgroundColor: '#FFF5E6',
                  borderRadius: 8,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                }}
              >

                {itemBefore?.quantity} {itemBefore?.uom} - Week-
                {itemBefore?.week_number}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 12,
                  color: '#333',
                  fontWeight: '700',
                  marginTop: 4,
                  backgroundColor: '#FFF5E6',
                  borderRadius: 8,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                }}
              >
                From {itemBefore?.sourceWarehouseSub?.name} Bin {itemBefore?.sourceBin?.code} to {itemBefore?.destinationWarehouseSub?.name} -{' '}
                {itemBefore?.destinationBin?.name}

              </Text>
            </View>

            {/* FOUND ITEM INFO */}
            {foundItem && (
              <View style={{ marginBottom: 4 }}>
                <Text style={{ color: '#888', fontSize: 14 }}>
                  {foundItem.item_name} | Qty: {foundItem.current_quantity} {foundItem.uom} | Week: {foundItem.week_number} | Bin: {foundItem.warehouse_bin_code}
                </Text>
              </View>
            )}

            {/* PALLET SUMBER */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end', // Mengunci alignment ke bagian bawah agar sejajar dengan input
                marginVertical: 4,
                gap: 8 // Memberikan jarak antar elemen secara konsisten
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>Pallet Sumber</Text>
                <TextInput
                  placeholder="Pallet Sumber"
                  value={palletSumber}
                  editable={mode !== 'edit'}
                  onChangeText={(v) => {
                    setPalletSumber(v);
                    setFoundItem(null);
                    setDoneSumber(false);
                  }}
                  style={[styles.input, { marginVertical: 0 }]}
                />
              </View>

              {/* Scan Button (hidden in edit mode) */}
              {mode !== 'edit' && (
                <TouchableOpacity
                  style={styles.scanBtn}
                  onPress={() => openScanner('sumber')}
                >
                  <Ionicons
                    name="barcode"
                    size={22}
                    color={Colors.secondaryColor}
                  />
                </TouchableOpacity>
              )}

              {/* CHECK Button SUMBER*/}
              {doneSumber ? (
                <Text style={{ color: 'green', fontWeight: '700', marginLeft: 10 }}>
                  DONE
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={handleCheckPalletSumber}
                  style={{
                    marginLeft: 6,
                    backgroundColor: '#F26E1F',
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Check</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* PALLET PICKING */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end', // Mengunci alignment ke bagian bawah agar sejajar dengan input
                marginVertical: 4,
                gap: 8 // Memberikan jarak antar elemen secara konsisten
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>Pallet Picking</Text>
                <TextInput
                  placeholder="Pallet Picking"
                  value={palletPicking}
                  editable={mode !== 'edit'}
                  onChangeText={(v) => {
                    setPalletPicking(v);
                    setPickingPallet(null);
                    setDonePicking(false);
                  }}
                  style={[styles.input, { marginVertical: 0 }]}
                />
              </View>
              {mode !== 'edit' && (
                <TouchableOpacity
                  style={styles.scanBtn}
                  onPress={() => openScanner('picking')}
                >
                  <Ionicons
                    name="barcode"
                    size={22}
                    color={Colors.secondaryColor}
                  />
                </TouchableOpacity>
              )}
              {/* CHECK Button */}
              {donePicking ? (
                <Text style={{ color: 'green', fontWeight: '700', marginLeft: 10 }}>
                  DONE
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={handleCheckPalletPicking}
                  style={{
                    marginLeft: 6,
                    backgroundColor: '#1f5bf2ff',
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Check</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>Qty Picking</Text>
                <TextInput
                  placeholder="Qty Picking"
                  value={qtyPicking}
                  onChangeText={(v) => {
                    const qty = Number(v);
                    // Cek jika qty melebihi permintaan
                    if (
                      itemBefore?.quantity != null &&
                      qty > Number(itemBefore.quantity)
                    ) {
                      showDialog('error', 'Qty picking tidak boleh lebih besar dari qty permintaan');
                      return;
                    }
                    // Cek jika qty + total picked sebelumnya melebihi permintaan
                    const activities = Array.isArray(activity) ? activity : [];
                    const totalPicked = activities.reduce(
                      (sum: number, act: any) =>
                        typeof act?.quantity_picked === 'number'
                          ? sum + act.quantity_picked
                          : sum,
                      0
                    );
                    if (
                      itemBefore?.quantity != null &&
                      qty + totalPicked > Number(itemBefore.quantity)
                    ) {
                      showDialog('error', `Qty picking total (${qty + totalPicked}) tidak boleh lebih besar dari qty permintaan (${itemBefore.quantity})`);
                      return;
                    }

                    // --- TAMBAHAN VALIDASI PALLET SUMBER DI SINI ---
                    if (
                      foundItem?.current_quantity != null &&
                      qty > Number(foundItem.current_quantity)
                    ) {
                      showDialog('error', `Qty picking tidak boleh lebih besar dari qty pallet sumber (${foundItem.current_quantity})`);
                      return;
                    }
                    // -----------------------------------------------

                    if (Number(pickingPallet?.capacity) - Number(pickingPallet?.current_quantity) < qty) {
                      showDialog('error', 'Qty picking tidak boleh lebih besar dari kapasitas pallet picking');
                      return;
                    }

                    onChangeQtyPicking(v);
                  }}
                  keyboardType="numeric"
                  style={[styles.input, { marginVertical: 0 }]}
                />
              </View>
              <Text style={{ marginLeft: 8, fontWeight: 'bold', color: '#333' }}>
                {itemBefore?.uom}
              </Text>
            </View>

            {/* SWITCHING */}
            {isSamePallet && !isSwitching && (
              <TouchableOpacity
                disabled={foundItem && Number(foundItem.current_quantity) === Number(qtyPicking)}
                style={[
                  styles.cancelButton,
                  {
                    backgroundColor: foundItem && Number(foundItem.current_quantity) === Number(qtyPicking)
                      ? '#ccc'
                      : '#F26E1F'
                  }
                ]}
                onPress={() => setIsSwitching(true)}
              >
                <Text
                  style={[
                    styles.cancelText,
                    {
                      color: foundItem && Number(foundItem.current_quantity) === Number(qtyPicking)
                        ? '#666'
                        : '#fff'
                    }
                  ]}
                >
                  Use Pallet Switch
                </Text>
              </TouchableOpacity>
            )}


            {isSamePallet && isSwitching && (
              <View style={styles.switchSection}>
                <Text style={styles.switchTitle}>Pallet Switching</Text>
                {/* PALLET SWITCHING */}
                {switchInfo && (
                  <Text style={{ color: '#888', fontSize: 14, marginVertical: 4 }}>
                    Uom: {switchInfo.uom} | Week:{' '}
                    {switchInfo.week_number}
                  </Text>
                )}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end', // Mengunci alignment ke bagian bawah agar sejajar dengan input
                    marginVertical: 4,
                    gap: 8 // Memberikan jarak antar elemen secara konsisten
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>Pallet Switching</Text>
                    <TextInput
                      placeholder="Pallet Switching"
                      value={switchPallet}
                      onChangeText={(v) => {
                        setSwitchPallet(v);
                        setSwitchInfo(null);
                        setDoneSwitch(false);
                      }}
                      style={[styles.input, { marginVertical: 0 }]}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.scanBtn}
                    onPress={() => openScanner('switching')}
                    disabled={mode === 'edit'}
                  >
                    <Ionicons
                      name="barcode"
                      size={22}
                      color={Colors.secondaryColor}
                    />
                  </TouchableOpacity>
                  {/* CHECK Button SWITCHING*/}
                  {doneSwitch ? (
                    <Text style={{ color: 'green', fontWeight: '700', marginLeft: 10 }}>
                      DONE
                    </Text>
                  ) : (
                    <TouchableOpacity
                      onPress={handleCheckPalletSwitching}
                      style={{
                        marginLeft: 6,
                        backgroundColor: '#1f5bf2ff',
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '700' }}>Check</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>Qty Switching</Text>
                    <TextInput
                      placeholder="Qty Switching"
                      value={switchQty}
                      onChangeText={setSwitchQty}
                      keyboardType="numeric"
                      editable={false}
                      style={[styles.input, { marginVertical: 0, backgroundColor: '#eee' }]}
                    />
                  </View>
                  {switchInfo && (
                    <Text style={{ marginLeft: 8, fontWeight: 'bold', color: '#333' }}>
                      {switchInfo.uom}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.cancelButton]}
                  onPress={() => setIsSwitching(false)}
                >
                  <Text style={styles.cancelText}>Cancel Switching</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* SUBMIT */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: isSubmitValid ? '#F26E1F' : '#bfbfbf' }
            ]}
            disabled={!isSubmitValid}
            onPress={handleSubmit}
          >
            <Text style={styles.submitText}>{mode === 'edit' ? 'Update' : 'Submit'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* SCANNER MODAL */}
      {isScannerOpen && device && (
        <View style={styles.scannerModal}>
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            codeScanner={codeScanner}
          />

          {/* FRAME */}
          <View style={styles.scanFrame} />

          <TouchableOpacity
            onPress={() => setIsScannerOpen(false)}
            style={styles.closeScannerBtn}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
              CLOSE
            </Text>
          </TouchableOpacity>
        </View>
      )}

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EDE8E3',
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#F4F7FB',
    borderRadius: 12,
    padding: 16,
  },

  scanBtn: {
    marginLeft: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },

  submitButton: {
    marginTop: 16,
    backgroundColor: '#F26E1F',
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '700',
  },

  // SWITCHING
  switchSection: {
    backgroundColor: '#FFF4E0',
    padding: 10,
    borderRadius: 10,
    marginVertical: 8,
  },
  switchTitle: {
    fontWeight: '700',
    marginBottom: 6,
    color: '#F26E1F',
  },
  cancelButton: {
    marginTop: 8,
    backgroundColor: '#eee',
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelText: {
    textAlign: 'center',
    color: '#333',
    fontWeight: '600',
  },

  // SCANNER MODAL
  scannerModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },

  scanFrame: {
    width: 260,
    height: 260,
    borderWidth: 3,
    borderColor: 'white',
    borderRadius: 20,
    position: 'absolute',
  },

  closeScannerBtn: {
    position: 'absolute',
    bottom: 60,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

});
