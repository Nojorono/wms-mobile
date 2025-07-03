import React, { useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import GlobalStyles from '../../../util/GlobalStyles.ts';
import Colors from '../../../constants/Colors';
import InboundList from '../../../components/InboundList.tsx';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { InboundParamList } from '../../navigation/InboundNavigator.tsx';
import ConstantService from '../../../service/constantService.ts';
import useConstantStore from '../../../store/useConstantStore.ts';
import InboundServices from '../../../service/inboundServices.ts';
import useInboundStore from '../../../store/useInboundStore.ts';
import { inboundListData } from '../../../dummy/inboundData';
import { useLoadingDialogStore } from '../../../store/useLoadingStore.ts';


type NavigationProp = StackNavigationProp<InboundParamList,'InboundMain'>;

function InboundScreen() {
  const styles = GlobalStyles();
  const { user } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();
  const {setVehicle} = useConstantStore();
  const {setInbound,inbound} = useInboundStore();
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();

  const fetchInbound = async () => {
    try {
      showLoadingDialog("Loading List Inbound Planning")
     const inboundList = await InboundServices.getInboundList(user?.id ?? '');
     setInbound(inboundList)
      console.log("inbound List",inbound)
    } catch (error) {
      hideLoadingDialog()
      console.error('Error fetching inbound data:', error);
      Alert.alert(
        'Error',
        'Failed to fetch inbound data. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    }finally {
      hideLoadingDialog()
    }
  }

  const fetchConstants = async () => {
    try {
      try {
        const getVehicleType = await ConstantService.getVehicleType();
        setVehicle(getVehicleType.data);
      } catch (err) {
        console.error('Error fetching vehicle types:', err);
        throw new Error('Failed to fetch vehicle types');
      }
    } catch (error) {
      console.error('Error fetching constants:', error);
      Alert.alert(
        'Error',
        'Failed to fetch data. Please check your connection and try again.',
        [{text: 'OK'}]
      );
    }
  }

  const inboundListDataWithRole = inbound?.data?.map((item: any) => {
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
        await fetchConstants();
        await fetchInbound()
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
          <Text style={styles.profileText}>Hi! Handsome</Text>
          <Text style={styles.profileSubtext}>
            Selamat beraktifitas, jaga selalu kesehatan rumah tanggamu
          </Text>
        </View>
      </View>
      {/* Main Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.menuContainer}
        stickyHeaderIndices={[2]}
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
          {inboundListDataWithRole?.map((item:any )=> (
            <InboundList
              key={item.id}
              title={item.title}
              client_name={item.client_name}
              task_type={item.task_type}
              status={item.status}
              statusColor={item.statusColor}
              role={item.role}
              onClick={()=>{navigation.navigate('InboundVehicle', { item })}}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default InboundScreen;
