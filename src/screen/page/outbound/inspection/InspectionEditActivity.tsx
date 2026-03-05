import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
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
import { userId } from '../../../../dummy/inboundData';

export default function InspectionUpdateActivity() {
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
  const itemBefore = itemBeforeParam as any;

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

  const handleApproveAction = async (type: "APPROVE" | "FINAL") => {
    if (!activity) return;

    const nextStatus =
      type === "APPROVE" ? "INSPECTION" : "INSPECTION_APPROVED";

    Alert.alert(
      "Confirm Approve",
      "Apakah Anda yakin ingin meng-approve item ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            try {
              showLoadingDialog("Approving...");
              const payload = {
                status: nextStatus,
                inspection_by: userId,
                ids: [activity.id],
              };
              await OutboundService.updateStatusPickingBulk(payload);
              hideLoadingDialog();
              showDialog("success", "Berhasil Update Status!");
              navigation.goBack();
            } catch (error) {
              hideLoadingDialog();
              showDialog("error", "Gagal Update Status!");
            }
          },
        },
      ]
    );
  };

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
      Alert.alert('Masukkan pallet sumber terlebih dahulu');
      return;
    }

    try {
      const res = await ScannerService.getPalletByCode(palletSumber);
      if (!res.success) {
        Alert.alert('Pallet tidak ditemukan atau tidak valid');
        return;
      }
      // find matching item_id
      const found = res.data.find((item: any) => item.item_id === itemBefore.item_id);
      if (!found) {
        Alert.alert('Pallet tidak memiliki item yang akan dipicking');
        return;
      }
      setFoundItem(found);
      setDoneSumber(true);
      Alert.alert('Pallet valid', `${found.item_name}\nQty ${found.current_quantity} ${found.uom}`);
    } catch (err) {
      Alert.alert('Gagal memeriksa pallet');
    }
  };

  const handleCheckPalletPicking = async () => {
    if (!palletPicking.trim()) {
      Alert.alert('Masukkan pallet picking terlebih dahulu');
      return;
    }

    try {
      const res = await ScannerService.getPalletByCode(palletPicking);
      if (!res.success) {
        Alert.alert('Pallet tidak ditemukan atau tidak valid');
        return;
      }
      setPickingPallet(res.data[0]);
      setDonePicking(true);
      Alert.alert('Pallet valid', `Week: ${res.data[0].week_number} | Uom: ${res.data[0].uom}`);
    } catch (err) {
      Alert.alert('Gagal memeriksa pallet');
    }
  };

  const handleCheckPalletSwitching = async () => {
    if (!switchPallet.trim()) {
      Alert.alert('Masukkan pallet switching terlebih dahulu');
      return;
    }
    try {
      const res = await ScannerService.getPalletByCode(switchPallet);
      if (!res.success) {
        Alert.alert('Pallet tidak ditemukan atau tidak valid');
        return;
      }
      setSwitchInfo(res.data[0]);
      setDoneSwitch(true);
      Alert.alert('Pallet valid', `${res.data[0].item_name}\nQty ${res.data[0].current_quantity} ${res.data[0].uom}`);
    } catch (err) {
      Alert.alert('Gagal memeriksa pallet');
    }
  };

  // validation adapts for edit: since fields are prefilled, checks still valid
  const isSubmitValid = (() => {
    // --- VALIDASI DASAR ---
    const sourceOk = palletSumber && doneSumber && foundItem;
    const pickingOk = palletPicking && donePicking && pickingPallet;
    const qtyOk = qtyPicking && Number(qtyPicking) > 0;

    // --- JIKA ADA SWITCHING ---
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
      Alert.alert('Pallet sumber belum dicek!');
      return;
    }
    if (!pickingPallet) {
      Alert.alert('Pallet picking belum dicek!');
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
      status: 'PENDING',
      inspection_by: itemBefore.memo?.requestor || itemBefore.requestor,
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
    } catch (err) {
      console.error(err);
      showDialog('error', mode === 'edit' ? 'Gagal update activity' : 'Gagal submit picking');
    } finally {
      hideLoadingDialog();
    }
  };

  const onChangeQtyPicking = (v: string) => {
    const qty = Number(v);
    // limit: not exceed requested quantity (itemBefore.item.quantity)
    if (itemBefore?.item?.quantity != null && qty > Number(itemBefore.item.quantity)) {
      Alert.alert('Qty picking tidak boleh lebih besar dari qty permintaan');
      return;
    }
    setQtyPicking(v);
  };

  const isSamePallet = palletSumber && palletPicking && palletSumber === palletPicking;

  return (
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
            {mode === 'edit' ? itemBefore?.item?.description : itemBefore?.item?.item?.description || itemBefore?.item?.description || 'Picking Activity'}
          </Text>
          {/* <Ionicons name="times" size={20} color={"red"} style={{ marginLeft: 12 }} /> */}
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

            {itemBefore?.quantity_plan} {itemBefore?.uom} - Week-
            {itemBefore?.transaction_picking.week_number}
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
            From {itemBefore?.transaction_picking.sourceWarehouseSub?.name} Bin {itemBefore?.transaction_picking.sourceBin?.name} to {itemBefore?.transaction_picking.destinationWarehouseSub?.name} -{' '}
            {itemBefore?.transaction_picking.destinationBin?.name}

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
            {`Activity Status: ${activity.status}`}

          </Text>
        </View>

        {/* FOUND ITEM INFO */}
        {foundItem && (
          <View style={{ marginBottom: 4 }}>
            <Text style={{ color: '#888', fontSize: 14 }}>
              {foundItem.item_name} | Qty: {foundItem.current_quantity} {foundItem.uom} | Week: {foundItem.week_number}
            </Text>
          </View>
        )}

        {/* PALLET SUMBER */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 4,
          }}
        >
          <TextInput
            placeholder="Pallet Sumber"
            value={palletSumber}
            onChangeText={(v) => {
              setPalletSumber(v);
              setFoundItem(null);
              setDoneSumber(false);
            }}
            style={[styles.input, { flex: 1, marginVertical: 0 }]}
          />

          {/* Scan Button (hidden in edit mode) */}

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
            alignItems: 'center',
            marginVertical: 4,
          }}
        >
          <TextInput
            placeholder="Pallet Picking"
            value={palletPicking}
            onChangeText={(v) => {
              setPalletPicking(v);
              setPickingPallet(null);
              setDonePicking(false);
            }}
            style={[styles.input, { flex: 1, marginVertical: 0 }]}
          />

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
          <TextInput
            placeholder="Qty Picking"
            value={qtyPicking}
            onChangeText={onChangeQtyPicking}
            keyboardType="numeric"
            style={[styles.input, { flex: 1, marginVertical: 0 }]}
          />

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
                alignItems: 'center',
                marginVertical: 4,
              }}
            >

              <TextInput
                placeholder="Pallet Switching"
                value={switchPallet}
                onChangeText={(v) => {
                  setSwitchPallet(v);
                  setSwitchInfo(null);
                  setDoneSwitch(false);
                }}
                style={[styles.input, { flex: 1, marginVertical: 0 }]}
              />

              <TouchableOpacity
                style={styles.scanBtn}
                onPress={() => openScanner('switching')}

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
              <TextInput
                placeholder="Qty Switching"
                value={switchQty}
                onChangeText={setSwitchQty}
                keyboardType="numeric"
                editable={false}
                style={[styles.input, { flex: 1, marginVertical: 0, backgroundColor: '#eee' }]}
              />
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

      {/* APPROVE BUTTONS */}

      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        
          {activity.status === "PENDING" && (
            <TouchableOpacity
              style={[styles.approveButton, { flex: 1, backgroundColor: "green" }]}
              onPress={() => handleApproveAction("APPROVE")}
            >
              <Text style={styles.approveText}>Approve</Text>
            </TouchableOpacity>
          )}

          {activity.status === "INSPECTION" && (
            <TouchableOpacity
              style={[styles.approveButton, { flex: 1, backgroundColor: "#f57f1e" }]}
              onPress={() => handleApproveAction("FINAL")}
            >
              <Text style={styles.approveText}>Final</Text>
            </TouchableOpacity>
          )}

          {activity.status === "INSPECTION_APPROVED" && (
            <>
              <TouchableOpacity
                style={[styles.approveButton, { flex: 1, backgroundColor: "#ccc" }]}
                disabled
              >
                <Text style={styles.approveText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.approveButton, { flex: 1, backgroundColor: "#ccc" }]}
                disabled
              >
                <Text style={styles.approveText}>Final</Text>
              </TouchableOpacity>
            </>
          )}

      </View>


      {/* SUBMIT */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          {
        backgroundColor:
          isSubmitValid && activity.status !== "INSPECTION_APPROVED"
            ? '#F26E1F'
            : '#bfbfbf'
          }
        ]}
        disabled={!isSubmitValid || activity.status === "INSPECTION_APPROVED"}
        onPress={handleSubmit}
      >
        <Text style={styles.submitText}>{mode === 'edit' ? 'Update' : 'Submit'}</Text>
      </TouchableOpacity>

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
    </View>
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
  approveButton: {
    marginTop: 10,
    backgroundColor: 'green',
    paddingVertical: 10,
    borderRadius: 8,
  },
  approveText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '700',
  },
});
