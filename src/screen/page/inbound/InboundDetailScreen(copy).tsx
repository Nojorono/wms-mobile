import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button, Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import GlobalStyles from '../../../util/GlobalStyles.ts';
import Colors from '../../../constants/Colors';
import { RouteProp } from '@react-navigation/native';
import { InboundParamList } from '../../navigation/InboundNavigator.tsx';
import { Picker } from '@react-native-picker/picker';
import Ionicons from '@react-native-vector-icons/ionicons';
import {
  Camera,
  useCameraDevice,
  useCameraPermission, useCodeScanner,
} from 'react-native-vision-camera';
import InboundServices from '../../../service/inboundServices.ts';
import ConstantService from '../../../service/constantService.ts';

type FormInboundRouteProp = RouteProp<InboundParamList, 'InboundDetail'>;
type FormActivityProps = {
  route: FormInboundRouteProp;
};

export default function InboundDetailScreen({ route }: FormActivityProps) {
  const styles = GlobalStyles();
  const { user } = useAuthStore();
  const { item, vehicle } = route.params;
  const [ detailInbound , setDetailInbound ] = useState <any>()

  const [status, setStatus] = useState('');
  const [pallets, setPallets] = useState([{ palletNumber: '', qty: '' }]);
  const [activeCameraIndex, setActiveCameraIndex] = useState<number | null>(null);
  const [activeBagIndex, setActiveBagIndex] = useState(null);
  const [openCam, setOpenCam] = useState(false);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');

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
      console.error('[Background Fetch] Task scheduling failed:', error);
    }
  };

  useEffect(() => {
    permission();
    const initialize = async () => {
      try {
        console.log('[] Initialize', vehicle);
        const response = await InboundServices.getInboundDetail(item.inbound_plan_id)
        setDetailInbound(response.data.items)
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    initialize();
  },[])

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13','code-128'],
    onCodeScanned: (codes) => {
      if (codes.length === 0) {
        Alert.alert('No codes found', 'Please try scanning again.');
        return;
      }else{
        setPallets(prevPallets => {
          const updated = [...prevPallets];
          if (activeCameraIndex !== null && updated[activeCameraIndex]) {
            updated[activeCameraIndex].palletNumber = codes[0].value ?? '';
          } else {
            updated[0].palletNumber = codes[0].value ?? '';
          }
          return updated;
        });
        setOpenCam(false);
        setActiveCameraIndex(null);
      }
    }
  });
  const handleRemovePallet = (index: any) => {
    if (index < 1) return;
    const updatedPallets = pallets.filter((_, i) => i !== index);
    setPallets(updatedPallets);
  };

  // Validate input fields before submit
  const handleSubmit = () => {
    // Check if all pallet inputs are valid
    for (let i = 0; i < pallets.length; i++) {
      if (!pallets[i].palletNumber || !pallets[i].qty) {
        Alert.alert('Validation', 'All pallet fields must be filled!');
        return;
      }
    }

    // Handle submission logic here
    Alert.alert('Success', 'Form submitted successfully!');
    // Reset form or handle the next steps
  };

  const handleAddPallet = (index: number) => {
    setPallets(prev => {
      const updated = [...prev];
      updated.splice(index, 0, { palletNumber: '', qty: '' });
      return updated;
    });
  };

  const handlePalletChange = (
    index: number,
    field: 'palletNumber' | 'qty',
    value: string,
  ) => {
    const updatedPallets = [...pallets];
    updatedPallets[index][field] = value;
    setPallets(updatedPallets);
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
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
            {device && (
              <Camera
                device={device}
                isActive={openCam}
                style={[style.camera, { alignSelf: 'center' }]}
                codeScanner={codeScanner}
              />
            )}
          </View>
        </Modal>
        <View
          style={{
            paddingTop: 15,
            alignItems: 'center',
          }}
        >
          <Text style={styles.profileText}>{item.title || 'Undefined'}</Text>
          <View style={style.row}>
            <Ionicons size={22} color={'#fff'} name={'person-circle'} />
            <Text style={[styles.profileText]}>
              {vehicle.transporter_name || 'Undefined'}
            </Text>
          </View>
          <View style={style.row}>
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
            {/* Dropdown (Status) */}
            <View style={style.formGroup}>
              <Picker
                selectedValue={status}
                style={style.input}
                onValueChange={itemValue => setStatus(itemValue)}
              >
                <Picker.Item label="Stock Type" value="" />
                <Picker.Item label="Available" value="Available" />
                <Picker.Item label="Waiting" value="Waiting" />
                <Picker.Item label="Not Available" value="Not Available" />
              </Picker>
            </View>

            {/* Map over inbound items */}
            {Array.isArray(detailInbound) && detailInbound.map((detail: any, detailIdx: any) => (
            <View
                key={detail.id}
              style={{
                borderWidth: 1,
                borderColor: '#666',
                borderRadius: 8,
                paddingHorizontal: 15,
                paddingTop: 8,
                  marginBottom: 20,
              }}
            >
                {/* ...rest of the code remains unchanged... */}
              <View style={style.row}>
                <View style={style.col}>
                  <Text style={style.label}>SKU</Text>
                    <Text style={style.label}>{detail.item.sku}</Text>
                </View>
                <View style={style.col}>
                  <Text style={style.label}>QTY</Text>
                    <Text style={style.label}>{detail.qty_plan}</Text>
                </View>
                <View style={style.col}>
                  <Text style={style.label}>Outstanding</Text>
                  <Text style={style.label}>0</Text>
                </View>
                <TouchableOpacity
                  style={style.addButton}
                  onPress={() => handleAddPallet(detailIdx)}
                >
                  <Text style={{ fontSize: 15, color: '#fff' }}>+</Text>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  borderWidth: 1,
                  marginBottom: 14,
                  borderColor: '#666',
                }}
              />
              {/* Pallet Input Rows */}
              {pallets.length > 0 &&
                pallets.map((pallet, index) => (
                  <View key={index} style={style.row}>
                    <View style={style.col}>
                      {index === 0 && (
                        <Text style={style.label}>Pallet Number</Text>
                      )}
                      <TextInput
                        style={style.input}
                        value={pallet.palletNumber}
                        onChangeText={text =>
                          handlePalletChange(index, 'palletNumber', text)
                        }
                        placeholder="Enter Pallet Number"
                      />
                    </View>
                    <View style={style.col}>
                      {index === 0 && <Text style={style.label}>Qty</Text>}
                      <TextInput
                        style={style.input}
                        value={pallet.qty}
                        onChangeText={text =>
                          handlePalletChange(index, 'qty', text)
                        }
                        placeholder="Enter Quantity"
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={style.col}>
                      {index === 0 && <Text style={style.label}>Action</Text>}
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
                            setActiveCameraIndex(index);
                            setOpenCam(true);
                          }}
                        >
                          <Ionicons
                            style={{ fontSize: 25, color: '#fff' }}
                            name={'scan-circle-outline'}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={style.removeButton}
                          onPress={() => handleRemovePallet(index)}
                        >
                          <Text style={style.removeButtonText}>−</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ))}
            <View style={style.buttons}>
              <Button title="Clear" onPress={() => {}} color="#d9534f" />
              <Button
                title="Save"
                onPress={handleSubmit}
                color={Colors.primeColor}
              />
            </View>
            </View>
            <View style={style.buttons}>
              <Button title="Clear" onPress={() => {}} color="#d9534f" />
              <Button
                title="Save"
                onPress={handleSubmit}
                color={Colors.primeColor}
              />
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
