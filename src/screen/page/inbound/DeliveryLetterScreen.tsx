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
import VehicleList from '../../../components/inbound/VehicleList.tsx';
import { StackNavigationProp } from '@react-navigation/stack';
import DatePicker from 'react-native-date-picker';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Controller, useForm } from 'react-hook-form';
import ConstantService from '../../../service/constantService.ts';
import useConstantStore from '../../../store/useConstantStore.ts';
import InboundServices from '../../../service/inboundServices.ts';
import { useAuthStore } from '../../../store/useAuthStore.ts';
import { useLoadingDialogStore } from '../../../store/useLoadingStore.ts';
import DeliveryLetterList from "../../../components/inbound/DeliveryLetterList.tsx";

type FormInboundRouteProp = RouteProp<InboundParamList, 'InboundDeliveryLetter'>;
type FormActivityProps = {
  route: FormInboundRouteProp;
};
type NavigationProp = StackNavigationProp<InboundParamList, 'InboundMain'>;

function DeliveryLetterScreen({ route }: FormActivityProps) {
  const styles = GlobalStyles();
  const { item } = route.params;
  const navigation = useNavigation<NavigationProp>();
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm();
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();

  const surjal = {
    title: "CWH-001-POPO-SHIROYO",
    type: "ON PROGRESS",
  };

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
        <View style={styles.profileSection}>
          <Text style={styles.profileText}>{item.title || 'Undefined'}</Text>
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
              <Text style={styles.activitiesHeaderText}>List Surat Jalan</Text>
              <TouchableOpacity style={{paddingHorizontal:10}} onPress={()=>{}}>
                <Text style={{ fontSize: 24, color: Colors.secondaryColor }}>
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <DeliveryLetterList title={surjal.title} type={surjal.type} onClick={() => navigation.navigate("InboundDeliveryLetterDetail", { item , surjal})} />

        </View>
      </ScrollView>
    </View>
  );
}

export default DeliveryLetterScreen;
