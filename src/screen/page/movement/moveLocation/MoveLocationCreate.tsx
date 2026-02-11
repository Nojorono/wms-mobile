import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import ConstantService from '../../../../service/constantService';
import MovementService from '../../../../service/movementService';
import { MoveLocationParamList } from '../../../navigation/movement/MoveLocationNavigator';
import { StackNavigationProp } from '@react-navigation/stack';

// --- TYPES (Tetap Sama) ---
type SelectedPallet = {
  pallet_id: string;
  pallet_code: string;
  currentItems: {
    inventory_tracking_id: string;
    item_id: string;
    item_name: string;
    week_number: number;
    current_quantity: number;
    uom: string;
  }[];
};

type WarehouseBinGroup = {
  warehouse: { id: string; name: string };
  warehouseSub: { id: string; code: string; name: string };
  warehouseBin: { id: string; code: string; name: string };
  pallets: SelectedPallet[];
};

type NavigationProp = StackNavigationProp<MoveLocationParamList, 'MoveLocationMain'>;

const SUB_INVENTORIES = [
  { label: 'Good Stock', value: 'GOOD_STOCK' },
  { label: 'Bad Stock', value: 'BAD_STOCK' },
];

const groupByWarehouseBin = (data: any[]): WarehouseBinGroup[] => {
  const map = new Map<string, WarehouseBinGroup>();
  data.forEach(row => {
    if (!row.warehouseBin || !row.warehouse_bin_id || !row.pallet) return;
    const binId = row.warehouse_bin_id;
    if (!map.has(binId)) {
      map.set(binId, {
        warehouse: row.warehouse,
        warehouseSub: row.warehouseSub,
        warehouseBin: row.warehouseBin,
        pallets: [],
      });
    }
    const group = map.get(binId)!;
    let pallet = group.pallets.find(p => p.pallet_id === row.pallet.id);
    if (!pallet) {
      pallet = { pallet_id: row.pallet.id, pallet_code: row.pallet.pallet_code, currentItems: [] };
      group.pallets.push(pallet);
    }
    row.pallet.currentItems.forEach((ci: any) => {
      pallet!.currentItems.push({
        inventory_tracking_id: row.id,
        item_id: ci.item_id,
        item_name: ci.item_name,
        week_number: ci.week_number,
        current_quantity: ci.current_quantity,
        uom: ci.uom,
      });
    });
  });
  return Array.from(map.values());
};

const MoveLocationCreate: React.FC = () => {
  const [pallets, setPallets] = useState<SelectedPallet[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [sourceLocation, setSourceLocation] = useState('');
  const [subInventory, setSubInventory] = useState('');
  const [warehouse, setWarehouse] = useState<WarehouseBinGroup[]>([]);
  const [filteredWarehouse, setFilteredWarehouse] = useState<WarehouseBinGroup[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseBinGroup | null>(null);
  const navigation = useNavigation<NavigationProp>();

  const palletsInSelectedBin = selectedWarehouse?.pallets || [];

  const availableItems = React.useMemo(() => {
    const set = new Set<string>();
    palletsInSelectedBin.forEach(p => p.currentItems.forEach(ci => ci.item_name && set.add(ci.item_name)));
    return Array.from(set);
  }, [palletsInSelectedBin]);

  const availableWeeks = React.useMemo(() => {
    const set = new Set<number>();
    palletsInSelectedBin.forEach(p => p.currentItems.forEach(ci => ci.week_number !== undefined && set.add(ci.week_number)));
    return Array.from(set).sort((a, b) => a - b);
  }, [palletsInSelectedBin]);

  const onSearchLocation = (text: string) => {
    setSourceLocation(text);
    if (!text) { setFilteredWarehouse([]); return; }
    const keyword = text.toLowerCase();
    const result = warehouse.filter(item => item.warehouseBin.code.toLowerCase().includes(keyword));
    setFilteredWarehouse(result);
  };

  const removePallet = (pallet_id: string) => {
    setPallets(prev => prev.filter(p => p.pallet_id !== pallet_id));
  };

  useFocusEffect(useCallback(() => { fetchWareHouse(); }, []));

  const fetchWareHouse = async () => {
    ConstantService.getInventoryTracking()
      .then((res) => setWarehouse(groupByWarehouseBin(res.data)))
      .catch((err) => console.error(err));
  };

  const onSelectPallet = (item: SelectedPallet) => {
    setPallets(prev => prev.find(p => p.pallet_id === item.pallet_id) ? prev : [...prev, item]);
    setModalVisible(false);
  };

  // --- LOGIKA PAYLOAD AND SUBMIT ---
  const handleConfirmMovement = () => {
    // 🔥 DATA YANG ANDA MINTA TETAP DI SINI
    const palletPayload = pallets.map(pallet => ({
      pallet_id: pallet.pallet_id,
      inventory_tracking_id: pallet.currentItems[0]?.inventory_tracking_id,
    }));


    const payload: any = {
      movement_type: subInventory,
      pallets: palletPayload,
      source_warehouse_id: selectedWarehouse?.warehouse.id || '',
      source_warehouse_sub_id: selectedWarehouse?.warehouseSub.id || '',
      source_bin_id: selectedWarehouse?.warehouseBin.id || '',
      status: 'PENDING',
    };
    console.log("Submitting payload:", payload);
    MovementService.postInventoryMovementNew(payload);
    Alert.alert("Success", "Movement completed successfully");
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MoveLocationMain' }],
      })
    );
  };

  const isDisabled = pallets.length === 0 || !subInventory || !selectedWarehouse;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Move Location</Text>
        <Text style={styles.headerSubtitle}>Kelola perpindahan stok pallet</Text>
      </View>

      <FlatList
        data={pallets}
        keyExtractor={(item) => item.pallet_id}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={
          <View style={styles.paddingContainer}>
            <Text style={styles.sectionLabel}>Konfigurasi Lokasi</Text>
            <View style={styles.card}>
              <Text style={styles.inputLabel}>Lokasi Sumber (Cari Bin)</Text>
              <View style={styles.searchRow}>
                <TextInput
                  placeholder="Ketik kode BIN..."
                  value={sourceLocation}
                  onChangeText={onSearchLocation}
                  style={styles.input}
                />
              </View>

              {filteredWarehouse.length > 0 && (
                <View style={styles.dropdownResults}>
                  {filteredWarehouse.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedWarehouse(item);
                        setSourceLocation(`${item.warehouseSub.code} - ${item.warehouseBin.code}`);
                        setFilteredWarehouse([]);
                      }}
                    >
                      <Text style={styles.dropdownTitle}>{item.warehouseBin.code}</Text>
                      <Text style={styles.dropdownSub}>{item.warehouse.name} • {item.warehouseSub.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={[styles.inputLabel, { marginTop: 15 }]}>Tujuan Sub Inventory</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={subInventory}
                  onValueChange={(v) => setSubInventory(v)}
                >
                  <Picker.Item label="-- Pilih Sub Inventory --" value="" color="#999" />
                  {SUB_INVENTORIES.map(i => <Picker.Item key={i.value} label={i.label} value={i.value} />)}
                </Picker>
              </View>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>List Pallet</Text>
              <TouchableOpacity
                style={[styles.miniAddBtn, !selectedWarehouse && styles.disabledMiniBtn]}
                onPress={() => setModalVisible(true)}
                disabled={!selectedWarehouse}
              >
                <Text style={styles.miniAddBtnText}>+ Add Pallet</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.palletCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.palletCode}>{item.pallet_code}</Text>
              {item.currentItems.map((ci, idx) => (
                <Text key={idx} style={styles.palletDetail}>
                  • {ci.item_name} (W{ci.week_number} | {ci.current_quantity} {ci.uom})
                </Text>
              ))}
            </View>
            <TouchableOpacity onPress={() => removePallet(item.pallet_id)} style={styles.removeIcon}>
              <Text style={{ color: '#FF4D4D', fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* FOOTER FIXED BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity
          disabled={isDisabled}
          style={[styles.mainButton, isDisabled && styles.mainButtonDisabled]}
          onPress={handleConfirmMovement}
        >
          <Text style={styles.mainButtonText}>Konfirmasi Pemindahan</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL PILIH PALLET */}
      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pilih Pallet</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ color: '#007AFF', fontWeight: '600' }}>Tutup</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={palletsInSelectedBin}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.modalItem} onPress={() => onSelectPallet(item)}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.pallet_code}</Text>
                {item.currentItems.map((ci, idx) => (
                  <Text key={idx} style={{ fontSize: 12, color: '#666' }}>
                    - {ci.item_name} (Qty: {ci.current_quantity})
                  </Text>
                ))}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default MoveLocationCreate;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7' },
  header: { padding: 20, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#111' },
  headerSubtitle: { fontSize: 13, color: '#666', marginTop: 2 },
  paddingContainer: { padding: 16 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: '#444', marginBottom: 10 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 }, android: { elevation: 2 } })
  },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#888', marginBottom: 6 },
  searchRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, backgroundColor: '#F8F9FA', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#EEE' },
  scanBtn: { backgroundColor: '#FF6A00', paddingHorizontal: 15, borderRadius: 8, justifyContent: 'center' },
  scanBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  pickerWrapper: { backgroundColor: '#F8F9FA', borderRadius: 8, borderWidth: 1, borderColor: '#EEE', marginTop: 4 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  miniAddBtn: { backgroundColor: '#00B894', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15 },
  disabledMiniBtn: { backgroundColor: '#CCC' },
  miniAddBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  palletCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6A00'
  },
  palletCode: { fontWeight: 'bold', fontSize: 15, color: '#222', marginBottom: 4 },
  palletDetail: { fontSize: 12, color: '#666' },
  removeIcon: { padding: 5 },
  footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFF', padding: 16, borderTopWidth: 1, borderTopColor: '#EEE' },
  mainButton: { backgroundColor: '#FF6A00', padding: 16, borderRadius: 12, alignItems: 'center' },
  mainButtonDisabled: { backgroundColor: '#D1D1D1' },
  mainButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  dropdownResults: { backgroundColor: '#FFF', borderRadius: 8, marginTop: 4, borderWidth: 1, borderColor: '#EEE' },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F8F9FA' },
  dropdownTitle: { fontWeight: 'bold', color: '#FF6A00' },
  dropdownSub: { fontSize: 11, color: '#999' },
  modalHeader: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalTitle: { fontSize: 17, fontWeight: 'bold' },
  modalItem: { backgroundColor: '#F8F9FA', padding: 16, borderRadius: 10, marginBottom: 10 }
});