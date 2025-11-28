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
import { OutboundItemParam } from '../../../../interface/outbound/outbound';
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
  const itemBefore = route.params as OutboundItemParam;
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
    try {
      showLoadingDialog('Loading List Picking SKU');
      const response = await OutboundService.getAssignPickingUser(itemBefore.item.memo_id);
      // Ambil item dengan createdAt paling baru
      if (Array.isArray(response.data) && response.data.length > 0) {
        const latest = response.data.reduce((prev: any, curr: any) =>
          new Date(curr.createdAt) > new Date(prev.createdAt) ? curr : prev
        );
        setAssignPicking(latest);
      }
    } catch (error) {
      hideLoadingDialog();
      showDialog('error', 'Error while Fetching Data Picking!');
    } finally {
      hideLoadingDialog();
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAssign();
    }, [])
  );

  useEffect(() => {
    if (foundItem && qtyPicking) {
      const picked = Number(qtyPicking);
      const sourceQty = Number(foundItem.current_quantity);

      if (picked < sourceQty) {
        setIsSwitching(true);
        setSwitchQty(String(sourceQty - picked));
      }
    }
  }, [qtyPicking, foundItem]);

  const handleCheckPalletSumber = async () => {
    if (!palletSumber.trim()) {
      Alert.alert("Masukkan pallet sumber terlebih dahulu");
      return;
    }

    try {
      const res = await ScannerService.getPalletByCode(palletSumber);
      if (!res.success) {
        Alert.alert("Pallet tidak ditemukan atau tidak valid");
        return;
      }
      // res.data is an array, filter for matching item_id
      const found = res.data.find((item: any) => item.item_id === itemBefore.item.item_id);
      setFoundItem(found);
      if (!found) {
        Alert.alert("Pallet tidak memiliki item yang akan dipicking");
        return;
      }
      setFoundItem(found);
      setDoneSumber(true);
      Alert.alert("Pallet valid | Item:" + found.item_name + " \n Qty " + found.current_quantity + " " + found.uom);
    } catch (err) {
      Alert.alert("Gagal memeriksa pallet");
    }
  };

  const handleCheckPalletPicking = async () => {
    if (!palletPicking.trim()) {
      Alert.alert("Masukkan pallet picking terlebih dahulu");
      return;
    }

    try {
      const res = await ScannerService.getPalletByCode(palletPicking);
      if (!res.success) {
        Alert.alert("Pallet tidak ditemukan atau tidak valid");
        return;
      }
      setPickingPallet(res.data[0]);
      setDonePicking(true);
      Alert.alert("Pallet valid | Week: " + res.data[0].week_number + "| Uom : " + res.data[0].uom);
    } catch (err) {
      Alert.alert("Gagal memeriksa pallet");
    }
  };

  const handleCheckPalletSwitching = async () => {
    if (!switchPallet.trim()) {
      Alert.alert("Masukkan pallet switching terlebih dahulu");
      return;
    }
    try {
      const res = await ScannerService.getPalletByCode(switchPallet);
      if (!res.success) {
        Alert.alert("Pallet tidak ditemukan atau tidak valid");
        return;
      }
      setSwitchInfo(res.data[0]);
      setDoneSwitch(true);

      Alert.alert("Pallet valid | Item:" + res.data[0].item_name + " \n Qty " + res.data[0].current_quantity + " " + res.data[0].uom);
    } catch (err) {
      Alert.alert("Gagal memeriksa pallet");
    }
  };

  const isSubmitValid = (() => {
    // --- VALIDASI DASAR ---
    const sourceOk = palletSumber && doneSumber && foundItem;
    const pickingOk = palletPicking && donePicking && pickingPallet;
    const qtyOk = qtyPicking && Number(qtyPicking) > 0;

    // --- JIKA ADA SWITCHING ---
    if (isSwitching) {

      const switchOk = switchPallet && doneSwitch && switchInfo;
      const switchQtyOk = switchQty && Number(switchQty) > 0;

      // Semua field switching + sumber + picking wajib lengkap
      return sourceOk && pickingOk && qtyOk && switchOk && switchQtyOk;
    }

    // --- TANPA SWITCHING ---
    return sourceOk && pickingOk && qtyOk;
  })();

  const handleSubmit = async () => {
    console.log("Submitting Picking Activity");

    if (!foundItem) {
      Alert.alert("Pallet sumber belum dicek!");
      return;
    }

    if (!pickingPallet) {
      Alert.alert("Pallet picking belum dicek!");
      return;
    }

    const userId = assignPicking?.picking_user_id || 'test-user-123';
    const userName = assignPicking?.picking_name || 'test user';

    const payload: any = {
      transaction_picking_id: itemBefore.item.id,
      pallet_source_id: foundItem?.id,
      pallet_use_id: pickingPallet?.id,
      item_id: itemBefore.item.item_id,
      quantity_picked: Number(qtyPicking),
      uom: itemBefore.item.uom,
      week_number: itemBefore.item.week_number,
      status: "OPEN",
      inspection_by: itemBefore.item.memo.requestor,
      user_id: userId,
      user_name: userName,
    };

    if (switchPallet) {
      payload.pallet_switch_id = switchInfo?.id;
    }

    if (switchQty) {
      payload.quantity_switch = Number(switchQty);
    }

    console.log("Submit Payload:", payload);
    try {
      showLoadingDialog('Submitting Picking Activity');
      const response = await OutboundService.postTransactionPicking(payload);
      navigation.goBack();
    } catch (error) {
      console.error('Submit Error:', error);
      Alert.alert('Gagal submit picking');
    } finally {
      hideLoadingDialog();
    }
  };

  const onChangeQtyPicking = (v: string) => {
    const qty = Number(v);

    if (qty > Number(itemBefore.item.quantity)) {
      Alert.alert("Qty picking tidak boleh lebih besar dari qty permintaan");
      return;
    }

    setQtyPicking(v);
  };


  const isSamePallet = palletSumber && palletPicking && palletSumber === palletPicking;

  return (
    <View style={styles.container}>
      {/* MAIN CARD */}
      <View style={styles.card}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: 'bold',
            color: 'black',
            textAlign: 'center',
            marginBottom: 12,
            backgroundColor: '#FFF5E6',
            borderRadius: 8,
            paddingVertical: 10,
            paddingHorizontal: 16,
            elevation: 2,
            shadowColor: '#F26E1F',
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
        >
          {itemBefore.item.item.description}
        </Text>

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
            {itemBefore.item.destinationWarehouseSub?.name} -{' '}
            {itemBefore.item.destinationBin?.name} -{' '}
            {itemBefore.item.quantity} {itemBefore.item.uom} - Week-
            {itemBefore.item.week_number}
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

          {/* Scan Button */}
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
            {itemBefore.item.uom}
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

      {/* SUBMIT */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: isSubmitValid ? '#F26E1F' : '#bfbfbf' }
        ]}
        disabled={!isSubmitValid}
        onPress={handleSubmit}
      >
        <Text style={styles.submitText}>Submit</Text>
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
});
