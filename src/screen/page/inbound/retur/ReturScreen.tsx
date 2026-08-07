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
import { InboundParamList } from '../../../navigation/inbound/InboundNavigator.tsx';
import { useLoadingDialogStore } from '../../../../store/useLoadingStore.ts';
import InboundCard from '../../../../components/inbound/InboundListCard.tsx';
// import InboundServices from '../../../../service/inboundServices.ts'; // Di-comment sementara
import { useDialogStore } from '../../../../store/useGlobalDialog.ts';
import { ROLES } from '../../../../constants/Roles.ts';
import { ReturParamList } from '../../../navigation/inbound/ReturNavigator.tsx';

type NavigationProp = StackNavigationProp<ReturParamList, 'ReturMain'>;

// 1. Definisikan Filter Options
const FILTER_OPTIONS = [
  'CREATED',
  'UNLOADING',
  'INSPECTION',
  'READY_INTEGRATION'
];

// 2. Buat Dummy Data
const DUMMY_RETUR_DATA = [
  {
    id: '1',
    inbound_number: 'RET-20231001-001',
    license_plate: 'B 1234 CD',
    arrival_date: '2023-10-01',
    status: 'CREATED',
  },
  {
    id: '2',
    inbound_number: 'RET-20231002-002',
    license_plate: 'D 5678 EF',
    arrival_date: '2023-10-02',
    status: 'UNLOADING',
  },
  {
    id: '3',
    inbound_number: 'RET-20231003-003',
    license_plate: 'F 9012 GH',
    arrival_date: '2023-10-03',
    status: 'INSPECTION',
  },
  {
    id: '4',
    inbound_number: 'RET-20231004-004',
    license_plate: 'B 3456 IJ',
    arrival_date: '2023-10-04',
    status: 'CREATED',
  },
  {
    id: '5',
    inbound_number: 'RET-20231005-005',
    license_plate: 'H 7890 KL',
    arrival_date: '2023-10-05',
    status: 'READY_INTEGRATION',
  },
];

function ReturScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [returList, setReturList] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>('CREATED');

  const styles = GlobalStyles();
  const { user } = useAuthStore();
  
  // 3. Uncomment availableFilters agar tidak error saat map di UI
  const availableFilters = useMemo(() => {
    if (user?.role?.name === ROLES.HELPER) {
      // Hilangkan READY_INTEGRATION untuk HELPER (sesuai contoh komentar Anda)
      return FILTER_OPTIONS.filter((f) => f !== 'READY_INTEGRATION');
    }
    return FILTER_OPTIONS;
  }, [user]);

  const navigation = useNavigation<NavigationProp>();
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const showDialog = useDialogStore((state) => state.showDialog);

  const fetchRetur = async () => {
    try {
      setRefreshing(true);
      showLoadingDialog('Loading List Retur Planning');
      
      // 4. Simulasi delay API menggunakan Dummy Data
      setTimeout(() => {
        setReturList(DUMMY_RETUR_DATA);
        hideLoadingDialog();
        setRefreshing(false);
      }, 1000); // Simulasi loading 1 detik

      // Code asli Anda (di-comment sementara):
      // const response = await InboundServices.getInboundList(selectedFilter || 'CREATED');
      // setReturList(response?.data || []);

    } catch (error) {
      hideLoadingDialog();
      showDialog('error', 'Error while Fetching Data Retur!');
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRetur();
    }, [selectedFilter])
  );

  // filter & search data
  const filteredList = useMemo(() => {
    return returList.filter((item) => {
      const matchSearch =
        item.inbound_number?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.license_plate?.toLowerCase().includes(searchText.toLowerCase());

      const matchFilter = selectedFilter ? item.status === selectedFilter : true;

      return matchSearch && matchFilter;
    });
  }, [returList, searchText, selectedFilter]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.secondaryColor }}>
      <ScrollView
        contentContainerStyle={styles.menuContainer}
        stickyHeaderIndices={[2]}
        style={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchRetur}
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
              List Retur Planning
            </Text>
          </View>

          {/* 🔍 Search + Filter Row */}
          <View style={{ marginVertical: 10 }}>
            <TextInput
              style={localStyles.searchInput}
              placeholder="Search retur number / plate"
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#888"
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 10 }}
            >
              {availableFilters.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    localStyles.filterButton,
                    selectedFilter === filter && { backgroundColor: Colors.primeColor },
                  ]}
                  onPress={() => {
                    const newFilter = selectedFilter === filter ? null : filter;
                    setSelectedFilter(newFilter);
                  }}
                >
                  <Text
                    style={[
                      localStyles.filterText,
                      selectedFilter === filter && { color: '#fff' },
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
                <InboundCard
                  key={item.id}
                  code={item.inbound_number}
                  plate={item.license_plate}
                  date={item.arrival_date}
                  role={'Warehouse Staff'}
                  status={item.status}
                  statusColor={statusColor}
                  onClick={() => navigation.navigate('ReturDetail', { item })}
                />
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export default ReturScreen;

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