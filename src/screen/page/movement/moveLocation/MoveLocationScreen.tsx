import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useAuthStore } from '../../../../store/useAuthStore.ts';
import GlobalStyles from '../../../../util/GlobalStyles.ts';
import Colors from '../../../../constants/Colors.ts';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useLoadingDialogStore } from '../../../../store/useLoadingStore.ts';
import { useDialogStore } from '../../../../store/useGlobalDialog.ts';
import { MoveLocationParamList } from '../../../navigation/movement/MoveLocationNavigator.tsx';
import MovementCard from '../../../../components/movement/MovementCard.tsx';
import MovementService from '../../../../service/movementService.ts';

type NavigationProp = StackNavigationProp<MoveLocationParamList, 'MoveLocationMain'>;

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];


function MoveLocationScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [MoveLocationList, setMoveLocationList] = useState<any[]>([]);
    const [selectedStatus, setSelectedStatus] = useState('');

  const styles = GlobalStyles();
  const { user } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const showDialog = useDialogStore((state) => state.showDialog);

  const fetchMoveLocation = async (statusFilter = selectedStatus) => {
    try {
      setRefreshing(true);
      showLoadingDialog('Loading List MoveLocation Planning');
      const response = await MovementService.getInventoryMovement({status: statusFilter, limit:100});
      console.log("MoveLocation response data:", response.data);
      setMoveLocationList(response.data || []);
    } catch (error) {
      hideLoadingDialog();
      showDialog('error', 'Error while Fetching Data MoveLocation!');
    } finally {
      hideLoadingDialog();
      setRefreshing(false);
    }
  };

    // Trigger fetch saat status berubah
    useEffect(() => {
      fetchMoveLocation();
    }, [selectedStatus]);

  useFocusEffect(
    useCallback(() => {
      fetchMoveLocation();
    }, [])
  );


  return (
    <View style={{ flex: 1, backgroundColor: Colors.secondaryColor }}>
      <ScrollView
        contentContainerStyle={styles.menuContainer}
        stickyHeaderIndices={[2]}
        style={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchMoveLocation()}
            colors={[Colors.primeColor]}
          />
        }
      >
        <View style={styles.menuCard}>
          <View
            style={[
              styles.activitiesHeader,
              { borderBottomWidth: 2, borderBottomColor: '#ccc' },
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
          {MoveLocationList.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: '#888', fontSize: 16 }}>There is no data</Text>
            </View>
          ) : (
            MoveLocationList.map((item: any, index: number) => {
              let statusColor;
              if (item.status === 'APPROVED') {
                statusColor = '#228B22';
              } else if (item.status === 'PENDING') {
                statusColor = '#FFB347';
              }else if (item.status === 'CANCELLED') {
                statusColor = '#f54222';
              } 
              else {
                statusColor = '#696969';
              }

              return (
                <React.Fragment key={item.movement_number ?? index}>
                  <MovementCard
                    Title={item.movement_number}
                    source={`Source: ${item.sourceBin?.name ?? item.sourceWarehouseSub?.name ?? "Unknown"}`}
                    destination={`Destination: ${item.destinationBin?.name ?? "Unknown"}`}
                    date={item.createdAt}
                    status={item.status}
                    statusColor={statusColor}
                    onClick={() => {
                      // if (!item.destinationBin) {
                      //   Alert.alert(
                      //     'Info',
                      //     'Item belum di-assign destination.'
                      //   );
                      //   return;
                      // }
                      navigation.navigate('MoveLocationDetail', { item });
                    }}
                  />
                </React.Fragment>
              );
            })
          )}

        </View>
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 20, alignItems: 'center' }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#FF9800',
            borderRadius: 30,
            paddingVertical: 16,
            paddingHorizontal: 24,
            elevation: 5,
            flexDirection: 'row',
            alignItems: 'center',
          }}
          onPress={() => navigation.navigate('MoveLocationCreate')}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
            + Create Movement
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default MoveLocationScreen;

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
