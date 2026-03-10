import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  TouchableOpacity,
  Alert,
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
import { HelperMovementParamList } from '../../../navigation/movement/HelperMovementNavigator.tsx';

type NavigationProp = StackNavigationProp<HelperMovementParamList, 'HelperMovementMain'>;

function UpdateHelperScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [UpdateInventoryList, setUpdateInventoryList] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('PENDING_HELPER_ACTION');

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
        // updateType: "SPLIT_PALLET",
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
                  status={item.scans && item.scans.length > 0 ? "NEED_INSPECTION" : item.status}
                  statusColor={item.scans && item.scans.length > 0 ? "#228B22" : statusColor}
                  onClick={() => {
                  if (item.scans && item.scans.length > 0) {
                    Alert.alert(
                      "Pending Inspection",
                      "This movement is awaiting inspection review"
                    );
                  } else {
                    navigation.navigate('UpdateHelperDetail', { item });
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
    </View>
  );
}

export default UpdateHelperScreen;

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