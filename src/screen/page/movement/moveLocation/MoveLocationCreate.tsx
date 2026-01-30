import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
} from 'react-native';

// ===== TYPES =====
type PalletItem = {
  id: string;
  trackingId: string;
  code: string;
};

type SelectedPallet = {
  pallet_id: string;
  inventory_tracking_id: string;
};

type MovementPayload = {
  movement_number: string;
  movement_type: 'GOOD_STOCK' | string;
  pallets: SelectedPallet[];
  source_warehouse_id: string;
  source_warehouse_sub_id: string;
  source_bin_id: string;
  destination_warehouse_id: string;
  destination_warehouse_sub_id: string;
  destination_bin_id: string;
  status: 'PENDING' | string;
  notes: string;
  users: {
    user_id: string;
    user_name: string;
    user_phone: string;
  }[];
};

// ===== DUMMY DATA (SIMULATE API) =====
const DUMMY_PALLETS: PalletItem[] = [
  { id: 'uuid-pallet-1', trackingId: 'uuid-tracking-1', code: 'Pallet-030' },
  { id: 'uuid-pallet-2', trackingId: 'uuid-tracking-2', code: 'Pallet-033' },
  { id: 'uuid-pallet-3', trackingId: 'uuid-tracking-3', code: 'Pallet-035' },
];

const MoveLocationCreate: React.FC = () => {
  const [pallets, setPallets] = useState<SelectedPallet[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  const onSelectPallet = (item: PalletItem) => {
    setPallets((prev) => {
      const exists = prev.find(
        (p) => p.pallet_id === item.id,
      );
      if (exists) return prev;

      return [
        ...prev,
        {
          pallet_id: item.id,
          inventory_tracking_id: item.trackingId,
        },
      ];
    });

    setModalVisible(false);
  };

  const payload: MovementPayload = {
    movement_number: 'MOV-20240101-0001',
    movement_type: 'GOOD_STOCK',
    pallets,
    source_warehouse_id: 'string',
    source_warehouse_sub_id: 'string',
    source_bin_id: 'string',
    destination_warehouse_id: 'string',
    destination_warehouse_sub_id: 'string',
    destination_bin_id: 'string',
    status: 'PENDING',
    notes,
    users: [
      {
        user_id: 'uuid-user-1',
        user_name: 'John Doe',
        user_phone: '+6281234567890',
      },
    ],
  };

  const isDisabled: boolean = pallets.length === 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Move Location</Text>

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
          <View style={styles.palletItem}>
            <Text>{item.pallet_id}</Text>
          </View>
        )}
      />

      <TextInput
        placeholder="Notes"
        value={notes}
        onChangeText={setNotes}
        style={styles.input}
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
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Pilih Pallet</Text>

          <FlatList
            data={DUMMY_PALLETS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => onSelectPallet(item)}>
                <Text>{item.code}</Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setModalVisible(false)}>
            <Text style={{ color: '#fff' }}>Close</Text>
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
});