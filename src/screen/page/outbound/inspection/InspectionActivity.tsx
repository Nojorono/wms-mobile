import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useLoadingDialogStore } from '../../../../store/useLoadingStore';
import { useDialogStore } from '../../../../store/useGlobalDialog';
import { InspectionParamList } from '../../../navigation/outbound/InspectionNavigator';
import OutboundService from '../../../../service/outboundService';
import { useAuthStore } from '../../../../store/useAuthStore';

type NavigationProp = StackNavigationProp<InspectionParamList, 'InspectionActivity'>;

export default function InspectionActivity() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { user } = useAuthStore();
  const userId = user?.id || "";
  const { data, dataBefore } = route.params as any;

  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const showDialog = useDialogStore((state) => state.showDialog);

  const [refreshing, setRefreshing] = useState(false);
  const [InspectionList, setInspectionList] = useState<any[]>([]);

  // modal & edit states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // editable fields local state
  const [quantityPicked, setQuantityPicked] = useState<string>('');
  const [weekNumber, setWeekNumber] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false); // true when user changes inputs

  const fetchInspection = async () => {
    try {
      setRefreshing(true);
      showLoadingDialog('Loading List Inspection SKU');
      const response = await OutboundService.getTransactionPickingDetail(data.id);
      const filtered = response.data || [];
      setInspectionList(filtered);
    } catch (error) {
      showDialog('error', 'Error while Fetching Data Inspection!');
    } finally {
      hideLoadingDialog();
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInspection();
    }, [])
  );

  // open modal and populate fields
  const openDetailModal = (activity: any) => {
    setSelectedItem(activity);
    setQuantityPicked(String(activity.quantity_picked ?? ''));
    setWeekNumber(String(activity.week_number ?? ''));
    setIsEditing(false);
    setModalVisible(true);
  };

  // submit edited fields
  const handleSubmitEdit = async () => {
    if (!selectedItem) return;
    // minimal validation
    if (quantityPicked.trim() === '') {
      return showDialog('error', 'Quantity picked wajib diisi');
    }
    try {
      showLoadingDialog('Submitting update...');
      // payload sesuai field yang diedit
      const payload = {
        quantity_picked: Number(quantityPicked),
        week_number: Number(weekNumber),
      };

      // TODO: ganti nama method jika service mu berbeda
      const response = await OutboundService.updateTransactionPickingDetail(selectedItem.id, payload);
      console.log('update response', response);
      await fetchInspection();

      showDialog('success', 'Update berhasil');
      setIsEditing(false);
      setModalVisible(false);
    } catch (error: any) {
      showDialog('error', error?.message || 'Gagal update item');
    } finally {
      hideLoadingDialog();
    }
  };

 const handleApproveAction = async (type: "APPROVE" | "FINAL") => {
  if (!selectedItem) return;

  const nextStatus =
    type === "APPROVE" ? "INSPECTION" : "INSPECTION_APPROVED";

  Alert.alert(
    "Confirm Approve",
    "Apakah Anda yakin ingin meng-approve item ini?",
    [
      { text: "Batal", style: "cancel" },
      {
        text: "Approve",
        onPress: async () => {
          try {
            showLoadingDialog("Approving...");

            const payload = {
              status: nextStatus,
              inspection_by: userId,
              ids: [selectedItem.id],
            };

            const res = await OutboundService.updateStatusPickingBulk(payload);
            console.log("response approve", res);

            hideLoadingDialog();
            await fetchInspection();
            showDialog("success", "Berhasil dikirim ke WH Staff!");
            setModalVisible(false);
          } catch (error) {
            hideLoadingDialog();
            showDialog("error", "Gagal mengirim ke WH Staff!");
          }
        },
      },
    ]
  );
};


  // when any input changes, set isEditing true (to hide approve button)
  const onChangeQuantity = (text: string) => {
    setQuantityPicked(text);
    if (!isEditing) setIsEditing(true);
  };
  const onChangeWeek = (text: string) => {
    setWeekNumber(text);
    if (!isEditing) setIsEditing(true);
  };


  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchInspection} />
        }
      >
        <View style={styles.card}>
          <Text style={styles.headerTitle}>
            LIST FOR INSPECTION ACTIVITY
          </Text>

          {/* 📌 LIST ACTIVITY */}
          {InspectionList && InspectionList.length === 0 ? (
            <Text style={styles.noActivityText}>
              Belum ada Activity, silahkan lakukan Activity Inspection
            </Text>
          ) : (
            InspectionList.map((activity: any, index: number) => (
              <View
                key={activity?.id || `${activity.week_number}-${index}`}
                style={styles.activityCard}
              >

                {/* 🔹 Title Section */}
                <Text style={{
                  fontSize: 18,
                  backgroundColor: '#FFF5E6',
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  fontWeight: '800',
                  marginBottom: 12,
                  color: '#333',
                }}>
                  Data Inspection - {index + 1}
                </Text>

                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Quantity Picked</Text>
                  <Text style={[styles.rowValue, { textAlign: 'left', color: 'green', fontWeight: '600' }]}>
                    {activity.quantity_picked} {activity.uom}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Pallet Use</Text>
                  <Text style={styles.rowValue}>{activity.palletUse?.pallet_code ?? '-'}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Week</Text>
                  <Text style={styles.rowValue}>{activity.week_number ?? '-'}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Status</Text>
                  <Text style={styles.rowValue}>{activity.status ?? '-'}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.rowLabel}>User</Text>
                  <Text style={styles.rowValue}>{activity.user_name ?? '-'}</Text>
                </View>

                {activity.status !== 'APPROVED' && (
                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() => openDetailModal(activity)}
                  >
                    <Text style={styles.detailText}>Go To Detail</Text>
                  </TouchableOpacity>
                )}

              </View>
            ))

          )}
        </View>
      </ScrollView>

      {/* Modal Edit */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Inspection</Text>

            {/* --- Disabled Fields Tambahan --- */}
            <Text style={styles.inputLabel}>Status</Text>
            <TextInput
              value={selectedItem?.status || ""}
              editable={false}
              style={[styles.inputBox, { backgroundColor: '#e6e6e6' }]}
            />

            <Text style={styles.inputLabel}>Item Id</Text>
            <TextInput
              value={selectedItem?.item_id || ""}
              editable={false}
              style={[styles.inputBox, { backgroundColor: '#e6e6e6' }]}
            />

            <Text style={styles.inputLabel}>Uom</Text>
            <TextInput
              value={selectedItem?.uom || ""}
              editable={false}
              style={[styles.inputBox, { backgroundColor: '#e6e6e6' }]}
              multiline
            />

            {/* --- Editable Fields --- */}
            <Text style={styles.inputLabel}>Quantity Picked</Text>
            <TextInput
              value={quantityPicked}
              onChangeText={onChangeQuantity}
              keyboardType="numeric"
              style={styles.inputBox}
              placeholder="Masukkan quantity"
            />

            <Text style={styles.inputLabel}>Week Number</Text>
            <TextInput
              value={weekNumber}
              onChangeText={onChangeWeek}
              style={styles.inputBox}
              placeholder="Masukkan week number"
            />

            {/* Submit */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitEdit}
            >
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>

            {/* APPROVE & FINAL APPROVE BUTTONS IN 1 ROW */}
            {!isEditing && (
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity
                style={[
                styles.approveButton,
                { flex: 1 },
                selectedItem?.status === 'INSPECTION' && { backgroundColor: '#ccc' },
                ]}
                onPress={selectedItem?.status === 'INSPECTION' ? undefined : () => handleApproveAction("APPROVE")}
                disabled={selectedItem?.status === 'INSPECTION'}
              >
                <Text style={styles.approveText}>Approve</Text>
              </TouchableOpacity>
              {selectedItem?.status !== 'APPROVED' && (
                <TouchableOpacity
                style={[
                  styles.approveButton,
                  { flex: 1, backgroundColor: '#f57f1eff' },
                  selectedItem?.status === 'PENDING' && { backgroundColor: '#ccc' },
                ]}
                onPress={selectedItem?.status === 'PENDING' ? undefined : () => handleApproveAction("FINAL")}
                disabled={selectedItem?.status === 'PENDING'}
                >
                <Text style={styles.approveText}>Final Approve</Text>
                </TouchableOpacity>
              )}
              </View>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flexGrow: 1,
    paddingBottom: 100, // supaya tidak ketutup tombol
  },
  card: {
    backgroundColor: '#F4F7FB',
    borderRadius: 12,
    padding: 16,
  },
  headerTitle: {
    fontSize: 14,
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
  },
  noActivityText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 12,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    paddingVertical: 6,
  },
  rowLabel: {
    flex: 1.2,
    fontWeight: '600',
    color: '#333',
  },
  rowValue: {
    flex: 1.5,
    color: '#333',
  },

  detailButton: {
    marginTop: 10,
    backgroundColor: '#F26E1F',
    paddingVertical: 8,
    borderRadius: 8,
  },
  detailText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '600',
  },

  // modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    width: '100%',
    maxWidth: 540,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 15,
  },
  inputLabel: {
    fontWeight: '600',
    marginTop: 10,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#2D9CDB',
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '700',
  },
  approveButton: {
    marginTop: 10,
    backgroundColor: 'green',
    paddingVertical: 10,
    borderRadius: 8,
  },
  approveText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '700',
  },
  closeButton: {
    marginTop: 15,
    paddingVertical: 8,
  },
  closeText: {
    color: 'red',
    fontWeight: '600',
    textAlign: 'center',
  },

  fab: {
    position: "absolute",
    bottom: 30,
    left: 25,
    backgroundColor: "#F26E1F",
    width: 100,
    height: 60,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
  },
});
