import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthStore } from '../../../../store/useAuthStore';
import GlobalStyles from '../../../../util/GlobalStyles.ts';
import Colors from '../../../../constants/Colors';
import { RouteProp } from '@react-navigation/native';
import { InboundParamList } from '../../../navigation/inbound/InboundNavigator.tsx';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/FontAwesome5';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import InboundServices from '../../../../service/inboundServices.ts';
import { useLoadingDialogStore } from '../../../../store/useLoadingStore.ts';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import useConstantStore from '../../../../store/useConstantStore.ts';

type FormInboundRouteProp = RouteProp<InboundParamList, 'InboundDetail'>;
type FormActivityProps = {
  route: FormInboundRouteProp;
};

type Pallet = { palletNumber: string; qty: string };
type SKUForm = {
  sku: string;
  pallets: Pallet[];
};
type InboundForm = {
  items: SKUForm[];
};

export default function InboundDetailScreen({ route }: FormActivityProps) {
  const styles = GlobalStyles();
  const { item, vehicle, doItem } = route.params;
  const [detailInbound, setDetailInbound] = useState<any>();
  const [openCam, setOpenCam] = useState(false);
  const [activeCamera, setActiveCamera] = useState<{ skuIdx: number; palletIdx: number } | null>(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const { items_sku, uom } = useConstantStore();

  const { control, handleSubmit, setValue, getValues, reset } = useForm<InboundForm>({
    defaultValues: { items: [] },
  });

  // Dynamically create field arrays for each SKU
  const [skuFieldArrays, setSkuFieldArrays] = useState<any[]>([]);

  const permission = async () => {
    try {
      await requestPermission();
      if (!hasPermission) {
        Alert.alert('Permission required', 'Please grant permission to access the camera.');
        return;
      }
    } catch (error) {
      console.error('Permission Error:', error);
    }
  };

  useEffect(() => {
    permission();
    const initialize = async () => {
      try {
        showLoadingDialog("Loading...");
        setDetailInbound(doItem.items);

        // Prepare form default values
        const items: SKUForm[] = (doItem.items || []).map((detail: any) => ({
          sku: detail?.item?.sku ?? detail?.item ?? '',
          pallets: [{ palletNumber: '', qty: '' }],
        }));
        reset({ items });
        // Removed useFieldArray from here to comply with React Hooks rules
      } catch (error) {
        console.error('Initialization error:', error);
        hideLoadingDialog();
      } finally {
        hideLoadingDialog();
      }
    };
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log('items_sku:', items_sku);
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
          `items.${activeCamera.skuIdx}.pallets.${activeCamera.palletIdx}.palletNumber`,
          codes[0].value ?? ''
        );
      }
        setOpenCam(false);
      setActiveCamera(null);
    },
  });

  const handleAddPallet = (skuIdx: number, palletIdx: number) => {
    const pallets = getValues(`items.${skuIdx}.pallets`);
    setValue(`items.${skuIdx}.pallets`, [
      ...pallets.slice(0, palletIdx + 1),
      { palletNumber: '', qty: '' },
      ...pallets.slice(palletIdx + 1),
    ]);
  };

  const handleRemovePallet = (skuIdx: number, palletIdx: number) => {
    const pallets = getValues(`items.${skuIdx}.pallets`);
    if (pallets.length > 1) {
      setValue(
        `items.${skuIdx}.pallets`,
        pallets.filter((_: any, idx: number) => idx !== palletIdx)
      );
      }
  };

  const onSubmit = (data: InboundForm) => {
    const collectedData: any[] = [];
    for (const item of data.items) {
      for (const pallet of item.pallets) {
        if (!pallet.palletNumber || !pallet.qty) {
          Alert.alert('Validation', 'All pallet fields must be filled!');
          return;
        }
        collectedData.push({
          sku: item.sku,
          palletNumber: pallet.palletNumber,
          qty: pallet.qty,
        });
      }
    }
    console.log('Collected Data:', collectedData);
    Alert.alert('Success', 'Form submitted successfully!');
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.secondaryColor }}>
      <View style={styles.headerHome}>
        <Modal visible={openCam} onDismiss={() => setOpenCam(false)} transparent>
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

      <ScrollView contentContainerStyle={styles.menuContainer} stickyHeaderIndices={[2]} style={styles.scrollViewContent}>
        <View style={styles.menuCard}>
          <View style={[styles.activitiesHeader, { borderBottomWidth: 1, borderBottomColor: '#ccc' }]}>
            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <Text style={styles.activitiesHeaderText}>Detail Inbound Planning</Text>
            </View>
          </View>
          <View style={style.container}>
            {/* Map over inbound items */}
            {Array.isArray(detailInbound) &&
              detailInbound.map((detail: any, skuIdx: number) => {
                const sku = detail.item_id;
                const skuObj = items_sku.items.find((item: any) => item.item.id === sku);
                const skuName = skuObj && skuObj.item && skuObj.item.id === sku ? skuObj.item.sku : '';
                console.log('skuName:', items_sku.items);

                return (
                  <View key={detail.id} style={{ borderWidth: 1, borderColor: '#666', borderRadius: 8, paddingHorizontal: 15, paddingTop: 8, marginBottom: 20 }}>
                    <View style={style.row}>
                      <View style={style.col}>
                        <Text style={style.label}>SKU</Text>
                        <Text style={style.label}>{skuName ?? ''}</Text>
                      </View>
                      <View style={style.col}>
                        <Text style={style.label}>QTY</Text>
                        <Text style={style.label}>{detail.qty_plan}</Text>
                      </View>
                      <View style={style.col}>
                        <Text style={style.label}>Total Scan</Text>
                        <Controller
                          control={control}
                          name={`items.${skuIdx}.pallets`}
                          render={({ field }) => (
                            <Text style={style.label}>{field.value.length}</Text>
                          )}
                        />
                      </View>
                      <TouchableOpacity
                        style={style.addButton}
                        onPress={() => {
                          const pallets = getValues(`items.${skuIdx}.pallets`);
                          handleAddPallet(skuIdx, pallets.length - 1);
                        }}
                      >
                        <Text style={{ fontSize: 15, color: '#fff' }}>+</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={{ borderWidth: 1, marginBottom: 14, borderColor: '#666' }} />
                    {/* Pallet Input Rows */}
                    <Controller
                      control={control}
                      name={`items.${skuIdx}.pallets`}
                      render={({ field }) => (
                        <>
                          {field.value.map((pallet: Pallet, palletIdx: number) => (
                            <View key={palletIdx} style={style.row}>
                        <View style={style.col}>
                                {palletIdx === 0 && <Text style={style.label}>Pallet Number</Text>}
                                <Controller
                                  control={control}
                                  name={`items.${skuIdx}.pallets.${palletIdx}.palletNumber`}
                                  render={({ field: fieldPallet }) => (
                          <TextInput
                            style={style.input}
                                      value={fieldPallet.value}
                                      onChangeText={fieldPallet.onChange}
                            placeholder="Enter Pallet Number"
                          />
                                  )}
                                />
                        </View>
                        <View style={style.col}>
                                {palletIdx === 0 && <Text style={style.label}>Qty</Text>}
                                <Controller
                                  control={control}
                                  name={`items.${skuIdx}.pallets.${palletIdx}.qty`}
                                  render={({ field: fieldQty }) => (
                          <TextInput
                            style={style.input}
                                      value={fieldQty.value}
                                      onChangeText={fieldQty.onChange}
                            placeholder="Enter Quantity"
                            keyboardType="numeric"
                          />
                                  )}
                                />
                        </View>
                        <View style={style.col}>
                                {palletIdx === 0 && <Text style={style.label}>Action</Text>}
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                                  <TouchableOpacity
                                    style={style.addButton}
                                    onPress={() => {
                                      setActiveCamera({ skuIdx, palletIdx });
                                      setOpenCam(true);
                                    }}
                                  >
                              <Ionicons style={{ fontSize: 25, color: '#fff' }} name={'barcode'} />
                            </TouchableOpacity>
                                  <TouchableOpacity
                                    style={style.removeButton}
                                    onPress={() => handleRemovePallet(skuIdx, palletIdx)}
                                  >
                              <Text style={style.removeButtonText}>−</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))}
                        </>
                      )}
                    />
                  </View>
                );
              })}
            <View style={style.buttons}>
              <Button title="Clear" onPress={() => reset()} color="#d9534f" />
              <Button title="Save" onPress={handleSubmit(onSubmit)} color={Colors.primeColor} />
            </View>
          </View>
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
    fontSize: 18,
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
