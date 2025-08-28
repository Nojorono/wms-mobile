import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import GlobalStyles from '../../../../util/GlobalStyles.ts';
import Colors from '../../../../constants/Colors';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { InboundParamList } from '../../../navigation/inbound/InboundNavigator.tsx';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../../../store/useAuthStore.ts';
import { useLoadingDialogStore } from '../../../../store/useLoadingStore.ts';
import DeliveryLetterList from '../../../../components/inbound/DeliveryLetterList.tsx';
import InboundServices from '../../../../service/inboundServices.ts';

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
    formState: { errors },
    reset,
  } = useForm();
  const [deliveryOrder, setDeliveryOrder] = useState<any>();
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const [refreshing, setRefreshing] = useState(false);

  const initialize = async () => {
    try {
      setRefreshing(true);
      showLoadingDialog('Loading...');
      const dataDo = await InboundServices.getInboundDeliveryOrder(
        item.inbound_plan_id,
      );
      setDeliveryOrder(dataDo);
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
    console.log(item);
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={initialize}
            colors={[Colors.primeColor]}
          />
        }
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
              <Text style={{ fontSize: 22, fontWeight: 'bold' }}>
                List Surat Jalan
              </Text>
              <TouchableOpacity
                onPress={() => {
                  // Navigate to the new screen with empty values
                  navigation.navigate('InboundInputDO', {
                    item: item,
                    mode: 'add', // Use this to indicate the form is for adding
                    initialValues: {
                      inbound_plan_id: '',
                      inbound_transporter_id: '',
                      number_delivery_order: '',
                    },
                  });
                }}
              >
                <Text style={{ fontSize: 24 }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          {deliveryOrder?.data?.map((doItem: any) => (
            <DeliveryLetterList
              key={doItem.id}
              title={doItem.number_delivery_order}
              type={doItem.items.length || ''}
              onClick={() => {
                navigation.navigate('InboundInputDO', {
                  item: item,
                  mode: 'edit',
                  initialValues: {
                    inbound_delivery_order_id: doItem.id,
                    inbound_plan_id: doItem.inbound_plan_id,
                    inbound_transporter_id:  doItem.inbound_transporter_id,
                    number_delivery_order: doItem.number_delivery_order,
                    items: doItem.items, // pass the items array
                  },
                });
              }}
              onProcess={() => {
                navigation.navigate('InboundDetail', { item, vehicle, doItem });
              }}
            />
          ))}
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
