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

type NavigationProp = StackNavigationProp<MoveLocationParamList, 'MoveLocationMain'>;

function MoveLocationScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [MoveLocationList, setMoveLocationList] = useState<any[]>([]);

  const styles = GlobalStyles();
  const { user } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const showDialog = useDialogStore((state) => state.showDialog);

  const fetchMoveLocation = async () => {
    try {
      setRefreshing(true);
      showLoadingDialog('Loading List MoveLocation Planning');
    //   const response = await MoveLocationServices.getMoveLocationList(selectedFilter || 'CREATED');
      setMoveLocationList([]);
    } catch (error) {
      hideLoadingDialog();
      showDialog('error', 'Error while Fetching Data MoveLocation!');
    } finally {
      hideLoadingDialog();
      setRefreshing(false);
    }
  };

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
            onRefresh={fetchMoveLocation}
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
              List MoveLocation Planning
            </Text>
          </View>

          {/* 📦 List Card */}
          {MoveLocationList.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: '#888', fontSize: 16 }}>There is no data</Text>
            </View>
          ) : (
            MoveLocationList.map((item: any) => {
              let statusColor;
              if (item.status === 'CREATED') {
                statusColor = '#228B22';
              } else if (item.status === 'COMPLETED') {
                statusColor = '#FFB347';
              } else {
                statusColor = '#696969';
              }

              return (
                <>
                 <MovementCard
                  key={item.id}
                  Title='MOVEMENT'
                  source={item.MoveLocation_number}
                  destination={item.license_plate}
                  date={item.arrival_date}
                  status={item.status}
                  statusColor={statusColor}
                  onClick={() => 
                  console.log('Clicked MoveLocation:', item)
                    // navigation.navigate('MoveLocationDetail', { item })
                }
                />
                
                </>
               
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
  searchInput: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  filterText: {
    fontSize: 13,
    color: '#333',
  },
});
