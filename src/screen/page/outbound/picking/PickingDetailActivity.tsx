import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

export default function PickingDetailActivity() {
  const navigation = useNavigation();
  const [palletSumber, setPalletSumber] = useState('');
  const [palletPicking, setPalletPicking] = useState('');
  const [qtyPicking, setQtyPicking] = useState('');
  const [sku, setSku] = useState('CLM12');
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchQty, setSwitchQty] = useState('');

  const handleSubmit = () => {
    navigation.goBack();
  };

  const handleScan = (type: 'sumber' | 'picking') => {
    // simulasi hasil scan
    if (type === 'sumber') setPalletSumber('P-033');
    else setPalletPicking('P-033');
  };

  const isSamePallet = palletSumber && palletPicking && palletSumber === palletPicking;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Picking</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Clasmild - 12</Text>
        <Text style={styles.subLabel}>
          <Text style={{ fontStyle: 'italic' }}>Suggested Location</Text> {'\n'}
          WEEK40 - JT6 - D - 0/40 DUS
        </Text>

        <TouchableOpacity style={styles.scanButton} onPress={() => handleScan('sumber')}>
          <Text style={styles.scanText}>Pilih Pallet Sumber</Text>
        </TouchableOpacity>

        <TextInput
          placeholder="Atau input manual"
          value={palletSumber}
          onChangeText={setPalletSumber}
          style={styles.input}
        />

        <TouchableOpacity style={styles.scanButton} onPress={() => handleScan('picking')}>
          <Text style={styles.scanText}>Pilih Pallet Picking</Text>
        </TouchableOpacity>

        <TextInput
          placeholder="Atau input manual"
          value={palletPicking}
          onChangeText={setPalletPicking}
          style={styles.input}
        />

        {isSamePallet && (
          <View style={styles.switchSection}>
            <Text style={styles.switchTitle}>Pallet Switching</Text>
            <TextInput
              placeholder="Scan / Input Pallet Baru"
              style={styles.input}
              onChangeText={setSwitchQty}
              value={switchQty}
            />
            <TouchableOpacity
              style={[styles.cancelButton]}
              onPress={() => setIsSwitching(false)}
            >
              <Text style={styles.cancelText}>Cancel Switching</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.dropdown}>
          <Picker selectedValue={sku} onValueChange={(v) => setSku(v)}>
            <Picker.Item label="CLM12" value="CLM12" />
            <Picker.Item label="ARM12" value="ARM12" />
            <Picker.Item label="AROS16" value="AROS16" />
          </Picker>
        </View>

        <TextInput
          placeholder="Qty Picking"
          value={qtyPicking}
          onChangeText={setQtyPicking}
          keyboardType="numeric"
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EDE8E3',
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F26E1F',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#F4F7FB',
    borderRadius: 12,
    padding: 16,
  },
  label: {
    fontWeight: '700',
    fontSize: 16,
  },
  subLabel: {
    color: '#444',
    marginBottom: 10,
  },
  scanButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    borderRadius: 10,
    marginVertical: 4,
  },
  scanText: {
    textAlign: 'center',
    color: '#333',
    fontWeight: '600',
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
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 6,
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
});
