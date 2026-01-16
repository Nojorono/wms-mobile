import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useLoadingDialogStore } from '../../../../store/useLoadingStore';
import { useDialogStore } from '../../../../store/useGlobalDialog';
import { PickingParamList } from '../../../navigation/outbound/PickingNavigator';
import OutboundService from '../../../../service/outboundService';
import { useFocusEffect } from '@react-navigation/native';
import { OutboundItemParam } from '../../../../interface/outbound/outbound';
import Ionicons from 'react-native-vector-icons/FontAwesome5';

type NavigationProp = StackNavigationProp<PickingParamList, 'PickingActivity'>;

export default function PickingActivity() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const itemBefore = route.params as OutboundItemParam;
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const showDialog = useDialogStore((state) => state.showDialog);
  const [refreshing, setRefreshing] = useState(false);
  const [pickingList, setPickingList] = useState<any[]>([]);
  const [userIdNewest, setUserIdNewest] = useState('');

  const handleAddActivity = () => {
    navigation.navigate('PickingDetailActivity', { mode: "add", itemBefore: itemBefore.item, activity: pickingList  });
  };



  const fetchPicking = async () => {
    try {
      setRefreshing(true);
      showLoadingDialog('Loading List Picking SKU');
      const response = await OutboundService.getTransactionPickingDetail(itemBefore.item.id);
      const filtered = response.data || [];
      if (filtered.length > 0) {
        const latestUserId = filtered.reduce((latest: any, item: any) =>
          new Date(item.createdAt) > new Date(latest.createdAt) ? item : latest
        ).user_id;

        setUserIdNewest(latestUserId);
      }
      setPickingList(filtered);
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
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchPicking} />
        }
      >
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
            <Text
              style={{
                fontStyle: 'italic',
                fontSize: 14,
                color: '#F26E1F',
                fontWeight: '700',
              }}
            >
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
                      
                      {itemBefore?.item.quantity} {itemBefore?.item.uom} - Week {' '} 
                      {itemBefore?.item.week_number}
                    </Text>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: 14,
                        color: '#333',
                        fontWeight: '700',
                        marginTop: 4,
                        backgroundColor: '#FFF5E6',
                        borderRadius: 8,
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                      }}
                    >
                     From {itemBefore?.item.sourceWarehouseSub?.name} Bin {itemBefore?.item.sourceBin?.name} to {itemBefore?.item.destinationWarehouseSub?.name} -{' '}
                      {itemBefore?.item.destinationBin?.name}
                      
                    </Text>
          </View>

          {/* 📌 LIST ACTIVITY */}
          {pickingList && pickingList.length === 0 ? (
            <Text style={styles.noActivityText}>
              Belum ada Activity, silahkan lakukan Activity Picking
            </Text>
          ) : (
            pickingList.map((activity: any, index: number) => (
              <View
                key={activity?.id || `${activity.week_number}-${index}`}
                style={styles.activityCard}
              >
                {/* 🔹 Title Section */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{
                  fontSize: 18,
                  backgroundColor: '#FFF5E6',
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  fontWeight: '800',
                  color: '#333',
                  flex: 1,
                  }}>
                  Picking - {index + 1}
                  </Text>
                  <TouchableOpacity
                  onPress={() => {
                    // Confirm before delete
                    Alert.alert(
                      'Delete Activity',
                      'Are you sure you want to delete this activity?',
                      [
                      {
                        text: 'Cancel',
                        style: 'cancel',
                      },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                        try {
                          showLoadingDialog('Deleting...');
                          await OutboundService.deteleTransactionPickingById(activity.id);
                          fetchPicking();
                        } catch (error) {
                          showDialog('error', 'Failed to delete activity');
                        } finally {
                          hideLoadingDialog();
                        }
                        },
                      },
                      ],
                      { cancelable: true }
                    );
                  }}
                  style={{ marginLeft: 10, padding: 4 }}
                  >
                  <Ionicons name="trash" size={18} color="red" />
                  </TouchableOpacity>
                </View>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Quantity Picked</Text>
                  <Text
                    style={[
                      styles.rowValue,
                      { textAlign: 'left', color: 'green', fontWeight: '600' },
                    ]}
                  >
                    {activity.quantity_picked} {activity.uom}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Pallet Use</Text>
                  <Text style={styles.rowValue}>{activity.palletUse.pallet_code}</Text>
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
                  <Text style={styles.rowLabel}>Status</Text>
                  <Text style={[styles.rowValue, { color: 'green' }]}>{activity.status}</Text>
                </View>


                {activity.status === "INSPECTION_APPROVED" || activity.status === "PENDING" ? null : (
                  <TouchableOpacity
                    style={{
                      marginTop: 10,
                      backgroundColor: '#1F5BF2',
                      paddingVertical: 8,
                      borderRadius: 8,
                    }}
                    onPress={() => navigation.navigate("PickingDetailActivity", {
                      mode: "edit",
                      activity: activity,   // kirim data item yang mau diedit
                      itemBefore: itemBefore.item // kirim itemBefore (kalau masih dipakai)
                    })}
                  >
                    <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>
                      Edit
                    </Text>

                  </TouchableOpacity>
                )}
              </View>

            ))
          )}
        </View>
        {/* 🔥 Hitung total quantity picked */}
        {(() => {
          const totalPicked = pickingList?.reduce(
            (sum: number, item: any) => sum + item.quantity_picked,
            0
          );

          return totalPicked >= itemBefore.item.quantity ? null : (
            <TouchableOpacity style={styles.addButton} onPress={handleAddActivity}>
              <Text style={styles.addButtonText}>+ Add Activity</Text>
            </TouchableOpacity>
          );
        })()}

      </ScrollView>
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
    color: '#F26E1F',
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
