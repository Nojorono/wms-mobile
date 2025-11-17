import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { OutboundItemParam } from '../../../../interface/outbound/outbound';
import Colors from '../../../../constants/Colors';
import Ionicons from 'react-native-vector-icons/FontAwesome5';

import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';

export default function PickingDetailActivity() {
  const navigation = useNavigation();
  const route = useRoute();
  const itemBefore = route.params as OutboundItemParam;

  const [palletSumber, setPalletSumber] = useState('');
  const [palletPicking, setPalletPicking] = useState('');
  const [qtyPicking, setQtyPicking] = useState('');
  const [sku, setSku] = useState('CLM12');
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchPallet, setSwitchPallet] = useState('');
  const [switchQty, setSwitchQty] = useState('');

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

  const handleSubmit = () => {
    // Example static user info, replace with actual user data if available
    const userId = 'uuid-user-123';
    const userName = 'John Doe';

    const payload = {
      transaction_picking_id: itemBefore.item.id,
      pallet_source_id: palletSumber,
      pallet_use_id: palletPicking,
      pallet_switch_id: switchPallet || null,
      item_id: itemBefore.item.item_id,
      quantity_picked: Number(qtyPicking),
      quantity_switch: switchQty ? Number(switchQty) : null,
      uom: itemBefore.item.uom,
      week_number: itemBefore.item.week_number,
      status: 'PENDING',
      inspection_by: userName,
      user_id: userId,
      user_name: userName,
    };

    console.log('Submit Payload:', payload);
    // navigation.goBack();
  };

  const isSamePallet =
    palletSumber && palletPicking && palletSumber === palletPicking;

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
            onChangeText={setPalletSumber}
            style={[styles.input, { flex: 1, marginVertical: 0 }]}
          />
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
            onChangeText={setPalletPicking}
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
        </View>

        {/* QTY PICKING */}
        <TextInput
          placeholder="Qty Picking"
          value={qtyPicking}
          onChangeText={setQtyPicking}
          keyboardType="numeric"
          style={styles.input}
        />

        {/* SWITCHING */}
        {isSamePallet && !isSwitching && (
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: '#F26E1F' }]}
            onPress={() => setIsSwitching(true)}
          >
            <Text style={[styles.cancelText, { color: '#fff' }]}>
              Use Pallet Switch
            </Text>
          </TouchableOpacity>
        )}

        {isSamePallet && isSwitching && (
          <View style={styles.switchSection}>
            <Text style={styles.switchTitle}>Pallet Switching</Text>
             {/* PALLET SWITCHING */}
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
            onChangeText={setSwitchPallet}
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
        </View>
            <TextInput
              placeholder="Qty Switching"
              value={switchQty}
              onChangeText={setSwitchQty}
              keyboardType="numeric"
              style={styles.input}
            />
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
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
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
