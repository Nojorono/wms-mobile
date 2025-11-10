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
import InboundServices from '../../../../service/inboundServices.ts';
import { useDialogStore } from '../../../../store/useGlobalDialog.ts';

type NavigationProp = StackNavigationProp<InboundParamList, 'InboundMain'>;

const FILTER_OPTIONS = [
  'CREATED',
  'UNLOADING',
  'INSPECTION',
  'READY_INTEGRATION',
];

function InboundScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [inboundList, setInboundList] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>("CREATED");

  const styles = GlobalStyles();
  const { user } = useAuthStore();
  const availableFilters = useMemo(() => {
    if (user?.role?.name === "HELPER") {
      // Hilangkan INSPECTION untuk HELPER
      return FILTER_OPTIONS.filter((f) => f !== "READY_INTEGRATION");
    }
    return FILTER_OPTIONS;
  }, [user]);
  const navigation = useNavigation<NavigationProp>();
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const showDialog = useDialogStore((state) => state.showDialog);

  const fetchInbound = async () => {
    try {
      setRefreshing(true);
      showLoadingDialog('Loading List Inbound Planning');
      const response = await InboundServices.getInboundList(selectedFilter || 'CREATED');
      setInboundList(response?.data || []);
    } catch (error) {
      hideLoadingDialog();
      showDialog('error', 'Error while Fetching Data Inbound!');
    } finally {
      hideLoadingDialog();
      setRefreshing(false);
    }
  };

useFocusEffect(
  useCallback(() => {
    fetchInbound();
  }, [selectedFilter])
);

  // filter & search data
  const filteredList = useMemo(() => {
    return inboundList.filter((item) => {
      const matchSearch =
        item.inbound_number?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.license_plate?.toLowerCase().includes(searchText.toLowerCase());

      const matchFilter = selectedFilter ? item.status === selectedFilter : true;

      return matchSearch && matchFilter;
    });
  }, [inboundList, searchText, selectedFilter]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.secondaryColor }}>
      <ScrollView
        contentContainerStyle={styles.menuContainer}
        stickyHeaderIndices={[2]}
        style={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchInbound}
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
              List Inbound Planning
            </Text>
          </View>

          {/* 🔍 Search + Filter Row */}
          <View style={{ marginVertical: 10 }}>
            <TextInput
              style={localStyles.searchInput}
              placeholder="Search inbound number / plate"
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
                      selectedFilter === filter && { color: "#fff" },
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
                  onClick={() => navigation.navigate('InboundDetail', { item })}
                />
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export default InboundScreen;

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
