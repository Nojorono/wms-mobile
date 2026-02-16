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
import ScannerService from '../../../../service/palletServices';
import { useAuthStore } from '../../../../store/useAuthStore';
import InboundServices from '../../../../service/inboundServices';
import DatePicker from 'react-native-date-picker';

const CreateUpdateScreen = () => {
  const [updateType, setUpdateType] = useState('UPDATE_PROD_CODE');
  const [palletNo, setPalletNo] = useState('');
  const [palletData, setPalletData] = useState<any>(null);
  const [itemMaster, setItemMaster] = useState<any>(null);
  const [selectedValue, setSelectedValue] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const userId = user?.id || 'uuid-user-123';

  // State Date Picker & Week
  const [openPicker, setOpenPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(''); 
  const [weekNumber, setWeekNumber] = useState<string | null>(null);
  const [tempDate, setTempDate] = useState(new Date());

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchWeek = async (dateStr: string) => {
    try {
      const res = await InboundServices.getWeekProduction(dateStr);
      const minggu = res?.data?.[0]?.MINGGU?.toString() || null;

      if (minggu) {
        setWeekNumber(minggu);
        setSelectedValue(dateStr); // selectedValue diisi format tanggal untuk prodCode
      } else {
        setWeekNumber(null);
        setSelectedValue('');
        setSelectedDate('');
        Alert.alert('Perhatian', 'Data minggu tidak ditemukan, silakan pilih tanggal lain.');
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal mengambil data minggu produksi.');
    }
  };

  const calculateNewQty = (currentQty: number, fromUom: string, toUom: string) => {
    if (!itemMaster || !fromUom || !toUom || fromUom === toUom) return currentQty;
    type UomType = 'DUS' | 'BAL' | 'PRESS' | 'BKS' | 'BTG';
    const units: UomType[] = ['DUS', 'BAL', 'PRESS', 'BKS', 'BTG'];
    const factor: Record<UomType, number> = {
      DUS: itemMaster.bal_per_dus || 1,
      BAL: itemMaster.press_per_bal || 1,
      PRESS: itemMaster.bks_per_press || 1,
      BKS: itemMaster.btg_per_bks || 1,
      BTG: 1
    };

    const convertToBase = (qty: number, uom: UomType) => {
      let totalBtg = qty;
      let startIndex = units.indexOf(uom);
      for (let i = startIndex; i < units.length - 1; i++) {
        totalBtg *= factor[units[i]];
      }
      return totalBtg;
    };

    const convertFromBase = (btgQty: number, targetUom: UomType) => {
      let finalQty = btgQty;
      let targetIndex = units.indexOf(targetUom);
      for (let i = units.length - 2; i >= targetIndex; i--) {
        finalQty /= factor[units[i]];
      }
      return finalQty;
    };

    try {
      const baseQty = convertToBase(currentQty, fromUom as UomType);
      const result = convertFromBase(baseQty, toUom as UomType);
      return Number.isInteger(result) ? result : parseFloat(result.toFixed(2));
    } catch (e) {
      return currentQty;
    }
  };

  const handleCheckPallet = async () => {
    if (!palletNo) {
      Alert.alert('Perhatian', 'Silahkan input atau scan nomor pallet');
      return;
    }
    setLoading(true);
    try {
      const mockPalletRes = await ScannerService.getPalletByCode(palletNo);
      const activeItems = mockPalletRes.data.filter((item: any) => item.current_quantity > 0);

      if (activeItems.length === 1) {
        const selectedPallet = activeItems[0];
        const mockItemMaster = await ScannerService.getItemById(selectedPallet.item_id);
        setItemMaster(mockItemMaster.data);
        setPalletData(selectedPallet);
      } else {
        Alert.alert('Gagal', 'Pallet tidak ditemukan atau kosong.');
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!palletData || !selectedValue) {
      Alert.alert('Error', 'Data belum lengkap.');
      return;
    }

    setLoading(true);
    try {
      const isUomUpdate = updateType === 'UPDATE_UOM';
      const isProdCodeUpdate = updateType === 'UPDATE_PROD_CODE';

      const newQty = isUomUpdate
        ? calculateNewQty(palletData.current_quantity, palletData.uom, selectedValue)
        : palletData.current_quantity;

      let payload: any = {
        updateType: "UPDATE_PROD_CODE_UOM",
        status: "COMPLETED",
        initiatedByUserId: userId,
        inspectionStatus: "APPROVED",
        inspectionByUserId: userId,
        notes: "Updated via Mobile App",
        completedDate: new Date().toISOString(),
        item: {
          sequence: 1,
          palletId: palletData.id,
          itemId: palletData.item_id,
          quantity: palletData.current_quantity,
          uom: palletData.uom,
          productionDate: palletData.production_date,
          weekNumber: palletData.week_number
        },
        scan: {
          scanNumber: `SCAN-${Date.now()}`,
          scanDate: new Date().toISOString(),
          scanByUserId: userId,
          palletId: palletData.id,
          itemId: palletData.item_id,
          quantity: newQty,
          uom: isUomUpdate ? selectedValue : palletData.uom,
          productionDate: isProdCodeUpdate ? selectedValue : palletData.production_date,
          status: "PENDING"
        }
      };

      if (isUomUpdate) {
        payload.uom = selectedValue;
      } else {
        payload.productionCode = selectedValue;
      }

      console.log('Final Payload:', payload);
      // await ScannerService.postUpdatePallet(payload);
      Alert.alert('Berhasil', 'Data berhasil diperbarui');
      
      // Reset
      setPalletData(null);
      setSelectedValue('');
      setSelectedDate('');
      setWeekNumber(null);
      setPalletNo('');
    } catch (error) {
      Alert.alert('Error', 'Gagal mengirim data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.blueCard}>
          <Text style={styles.label}>Pilih Tipe Update</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={updateType}
              onValueChange={(v) => { 
                setUpdateType(v); 
                setSelectedValue(''); 
                setSelectedDate('');
                setWeekNumber(null);
              }}>
              <Picker.Item label="Update Production Code" value="UPDATE_PROD_CODE" />
              <Picker.Item label="Update UOM" value="UPDATE_UOM" />
            </Picker>
          </View>

          <Text style={styles.label}>Nomor Pallet</Text>
          <View style={styles.searchRow}>
            <TextInput style={styles.input} placeholder="Scan Pallet..." value={palletNo} onChangeText={setPalletNo} />
            <TouchableOpacity style={styles.scanBtn} onPress={handleCheckPallet}>
              {loading ? <ActivityIndicator size="small" color="#FF6B00" /> : <Text style={styles.scanIcon}>🔍</Text>}
            </TouchableOpacity>
          </View>

          {palletData && (
            <>
              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>DATA SAAT INI</Text>
                <Text>{palletData.item_name} | Week {palletData.week_number}</Text>
                <Text style={{ fontWeight: 'bold' }}>{palletData.current_quantity} {palletData.uom}</Text>
              </View>

              <Text style={styles.label}>
                {updateType === 'UPDATE_PROD_CODE' ? 'Update Production Date' : 'Update UOM'}
              </Text>

              {updateType === 'UPDATE_PROD_CODE' ? (
                <View>
                  <TouchableOpacity
                    style={[styles.input, { justifyContent: "center", marginBottom: 8 }]}
                    onPress={() => setOpenPicker(true)}
                  >
                    <Text style={{ color: selectedDate ? "#111" : "#9ca3af" }}>
                      {selectedDate || "Pilih Tanggal Produksi"}
                    </Text>
                  </TouchableOpacity>

                  <DatePicker
                    modal
                    open={openPicker}
                    date={tempDate}
                    mode="date"
                    onConfirm={(date) => {
                      setOpenPicker(false);
                      setTempDate(date);
                      const formatted = formatDate(date);
                      setSelectedDate(formatted);
                      fetchWeek(formatted);
                    }}
                    onCancel={() => setOpenPicker(false)}
                  />
                </View>
              ) : (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedValue}
                    onValueChange={(val) => setSelectedValue(val)}>
                    <Picker.Item label="-- Pilih UOM --" value="" />
                    {['DUS', 'BAL', 'PRESS', 'BKS', 'BTG'].map(u => (
                      <Picker.Item key={u} label={u} value={u} />
                    ))}
                  </Picker>
                </View>
              )}

             {selectedValue !== '' && (
  <View style={styles.previewCard}>
    <Text style={styles.previewTitle}>PRATINJAU PERUBAHAN</Text>
    <View style={styles.previewRow}>
      {/* --- DATA DARI (LAMA) --- */}
      <View style={styles.previewCol}>
        <Text style={styles.smallLabel}>DARI</Text>
        <Text style={{ fontWeight: '500' }}>
          {updateType === 'UPDATE_PROD_CODE' 
            ? `Week ${palletData.week_number}` 
            : palletData.uom}
        </Text>
        <Text style={styles.previewQty}>
          {palletData.current_quantity} {palletData.uom}
        </Text>
      </View>

      <Text style={styles.arrow}>➔</Text>

      {/* --- DATA MENJADI (BARU) --- */}
      <View style={styles.previewCol}>
        <Text style={styles.smallLabel}>MENJADI</Text>
        <Text style={{ color: '#FF6B00', fontWeight: 'bold' }}>
          {updateType === 'UPDATE_PROD_CODE' 
            ? (weekNumber ? `Week ${weekNumber}` : '-') 
            : selectedValue}
        </Text>
        <Text style={[styles.previewQty, { color: '#FF6B00', fontWeight: 'bold' }]}>
          {updateType === 'UPDATE_UOM'
            ? calculateNewQty(palletData.current_quantity, palletData.uom, selectedValue)
            : palletData.current_quantity} 
          {' '}
          {/* Tampilkan UOM baru jika update UOM, jika tidak tampilkan UOM lama */}
          {updateType === 'UPDATE_UOM' ? selectedValue : palletData.uom}
        </Text>
      </View>
    </View>
  </View>
)}
            </>
          )}
        </View>
      </ScrollView>

      <View style={{ padding: 16 }}>
        <TouchableOpacity
          style={[styles.submitBtn, (!palletData || !selectedValue) && { backgroundColor: '#CCC' }]}
          onPress={handleSubmit}
          disabled={!palletData || !selectedValue}
        >
          <Text style={styles.submitText}>Konfirmasi Perubahan</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContent: { padding: 16 },
  blueCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, elevation: 2 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 5 },
  pickerContainer: { backgroundColor: '#F9F9F9', borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#EEE' },
  searchRow: { flexDirection: 'row', marginBottom: 15 },
  input: { flex: 1, backgroundColor: '#F9F9F9', borderRadius: 8, paddingHorizontal: 12, height: 45, borderWidth: 1, borderColor: '#EEE' },
  scanBtn: { backgroundColor: '#FF6B00', width: 50, justifyContent: 'center', alignItems: 'center', borderTopRightRadius: 8, borderBottomRightRadius: 8 },
  scanIcon: { color: '#FFF', fontSize: 18 },
  infoBox: { padding: 12, backgroundColor: '#E1E9F0', borderRadius: 8, marginBottom: 15 },
  infoTitle: { fontSize: 10, color: '#555', marginBottom: 4 },
  previewCard: { marginTop: 10, padding: 15, backgroundColor: '#FFFEEA', borderRadius: 10, borderWidth: 1, borderColor: '#F2E675' },
  previewTitle: { fontSize: 11, fontWeight: 'bold', color: '#856404', marginBottom: 10, textAlign: 'center' },
  previewRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  previewCol: { alignItems: 'center' },
  previewQty: { fontSize: 12, color: '#777' },
  smallLabel: { fontSize: 9, color: '#999' },
  arrow: { fontSize: 20, color: '#CCC' },
  submitBtn: { backgroundColor: '#FF6B00', padding: 16, borderRadius: 10, alignItems: 'center' },
  submitText: { color: '#FFF', fontWeight: 'bold' },
});

export default CreateUpdateScreen;