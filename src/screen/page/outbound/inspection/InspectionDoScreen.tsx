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
import OutboundCard from '../../../../components/outbound/OutboundCard.tsx';
import { outboundData } from '../../../../dummy/outboundData.js';
import { InspectionParamList } from '../../../navigation/outbound/InspectionNavigator.tsx';
import OutboundService from '../../../../service/outboundService.ts';

type NavigationProp = StackNavigationProp<InspectionParamList, 'InspectionDoMain'>;

function InspectionDoScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [InspectionList, setInspectionList] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>();

  const styles = GlobalStyles();
  const { user } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const showDialog = useDialogStore((state) => state.showDialog);

  const fetchInspection = async () => {
    try {
      setRefreshing(true);
      showLoadingDialog('Loading List Inspection Planning');
      const data:any= {
        limit:100,
        // status:"PENDING"
      }
      const response = await OutboundService.getOutboundDoList(data);
      setInspectionList(response.data || []);
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
        item.outbound_do_number?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.origin?.toLowerCase().includes(searchText.toLowerCase());

      const matchFilter = selectedFilter ? item.status === selectedFilter : true;

      return matchSearch && matchFilter;
    });
  }, [InspectionList, searchText, selectedFilter]);

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
              List Inspection Outbound
            </Text>
          </View>

          {/* 🔍 Search + Filter Row */}
          <View style={{ marginVertical: 10 }}>
            <TextInput
              style={localStyles.searchInput}
              placeholder="Search Inspection Outbound number"
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
              if (item.status === 'APPROVED') {
                statusColor = '#228B22';
              } else if (item.status === 'PENDING') {
                statusColor = '#FFB347';
              }  else if (item.status === 'IN_PROGRESS') {
                statusColor = '#477bffff';
              } else {
                statusColor = '#696969';
              }

              return (
                <OutboundCard
                  key={item.id}
                  title={item.outbound_do_number}
                  subTitle={item.origin}
                  origin={item.delivery_date}
                  status={item.status}
                  statusColor={statusColor}
                  // onClick={() => navigation.navigate('InspectionMemo', { item })}
                  onClick={() => navigation.navigate('NewInspectionMemo', { item })}
                />
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export default InspectionDoScreen;

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
