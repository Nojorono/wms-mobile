import React, { useState, useEffect } from 'react';
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
import UserServices from '../../../../service/userServices'; // Import UserServices
import DatePicker from 'react-native-date-picker';
import MovementService from '../../../../service/movementService';
import { UpdateInventoryParamList } from '../../../navigation/movement/UpdateInventoryNavigator.tsx';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { ROLES } from "../../../../constants/Roles";

type NavigationProp = StackNavigationProp<UpdateInventoryParamList, 'UpdateInventoryMain'>;

const CreateUpdateScreen = () => {
  const [updateType, setUpdateType] = useState('UPDATE_PROD_CODE');
  const [palletNo, setPalletNo] = useState('');
  const [palletData, setPalletData] = useState<any>(null);
  const [palletItems, setPalletItems] = useState<any[]>([]);
  const [itemMaster, setItemMaster] = useState<any>(null);
  const [selectedValue, setSelectedValue] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State Baru untuk Split Pallet & Search User
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [assignedUserName, setAssignedUserName] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const { user } = useAuthStore();
  const userId = user?.id || 'uuid-user-123';
  
  const navigation = useNavigation<NavigationProp>();

  // State Date Picker & Week
  const [openPicker, setOpenPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [weekNumber, setWeekNumber] = useState<string | null>(null);
  const [tempDate, setTempDate] = useState(new Date());

  // Fetch Devices & User Management
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch Forklift Drivers
        const resList = await UserServices.getUserList();
        const filtered = (resList?.data || []).filter(
          (u: any) => u?.role?.name?.toUpperCase() === ROLES.DRIVER_FORKLIFT.toUpperCase()
        );
        setDevices(filtered);

        // Fetch User Management untuk Search
        const resManage = await UserServices.getUserManagementList();
        setAllUsers(resManage?.data || []);
      } catch (err) {
        console.log("Failed to fetch user data", err);
      }
    };
    fetchInitialData();
  }, []);

  const handleNameChange = (text: string) => {
    setAssignedUserName(text);
    if (text.trim().length > 0) {
      const filtered = allUsers.filter(u => 
        u.name?.toLowerCase().includes(text.toLowerCase()) || 
        (u.phone && u.phone.includes(text))
      );
      setSearchResults(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSelectUser = (item: any) => {
    setAssignedUserName(item.name);
    setShowDropdown(false);
  };

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
        setSelectedValue(dateStr); 
      } else {
        setWeekNumber(null);
        setSelectedValue('');
        setSelectedDate('');
        Alert.alert('Perhatian', 'Data minggu tidak ditemukan.');
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
      for (let i = startIndex; i < units.length - 1; i++) totalBtg *= factor[units[i]];
      return totalBtg;
    };

    const convertFromBase = (btgQty: number, targetUom: UomType) => {
      let finalQty = btgQty;
      let targetIndex = units.indexOf(targetUom);
      for (let i = units.length - 2; i >= targetIndex; i--) finalQty /= factor[units[i]];
      return finalQty;
    };

    try {
      const baseQty = convertToBase(currentQty, fromUom as UomType);
      const result = convertFromBase(baseQty, toUom as UomType);
      return Number.isInteger(result) ? result : parseFloat(result.toFixed(2));
    } catch (e) { return currentQty; }
  };

  const handleCheckPallet = async () => {
    if (!palletNo) {
      Alert.alert('Perhatian', 'Silahkan input atau scan nomor pallet');
      return;
    }
    setLoading(true);
    try {
      const mockPalletRes = await ScannerService.getPalletByCode(palletNo);
      const activeItems = (mockPalletRes.data || []).filter((item: any) => item.current_quantity > 0);

      if (activeItems.length > 0) {
        setPalletItems(activeItems);
        if (activeItems.length === 1) {
          const selectedPallet = activeItems[0];
          const mockItemMaster = await ScannerService.getItemById(selectedPallet.item_id);
          setItemMaster(mockItemMaster.data);
          setPalletData(selectedPallet);
          if (updateType === 'SPLIT_PALLET') setSelectedValue(selectedPallet.id);
        }
      } else {
        Alert.alert('Gagal', 'Pallet tidak ditemukan atau kosong.');
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItemSplit = async (itemId: string) => {
    const selected = palletItems.find(i => i.id === itemId);
    if (selected) {
        setLoading(true);
        const mockItemMaster = await ScannerService.getItemById(selected.item_id);
        setItemMaster(mockItemMaster.data);
        setPalletData(selected);
        setSelectedValue(itemId);
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
      const isSplitPallet = updateType === 'SPLIT_PALLET';
      const isUomUpdate = updateType === 'UPDATE_UOM';
      const isProdCodeUpdate = updateType === 'UPDATE_PROD_CODE';

      let payload: any;

      if (isSplitPallet) {
        payload = {
          updateType: "SPLIT_PALLET",
          status: "PENDING_HELPER_ACTION",
          initiatedByUserId: userId,
          inspectionStatus: "PENDING",
          notes: "Split pallet request via mobile",
          completedDate: new Date().toISOString(),
          item: {
            sequence: 1,
            palletId: palletData.pallet_id || palletData.id,
            itemId: palletData.item_id,
            quantity: palletData.current_quantity,
            uom: palletData.uom,
            productionDate: palletData.production_date,
            weekNumber: palletData.week_number
          },
          assigned: [
            {
              userId: selectedDeviceId,
              // userName: assignedUserName,
              assignedAt: new Date().toISOString()
            }
          ]
        };
        // await MovementService.postSplitPallet(payload);
      } else {
        const newQty = isUomUpdate 
          ? calculateNewQty(palletData.current_quantity, palletData.uom, selectedValue) 
          : palletData.current_quantity;

        payload = {
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
            scanDate: new Date().toISOString(),
            scanByUserId: userId,
            palletId: palletData.id,
            itemId: palletData.item_id,
            quantity: newQty,
            uom: isUomUpdate ? selectedValue : palletData.uom,
            productionDate: isProdCodeUpdate ? selectedValue : palletData.production_date,
            status: "PENDING",
            weekNumber: weekNumber
          }
        };
        if (isUomUpdate) payload.uom = selectedValue;
        else payload.productionCode = selectedValue;
        //tambahan disini
        // updatePalletById(palletData.id, payload_ganti uom);
        await MovementService.postUpdateInventory(payload);
      }

      Alert.alert('Berhasil', 'Data berhasil diproses');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Gagal mengirim data');
      console.log("Submit error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.blueCard}>
          <Text style={styles.label}>Pilih Tipe Update</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={updateType}
              onValueChange={(v) => {
                setUpdateType(v);
                setSelectedValue('');
                setPalletData(null);
                setWeekNumber(null);
                setSelectedDate('');
              }}>
              <Picker.Item label="Update Production Code" value="UPDATE_PROD_CODE" />
              <Picker.Item label="Update UOM" value="UPDATE_UOM" />
              <Picker.Item label="Split Pallet" value="SPLIT_PALLET" />
            </Picker>
          </View>

          <Text style={styles.label}>Nomor Pallet</Text>
          <View style={styles.searchRow}>
            <TextInput style={styles.input} placeholder="Scan Pallet..." value={palletNo} onChangeText={setPalletNo} />
            <TouchableOpacity style={styles.scanBtn} onPress={handleCheckPallet}>
              {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.scanIcon}>🔍</Text>}
            </TouchableOpacity>
          </View>

          {updateType === 'SPLIT_PALLET' && palletItems.length > 0 && (
            <>
              <Text style={styles.label}>Pilih Item yang akan di Split</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={selectedValue} onValueChange={handleSelectItemSplit}>
                    <Picker.Item label="-- Pilih Item --" value="" />
                    {palletItems.map((item, index) => (
                        <Picker.Item key={index} label={`${item.item_name} (${item.current_quantity} ${item.uom})`} value={item.id} />
                    ))}
                </Picker>
              </View>
            </>
          )}

          {palletData && (
            <>
              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>DATA SAAT INI</Text>
                <Text>{palletData.item_name} | Week {palletData.week_number}</Text>
                <Text style={{ fontWeight: 'bold' }}>{palletData.current_quantity} {palletData.uom}</Text>
              </View>

              {/* KHUSUS SPLIT PALLET: INPUT DEVICE & SEARCH USER */}
              {updateType === 'SPLIT_PALLET' && (
                <View style={{ marginTop: 10 }}>
                   <Text style={styles.label}>Device (Scanner)</Text>
                   <View style={styles.pickerContainer}>
                      <Picker selectedValue={selectedDeviceId} onValueChange={(v) => setSelectedDeviceId(v)}>
                        <Picker.Item label="-- Pilih Device --" value="" />
                        {devices.map((d: any) => (
                          <Picker.Item key={d.id} label={d.username || d.name || "-"} value={d.id} />
                        ))}
                      </Picker>
                   </View>

                   <Text style={styles.label}>Input User Name</Text>
                   <View style={{ zIndex: 100 }}>
                      <TextInput 
                        style={styles.input} 
                        placeholder="Search name or phone..." 
                        value={assignedUserName} 
                        onChangeText={handleNameChange}
                        onFocus={() => { if(searchResults.length > 0) setShowDropdown(true); }}
                      />
                      {showDropdown && searchResults.length > 0 && (
                        <View style={styles.dropdown}>
                          <ScrollView style={{ maxHeight: 180 }} keyboardShouldPersistTaps="handled">
                            {searchResults.map((item) => (
                              <TouchableOpacity key={item.id} style={styles.dropdownItem} onPress={() => handleSelectUser(item)}>
                                <Text style={styles.dropdownName}>{item.name}</Text>
                                <Text style={styles.dropdownPhone}>{item.phone || 'No Phone'}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                   </View>
                </View>
              )}

              {/* LOGIC LAMA: DATE PICKER & UOM PICKER */}
              {updateType === 'UPDATE_PROD_CODE' && (
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.label}>Update Production Date</Text>
                  <TouchableOpacity style={[styles.input, { justifyContent: "center" }]} onPress={() => setOpenPicker(true)}>
                    <Text style={{ color: selectedDate ? "#111" : "#9ca3af" }}>{selectedDate || "Pilih Tanggal Produksi"}</Text>
                  </TouchableOpacity>
                  <DatePicker modal open={openPicker} date={tempDate} mode="date" 
                    onConfirm={(date) => { setOpenPicker(false); setSelectedDate(formatDate(date)); fetchWeek(formatDate(date)); }} 
                    onCancel={() => setOpenPicker(false)} 
                  />
                </View>
              )}

              {updateType === 'UPDATE_UOM' && (
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.label}>Update UOM</Text>
                  <View style={styles.pickerContainer}>
                    <Picker selectedValue={selectedValue} onValueChange={(val) => setSelectedValue(val)}>
                      <Picker.Item label="-- Pilih UOM --" value="" />
                      {['DUS', 'BAL', 'PRESS', 'BKS', 'BTG'].map(u => (<Picker.Item key={u} label={u} value={u} />))}
                    </Picker>
                  </View>
                </View>
              )}

              {/* PREVIEW CARD (DIPERTAHANKAN) */}
              {updateType !== 'SPLIT_PALLET' && selectedValue !== '' && (
                <View style={styles.previewCard}>
                  <Text style={styles.previewTitle}>PRATINJAU PERUBAHAN</Text>
                  <View style={styles.previewRow}>
                    <View style={styles.previewCol}>
                      <Text style={styles.smallLabel}>DARI</Text>
                      <Text style={{ fontWeight: '500' }}>
                        {updateType === 'UPDATE_PROD_CODE' ? `Week ${palletData.week_number}` : palletData.uom}
                      </Text>
                      <Text style={styles.previewQty}>{palletData.current_quantity} {palletData.uom}</Text>
                    </View>
                    <Text style={styles.arrow}>➔</Text>
                    <View style={styles.previewCol}>
                      <Text style={styles.smallLabel}>MENJADI</Text>
                      <Text style={{ color: '#FF6B00', fontWeight: 'bold' }}>
                        {updateType === 'UPDATE_PROD_CODE' ? (weekNumber ? `Week ${weekNumber}` : '-') : selectedValue}
                      </Text>
                      <Text style={[styles.previewQty, { color: '#FF6B00', fontWeight: 'bold' }]}>
                        {updateType === 'UPDATE_UOM' ? calculateNewQty(palletData.current_quantity, palletData.uom, selectedValue) : palletData.current_quantity}
                        {' '}{updateType === 'UPDATE_UOM' ? selectedValue : palletData.uom}
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
          style={[styles.submitBtn, (!palletData || !selectedValue || (updateType === 'SPLIT_PALLET' && (!selectedDeviceId || !assignedUserName))) && { backgroundColor: '#CCC' }]}
          onPress={handleSubmit}
          disabled={!palletData || !selectedValue || (updateType === 'SPLIT_PALLET' && (!selectedDeviceId || !assignedUserName))}
        >
          <Text style={styles.submitText}>{updateType === 'SPLIT_PALLET' ? 'Proses Split Pallet' : 'Konfirmasi Perubahan'}</Text>
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
  // Tambahan style untuk Search Dropdown
  dropdown: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
    elevation: 5,
    zIndex: 1000,
  },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  dropdownName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  dropdownPhone: { fontSize: 12, color: '#888' },
});

export default CreateUpdateScreen;