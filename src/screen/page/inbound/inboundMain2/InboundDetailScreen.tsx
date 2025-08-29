import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import GlobalStyles from '../../../../util/GlobalStyles.ts';
import Colors from '../../../../constants/Colors.ts';
import { RouteProp } from '@react-navigation/native';
import { InboundParamList } from '../../../navigation/inbound/InboundNavigator.tsx';
import Ionicons from 'react-native-vector-icons/FontAwesome5';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import { useLoadingDialogStore } from '../../../../store/useLoadingStore.ts';
import { Controller, useForm } from 'react-hook-form';
import useConstantStore from '../../../../store/useConstantStore.ts';
import { Picker } from '@react-native-picker/picker';
import ScanList from '../../../../components/inbound/ScanList.tsx';
import { useAuthStore } from '../../../../store/useAuthStore.ts';
import inboundServices from '../../../../service/inboundServices.ts';

type FormInboundRouteProp = RouteProp<InboundParamList, 'InboundDetail'>;
type FormActivityProps = {
  route: FormInboundRouteProp;
};

type Pallet = { palletNumber: string; qty: string };
type SKUForm = {
  sku: string;
  pallets: Pallet[];
};

export default function InboundDetailScreen({ route }: FormActivityProps) {
  const styles = GlobalStyles();
  const { item, vehicle, doItem } = route.params;
  const [openCam, setOpenCam] = useState(false);
  const [activeCamera, setActiveCamera] = useState<{
    skuIdx: number;
    palletIdx: number;
  } | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const { items_sku } = useConstantStore();
  const [editData, setEditData] = useState<SKUForm | null>(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const [listInboundScanning, setListInboundScanning] = useState<ListInboundScanning[]>([]);
  interface ListInboundScanning {
    id: string;
    inbound_transporter_id: string;
    organization_id: number;
    inbound_plan_id: string;
    inbound_delivery_order_id: string;
    inbound_delivery_order_item_id: string;
    item_id: string;
    checker_assign_id: string;
    actual_qty: number;
    pallet_code: string;
    status: string;
    approved_by: string | null;
    createdAt: string;
    updatedAt: string;
  }
  const { user } = useAuthStore();

  const { control, handleSubmit, setValue } = useForm<SKUForm>({
    defaultValues: { sku: '', pallets: [{ palletNumber: '', qty: '' }] },
  });

  const permission = async () => {
    try {
      await requestPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission required',
          'Please grant permission to access the camera.',
        );
        return;
      }
    } catch (error) {
      console.error('Permission Error:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await permission();
        showLoadingDialog('Loading Inbound Scanning Data');
        const response = await inboundServices.getListInboundScanning(item.inbound_plan_id);
        setListInboundScanning(response.data);
        console.log('Inbound Scanning Data:', response);
      } catch (error) {
        console.error('Error fetching data:', error);
        hideLoadingDialog()
      }finally {
        hideLoadingDialog()
      }
    };

    fetchData();
  }, []);

  // Code scanner for barcode/QR
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'code-128'],
    onCodeScanned: codes => {
      if (codes.length === 0) {
        Alert.alert('No codes found', 'Please try scanning again.');
        return;
      }
      if (activeCamera) {
        setValue(
          `pallets.${activeCamera.palletIdx}.palletNumber`,
          codes[0].value ?? '',
        );
      }
      setOpenCam(false);
      setActiveCamera(null);
    },
  });

  const onSubmit = (data: SKUForm) => {
    if (isEditMode) {
      console.log('Edited Data:', data);
      Alert.alert('Edit Data', `Edited SKU: ${data.sku}`);
      setIsEditMode(false);
      setEditData(null);
    } else {
      const [item_id, item_detail_id] = data.sku.split('|');
      const dataWithPallets = {
        inbound_transporter_id: item.inbound_transporter_id,
        inbound_delivery_order_id: doItem.id,
        inbound_delivery_order_item_id: item_detail_id,
        item_id: item_id,
        organization_id: item.inbound_plan.organization_id,
        inbound_plan_id: item.inbound_plan_id,
        checker_assign_id: item.id,
        checker_id: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        actual_qty: Number(data.pallets[0].qty),
        pallet_code: data.pallets[0].palletNumber,
      };
      console.log('Submitted Data:', dataWithPallets);
      Alert.alert(
        'Input Data',
        `id Item: ${item_detail_id}\nSKU: ${item_id}\nPallet Number: ${data.pallets[0].palletNumber}\nQty: ${data.pallets[0].qty}`,
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.secondaryColor }}>
      <View style={styles.headerHome}>
        <Modal
          visible={openCam}
          onDismiss={() => setOpenCam(false)}
          transparent
        >
          <View style={style.cameraContainer}>
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 30,
                right: 30,
                zIndex: 10,
                backgroundColor: '#fff',
                borderRadius: 20,
                padding: 8,
                elevation: 3,
              }}
              onPress={() => setOpenCam(false)}
            >
              <Ionicons name="window-close" size={28} color="#333" />
            </TouchableOpacity>
            {device && (
              <View style={{ position: 'relative', alignSelf: 'center' }}>
                <Camera
                  device={device}
                  isActive={openCam}
                  style={[style.camera, { alignSelf: 'center' }]}
                  codeScanner={codeScanner}
                />
                <View
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 250,
                    height: 250,
                    marginTop: -120,
                    borderWidth: 3,
                    borderColor: Colors.secondaryColor,
                    borderRadius: 16,
                    backgroundColor: 'rgba(0,0,0,0.0)',
                    zIndex: 20,
                  }}
                  pointerEvents="none"
                />
              </View>
            )}
          </View>
        </Modal>
        <View style={{ paddingTop: 15, alignItems: 'center' }}>
          <Text style={styles.profileText}>{item.title || 'Undefined'}</Text>
          <View style={style.row}>
            <Ionicons size={26} color={'#fff'} name={'truck'} />
            <Text style={[styles.profileText, { marginLeft: 10 }]}>
              {vehicle.transporter_code_number || 'Undefined'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.menuContainer}
        stickyHeaderIndices={[1]}
        style={styles.scrollViewContent}
      >
        <View style={styles.menuCard}>
          <View
            style={[
              styles.activitiesHeader,
              { borderBottomWidth: 1, borderBottomColor: '#ccc' },
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
              <Text style={styles.activitiesHeaderText}>
                Detail Inbound Planning
              </Text>
            </View>
          </View>
          <View style={style.container}>
            {listInboundScanning && listInboundScanning.length > 0 ? (
              listInboundScanning.map((item) => (
                <ScanList
                  key={item.id}
                  title={"item.item_id"}
                  pallet={item.pallet_code}
                  qty={item.actual_qty}
                />
              ))
            ) : (
              <View><Text>Empty Data</Text></View>
            )}
            {/*<ScanList*/}
            {/*  title={'SKU-JAZ'}*/}
            {/*  pallet={'P-01-OP'}*/}
            {/*  qty={20}*/}
            {/*  onClick={() => {*/}
            {/*    setIsEditMode(true);*/}
            {/*    setEditData({*/}
            {/*      sku: 'SKU-JAZ',*/}
            {/*      pallets: [{ palletNumber: 'P-01-OP', qty: '20' }],*/}
            {/*    });*/}
            {/*    setValue('sku', 'SKU-JAZ');*/}
            {/*    setValue('pallets.0.palletNumber', 'P-01-OP');*/}
            {/*    setValue('pallets.0.qty', '20');*/}
            {/*  }}*/}
            {/*/>*/}
          </View>
        </View>
      </ScrollView>
      <View
        style={{
          backgroundColor: '#fff',
          borderColor: '#666',
          borderTopWidth: 3,
          paddingHorizontal: 15,
          paddingTop: 8,
        }}
      >
        <View style={style.row}>
          <View style={style.col}>
            <Text style={style.label}>SKU</Text>
          </View>
          <View style={{ width: '70%' }}>
            <Picker
              selectedValue={doItem.items.id || ''}
              onValueChange={itemValue => {
                setValue(`sku`, itemValue);
              }}
              style={{ width: '100%' }}
            >
              <Picker.Item label="Select SKU" value="" />
              {Array.isArray(doItem.items) &&
                doItem.items.map((option: any) => {
                  const sku = option.item_id;
                  const skuObj = items_sku.items.find(
                    (item: any) => item.item.id === sku,
                  );
                  const skuName =
                    skuObj && skuObj.item && skuObj.item.id === sku
                      ? skuObj.item.sku
                      : '';
                  return (
                    <Picker.Item
                      key={option.item_id}
                      label={`${skuName}  with qty: ${option.qty_plan || ''}`}
                      value={`${option.item_id}|${option.id}`}
                    />
                  );
                })}
            </Picker>
          </View>
        </View>

        <View
          style={{
            borderWidth: 1,
            marginBottom: 14,
            borderColor: '#666',
          }}
        />
        {/* Pallet Input Row */}
        <View style={style.row}>
          <View style={style.col}>
            <Text style={style.label}>Pallet Number</Text>
            <Controller
              control={control}
              name={`pallets.0.palletNumber`}
              render={({ field }) => (
                <TextInput
                  style={style.input}
                  value={typeof field.value === 'string' ? field.value : ''}
                  onChangeText={field.onChange}
                  placeholder="Enter Pallet Number"
                />
              )}
            />
          </View>
          <View style={style.col}>
            <Text style={style.label}>Qty</Text>
            <Controller
              control={control}
              name={`pallets.0.qty`}
              render={({ field }) => (
                <TextInput
                  style={style.input}
                  value={typeof field.value === 'string' ? field.value : ''}
                  onChangeText={field.onChange}
                  placeholder="Enter Quantity"
                  keyboardType="numeric"
                />
              )}
            />
          </View>
          <View style={style.col}>
            <Text style={style.label}>Action</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 15,
              }}
            >
              <TouchableOpacity
                style={style.addButton}
                onPress={() => {
                  setActiveCamera({ skuIdx: 0, palletIdx: 0 });
                  setOpenCam(true);
                }}
              >
                <Ionicons
                  style={{ fontSize: 25, color: '#fff' }}
                  name={'barcode'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  style.addButton,
                  { marginLeft: 6, backgroundColor: Colors.primeColor },
                ]}
                onPress={() => handleSubmit(onSubmit)()}
              >
                <Ionicons size={18} color={'#fff'} name={'chevron-right'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '80%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondaryColor,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingLeft: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  modalButton: {
    backgroundColor: Colors.secondaryColor,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  col: {
    width: '30%',
  },
  addButton: {
    backgroundColor: Colors.secondaryColor,
    paddingVertical: 12,
    borderRadius: 8,
    width: 40,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 10,
  },
  removeButton: {
    width: 40,
    height: 50,
    marginHorizontal: 6,
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  buttons: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  camera: {
    width: 500,
    height: 500,
    borderColor: 'black',
    borderWidth: 1,
  },
  cameraContainer: {
    backgroundColor: 'white',
    padding: 80,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});
