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
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import ConstantService from '../../../../service/constantService';
import MovementService from '../../../../service/movementService';

type SubWarehouse = { id: string; name: string; code: string; warehouse_id: string };
type Bin = { id: string; name: string; code: string };
type SelectedPallet = {
  pallet_id: string;
  pallet_code: string;
  inventory_tracking_id: string;
  currentItems: { item_name: string; current_quantity: number; uom: string; }[];
};

const SUB_INVENTORIES = [
  { label: 'Good Stock', value: 'GOOD_STOCK' },
  // { label: 'Bad Stock', value: 'BAD_STOCK' },
];

const MoveLocationCreate: React.FC = () => {
  const navigation = useNavigation();

  // Data Master
  const [subWarehouses, setSubWarehouses] = useState<SubWarehouse[]>([]);
  const [bins, setBins] = useState<Bin[]>([]);
  const [availablePallets, setAvailablePallets] = useState<SelectedPallet[]>([]);

  // Selection State
  const [selectedSub, setSelectedSub] = useState<SubWarehouse | null>(null);
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [selectedPallets, setSelectedPallets] = useState<SelectedPallet[]>([]);
  const [subInventoryTujuan, setSubInventoryTujuan] = useState('');

  // UI State
  const [searchSub, setSearchSub] = useState('');
  const [filteredSubs, setFilteredSubs] = useState<SubWarehouse[]>([]);
  const [modalPalletVisible, setModalPalletVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      ConstantService.getSubWarehouse()
        .then(res => setSubWarehouses(res.data))
        .catch(err => console.error('Error fetch SubWH:', err));
    }, [])
  );

  // Helper fetch pallet (Bin bersifat opsional)
  const fetchPallets = (subId: string, binId?: string) => {
    ConstantService.getInventoryTracking(subId, binId || '')
      .then(res => {
        const transformed = res.data.map((row: any) => ({
          pallet_id: row.pallet.id,
          pallet_code: row.pallet.pallet_code,
          inventory_tracking_id: row.id,
          currentItems: row.pallet.currentItems || []
        }));
        setAvailablePallets(transformed);
      })
      .catch(err => console.error('Error fetch Pallets:', err));
  };

  const onSelectSub = (sub: SubWarehouse) => {
    setSelectedSub(sub);
    setSearchSub(sub.code);
    setFilteredSubs([]);
    setSelectedBin(null);
    setSelectedPallets([]);
    
    // Langsung ambil bin untuk ditampilkan sebagai list
    ConstantService.getBinsBySubWareHouseId(sub.id)
      .then(res => setBins(res.data))
      .catch(() => setBins([]));

    // Langsung ambil pallet di level Sub Warehouse
    fetchPallets(sub.id);
  };

  const onSelectBin = (bin: Bin) => {
    if (selectedBin?.id === bin.id) {
        // Unselect jika diklik lagi (opsional)
        setSelectedBin(null);
        fetchPallets(selectedSub!.id);
    } else {
        setSelectedBin(bin);
        setSelectedPallets([]);
        fetchPallets(selectedSub!.id, bin.id);
    }
  };

  const togglePalletSelection = (pallet: SelectedPallet) => {
    const isExist = selectedPallets.find(p => p.pallet_id === pallet.pallet_id);
    if (isExist) {
      setSelectedPallets(prev => prev.filter(p => p.pallet_id !== pallet.pallet_id));
    } else {
      setSelectedPallets(prev => [...prev, pallet]);
    }
  };

  const handleConfirmMovement = () => {
    const payload = {
      movement_type: subInventoryTujuan,
      source_warehouse_id: selectedSub?.warehouse_id,
      source_warehouse_sub_id: selectedSub?.id,
      source_bin_id: selectedBin?.id || null, // Kirim null jika tidak ada bin
      pallets: selectedPallets.map(p => ({
        pallet_id: p.pallet_id,
        inventory_tracking_id: p.inventory_tracking_id
      })),
      status: 'PENDING',
    };

    MovementService.postInventoryMovementNew(payload)
      .then(() => {
        Alert.alert("Success", "Movement berhasil dibuat");
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'MoveLocationMain' }] }));
      })
      .catch(err => Alert.alert("Error", err.message));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Move Location</Text>
      </View>

      <FlatList
        data={selectedPallets}
        keyExtractor={(item) => item.pallet_id}
        ListHeaderComponent={
          <View style={styles.paddingContainer}>
            <View style={styles.card}>
              <Text style={styles.inputLabel}> Pilih Sub Warehouse (Ketik Kode)</Text>
              <TextInput
                placeholder="Contoh: JT.."
                value={searchSub}
                onChangeText={(t) => {
                    setSearchSub(t);
                    setFilteredSubs(subWarehouses.filter(s => s.code.toLowerCase().includes(t.toLowerCase())));
                }}
                style={styles.input}
              />
              {filteredSubs.length > 0 && (
                <View style={styles.dropdownResults}>
                  {filteredSubs.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.dropdownItem} onPress={() => onSelectSub(item)}>
                      <Text style={styles.dropdownTitle}>{item.code}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {selectedSub && (
                <>
                  <Text style={[styles.inputLabel, { marginTop: 15 }]}> Pilih Bin</Text>
                  <View style={styles.binContainer}>
                    {bins.length > 0 ? bins.map((bin) => (
                      <TouchableOpacity 
                        key={bin.id} 
                        style={[styles.binChip, selectedBin?.id === bin.id && styles.binChipActive]} 
                        onPress={() => onSelectBin(bin)}
                      >
                        <Text style={[styles.binText, selectedBin?.id === bin.id && styles.binTextActive]}>{bin.code}</Text>
                      </TouchableOpacity>
                    )) : <Text style={styles.emptyText}>Tidak ada bin di lokasi ini</Text>}
                  </View>
                </>
              )}

              <Text style={[styles.inputLabel, { marginTop: 15 }]}> Tujuan Pergerakan</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={subInventoryTujuan}
                  onValueChange={(v) => setSubInventoryTujuan(v)}
                >
                  <Picker.Item label="-- Pilih Tujuan --" value="" color="#999" />
                  {SUB_INVENTORIES.map(i => <Picker.Item key={i.value} label={i.label} value={i.value} />)}
                </Picker>
              </View>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>Pallet Terpilih ({selectedPallets.length})</Text>
              <TouchableOpacity
                style={[styles.miniAddBtn, !selectedSub && styles.disabledMiniBtn]}
                onPress={() => setModalPalletVisible(true)}
                disabled={!selectedSub}
              >
                <Text style={styles.miniAddBtnText}>+ Pilih Pallet</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.palletCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.palletCode}>{item.pallet_code}</Text>
                {item.currentItems.filter(ci => ci.current_quantity > 0).map((ci, idx) => (
                <Text key={idx} style={styles.palletDetail}>• {ci.item_name} ({ci.current_quantity} {ci.uom})</Text>
                ))}
            </View>
            <TouchableOpacity onPress={() => togglePalletSelection(item)}>
              <Text style={{ color: 'red', fontWeight: 'bold' }}>Hapus</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          disabled={!selectedSub || !subInventoryTujuan || selectedPallets.length === 0}
          style={[styles.mainButton, (!selectedSub || !subInventoryTujuan || selectedPallets.length === 0) && styles.mainButtonDisabled]}
          onPress={handleConfirmMovement}
        >
          <Text style={styles.mainButtonText}>Konfirmasi Pemindahan</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalPalletVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Daftar Pallet ({selectedBin?.code || 'Tanpa Bin'})</Text>
            <TouchableOpacity onPress={() => setModalPalletVisible(false)}>
              <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>Selesai</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={availablePallets}
            keyExtractor={(item) => item.pallet_id}
            renderItem={({ item }) => {
              const isSelected = !!selectedPallets.find(p => p.pallet_id === item.pallet_id);
              return (
                <TouchableOpacity 
                  style={[styles.modalItem, isSelected && { borderColor: '#FF6A00', borderWidth: 2 }]} 
                  onPress={() => togglePalletSelection(item)}
                >
                  <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.pallet_code}</Text>
                  {isSelected && <Text style={{color: '#FF6A00', fontWeight: 'bold'}}>✓ Terpilih</Text>}
                  </View>
                  {item.currentItems.filter(ci => ci.current_quantity > 0).map((ci, idx) => (
                  <Text key={idx} style={{ fontSize: 13, color: '#555' }}>- {ci.item_name} (Qty: {ci.current_quantity})</Text>
                  ))}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 30, color: '#999'}}>Tidak ada data pallet tersedia</Text>}
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  paddingContainer: { padding: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 20, elevation: 3 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 8 },
  input: { backgroundColor: '#F8F9FA', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#DDD' },
  binContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 5 },
  binChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F0F0F0', borderWidth: 1, borderColor: '#DDD' },
  binChipActive: { backgroundColor: '#FF6A00', borderColor: '#FF6A00' },
  binText: { fontSize: 12, color: '#333', fontWeight: '600' },
  binTextActive: { color: '#FFF' },
  dropdownResults: { backgroundColor: '#FFF', borderRadius: 8, marginTop: 4, borderWidth: 1, borderColor: '#EEE' },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F8F9FA' },
  dropdownTitle: { fontWeight: 'bold', color: '#FF6A00' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  miniAddBtn: { backgroundColor: '#00B894', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  disabledMiniBtn: { backgroundColor: '#CCC' },
  miniAddBtnText: { color: '#FFF', fontWeight: 'bold' },
  palletCard: { flexDirection: 'row', backgroundColor: '#FFF', marginHorizontal: 16, marginBottom: 10, borderRadius: 10, padding: 16, alignItems: 'center', borderLeftWidth: 5, borderLeftColor: '#FF6A00', elevation: 2 },
  palletCode: { fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  palletDetail: { fontSize: 12, color: '#666' },
  footer: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  mainButton: { backgroundColor: '#FF6A00', padding: 16, borderRadius: 12, alignItems: 'center' },
  mainButtonDisabled: { backgroundColor: '#D1D1D1' },
  mainButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  modalHeader: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#EEE' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalItem: { backgroundColor: '#F8F9FA', padding: 16, margin: 10, borderRadius: 10, borderWidth: 1, borderColor: '#EEE' },
  emptyText: { fontSize: 12, color: '#999', fontStyle: 'italic' },
  pickerWrapper: { backgroundColor: '#F8F9FA', borderRadius: 8, borderWidth: 1, borderColor: '#DDD' }
});