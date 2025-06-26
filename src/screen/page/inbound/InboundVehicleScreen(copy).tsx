import React, { useState } from 'react';
import {
  Modal,
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
import { RouteProp, useNavigation } from '@react-navigation/native';
import { InboundParamList } from '../../navigation/InboundNavigator.tsx';
import VehicleList from '../../../components/VehicleList.tsx';
import { StackNavigationProp } from '@react-navigation/stack';
import DatePicker from 'react-native-date-picker';
import Ionicons from "@react-native-vector-icons/ionicons";


type FormInboundRouteProp = RouteProp<
  InboundParamList,
  'InboundVehicle'
>;
type FormActivityProps = {
  route: FormInboundRouteProp;
};

type NavigationProp = StackNavigationProp<InboundParamList,'InboundMain'>;

const VehicleListData = [
  {
    id: 1,
    title: 'B 123 TYX',
    type: 'Mini Van',
  },
  {
    id: 2,
    title: 'H 7833 TYY',
    type: 'BOX',
  },
  {
    id: 3,
    title: 'H 9082 PO',
    type: 'BOX',
  },
];



function InboundVehicleScreen( { route }: FormActivityProps ) {
    const styles = GlobalStyles();
    const { user } = useAuthStore();
    const { item } = route.params;

  const navigation = useNavigation<NavigationProp>();


  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [driverName, setDriverName] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [sealNumber, setSealNumber] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [arrival, setArrival] = useState(new Date())
  const [departure, setDeparture] = useState(new Date())
  const [startLoad, setStartLoad] = useState(new Date())
  const [endLoad, setEndload] = useState(new Date())

  // Handle modal visibility
  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  // Handle form submission (optional)
  const handleFormSubmit = () => {
    console.log('Driver Name:', driverName);
    console.log('Vehicle Type:', vehicleType);
    console.log('Seal Number:', sealNumber);
    setDriverName('');
    setVehicleType('');
    setSealNumber('');
    setCarNumber('')
    closeModal(); // Close modal after submission
  };


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
              <Text style={styles.activitiesHeaderText}>List Vehicle</Text>
              <TouchableOpacity onPress={openModal}>
                <Text style={{ fontSize: 24, color: Colors.secondaryColor }}>
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {VehicleListData.map(vehicle => (
            <VehicleList
              key={vehicle.id}
              onClick={() => {
                navigation.navigate('InboundDetail', { item, vehicle})
              }}
              title={vehicle.title}
              type={vehicle.type}
              statusColor="#E5FFF2"
            />
          ))}
        </View>
      </ScrollView>
      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={style.modalContainer}>
          <View style={style.modalContent}>
            <Text style={style.modalTitle}>Add Vehicle Details</Text>

            {/* Input Fields */}
            <TextInput
              style={style.input}
              placeholder="Plat Number"
              value={carNumber}
              onChangeText={setCarNumber}
            />
            <TextInput
              style={style.input}
              placeholder="Driver Name"
              value={driverName}
              onChangeText={setDriverName}
            />
            <TextInput
              style={style.input}
              placeholder="Vehicle Type"
              value={vehicleType}
              onChangeText={setVehicleType}
            />
            <TextInput
              style={style.input}
              placeholder="Seal No"
              value={sealNumber}
              onChangeText={setSealNumber}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
              <TextInput
                style={[style.input, { flex: 1, marginRight: 8 }]}
                placeholder="Arrival Time"
                value={date.toLocaleString()}
                editable={false}
              />
              <Ionicons
                size={25}
                color={Colors.secondaryColor}
                name={'calendar'}
                onPress={() => setOpen(true)}
                style={{ marginLeft: 4 }}
              />
              <DatePicker
                  modal
                  open={open}
                  date={date}
                  onConfirm={(date) => {
                    setOpen(false)
                    setDate(date)
                  }}
                  onCancel={() => {
                    setOpen(false)
                  }}
              />
            </View>
            {/*<DatePicker date={startLoad} onDateChange={setStartLoad} />*/}
            {/*<DatePicker date={endLoad} onDateChange={setEndload} />*/}
            {/*<DatePicker date={departure} onDateChange={setDeparture} />*/}

            {/* Buttons */}
            <View style={style.modalButtons}>
              <TouchableOpacity
                style={style.modalButton}
                onPress={handleFormSubmit}
              >
                <Text style={style.modalButtonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={style.modalButton} onPress={closeModal}>
                <Text style={style.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default InboundVehicleScreen;


const style = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '80%',
    padding: 20,
    borderRadius: 10,
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

