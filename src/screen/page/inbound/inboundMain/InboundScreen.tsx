import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { useAuthStore } from '../../../../store/useAuthStore.ts';
import GlobalStyles from '../../../../util/GlobalStyles.ts';
import Colors from '../../../../constants/Colors.ts';
import InboundList from '../../../../components/inbound/InboundList.tsx';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { InboundParamList } from '../../../navigation/inbound/InboundNavigator.tsx';
import { useLoadingDialogStore } from '../../../../store/useLoadingStore.ts';
import InboundCard from '../../../../components/inbound/InboundListCard.tsx';
import InboundServices from '../../../../service/inboundServices.ts';

type NavigationProp = StackNavigationProp<InboundParamList,'InboundMain'>;

function InboundScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [inboundList, setInboundList] = useState<any[]>([]);
  const styles = GlobalStyles();
  const { user } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();

  const fetchInbound = async () => {
    try {
      setRefreshing(true);
      showLoadingDialog("Loading List Inbound Planning")
      const response = await InboundServices.getInboundList();
      setInboundList(response?.data|| []);
      console.log('Inbound data fetched successfully:', response.data);
    } catch (error) {
      hideLoadingDialog()
      console.error('Error fetching inbound data:', error);
      Alert.alert(
        'Error',
        'Failed to fetch inbound data. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      hideLoadingDialog()
      setRefreshing(false);
    }
  }


  useEffect(() => {
    const initialize = async () => {
      try {
        await fetchInbound()
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    initialize();
  },[])

  return (
    <View style={{ flex: 1, backgroundColor: Colors.secondaryColor }}>
      <ScrollView
        contentContainerStyle={styles.menuContainer}
        stickyHeaderIndices={[2]}
        style={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={()=> {
              fetchInbound()
            }}
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
            <Text style={styles.activitiesHeaderText}>List Inbound Planning</Text>
          </View>
          {inboundList.map((item: any) => {
            let statusColor;
            if (item.status === 'CREATED') {
              statusColor = '#228B22';
            } else if (item.status === 'In Progress') {
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
              role={"Warehouse Staff"}
              status={item.status}
              statusColor={statusColor}
              onClick={() => navigation.navigate('InboundDetail', { item })}
              />
            );
            })}
        </View>
      </ScrollView>
    </View>
  );
}

export default InboundScreen;
