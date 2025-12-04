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
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useLoadingDialogStore } from '../../../../store/useLoadingStore.ts';
import { useDialogStore } from '../../../../store/useGlobalDialog.ts';
import { InspectionParamList } from '../../../navigation/outbound/InspectionNavigator.tsx';
import OutboundCard from '../../../../components/outbound/OutboundCard.tsx';
import { outboundData, skuOutboundData } from '../../../../dummy/outboundData.js';
import OutboundService from '../../../../service/outboundService.ts';

type NavigationProp = StackNavigationProp<InspectionParamList, 'InspectionDoMain'>;

function InspectionSkuScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [InspectionList, setInspectionList] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>();

  const styles = GlobalStyles();
  const { user } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { data, dataBefore } = route.params as any;

  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const showDialog = useDialogStore((state) => state.showDialog);

  const fetchInspection = async () => {
    try {
      setRefreshing(true);
      showLoadingDialog('Loading List Inspection Planning');
      //   const response = await OutboundServices.getInspectionList(selectedFilter || 'CREATED');
      setInspectionList(data.transaction_pickings || []);
    } catch (error) {
      hideLoadingDialog();
      showDialog('error', 'Error while Fetching Data Inspection!');
    } finally {
      hideLoadingDialog();
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInspection();
    }, [selectedFilter])
  );

  // filter & search data
  const filteredList = useMemo(() => {
    return InspectionList.filter((item) => {
      const matchSearch =
        item.uom?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.status?.toLowerCase().includes(searchText.toLowerCase());

      const matchFilter = selectedFilter ? item.status === selectedFilter : true;

      return matchSearch && matchFilter;
    });
  }, [InspectionList, searchText, selectedFilter]);

  const handleLepasMemo = () => {
    try {
      Alert.alert(
        'Confirm',
        'Are you sure you want to release the memo?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: async () => {
              await OutboundService.cancelMemo(data.id);
              showDialog('success', 'Memo released successfully!');
              navigation.goBack();
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error releasing memo:', error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.secondaryColor }}>
      <ScrollView
        contentContainerStyle={styles.menuContainer}
        stickyHeaderIndices={[2]}
        style={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchInspection}
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
              List Inspection Planning
            </Text>
          </View>

          {/* 🔍 Search + Filter Row */}
          <View style={{ marginVertical: 10 }}>
            <TextInput
              style={localStyles.searchInput}
              placeholder="Search Inspection number / plate"
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#888"
            />
          </View>

          {/* 📦 List Card */}
          {filteredList.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: '#888', fontSize: 16 }}>There is no data</Text>
            </View>
          ) : (
            filteredList.map((item: any) => {
              let statusColor;
              if (item.status === 'CREATED') {
                statusColor = '#228B22';
              } else if (item.status === 'UNLOADING') {
                statusColor = '#FFB347';
              } else {
                statusColor = '#696969';
              }

              return (
                <OutboundCard
                  key={item.id}
                  title={item.quantity + ' ' + item.uom}
                  subTitle={'Week = ' + item.week_number}
                  origin={item.createdAt}
                  status={item.status}
                  statusColor={statusColor}
                  onClick={() => navigation.navigate('InspectionActivity', { data: item, dataBefore: [] })}
                />


              );
            })
          )}
        </View>
      </ScrollView>
       {/* FLOATING BUTTON */}
        <TouchableOpacity style={localStyles.floatingButton} onPress={handleLepasMemo}>
          <Text style={localStyles.floatingText}>Lepas Memo</Text>
        </TouchableOpacity>
    </View>
  );
}

export default InspectionSkuScreen;

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
  container: {
    flex: 1,
  },

  floatingButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#F26E1F', // orange
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  floatingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
