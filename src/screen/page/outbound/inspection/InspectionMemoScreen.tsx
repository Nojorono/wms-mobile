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
import OutboundService from '../../../../service/outboundService.ts';
import MemoItemCard from '../../../../components/outbound/MemoItemCard.tsx';

type NavigationProp = StackNavigationProp<InspectionParamList, 'InspectionDoMain'>;

function InspectionMemoScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [InspectionList, setInspectionList] = useState<any>([]);
  const [mergeItemMemo, setMergeItemMemo] = useState<any>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>();
  const route = useRoute();
  const itemBefore = route.params as any

  const styles = GlobalStyles();
  const { user } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const showDialog = useDialogStore((state) => state.showDialog);


  const fetchInspection = async () => {
    try {
      setRefreshing(true);
      showLoadingDialog('Loading List Inspection Memo Planning');
      const data: any = {
        limit: 100,
        status: "PENDING"
      }
      const response = await OutboundService.getOutboundDoList(data);
      const list = response?.data || [];
      const matched = list.find((item: any) => item.id === itemBefore.item.id);
      const memos = matched?.outbound_memos || [];
      const memoItems = matched?.outbound_memo_items || [];
      const pickings = matched?.transaction_pickings;
       setMergeItemMemo(memoItems.map((item: any) => {
        const picking = pickings.find((p: any) => p.item_id === item.item_id);
        return {
          ...item,
          is_scanned: !!picking,
          picked_quantity: picking ? picking.quantity : 0,

          scan_detail: picking?.transactionScanPicking?.[0] ?? null,
        };
      }));
      console.log('Fetched Inspection Memos:', memos);

      // 🔄 Set state pakai hasil filter dari fetch
      setInspectionList(memos);
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
    return InspectionList.filter((item: any) => {
      const matchSearch =
        item.outbound_memo_number?.toLowerCase().includes(searchText.toLowerCase()) 

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
              List Inspection Memo
            </Text>
          </View>

          {/* 🔍 Search + Filter Row */}
          <View style={{ marginVertical: 10 }}>
            <TextInput
              style={localStyles.searchInput}
              placeholder="Search Inspection Memo number"
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
          title={item.outbound_memo_number}
          subTitle={item.ship_to}
          origin={item.type}
          // status={item.status}
          statusColor={statusColor}
          onClick={() => navigation.navigate('InspectionSku', { data: item, dataBefore: itemBefore })}
        />
      );
            })
          )}
        </View>
      </ScrollView>
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 30,
          left: 30,
          backgroundColor: "#F26E1F",
          width: 120,
          height: 50,
          paddingHorizontal: 20,
          borderRadius: 40,
          justifyContent: "center",
          alignItems: "center",
          elevation: 6,
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowOffset: { width: 0, height: 3 },
        }}
        onPress={() =>
          Alert.alert('Approve All Inspection Task', 'Are you sure you want Approve all of task?', [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ])
        }
      >
        <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>
          Approve Task
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default InspectionMemoScreen;

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
