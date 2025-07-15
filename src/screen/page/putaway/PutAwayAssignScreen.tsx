// InboundVehicleScreen.tsx
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import VehicleList from '../../../components/inbound/VehicleList.tsx';
import { useAuthStore } from '../../../store/useAuthStore.ts';
import { useLoadingDialogStore } from '../../../store/useLoadingStore.ts';
import GlobalStyles from '../../../util/GlobalStyles.ts';
import { StackNavigationProp } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import { PutAwayParamList } from '../../navigation/PutAwayNavigator.tsx';

type FormPutAwayRouteProp = RouteProp<PutAwayParamList, 'PutAwayAssign'>;
type FormActivityProps = {
  route: FormPutAwayRouteProp;
};
type NavigationProp = StackNavigationProp<PutAwayParamList, 'PutAwayMain'>;
function PutAwayAssignScreen( { route }: FormActivityProps ) {
  const styles = GlobalStyles();
  const { item } = route.params;
  const { user } = useAuthStore();
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);

  const [transporter, setTransporter] = useState<any>();

  const initialize = async () => {
    try {
      setRefreshing(true);
      showLoadingDialog("Loading...");

      // const dataTransporter = await InboundServices.getTransporterList(item.inbound_plan_id);
      // setTransporter(dataTransporter);
    } catch (error) {
      hideLoadingDialog();
      console.error('Initialization error:', error);
    } finally {
      setRefreshing(false);
      hideLoadingDialog();
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.secondaryColor }}>
      <View style={styles.headerHome}>
        <View style={styles.profileSection}>
          <Text style={styles.profileText}>{item.title || 'Undefined'}</Text>
        </View>
      </View>
      <ScrollView style={styles.scrollViewContent} contentContainerStyle={styles.menuContainer} refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={initialize}
          colors={[Colors.primeColor]}

        />
      }>
        <View style={styles.menuCard}>
          <View style={[styles.activitiesHeader, { borderBottomWidth: 2, borderBottomColor: '#666' }]}>
            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <Text style={styles.activitiesHeaderText}>List Vehicle</Text>
              <TouchableOpacity
                onPress={() => {
                  // Navigate to the new screen with empty values
                  // navigation.navigate('InboundInputVehicle', {
                  //   item:item,
                  //   mode: 'add', // Use this to indicate the form is for adding
                  //   initialValues: {
                  //     transporter_code_number: '',
                  //     transporter_name: '',
                  //     vehicle_id: '',
                  //     transporter_phone: '',
                  //     transporter_seal_number: '',
                  //     arrival_time: '',
                  //     unloading_start_time: '',
                  //     unloading_end_time: '',
                  //     departure_time: '',
                  //   },
                  // });
                }}
              >
                <Text style={{ fontSize: 24 }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          {transporter?.data.map((vehicle: any) => (
            <VehicleList
              key={vehicle.id}
              title={vehicle.transporter_code_number}
              type={vehicle.vehicle.vehicle_type}
              statusColor="#E5FFF2"
              onClickInbound={() =>{
                // navigation.navigate('InboundDeliveryOrder', { item, vehicle })
              }}
              onClickVehicle={() => {
                // When clicking a vehicle, navigate to the form pre-filled with data
                // navigation.navigate('InboundInputVehicle', {
                //   item:item,
                //   mode: 'edit',
                //   initialValues: {
                //     transporter_code_number: vehicle.transporter_code_number,
                //     transporter_name: vehicle.transporter_name,
                //     vehicle_id: vehicle.vehicle.id,
                //     transporter_phone: vehicle.transporter_phone,
                //     transporter_seal_number: vehicle.transporter_seal_number,
                //     arrival_time: vehicle.arrival_time,
                //     unloading_start_time: vehicle.unloading_start_time,
                //     unloading_end_time: vehicle.unloading_end_time,
                //     departure_time: vehicle.departure_time,
                //   },
                // });
              }}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default PutAwayAssignScreen;
