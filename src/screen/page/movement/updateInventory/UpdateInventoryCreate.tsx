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
import UserServices from '../../../../service/userServices';
import DatePicker from 'react-native-date-picker';
import MovementService from '../../../../service/movementService';
import { UpdateInventoryParamList } from '../../../navigation/movement/UpdateInventoryNavigator.tsx';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ConstantService from '../../../../service/constantService';

import { ROLES } from "../../../../constants/Roles";
import { compareScanWithReference } from '../../inbound/service/inboundService.ts';

type NavigationProp = StackNavigationProp<UpdateInventoryParamList, 'UpdateInventoryMain'>;

const CreateUpdateScreen = () => {
  const [updateType, setUpdateType] = useState('UPDATE_PROD_CODE');
  const [palletNo, setPalletNo] = useState('');
  const [palletData, setPalletData] = useState<any>(null);
  const [palletItems, setPalletItems] = useState<any[]>([]);
  const [itemMaster, setItemMaster] = useState<any>(null);
  const [selectedValue, setSelectedValue] = useState('');
  const [loading, setLoading] = useState(false);

  // State Merge Pallet
  const [mergePallets, setMergePallets] = useState<any[]>([]);

  // State Split Pallet & Search User
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [assignedUserName, setAssignedUserName] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [splitQty, setSplitQty] = useState('');

  const { user } = useAuthStore();
  const userId = user?.id || 'uuid-user-123';
  const navigation = useNavigation<NavigationProp>();

  const [openPicker, setOpenPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [weekNumber, setWeekNumber] = useState<string | null>(null);
  const [tempDate, setTempDate] = useState(new Date());

  // State Baru untuk Search Lokasi (Merge Pallet)
  const [subWarehouses, setSubWarehouses] = useState<any[]>([]);
  const [filteredSubs, setFilteredSubs] = useState<any[]>([]);
  const [searchSub, setSearchSub] = useState('');
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [bins, setBins] = useState<any[]>([]);
  const [selectedBin, setSelectedBin] = useState<any>(null);
  const [availablePallets, setAvailablePallets] = useState<any[]>([]);

  //State untuk item pallet
  const [availableItemsFromPallet, setAvailableItemsFromPallet] = useState<any[]>([]);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [tempSelectedPalletCode, setTempSelectedPalletCode] = useState('');

  const handleAddPalletToMerge = (pallet: any) => {
    // Ambil detail pallet untuk melihat isinya (karena data dari inventory tracking mungkin hanya summary)
    setLoading(true);
    ScannerService.getPalletByCode(pallet.pallet_code)
      .then((res) => {
        const activeItems = (res.data || []).filter((item: any) => item.current_quantity > 0);

        if (activeItems.length === 0) {
          Alert.alert("Perhatian", "Pallet ini tidak memiliki item aktif.");
          return;
        }

        // Jika item lebih dari 1, tampilkan picker. 
        // Jika hanya 1, bisa langsung diproses (atau tetap tampilkan picker agar konsisten)
        setAvailableItemsFromPallet(activeItems);
        setTempSelectedPalletCode(pallet.pallet_code);
        setShowItemPicker(true);
      })
      .catch(() => Alert.alert("Error", "Gagal mengambil detail item pallet"))
      .finally(() => setLoading(false));
  };

  const onConfirmSelectItem = (item: any) => {
    // 1. Validasi: Apakah kombinasi Pallet + Item ini sudah ada di list merge?
    const isExist = mergePallets.find(p => p.id === item.id);
    if (isExist) {
      Alert.alert("Perhatian", "Item dari pallet ini sudah masuk dalam daftar.");
      return;
    }

    // 2. Validasi Kriteria (Item, UOM, Week harus sama dengan pallet/item pertama)
    if (mergePallets.length > 0) {
      const first = mergePallets[0];
      const isMatch =
        // item.item_id === first.item_id &&
        item.uom === first.uom 
        // && String(item.week_number) === String(first.week_number);

      if (!isMatch) {
        Alert.alert(
          "Validasi Gagal",
          `Item harus sama dengan item pertama! \n\nTarget: ${first.item_name} (W${first.week_number})`
        );
        return;
      }
    }

    // Masukkan ke daftar merge
    const palletToMerge = {
      ...item,
      pallet_code: tempSelectedPalletCode // Gunakan code pallet aslinya
    };

    setMergePallets([...mergePallets, palletToMerge]);
    setShowItemPicker(false);
    setAvailableItemsFromPallet([]);
  };


  // Effect untuk ambil data Sub Warehouse saat pertama kali pilih MERGE_PALLET
  useEffect(() => {
    if (updateType === 'MERGE_PALLET') {
      ConstantService.getSubWarehouse()
        .then(res => setSubWarehouses(res.data))
        .catch(err => console.log("Err SubWH", err));
    }
  }, [updateType]);

  // Fungsi Fetch Pallet dari Inventory Tracking
  const fetchPalletsFromInventory = (subId: string, binId?: string) => {
    setLoading(true);
    // Menggunakan API inventory tracking sesuai contoh referensi kamu
    ConstantService.getInventoryTracking(subId, binId || '')
      .then(res => {
        // Transform data agar sesuai dengan struktur yang dibutuhkan
        const transformed = res.data.map((row: any) => ({
          pallet_id: row.pallet.id,
          pallet_code: row.pallet.pallet_code,
          inventory_tracking_id: row.id,
          // Mengambil item pertama sebagai referensi validasi (asumsi 1 pallet 1 jenis item saat mau merge)
          item_id: row.pallet.currentItems?.[0]?.item_id,
          item_name: row.pallet.currentItems?.[0]?.item_name,
          uom: row.pallet.currentItems?.[0]?.uom,
          week_number: row.pallet.currentItems?.[0]?.week_number,
          current_quantity: row.pallet.currentItems?.[0]?.current_quantity,
          production_date: row.pallet.currentItems?.[0]?.production_date,
        }));
        setAvailablePallets(transformed);
      })
      .catch(err => Alert.alert("Error", "Gagal mengambil data pallet"))
      .finally(() => setLoading(false));
  };

  const onSelectSub = (sub: any) => {
    setSelectedSub(sub);
    setSearchSub(sub.code);
    setFilteredSubs([]);
    setSelectedBin(null);
    setAvailablePallets([]);

    ConstantService.getBinsBySubWareHouseId(sub.id)
      .then(res => setBins(res.data))
      .catch(() => setBins([]));

    fetchPalletsFromInventory(sub.id);
  };

  const onSelectBin = (bin: any) => {
    setShowItemPicker(false);
    if (selectedBin?.id === bin.id) {
      setSelectedBin(null);
      fetchPalletsFromInventory(selectedSub.id);
    } else {
      setSelectedBin(bin);
      fetchPalletsFromInventory(selectedSub.id, bin.id);
    }
  };

  const handleNameChange = (text: string) => {
    setAssignedUserName(text);

    if (text.trim().length === 0) {
      // Jika kosong, tampilkan semua user (limit 20 agar tidak berat)
      setSearchResults(allUsers.slice(0, 20));
      setShowDropdown(true);
    } else {
      // Filter berdasarkan nama atau nomor telepon
      const filtered = allUsers.filter(u =>
        u.name?.toLowerCase().includes(text.toLowerCase()) ||
        (u.phone && u.phone.includes(text))
      );
      setSearchResults(filtered);
      setShowDropdown(true);
    }
  };

  // Fungsi tambahan agar saat input di-klik langsung muncul dropdown
  const handleFocusInput = () => {
    if (assignedUserName.trim().length === 0) {
      setSearchResults(allUsers.slice(0, 20));
    }
    setShowDropdown(true);
  };

  // const handleAddPalletToMerge = (pallet: any) => {
  //   // 1. Validasi: Apakah sudah ada di list?
  //   if (mergePallets.find(p => p.pallet_id === pallet.pallet_id)) {
  //     Alert.alert("Perhatian", "Pallet sudah masuk dalam daftar.");
  //     return;
  //   }

  //   // 2. Validasi: Item, UOM, dan Week harus sama dengan pallet pertama yang sudah masuk
  //   if (mergePallets.length > 0) {
  //     const first = mergePallets[0];
  //     const isMatch =
  //       pallet.item_id === first.item_id &&
  //       pallet.uom === first.uom &&
  //       String(pallet.week_number) === String(first.week_number);

  //     if (!isMatch) {
  //       Alert.alert(
  //         "Validasi Gagal",
  //         `Item harus sama! \nKriteria: \n- Item: ${first.item_name} \n- UOM: ${first.uom} \n- Week: ${first.week_number}`
  //       );
  //       return;
  //     }
  //   }

  //   setMergePallets([...mergePallets, pallet]);
  // };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const resList = await UserServices.getUserList();
        const filtered = (resList?.data || []).filter(
          (u: any) => u?.role?.name?.toUpperCase() === ROLES.HELPER.toUpperCase()
        );
        setDevices(filtered);
        const resManage = await UserServices.getUserManagementList();
        setAllUsers(resManage?.data || []);
      } catch (err) {
        console.log("Failed to fetch user data", err);
      }
    };
    fetchInitialData();
  }, []);

  // const handleNameChange = (text: string) => {
  //   setAssignedUserName(text);
  //   if (text.trim().length > 0) {
  //     const filtered = allUsers.filter(u =>
  //       u.name?.toLowerCase().includes(text.toLowerCase()) ||
  //       (u.phone && u.phone.includes(text))
  //     );
  //     setSearchResults(filtered);
  //     setShowDropdown(true);
  //   } else {
  //     setShowDropdown(false);
  //   }
  // };

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
    type UomType = 'DUS' | 'BAL' | 'PRS' | 'BKS' | 'BTG';
    const units: UomType[] = ['DUS', 'BAL', 'PRS', 'BKS', 'BTG'];
    const factor: Record<UomType, number> = {
      DUS: itemMaster.bal_per_dus || 1,
      BAL: itemMaster.press_per_bal || 1,
      PRS: itemMaster.bks_per_press || 1,
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

      if (!Number.isInteger(result)) {
        Alert.alert('Error', 'Konversi menghasilkan nilai desimal. Jumlah tidak dapat dikonversi.');
        return currentQty;
      }

      return result;
    } catch (e) {
      return currentQty;
    }
  };

  const handleCheckPallet = async () => {
    if (!palletNo) {
      Alert.alert('Perhatian', 'Silahkan input atau scan nomor pallet');
      return;
    }

    // Simpan nomor pallet dari inputan ke variabel lokal sebelum loading/hit API
    const currentScannedCode = palletNo;

    setLoading(true);
    try {
      const mockPalletRes = await ScannerService.getPalletByCode(currentScannedCode);
      const activeItems = (mockPalletRes.data || []).filter((item: any) => item.current_quantity > 0);

      if (activeItems.length > 0) {
        if (updateType === 'MERGE_PALLET') {
          // Tambahkan pallet_code dari inputan user (currentScannedCode) ke setiap item
          const newPallets = activeItems.map((item: any) => ({
            ...item,
            pallet_code: currentScannedCode // Menyimpan data inputan sebelum search
          }));

          const isExist = mergePallets.find(p => p.pallet_code === currentScannedCode);
          if (isExist) {
            Alert.alert('Info', 'Pallet ini sudah ada di daftar merge');
          } else {
            setMergePallets([...mergePallets, ...newPallets]);
            setPalletNo(''); // Reset input setelah berhasil
          }
        } else {
          // Logic Original (Split / Update Prod Code / UOM)
          const palletId = mockPalletRes.data[0].id;
          const validateItems = await MovementService.getUpdateInventoryList({ status: 'PENDING_HELPER_ACTION', limit: 100 });
          const isInValidateList = validateItems?.data?.some((validateItem: any) =>
            validateItem.items?.some((item: any) => item.palletId === palletId)
          );

          if (isInValidateList) {
            Alert.alert('Error', 'Pallet sudah digunakan untuk task ke helper. Tidak dapat diproses.');
            setLoading(false);
            return;
          }

          setPalletItems(activeItems);
          if (activeItems.length === 1) {
            const selectedPallet = activeItems[0];
            const mockItemMaster = await ScannerService.getItemById(selectedPallet.item_id);

            // Validasi data item master
            if (updateType === 'UPDATE_UOM') {
              if (!mockItemMaster.data ||
                mockItemMaster.data.bal_per_dus === null ||
                mockItemMaster.data.bal_per_dus === 0 ||
                mockItemMaster.data.press_per_bal === null ||
                mockItemMaster.data.press_per_bal === 0 ||
                mockItemMaster.data.bks_per_press === null ||
                mockItemMaster.data.bks_per_press === 0 ||
                mockItemMaster.data.btg_per_bks === null ||
                mockItemMaster.data.btg_per_bks === 0) {
                Alert.alert('Error', 'Data item belum lengkap. Silahkan hubungi administrasi');
                setLoading(false);
                return;
              }
            }

            setItemMaster(mockItemMaster.data);

            // Simpan juga pallet_code ke palletData tunggal
            setPalletData({
              ...selectedPallet,
              pallet_code: currentScannedCode
            });

            if (updateType === 'SPLIT_PALLET') setSelectedValue(selectedPallet.id);
          }
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

  const handleDeleteMergePallet = (index: number) => {
    const deletedPallet = mergePallets[index];
    const newList = mergePallets.filter((_, i) => i !== index);
    setMergePallets(newList);
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
    if (updateType === 'MERGE_PALLET') {
      if (mergePallets.length < 2 || !selectedDeviceId || !assignedUserName) {
        Alert.alert('Error', 'Data Merge belum lengkap (Minimal 2 pallet, pilih target, dan pilih helper).');
        return;
      }
    } else if (!palletData || !selectedValue) {
      Alert.alert('Error', 'Data belum lengkap.');
      return;
    }

    setLoading(true);
    try {
      let payload: any;
      if (updateType === 'MERGE_PALLET') {
        payload = {
          updateType: "MERGE_PALLET",
          status: "PENDING_HELPER_ACTION",
          initiatedByUserId: userId,
          inspectionStatus: "PENDING",
          inspectionByUserId: userId,
          notes: "Merge pallet request via mobile",
          completedDate: new Date().toISOString(),
          items: mergePallets.map((p, idx) => ({
            sequence: idx + 1,
            palletId: p.pallet_id || p.id,
            itemId: p.item_id,
            productionDate: p.production_date,
            weekNumber: p.week_number,
            quantity: p.current_quantity,
            uom: p.uom
          })),
          assigned: [{ userId: selectedDeviceId, assignedAt: new Date().toISOString() }]
        };
        await MovementService.postUpdateInventoryMerge(payload);
      } else if (updateType === 'SPLIT_PALLET') {
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
            quantity: Number(splitQty),
            uom: palletData.uom,
            productionDate: palletData.production_date,
            weekNumber: palletData.week_number
          },
          assigned: [{ userId: selectedDeviceId, assignedAt: new Date().toISOString() }]
        };
        await MovementService.postUpdateInventorySplit(payload);
      } else {
        const isUomUpdate = updateType === 'UPDATE_UOM';
        const isProdCodeUpdate = updateType === 'UPDATE_PROD_CODE';
        const newQty = isUomUpdate ? calculateNewQty(palletData.current_quantity, palletData.uom, selectedValue) : palletData.current_quantity;

        if (isUomUpdate) {
          await ScannerService.updatePalletById(palletData.pallet_id || palletData.id, { capacity: newQty });
        }
        console.log("Payload for Update Inventory:", selectedValue)

        const formattedDate = isProdCodeUpdate
          ? new Date(selectedValue).toISOString()
          : selectedValue;

        console.log("Formatted Date for Payload:", formattedDate);

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
            palletId: palletData.pallet_id || palletData.id,
            itemId: palletData.item_id,
            quantity: palletData.current_quantity,
            uom: palletData.uom,
            productionDate: palletData.production_date || "2026-01-05T00:00:00.000Z",
            weekNumber: Number(palletData.week_number) || 1
          },
          scan: {
            scanDate: new Date().toISOString(),
            scanByUserId: userId,
            palletId: palletData.pallet_id || palletData.id,
            itemId: palletData.item_id,
            quantity: newQty,
            uom: isUomUpdate ? selectedValue : palletData.uom,
            productionDate: isProdCodeUpdate ? formattedDate : palletData.production_date,
            status: "PENDING",
            weekNumber: weekNumber
          }
        };
        if (isUomUpdate) {
          payload.uom = selectedValue;
        } else {
          payload.productionCode = selectedValue;
        }

        console.log("Payload for Update Inventory:", payload);

        try {
          // console.log("Payload for Update Inventory:", payload);
          await MovementService.postUpdateInventory(payload);
        } catch (invError) {
          if (isUomUpdate) {
            await ScannerService.updatePalletById(palletData.pallet_id || palletData.id, { capacity: palletData.current_quantity });
          }
          throw invError;
        }
      }
      Alert.alert('Berhasil', 'Data berhasil diproses');
      navigation.goBack();
    } catch (error: any) {
      console.log("Submit error", error);

      const rawMessage = error?.data?.message || 'Gagal memproses data';

      // Safely convert Array to String if necessary
      const finalMessage = Array.isArray(rawMessage)
        ? rawMessage.join(', ')
        : String(rawMessage);

      Alert.alert('Error', finalMessage);
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
                setMergePallets([]);
              }}>
              <Picker.Item label="Update Production Code" value="UPDATE_PROD_CODE" />
              <Picker.Item label="Update UOM" value="UPDATE_UOM" />
              <Picker.Item label="Split Pallet" value="SPLIT_PALLET" />
              <Picker.Item label="Merge Pallet" value="MERGE_PALLET" />
            </Picker>
          </View>
          {updateType === 'MERGE_PALLET' ? (
            /* --- FLOW MERGE PALLET BARU --- */
            <View>
              <Text style={styles.label}>Cari Lokasi (Zone/Sub Warehouse)</Text>
              <TextInput
                style={styles.input}
                placeholder="Scan kode Zone..."
                value={searchSub}
                onChangeText={(t) => {
                  setSearchSub(t);
                  // Tambahkan kondisi t.trim().length > 0
                  if (t.trim().length > 0) {
                    const filtered = subWarehouses.filter(s =>
                      s.code.toLowerCase().includes(t.toLowerCase())
                    );
                    setFilteredSubs(filtered);
                  } else {
                    // Jika kosong, kosongkan list sugesti
                    setFilteredSubs([]);
                  }
                }}
              />
              {filteredSubs.length > 0 && (
                <View style={styles.dropdown}>
                  {filteredSubs.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.dropdownItem} onPress={() => onSelectSub(item)}>
                      <Text>{item.code}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {selectedSub && (
                <>
                  <Text style={[styles.label, { marginTop: 15 }]}>Pilih Bin (Opsional)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginBottom: 10 }}>
                    {bins.map((bin) => (
                      <TouchableOpacity
                        key={bin.id}
                        style={[styles.binChip, selectedBin?.id === bin.id && styles.binChipActive]}
                        onPress={() => onSelectBin(bin)}
                      >
                        <Text style={{ color: selectedBin?.id === bin.id ? '#FFF' : '#333' }}>{bin.code}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={styles.label}>Pilih Pallet dari Lokasi ini:</Text>
                  {loading ? (
                    <ActivityIndicator color="#FF6B00" />
                  ) : (
                    <View style={{ maxHeight: 200, borderWidth: 1, borderColor: '#EEE', borderRadius: 8, padding: 5 }}>
                      <ScrollView nestedScrollEnabled={true}>
                        <View style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          alignItems: 'flex-start'
                        }}>
                          {availablePallets.map((p) => (
                            <TouchableOpacity
                              key={p.pallet_id}
                              style={{
                                backgroundColor: '#f0f0f0',
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 6,
                                margin: 4, // Jarak antar item
                                borderWidth: 1,
                                borderColor: '#ddd',
                                minWidth: '22%', // Agar sekitar 4 kolom (menyesuaikan layar)
                                alignItems: 'center'
                              }}
                              onPress={() => handleAddPalletToMerge(p)}
                            >
                              <Text style={{ fontWeight: 'bold', fontSize: 12 }}>{p.pallet_code}</Text>
                            </TouchableOpacity>
                          ))}

                          {availablePallets.length === 0 && (
                            <Text style={{ padding: 10, textAlign: 'center', width: '100%' }}>Tidak ada pallet</Text>
                          )}
                        </View>
                      </ScrollView>
                    </View>
                  )}
                  {showItemPicker && (
                    <View style={[styles.infoBox, { backgroundColor: '#FFF3E0', borderColor: '#FF6B00', borderWidth: 1, marginBottom: 15 }]}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={[styles.label, { color: '#E65100' }]}>Pilih Item dari Pallet {tempSelectedPalletCode}:</Text>
                        <TouchableOpacity onPress={() => setShowItemPicker(false)}>
                          <Text style={{ fontWeight: 'bold', color: 'red' }}>Batal</Text>
                        </TouchableOpacity>
                      </View>
                      {availableItemsFromPallet.map((item, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={[styles.palletSelectItem, { backgroundColor: '#FFF', marginTop: 5 }]}
                          onPress={() => onConfirmSelectItem(item)}
                        >
                          <Text style={{ fontWeight: '600' }}>{item.item_name}</Text>
                          <Text style={{ fontSize: 12 }}>Qty: {item.current_quantity} {item.uom} | Week: {item.week_number}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>
          ) : (

            <>
              <Text style={styles.label}>Nomor Pallet</Text>
              <View style={styles.searchRow}>
                <TextInput style={styles.input} placeholder="Scan Pallet..." value={palletNo} onChangeText={setPalletNo} />
                <TouchableOpacity style={styles.scanBtn} onPress={handleCheckPallet}>
                  <Text style={styles.scanIcon}>🔍</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* LIST PALLET UNTUK MERGE DENGAN FUNGSI DELETE */}
          {updateType === 'MERGE_PALLET' && mergePallets.length > 0 && (
            <View style={{ marginBottom: 15 }}>
              <Text style={styles.label}>Daftar Pallet Akan Di-Merge:</Text>
              {mergePallets.map((item, idx) => (
                <View key={idx} style={styles.mergeItemCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.palletCodeLabel}>{item.pallet_code || 'N/A'}</Text>
                    <Text style={styles.itemInfoText}>{item.item_name}</Text>
                    <Text style={styles.qtyInfoText}>{item.current_quantity} {item.uom} | Week {item.week_number ?? 0}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteMergePallet(idx)}
                  >
                    <Text style={styles.deleteText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

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

          {/* SECTION HELPER */}
          {(updateType === 'SPLIT_PALLET' || updateType === 'MERGE_PALLET') && (
            (palletData || mergePallets.length > 0) && (
              <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 15 }}>
                {updateType === 'SPLIT_PALLET' && (
                  <>
                    <Text style={styles.label}>Quantity yang akan di-Split ({palletData?.uom})</Text>
                    <TextInput
                      style={[styles.input, { marginBottom: 15 }]}
                      placeholder="Masukkan Qty..."
                      keyboardType="numeric"
                      value={splitQty}
                      onChangeText={setSplitQty}
                    />
                  </>
                )}

                <Text style={styles.label}>Device (Scanner Helper)</Text>
                <View style={styles.pickerContainer}>
                  <Picker selectedValue={selectedDeviceId} onValueChange={(v) => setSelectedDeviceId(v)}>
                    <Picker.Item label="-- Pilih Device --" value="" />
                    {devices.map((d: any) => (
                      <Picker.Item key={d.id} label={d.username || d.name || "-"} value={d.id} />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.label}>Input User Name (Helper)</Text>
                {/* Container utama harus memiliki zIndex agar tidak tertutup item di atasnya */}
                <View style={{ zIndex: 5000, position: 'relative' }}>
                  <TextInput
                    style={styles.input}
                    placeholder="Search name or phone..."
                    value={assignedUserName}
                    onChangeText={handleNameChange}
                    onFocus={handleFocusInput}
                  />

                  {showDropdown && (
                    <View style={{
                      position: 'absolute',
                      bottom: 50,       // KUNCI: Gunakan 'bottom' (sesuaikan dengan tinggi TextInput + margin)
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#DDD',
                      maxHeight: 200,    // Batasi tinggi agar tidak menutupi seluruh layar atas
                      elevation: 10,     // Agar melayang di Android
                      zIndex: 9999,      // Agar melayang di iOS
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: -4 }, // Shadow ke arah atas
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                    }}>
                      <ScrollView
                        nestedScrollEnabled={true}
                        keyboardShouldPersistTaps="handled"
                        style={{ flexGrow: 0 }}
                      >
                        {searchResults.length > 0 ? (
                          searchResults.map((item) => (
                            <TouchableOpacity
                              key={item.id}
                              style={{
                                padding: 15,
                                borderBottomWidth: 1,
                                borderBottomColor: '#F0F0F0',
                                backgroundColor: 'white'
                              }}
                              onPress={() => handleSelectUser(item)}
                            >
                              <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#333' }}>{item.name}</Text>
                              <Text style={{ fontSize: 12, color: '#777', marginTop: 2 }}>{item.phone || 'No Phone'}</Text>
                            </TouchableOpacity>
                          ))
                        ) : (
                          <View style={{ padding: 15 }}>
                            <Text style={{ textAlign: 'center', color: '#999' }}>User tidak ditemukan</Text>
                          </View>
                        )}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>
            )
          )}

          {/* DATA SAAT INI (TIPE LAIN) */}
          {palletData && updateType !== 'MERGE_PALLET' && (
            <>
              <View style={[styles.infoBox, { marginTop: 55 }]}>
                <Text style={styles.infoTitle}>DATA SAAT INI (Pallet: {palletData.pallet_code})</Text>
                <Text>{palletData.item_name} | Week {palletData.week_number}</Text>
                <Text style={{ fontWeight: 'bold' }}>{palletData.current_quantity} {palletData.uom}</Text>
              </View>
              {/* UI Prod Code / UOM logic tetap sama */}
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
                      {['DUS', 'BAL', 'PRS', 'BKS', 'BTG'].map(u => (<Picker.Item key={u} label={u} value={u} />))}
                    </Picker>
                  </View>
                </View>
              )}
              {selectedValue !== '' && updateType !== 'SPLIT_PALLET' && updateType !== 'MERGE_PALLET' && (
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
          style={[styles.submitBtn,
          ((updateType !== 'MERGE_PALLET' && (!palletData || !selectedValue)) ||
            (updateType === 'MERGE_PALLET' && (mergePallets.length < 2))) && { backgroundColor: '#CCC' }
          ]}
          onPress={() => {
            Alert.alert('Konfirmasi', `Anda yakin ingin melanjutkan?`, [
              { text: 'Batal', style: 'cancel' },
              { text: 'Lanjutkan', onPress: handleSubmit }
            ]);
          }}
          disabled={
            (updateType !== 'MERGE_PALLET' && (!palletData || !selectedValue)) ||
            (updateType === 'MERGE_PALLET' && (mergePallets.length < 2))
          }
        >
          <Text style={styles.submitText}>PROSES</Text>
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
  infoBox: { padding: 12, backgroundColor: '#E1E9F0', borderRadius: 8, marginBottom: 10 },
  infoTitle: { fontSize: 10, color: '#555', marginBottom: 4 },

  // Styles Baru untuk Merge List
  mergeItemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center'
  },
  palletCodeLabel: { fontSize: 13, fontWeight: 'bold', color: '#FF6B00' },
  itemInfoText: { fontSize: 12, color: '#333' },
  qtyInfoText: { fontSize: 11, color: '#666' },
  deleteBtn: { backgroundColor: '#FEE2E2', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  deleteText: { color: '#EF4444', fontWeight: 'bold' },

  submitBtn: { backgroundColor: '#FF6B00', padding: 16, borderRadius: 10, alignItems: 'center' },
  submitText: { color: '#FFF', fontWeight: 'bold' },
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
  binChip: { padding: 8, backgroundColor: '#EEE', borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#DDD' },
  binChipActive: { backgroundColor: '#FF6B00', borderColor: '#FF6B00' },
  palletSelectItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  previewCard: { marginTop: 10, padding: 15, backgroundColor: '#FFFEEA', borderRadius: 10, borderWidth: 1, borderColor: '#F2E675' },
  previewTitle: { fontSize: 11, fontWeight: 'bold', color: '#856404', marginBottom: 10, textAlign: 'center' },
  previewRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  previewCol: { alignItems: 'center' },
  previewQty: { fontSize: 12, color: '#777' },
  smallLabel: { fontSize: 9, color: '#999' },
  arrow: { fontSize: 20, color: '#CCC' },
});

export default CreateUpdateScreen;