import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useAuthStore } from '../../../../store/useAuthStore.ts';
import GlobalStyles from '../../../../util/GlobalStyles.ts';
import Colors from '../../../../constants/Colors.ts';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useLoadingDialogStore } from '../../../../store/useLoadingStore.ts';
import { useDialogStore } from '../../../../store/useGlobalDialog.ts';
import MovementCard from '../../../../components/movement/MovementCard.tsx';
import MovementService from '../../../../service/movementService.ts';
import { UpdateInventoryParamList } from '../../../navigation/movement/UpdateInventoryNavigator.tsx';

type NavigationProp = StackNavigationProp<UpdateInventoryParamList, 'UpdateInventoryMain'>;

// Definisi Filter Status
const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Pending Assignment', value: 'PENDING_ASSIGNMENT' },
  { label: 'Helper Action', value: 'PENDING_HELPER_ACTION' },
  { label: 'Inspection', value: 'PENDING_INSPECTION' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

function UpdateInventoryScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [UpdateInventoryList, setUpdateInventoryList] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('');

  const styles = GlobalStyles();
  const navigation = useNavigation<NavigationProp>();
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const showDialog = useDialogStore((state) => state.showDialog);

  const fetchUpdateInventory = async (statusFilter = selectedStatus) => {
    try {
      setRefreshing(true);
      showLoadingDialog('Loading List UpdateInventory');
      const response = await MovementService.getUpdateInventoryList({ 
        status: statusFilter, 
        limit: 100 
      });
      console.log('Fetched Update Inventory:', response);
      setUpdateInventoryList(response.data || []);
    } catch (error) {
      showDialog('error', 'Error while Fetching Data UpdateInventory!');
      console.error('Fetch Update Inventory Error:', error);
    } finally {
      hideLoadingDialog();
      setRefreshing(false);
    }
  };

  // Trigger fetch saat status berubah
  useEffect(() => {
    fetchUpdateInventory();
  }, [selectedStatus]);

  useFocusEffect(
    useCallback(() => {
      fetchUpdateInventory();
    }, [navigation])
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.secondaryColor }}>
      <ScrollView
        contentContainerStyle={styles.menuContainer}
        style={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchUpdateInventory()}
            colors={[Colors.primeColor]}
          />
        }
      >
        <View style={styles.menuCard}>
          <View
            style={[
              styles.activitiesHeader,
              { borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
            ]}
          >
            <Text style={styles.activitiesHeaderText}>
              List Move Location
            </Text>
          </View>

          {/* 🔍 FILTER STATUS - Sekarang di bawah Judul */}
          <View style={localStyles.filterWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {STATUS_OPTIONS.map((item) => {
                const isActive = selectedStatus === item.value;
                return (
                  <TouchableOpacity
                    key={item.label}
                    onPress={() => setSelectedStatus(item.value)}
                    style={[
                      localStyles.chip,
                      isActive && { backgroundColor: Colors.primeColor, borderColor: Colors.primeColor }
                    ]}
                  >
                    <Text style={[
                      localStyles.chipText,
                      isActive && { color: '#fff', fontWeight: 'bold' }
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* 📦 List Card */}
          {UpdateInventoryList.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 40 }}>
              <Text style={{ color: '#888', fontSize: 16 }}>There is no data</Text>
            </View>
          ) : (
            UpdateInventoryList.map((item: any, index: number) => {
              // Pewarnaan status
              let statusColor = '#696969'; // Default Gray
              if (['APPROVED', 'COMPLETED'].includes(item.status)) statusColor = '#228B22';
              if (['REJECTED', 'CANCELLED'].includes(item.status)) statusColor = '#DC3545';
              if (item.status.startsWith('PENDING')) statusColor = '#FFB347';

              return (
                <MovementCard
                  key={item.updateNumber ?? index}
                  Title={item.updateNumber}
                  source={`${item.updateType ?? "Unknown"}`}
                  destination={``}
                  date={item.createdAt}
                  status={item.status}
                  statusColor={statusColor}
                  onClick={() => {
                      
                      if (item.status === 'PENDING_HELPER_ACTION' && item.scans && item.scans.length > 0) {
                        navigation.navigate('UpdateInventoryInspection', { item });
                      } else if (item.status !== 'PENDING_HELPER_ACTION') {
                        showDialog('error', 'Hanya Pending Helper Action yang bisa diinspeksi');
                      } else {
                        showDialog('error', 'Belum ada scan yang dilakukan oleh helper');
                      }
                   
                  }}
                />
              );
            })
          )}
        </View>
        {/* Padding bawah agar list tidak tertutup tombol Floating */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Button */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 20, alignItems: 'center' }}>
        <TouchableOpacity
          style={localStyles.fab}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('UpdateInventoryCreate')}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
            + Create Update
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default UpdateInventoryScreen;

const localStyles = StyleSheet.create({
  filterWrapper: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 10
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  chipText: {
    fontSize: 12,
    color: '#666',
  },
  fab: {
    backgroundColor: '#FF9800',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flexDirection: 'row',
    alignItems: 'center',
  }
});