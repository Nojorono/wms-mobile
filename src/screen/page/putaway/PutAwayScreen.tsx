import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import GlobalStyles from '../../../util/GlobalStyles.ts';
import Colors from '../../../constants/Colors';
import InboundList from '../../../components/inbound/InboundList.tsx';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { InboundParamList } from '../../navigation/InboundNavigator.tsx';
import ConstantService from '../../../service/constantService.ts';
import useConstantStore from '../../../store/useConstantStore.ts';
import InboundServices from '../../../service/inboundServices.ts';
import useInboundStore from '../../../store/useInboundStore.ts';
import { inboundListData } from '../../../dummy/inboundData';
import { useLoadingDialogStore } from '../../../store/useLoadingStore.ts';
import { PutAwayParamList } from '../../navigation/PutAwayNavigator.tsx';
import usePutAwayStore from '../../../store/usePutAwayStore.ts';
import PutAwayService from '../../../service/putAwayService.ts';


type NavigationProp = StackNavigationProp<PutAwayParamList,'PutAwayMain'>;

function PutAwayScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const styles = GlobalStyles();
  const { user } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();
  const {setVehicle} = useConstantStore();
  const {setPutAway,putAway} = usePutAwayStore();
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();

  const fetchPutAway = async () => {
    try {
      setRefreshing(true);
      showLoadingDialog("Loading List PutAway Planning")
     const putAwayList = await PutAwayService.getPutAwayList(user?.id ?? '');
     setPutAway(putAwayList)
      console.log("putaway List",putAway)
    } catch (error) {
      hideLoadingDialog()
      console.error('Error fetching putAway data:', error);
      Alert.alert(
        'Error',
        'Failed to fetch putaway data. Please check your connection and try again.',
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
        await fetchPutAway()
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
            onRefresh={fetchPutAway}
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
          {putAway?.data.map((item:any )=> (
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

export default PutAwayScreen;
