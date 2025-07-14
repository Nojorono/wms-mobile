import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import GlobalStyles from '../../../util/GlobalStyles.ts';
import Colors from '../../../constants/Colors';
import InboundList from '../../../components/inbound/InboundList.tsx';
import { useLoadingDialogStore } from '../../../store/useLoadingStore.ts';
import useOutboundStore from '../../../store/useOutboundStore.ts';
import OutboundService from '../../../service/outboundService.ts';

function OutboundScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const styles = GlobalStyles();
  const { user } = useAuthStore();
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
    const {setOutbound,outbound} = useOutboundStore();
  const fetchOutbound = async () => {
    try {
      setRefreshing(true);
      showLoadingDialog("Loading List Outbound Planning")
     const outboundList = await OutboundService.getOutboundList(user?.id ?? '');
     setOutbound(outboundList)
      console.log("outbound List",outboundList)
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
            <Text style={styles.activitiesHeaderText}>List Inbound Planning</Text>
          </View>
          {outbound?.data.map((item:any )=> (
            <InboundList
              key={item.id}
              title={item.title}
              // client_name={item.client_name}
              // task_type={item.task_type}
              status={item.status}
              statusColor={item.statusColor}
              role={item.role}
              // onClick={()=>{navigation.navigate('InboundVehicle', { item })}}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default OutboundScreen;
