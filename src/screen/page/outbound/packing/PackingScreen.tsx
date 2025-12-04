import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View, RefreshControl } from 'react-native';
import { useAuthStore } from '../../../../store/useAuthStore';
import GlobalStyles from '../../../../util/GlobalStyles.ts';
import Colors from '../../../../constants/Colors';
import InboundList from '../../../../components/inbound/InboundList.tsx';
import { useLoadingDialogStore } from '../../../../store/useLoadingStore.ts';
import useOutboundStore from '../../../../store/useOutboundStore.ts';
import OutboundService from '../../../../service/outboundService.ts';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OutboundParamList } from '../../../navigation/outbound/OutboundNavigator.tsx';


type NavigationProp = StackNavigationProp<OutboundParamList,'OutboundMain'>;

function PackingScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const styles = GlobalStyles();
  const { user } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const {setOutbound,outbound} = useOutboundStore();
  const fetchOutbound = async () => {
    try {
      setRefreshing(true);
      showLoadingDialog("Loading List Outbound Planning")
      // const outboundList = await OutboundService.getOutboundList(user?.id ?? '');
      // setOutbound(outboundList)
      // console.log("outbound List",outboundList)
    } catch (error) {
      hideLoadingDialog()
      console.error('Error fetching outbound data:', error);
      Alert.alert(
        'Error',
        'Failed to fetch outbound data. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    }finally {
      hideLoadingDialog()
      setRefreshing(false);
    }
  }

  const OutboundListDataWithRole = outbound?.data?.map((item: any) => {
    const userId = user?.id;
    let role = '';
    if (item.checker_leader?.id === userId && item.checkers?.some((checker: any) => checker.id === userId)) {
      role = 'Checker and Leader';
    } else if (item.checker_leader?.id === userId) {
      role = 'Leader';
    } else if (item.checkers?.some((checker: any) => checker.id === userId)) {
      role = 'Checker';
    }
    return {
      id: item.id,
      title: item.inbound_plan?.inbound_planning_no,
      status: item.inbound_plan?.plan_status,
      statusColor: '', // Set as needed
      role,
      client_name: item.inbound_plan?.client_name || '',
      task_type: item.inbound_plan?.task_type || '',
      ...item,
    };
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        await fetchOutbound()
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    initialize();
  },[user])

  return (
    <View style={{ flex: 1, backgroundColor: Colors.secondaryColor }}>
      {/* Header */}
      <View style={styles.headerHome}>
        <View style={styles.profileSection}>
          <Text style={styles.profileText}>Hi! {user?.firstName}</Text>
          <Text style={styles.profileSubtext}>
            Selamat beraktifitas, jaga selalu kesehatan rumah tanggamu
          </Text>
        </View>
      </View>
      {/* Main Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.menuContainer}
        stickyHeaderIndices={[2]}
        style={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchOutbound}
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
              List Outbound Planning
            </Text>
          </View>
          {OutboundListDataWithRole?.map((item: any) => (
            <InboundList
              key={item.id}
              title={item.title}
              // client_name={item.client_name}
              // task_type={item.task_type}
              status={item.status}
              statusColor={item.statusColor}
              role={item.role}
              onClick={() => {
                navigation.navigate('OutboundAssign', { item });
              }}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default PackingScreen;
