import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PickingParamList } from '../../../navigation/outbound/PickingNavigator';
import { OutboundItemParam } from '../../../../interface/outbound/outbound';
import { useLoadingDialogStore } from '../../../../store/useLoadingStore';
import { useDialogStore } from '../../../../store/useGlobalDialog';
import OutboundService from '../../../../service/outboundService';
import { PickingMemoRecord } from '../../../../interface/outbound/pickingMemoTypes';

type NavigationProp = StackNavigationProp<PickingParamList, 'PickingDoMain'>;

export default function PickingActivity() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const itemBefore = route.params as OutboundItemParam
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const showDialog = useDialogStore((state) => state.showDialog);
  const [refreshing, setRefreshing] = useState(false);
const [pickingList, setPickingList] = useState<PickingMemoRecord[] | null>(null);



  const handleAddActivity = () => {
    navigation.navigate('PickingDetailActivity', { item: itemBefore.item });
  };

  const fetchPicking = async () => {
    try {
      setRefreshing(true);
      showLoadingDialog('Loading List Picking SKU');
      const response = await OutboundService.getSkuByMemoId(itemBefore.item.memo_id);
      console.log('Picking SKU Response:', response.data.data);
      setPickingList(response.data.data || []);
    } catch (error) {
      hideLoadingDialog();
      showDialog('error', 'Error while Fetching Data Picking!');
    } finally {
      hideLoadingDialog();
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPicking();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text
          style={{
            fontSize: 22,
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
          }}
        >
          {itemBefore.item.item.description}
        </Text>
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontStyle: 'italic', fontSize: 14, color: '#F26E1F', fontWeight: '700' }}>
            Suggested Destination Location
          </Text>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 16,
              color: '#333',
              fontWeight: '700',
              marginTop: 4,
              backgroundColor: '#FFF5E6',
              borderRadius: 8,
              paddingVertical: 6,
              paddingHorizontal: 12,
            }}
          >
            {itemBefore.item.destinationWarehouseSub?.name} - {itemBefore.item.destinationBin?.name} - {itemBefore.item.quantity} {itemBefore.item.uom} - Week-{itemBefore.item.week_number}
          </Text>
        </View>

        {pickingList && pickingList[0]?.transactionScanPicking?.length === 0 ? (
          <Text style={styles.noActivityText}>
            Belum ada Activity, silahkan lakukan Activity Picking
          </Text>
        ) : (
          pickingList && pickingList[0]?.transactionScanPicking?.map((activity: any, index: number) => (
            <View key={index} style={styles.activityCard}>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Quantity Picked</Text>
                  <Text style={[styles.rowValue, { textAlign: 'left', color: 'green', fontWeight: '600' }]}>
                  {activity.quantity_picked} {activity.uom}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Week</Text>
                  <Text style={styles.rowValue}>{activity.week_number}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>User</Text>
                  <Text style={styles.rowValue}>{activity.user_name}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Inspection By</Text>
                  <Text style={styles.rowValue}>{activity.inspection_by}</Text>
                </View>

              <View style={styles.statusBox}>
                <Text style={styles.statusText}>{activity.status}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddActivity}>
        <Text style={styles.addButtonText}>+ Add Activity</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#EDE8E3',
    flexGrow: 1,
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
    marginBottom: 4,
  },
  subLabel: {
    color: '#444',
    marginBottom: 12,
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
  headerText: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 8,
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    paddingVertical: 6,
  },
  switchingRow: {
    backgroundColor: '#FFF5E6', // 🔸 warna khusus baris switching
    borderRadius: 6,
  },
  rowLabel: {
    flex: 1.2,
    fontWeight: '600',
    color: '#333',
  },
  switchingLabel: {
    color: '#E67E22', // 🔸 teks oranye agar beda
  },
  rowValue: {
    flex: 1.5,
    color: '#333',
  },
  location: {
    flex: 1.2,
    color: '#F26E1F',
    fontWeight: '600',
  },
  qty: {
    flex: 1,
    textAlign: 'right',
    color: 'green',
    fontWeight: '600',
  },
  statusBox: {
    backgroundColor: '#D6B4F0',
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  statusText: {
    color: '#4A235A',
    fontWeight: '600',
  },
  addButton: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  addButtonText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#333',
  },
});
