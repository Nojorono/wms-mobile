import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import GlobalStyles from '../../../util/GlobalStyles.ts';
import Colors from '../../../constants/Colors';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { InboundParamList } from '../../navigation/InboundNavigator.tsx';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../../store/useAuthStore.ts';
import { useLoadingDialogStore } from '../../../store/useLoadingStore.ts';
import DeliveryLetterList from '../../../components/inbound/DeliveryLetterList.tsx';

type FormInboundRouteProp = RouteProp<InboundParamList, 'InboundDeliveryOrder'>;
type FormActivityProps = {
  route: FormInboundRouteProp;
};
type NavigationProp = StackNavigationProp<InboundParamList, 'InboundMain'>;

function DeliveryOrderScreen({ route }: FormActivityProps) {
  const styles = GlobalStyles();
  const { item, vehicle } = route.params;
  const { user } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [transporter, setTransporter] = useState<any>();
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState<{
    [key: string]: boolean;
  }>({});

  const initialize = async () => {
    try {
      showLoadingDialog('Loading...');
      // additional logic for adding delivery order
    } catch (error) {
      console.error('Initialization error:', error);
      hideLoadingDialog();
    } finally {
      hideLoadingDialog();
    }
  };

  useEffect(() => {
    console.log('PERCUMA', vehicle);
    initialize();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.secondaryColor }}>
      <View style={styles.headerHome}>
        <View style={[styles.profileSection, { alignItems: 'center' }]}>
          <Text style={styles.profileText}>{item.title || 'Undefined'}</Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Ionicons size={26} color={'#fff'} name={'car-outline'} />
            <Text style={[styles.profileText, { marginLeft: 10 }]}>
              {vehicle.transporter_code_number || 'Undefined'}
            </Text>
          </View>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.menuContainer}
        stickyHeaderIndices={[2]}
        style={styles.scrollViewContent}
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
              <TouchableOpacity onPress={() => {}}>
                <Text style={{ fontSize: 24, color: Colors.secondaryColor }}></Text>
              </TouchableOpacity>
            </View>
          </View>
          <DeliveryLetterList
            title={'SUR-JAL-01'}
            type={'onprogress'}
            onClick={() => {
              navigation.navigate('InboundDetail', { item, vehicle });
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const style = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20, // Add horizontal padding for larger modals
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.secondaryColor,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  modalButton: {
    backgroundColor: Colors.secondaryColor,
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DeliveryOrderScreen;
