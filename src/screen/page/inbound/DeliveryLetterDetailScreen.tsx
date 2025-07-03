import React, { useCallback, useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import GlobalStyles from '../../../util/GlobalStyles.ts';
import Colors from '../../../constants/Colors';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { InboundParamList } from '../../navigation/InboundNavigator.tsx';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm } from 'react-hook-form';
import { useLoadingDialogStore } from '../../../store/useLoadingStore.ts';
import DeliveryLetterList from "../../../components/inbound/DeliveryLetterList.tsx";

type FormInboundRouteProp = RouteProp<InboundParamList, 'InboundDeliveryLetterDetail'>;
type FormActivityProps = {
  route: FormInboundRouteProp;
};
type NavigationProp = StackNavigationProp<InboundParamList, 'InboundMain'>;

function DeliveryLetterDetailScreen({ route }: FormActivityProps) {
  const styles = GlobalStyles();
  const { item , surjal } = route.params;
  const navigation = useNavigation<NavigationProp>();
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm();
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();

  const VEHICLE_FIELDS = [
    {
      name: 'transporter_code_number',
      label: 'Plat Number',
      placeholder: 'Plat Number',
      rule: 'Plat Number is required',
    },
    {
      name: 'transporter_name',
      label: 'Driver Name',
      placeholder: 'Driver Name',
      rule: 'Driver Name is required',
    },
    {
      name: 'transporter_phone',
      label: 'Phone Number',
      placeholder: 'Phone Number',
      rule: 'Driver Phone  is required',
    },
    {
      name: 'vehicle_id',
      label: 'Vehicle Type',
      placeholder: 'Vehicle Type',
      rule: 'Vehicle Type is required',
    },
    {
      name: 'transporter_seal_number',
      label: 'Seal No',
      placeholder: 'Seal No',
      rule: 'Seal Number is required',
    },
  ];
  const DATE_FIELDS = [
    {
      name: 'arrival_time',
      label: 'Arrival',
      rule: 'Arrival Time cannot be null',
    },
    {
      name: 'unloading_start_time',
      label: 'Start Loading',
      rule: 'Start Loading cannot be null',
    },
    {
      name: 'unloading_end_time',
      label: 'End Loading',
      rule: 'End Loading cannot be null',
    },
    {
      name: 'departure_time',
      label: 'Departure',
      rule: 'Departure Time cannot be null',
    },
  ];

  const initialize = async () => {
    try {
      showLoadingDialog("Loading...");
      // Add list DeliveryLetter in here

    } catch (error) {
      console.error('Initialization error:', error);
      hideLoadingDialog()
    }finally {
      hideLoadingDialog();
    }
  };

  useEffect(() => {
    initialize();
  }, []);


  return (
    <View style={{ flex: 1, backgroundColor: Colors.secondaryColor }}>
      <View style={styles.headerHome}>
        <View style={[styles.profileSection,{alignItems: 'center'}]}>
          <Text style={styles.profileText}>{item.title || 'Undefined'}</Text>
          <Text style={styles.profileText}>{surjal.title || 'Undefined'}</Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.menuContainer}
        stickyHeaderIndices={[2]}
      >
        <View style={styles.menuCard}>
          <View
            style={[
              styles.activitiesHeader,
              { borderBottomWidth: 2, borderBottomColor: '#666' },
            ]}
          >
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <Text style={styles.activitiesHeaderText}>Detail Surat Jalan</Text>
              <TouchableOpacity style={{paddingHorizontal:10}} onPress={()=>{}}>
                <Text style={{ fontSize: 24, color: Colors.secondaryColor }}>

                </Text>
              </TouchableOpacity>
            </View>
          </View>


        </View>
      </ScrollView>
    </View>
  );
}

export default DeliveryLetterDetailScreen;
