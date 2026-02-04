import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import ConstantService from '../../../../service/constantService';
import { set } from 'react-hook-form';



// ===== TYPES =====
type PalletItem = {
  id: string;
  trackingId: string;
  code: string;
};

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



const SUB_INVENTORIES = [
  { label: 'Good Stock', value: 'GOOD_STOCK' },
  { label: 'Bad Stock', value: 'BAD_STOCK' },
];

type WarehouseBinGroup = {
  warehouse: {
    id: string;
    name: string;
  };
  warehouseSub: {
    id: string;
    code: string;
    name: string;
  };
  warehouseBin: {
    id: string;
    code: string;
    name: string;
  };
  pallets: {
    pallet_id: string;
    pallet_code: string;
    currentItems: {
      inventory_tracking_id: string; // ✅ PINDAH KE SINI
      item_id: string;
      item_name: string;
      week_number: number;
      current_quantity: number;
      uom: string;
    }[];
  }[];
};


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

    // cari / buat pallet
    let pallet = group.pallets.find(
      p => p.pallet_id === row.pallet.id
    );

    if (!pallet) {
      pallet = {
        pallet_id: row.pallet.id,
        pallet_code: row.pallet.pallet_code,
        currentItems: [],
      };
      group.pallets.push(pallet);
    }

    // 🔥 LOOP currentItems dari pallet
    row.pallet.currentItems.forEach((ci: any) => {
      pallet!.currentItems.push({
        inventory_tracking_id: row.id, // inventory_tracking
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

  const [selectedItem, setSelectedItem] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<number | ''>('');
  const palletsInSelectedBin = selectedWarehouse?.pallets || [];
  const availableItems = React.useMemo(() => {
    const set = new Set<string>();

    palletsInSelectedBin.forEach(pallet => {
      pallet.currentItems.forEach(ci => {
        if (ci.item_name) {
          set.add(ci.item_name);
        }
      });
    });

    return Array.from(set);
  }, [palletsInSelectedBin]);

  const availableWeeks = React.useMemo(() => {
    const set = new Set<number>();

    palletsInSelectedBin.forEach(pallet => {
      pallet.currentItems.forEach(ci => {
        if (ci.week_number !== undefined) {
          set.add(ci.week_number);
        }
      });
    });

    return Array.from(set).sort((a, b) => a - b);
  }, [palletsInSelectedBin]);


  const onSearchLocation = (text: string) => {
    setSourceLocation(text);

    if (!text) {
      setFilteredWarehouse([]);
      return;
    }

    const keyword = text.toLowerCase();

    const result = warehouse.filter(item =>
      item.warehouseBin.code.toLowerCase().includes(keyword)
    );

    setFilteredWarehouse(result);
  };



  const filteredPallets = palletsInSelectedBin.filter(pallet =>
    pallet.currentItems.some(ci => {
      const matchItem =
        selectedItem === '' || ci.item_name === selectedItem;

      const matchWeek =
        selectedWeek === '' || ci.week_number === selectedWeek;

      return matchItem && matchWeek;
    })
  );




  const removePallet = (pallet_id: string) => {
    setPallets(prev =>
      prev.filter(p => p.pallet_id !== pallet_id)
    );
  };



  useFocusEffect(
    useCallback(() => {
      fetchWareHouse();
    }, [])
  );

  const fetchWareHouse = async () => {

    ConstantService.getInventoryTracking()
      .then((res) => {
        console.log('Inventory Tracking data:', res.data);
        const groupedWarehouse = groupByWarehouseBin(res.data);
        setWarehouse(groupedWarehouse);
      })
      .catch((err) => {
        console.error('Error fetching inventory tracking:', err);
      });
  }

  const onSelectPallet = (
    item: WarehouseBinGroup['pallets'][0]
  ) => {
    setPallets(prev => {
      const exists = prev.find(
        p => p.pallet_id === item.pallet_id
      );
      if (exists) return prev;

      return [
        ...prev,
        {
          pallet_id: item.pallet_id,
          pallet_code: item.pallet_code,
          currentItems: item.currentItems,
        },
      ];
    });

    setModalVisible(false);
  };


  const palletPayload = pallets.flatMap(pallet =>
    pallet.currentItems.map(ci => ({
      pallet_id: pallet.pallet_id,
      inventory_tracking_id: ci.inventory_tracking_id,
    }))
  );



  const payload: any = {
    movement_type: subInventory,
    pallets: palletPayload,
    source_warehouse_id: selectedWarehouse?.warehouse.id || '',
    source_warehouse_sub_id: selectedWarehouse?.warehouseSub.id || '',
    source_bin_id: selectedWarehouse?.warehouseBin.id || '',
    status: 'PENDING',
  };

  const isDisabled: boolean = pallets.length === 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Move Location</Text>
      {/* LOKASI SUMBER */}
      <Text style={styles.label}>Lokasi Sumber</Text>
      <View style={styles.row}>
        <TextInput
          placeholder="Cari lokasi (Warehouse / Sub / Bin)"
          value={sourceLocation}
          onChangeText={onSearchLocation}
          style={[styles.input, { flex: 1, marginTop: 0 }]}
        />





        <TouchableOpacity
          style={styles.scanBtn}
          onPress={() => {
            console.log('SCAN LOCATION');
            // nanti isi logic scan barcode
          }}>
          <Text style={styles.scanText}>Scan</Text>
        </TouchableOpacity>
      </View>
      {filteredWarehouse.length > 0 && (
        <View style={styles.searchResult}>
          <FlatList
            data={filteredWarehouse}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.searchItem}
                onPress={() => {
                  setSelectedWarehouse(item);
                  setSourceLocation(
                    `${item.warehouse.name} - ${item.warehouseSub.code} - ${item.warehouseBin.code}`
                  );
                  setFilteredWarehouse([]);
                  setSelectedItem('');
                  setSelectedWeek('');

                }}
              >
                <Text style={styles.searchTitle}>
                  {item.warehouse.name}
                </Text>
                <Text style={styles.searchSub}>
                  {item.warehouseSub.code} • BIN {item.warehouseBin.code}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* TUJUAN SUB INVENTORY */}
      <Text style={styles.label}>Tujuan Sub Inventory</Text>
      <View style={styles.dropdown}>
        <Picker
          selectedValue={subInventory}
          onValueChange={(value) => setSubInventory(value)}>
          <Picker.Item label="-- Pilih Sub Inventory --" value="" />
          {SUB_INVENTORIES.map((item) => (
            <Picker.Item
              key={item.value}
              label={item.label}
              value={item.value}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>List Pallet</Text>
      <TouchableOpacity
        style={styles.addPallet}
        onPress={() => setModalVisible(true)}>
        <Text>+ Add Pallet</Text>
      </TouchableOpacity>

      <FlatList
        data={pallets}
        keyExtractor={(item) => item.pallet_id}
        renderItem={({ item }) => (
          <View style={styles.palletItemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.palletCode}>
                {item.pallet_code}
              </Text>

              {item.currentItems.map((ci) => (
                <Text
                  key={`${item.pallet_id}-${ci.item_id}`}
                  style={styles.palletDetail}
                >
                  {ci.item_name} • Week {ci.week_number}
                </Text>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => removePallet(item.pallet_id)}
            >
              <Text style={{ color: 'red', fontWeight: 'bold' }}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />




      <TouchableOpacity
        disabled={isDisabled}
        style={[styles.submitBtn, isDisabled && styles.disabledBtn]}
        onPress={() => {
          console.log('PAYLOAD:', payload);
        }}>
        <Text style={styles.submitText}>Request Movement</Text>
      </TouchableOpacity>

      {/* MODAL PILIH PALLET */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Pilih Pallet</Text>

          <Text style={styles.label}>Item</Text>
          <View style={[
            styles.dropdown,
            !selectedWarehouse && { opacity: 0.5 }
          ]}>
            <Picker
              selectedValue={selectedItem}
              onValueChange={(value) => setSelectedItem(value)}
            >
              <Picker.Item label="-- Semua Item --" value="" />
              {availableItems.map(item => (
                <Picker.Item
                  key={item}
                  label={item}
                  value={item}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Week</Text>
          <View style={[
            styles.dropdown,
            !selectedWarehouse && { opacity: 0.5 }
          ]}>
            <Picker
              selectedValue={selectedWeek}
              onValueChange={(value) => setSelectedWeek(value)}
            >
              <Picker.Item label="-- Semua Week --" value="" />
              {availableWeeks.map(week => (
                <Picker.Item
                  key={week}
                  label={`Week ${week}`}
                  value={week}
                />
              ))}
            </Picker>
          </View>

          {/* LIST PALLET */}
          {/* LIST PALLET */}
          <FlatList
            data={filteredPallets}
            keyExtractor={(item) => item.pallet_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => onSelectPallet(item)}
              >
                <Text style={{ fontWeight: '600' }}>
                  {item.pallet_code}
                </Text>

                {item.currentItems.map(ci => (
                  <Text
                    key={`${item.pallet_id}-${ci.inventory_tracking_id}`} // ✅
                    style={{ fontSize: 12 }}
                  >
                    {ci.item_name} • Week {ci.week_number} • Qty: {ci.current_quantity} {ci.uom}
                  </Text>
                ))}
              </TouchableOpacity>
            )}
          />


          <TouchableOpacity
            disabled={!selectedWarehouse}
            style={[
              styles.addPallet,
              !selectedWarehouse && { backgroundColor: '#E0E0E0' }
            ]}
            onPress={() => setModalVisible(true)}
          >
            <Text>+ Add Pallet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setModalVisible(false)}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </Modal>

    </View>
  );
};

export default MoveLocationCreate;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F4F6F8',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    marginTop: 16,
  },
  addPallet: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  palletItem: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  submitBtn: {
    backgroundColor: '#FF6A00',
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#BDBDBD',
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalItem: {
    padding: 16,
    backgroundColor: '#F1F1F1',
    borderRadius: 8,
    marginBottom: 8,
  },
  closeBtn: {
    backgroundColor: '#FF6A00',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  scanBtn: {
    backgroundColor: '#FF6A00',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    marginLeft: 8,
  },

  scanText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 8,
  },
  searchResult: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 200,
  },

  searchItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },

  searchTitle: {
    fontWeight: '600',
  },

  searchSub: {
    fontSize: 12,
    color: '#666',
  },
  palletItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  palletCode: {
    fontWeight: 'bold',
    fontSize: 14,
  },

  palletDetail: {
    fontSize: 12,
    color: '#666',
  },
});