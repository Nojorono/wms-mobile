import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const CreateUpdateScreen = () => {
  const [updateType, setUpdateType] = useState('UPDATE_PROD_CODE');
  const [palletNo, setPalletNo] = useState('');
  const [palletData, setPalletData] = useState<any>(null);
  const [selectedValue, setSelectedValue] = useState('');
  const [loading, setLoading] = useState(false);

  // Logic Hit API & Filter Item (Poin 3 & 4)
  const handleCheckPallet = async () => {
    if (!palletNo) {
      Alert.alert('Perhatian', 'Silahkan input atau scan nomor pallet');
      return;
    }

    setLoading(true);
    try {
      // Simulasi Hit API
      // Dalam realita: const res = await axios.get(`/pallet/${palletNo}`)
      const mockApiResponse = {
        palletId: "uuid-pallet-123",
        items: [
          { sku: 'Class Mild - 16', week: 48, qty: 10, uom: 'DUS', itemId: 'uuid-item-123' },
          { sku: 'Item Kosong', week: 10, qty: 0, uom: 'DUS', itemId: 'uuid-item-999' }
        ]
      };

      // Poin 4: Filter item yang qty-nya tidak 0
      const activeItems = mockApiResponse.items.filter(item => item.qty > 0);

      if (activeItems.length === 1) {
        setPalletData(activeItems[0]);
      } else if (activeItems.length > 1) {
        Alert.alert('Gagal', 'Pallet memiliki lebih dari 1 item aktif. Update hanya bisa untuk 1 item.');
        setPalletData(null);
      } else {
        Alert.alert('Gagal', 'Tidak ada item dengan qty > 0 di pallet ini.');
        setPalletData(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal mengambil data pallet');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!palletData || !selectedValue) {
      Alert.alert('Error', 'Data belum lengkap');
      return;
    }

    // Poin 5: Penyesuaian Payload
    const payload = {
      updateType: "UPDATE_PROD_CODE_UOM",
      uom: updateType === 'UPDATE_UOM' ? selectedValue : palletData.uom,
      productionCode: updateType === 'UPDATE_PROD_CODE' ? selectedValue : palletData.productionDate,
      status: "COMPLETED",
      initiatedByUserId: "uuid-user-123",
      inspectionStatus: "APPROVED",
      inspectionByUserId: "uuid-user-123",
      completedDate: new Date().toISOString(),
      item: { // Data SEBELUM update
        sequence: 1,
        palletId: "uuid-pallet-123",
        itemId: palletData.itemId,
        quantity: palletData.qty,
        uom: palletData.uom,
        productionDate: "2025-01-01",
        weekNumber: palletData.week
      },
      scan: { // Data SESUDAH update
        scanNumber: "SCAN-001",
        scanDate: new Date().toISOString(),
        scanByUserId: "uuid-user-123",
        palletId: "uuid-pallet-123",
        itemId: palletData.itemId,
        quantity: palletData.qty,
        uom: updateType === 'UPDATE_UOM' ? selectedValue : palletData.uom,
        productionDate: updateType === 'UPDATE_PROD_CODE' ? `2025-W${selectedValue}` : "2025-01-01",
        notes: "Updated via Mobile App",
        status: "PENDING"
      }
    };

    console.log('Payload dikirim:', payload);
    Alert.alert('Berhasil', 'Data update telah diproses');
  };

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.blueCard}>
          
          {/* 1. Pilih Tipe Update */}
          <Text style={styles.label}>Pilih Tipe Update</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={updateType}
              onValueChange={(itemValue) => {
                setUpdateType(itemValue);
                setSelectedValue('');
              }}>
              <Picker.Item label="Update Production Code" value="UPDATE_PROD_CODE" />
              <Picker.Item label="Update UOM" value="UPDATE_UOM" />
            </Picker>
          </View>

          {/* 2. Pilih Pallet */}
          <Text style={styles.label}>Pilih Pallet</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.input}
              placeholder="Pilih/Scan Pallet"
              value={palletNo}
              onChangeText={setPalletNo}
            />
            <TouchableOpacity style={styles.scanBtn} onPress={handleCheckPallet}>
              {loading ? <ActivityIndicator size="small" color="#FF6B00" /> : <Text style={styles.scanIcon}>[ ]</Text>}
            </TouchableOpacity>
          </View>

          {/* 3. List SKU (Tampil jika pallet ok) */}
          {palletData && (
            <View style={styles.skuInfoCard}>
              <Text style={styles.skuTitle}>List SKU:</Text>
              <View style={styles.skuDetail}>
                <Text style={styles.skuTextBold}>{palletData.sku}</Text>
                <Text style={styles.skuTextSmall}>Week {palletData.week}</Text>
                <Text style={styles.skuTextBold}>{palletData.qty} {palletData.uom}</Text>
              </View>
            </View>
          )}

          {/* 4. Update Field (Dynamic) */}
          <Text style={styles.label}>
            {updateType === 'UPDATE_PROD_CODE' ? 'Update Production Code' : 'Update UOM'}
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedValue}
              onValueChange={(val) => setSelectedValue(val)}>
              <Picker.Item label={updateType === 'UPDATE_PROD_CODE' ? "Pilih Week" : "Pilih UOM"} value="" />
              {updateType === 'UPDATE_PROD_CODE' ? (
                Array.from({ length: 5 }, (_, i) => (
                  <Picker.Item key={i} label={`Week ${48 + i}`} value={`${48 + i}`} />
                ))
              ) : (
                <>
                  <Picker.Item label="PCS" value="PCS" />
                  <Picker.Item label="DUS" value="DUS" />
                  <Picker.Item label="PACK" value="PACK" />
                </>
              )}
            </Picker>
          </View>

        </View>
      </ScrollView>

      {/* Button Submit */}
      <View style={{ padding: 16 }}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FF6B00', marginLeft: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 3 },
  scrollContent: { padding: 16 },
  blueCard: { backgroundColor: '#E1E9F0', borderRadius: 15, padding: 16, minHeight: 450 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  pickerContainer: { backgroundColor: '#FFF', borderRadius: 8, marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#CCC' },
  searchRow: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, paddingHorizontal: 12, height: 50, borderWidth: 1, borderColor: '#CCC' },
  scanBtn: { backgroundColor: '#FFF', width: 50, height: 50, borderTopRightRadius: 8, borderBottomRightRadius: 8, justifyContent: 'center', alignItems: 'center', borderLeftWidth: 0, borderWidth: 1, borderColor: '#CCC' },
  scanIcon: { fontSize: 20, color: '#FF6B00', fontWeight: 'bold' },
  skuInfoCard: { backgroundColor: '#FFF', borderRadius: 8, padding: 12, marginBottom: 20 },
  skuTitle: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  skuDetail: { flexDirection: 'row', justifyContent: 'space-between' },
  skuTextBold: { fontWeight: 'bold', fontSize: 13 },
  skuTextSmall: { fontSize: 13, color: '#666' },
  submitBtn: { backgroundColor: '#FF6B00', padding: 16, borderRadius: 10, alignItems: 'center' },
  submitText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default CreateUpdateScreen;