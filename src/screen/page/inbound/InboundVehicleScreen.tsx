import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
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
import GlobalStyles from '../../../util/GlobalStyles.ts';
import Colors from '../../../constants/Colors';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { InboundParamList } from '../../navigation/InboundNavigator.tsx';
import VehicleList from '../../../components/VehicleList.tsx';
import { StackNavigationProp } from '@react-navigation/stack';
import DatePicker from 'react-native-date-picker';
import Ionicons from "@react-native-vector-icons/ionicons";
import { useForm, Controller } from 'react-hook-form';
import ConstantService from '../../../service/constantService.ts';
import useConstantStore from '../../../store/useConstantStore.ts';

type FormInboundRouteProp = RouteProp<InboundParamList, 'InboundVehicle'>;
type FormActivityProps = {
    route: FormInboundRouteProp;
};
type NavigationProp = StackNavigationProp<InboundParamList, 'InboundMain'>;

const VEHICLE_FIELDS = [
    { name: 'carNumber', label: 'Plat Number', placeholder: 'Plat Number', rule: 'Plat Number is required' },
    { name: 'driverName', label: 'Driver Name', placeholder: 'Driver Name', rule: 'Driver Name is required' },
    { name: 'vehicleType', label: 'Vehicle Type', placeholder: 'Vehicle Type', rule: 'Vehicle Type is required' },
    { name: 'sealNumber', label: 'Seal No', placeholder: 'Seal No', rule: 'Seal Number is required' },
];
const DATE_FIELDS = [
    { name: 'arrival', label: 'Arrival', rule: 'Arrival Time cannot be null' },
    { name: 'startLoading', label: 'Start Loading', rule: 'Start Loading cannot be null' },
    { name: 'endLoading', label: 'End Loading', rule: 'End Loading cannot be null' },
    { name: 'departure', label: 'Departure', rule: 'Departure Time cannot be null' },
];

const VehicleListData = [
    { id: 1, title: 'B 123 TYX', type: 'Mini Van' },
    { id: 2, title: 'H 7833 TYY', type: 'BOX' },
    { id: 3, title: 'H 9082 PO', type: 'BOX' },
];

function InboundVehicleScreen({ route }: FormActivityProps) {
    const styles = GlobalStyles();
    const { item } = route.params;
    const {vehicle} = useConstantStore();
    const navigation = useNavigation<NavigationProp>();
    const { control, handleSubmit, formState: { errors }, reset } = useForm();

    const [modalVisible, setModalVisible] = useState(false);
    const [date, setDate] = useState(new Date());
    const [openDatePicker, setOpenDatePicker] = useState<{ [key: string]: boolean }>({});

    const memoizedVehicleList = useMemo(() => VehicleListData, []);

    const toggleModal = useCallback(() => setModalVisible(v => !v), []);
    // Removed duplicate useForm call and reset extraction

    const onSubmit = useCallback((data: any) => {
        try{
            console.log('Submitted JSON:', JSON.stringify(data, null, 2));
            // Reset all fields after submit
            reset(); // Reset all fields after submit
            setDate(new Date());
            setOpenDatePicker({});
        }catch(error){
            console.error('Error submitting form:', error);
            return;
        }finally {
            setModalVisible(false);
        }

    }, [reset]);

  useEffect(() => {
    ConstantService.getVehicleType()
    console.log("data yang dibawa",item)
  }, []);

        const renderTextField = useCallback(
            (field: any) => {
                if (field.name === 'vehicleType') {
                    return (
                        <Controller
                            key={field.name}
                            control={control}
                            name={field.name}
                            rules={{ required: field.rule }}
                            render={({ field: { value, onChange } }) => (
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                                    <Text style={{ marginRight: 8, width: 90 }}>{field.label}</Text>
                                    <View style={{ flex: 1 }}>
                                        <View style={[style.input, { padding: 0, justifyContent: 'center' }]}>
                                            <Picker
                                                selectedValue={value}
                                                onValueChange={itemValue => onChange(itemValue)}
                                                style={{ width: '100%' }}
                                            >
                                                <Picker.Item label="Select Type" value="" />
                                                {vehicle?.map((option: { id: string; vehicle_type: string }) => (
                                                    <Picker.Item key={option.id} label={option.vehicle_type} value={option.id} />
                                                ))}
                                            </Picker>
                                        </View>
                                    </View>
                                </View>
                            )}
                        />
                    );
                }
                return (
            <Controller
                key={field.name}
                control={control}
                name={field.name}
                rules={{ required: field.rule }}
                render={({ field: { value, onChange } }) => (
                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                        <Text style={{ marginRight: 8, width: 90 }}>{field.label}</Text>
                        <TextInput
                            style={[style.input, { flex: 1 }]}
                            placeholder={field.placeholder}
                            value={value}
                            onChangeText={onChange}
                        />
                    </View>
                )}
            />
                );
            },
        [control]
    );

    const renderDateField = useCallback(
        (field: any) => (
            <View key={field.name} style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                <Controller
                    control={control}
                    name={field.name}
                    rules={{ required: field.rule }}
                    render={({ field: { value, onChange } }) => (
                        <>
                            <Text style={{ marginRight: 8, width: 90 }}>{field.label}</Text>
                            <TextInput
                                style={[style.input, { flex: 1, marginRight: 8 }]}
                                placeholder={field.label}
                                value={value ? new Date(value).toLocaleString() : ''}
                                editable={false}
                            />
                            <Ionicons
                                size={25}
                                color={Colors.secondaryColor}
                                name={'calendar'}
                                onPress={() => setOpenDatePicker(prev => ({ ...prev, [field.name]: true }))}
                                style={{ marginLeft: 4 }}
                            />
                            <DatePicker
                                modal
                                open={!!openDatePicker[field.name]}
                                date={value ? new Date(value) : date}
                                onConfirm={(d) => {
                                    setOpenDatePicker(prev => ({ ...prev, [field.name]: false }));
                                    setDate(d);
                                    onChange(d);
                                }}
                                onCancel={() => setOpenDatePicker(prev => ({ ...prev, [field.name]: false }))}
                            />
                        </>
                    )}
                />
            </View>
        ),
        [control, date, openDatePicker]
    );

    return (
        <View style={{ flex: 1, backgroundColor: Colors.secondaryColor }}>
            <View style={styles.headerHome}>
                <View style={styles.profileSection}>
                    <Text style={styles.profileText}>{item.title || 'Undefined'}</Text>
                </View>
            </View>
            <ScrollView contentContainerStyle={styles.menuContainer} stickyHeaderIndices={[2]}>
                <View style={styles.menuCard}>
                    <View style={[styles.activitiesHeader, { borderBottomWidth: 2, borderBottomColor: '#666' }]}>
                        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                            <Text style={styles.activitiesHeaderText}>List Vehicle</Text>
                            <TouchableOpacity onPress={toggleModal}>
                                <Text style={{ fontSize: 24, color: Colors.secondaryColor }}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {memoizedVehicleList.map(vehicle => (
                        <VehicleList
                            key={vehicle.id}
                            onClick={() => navigation.navigate('InboundDetail', { item, vehicle })}
                            title={vehicle.title}
                            type={vehicle.type}
                            statusColor="#E5FFF2"
                        />
                    ))}
                </View>
            </ScrollView>

            <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={toggleModal}>
                <View style={style.modalContainer}>
                    <View style={style.modalContent}>
                        <Text style={style.modalTitle}>Add Vehicle Details</Text>
                        {VEHICLE_FIELDS.map(field => (
                            <View key={field.name} style={{ width: '100%' }}>
                                {renderTextField(field)}
                                {typeof errors[field.name]?.message === 'string' ? (
                                    <Text style={style.errorText}>
                                        {errors[field.name]?.message as string}
                                    </Text>
                                ) : null}
                            </View>
                        ))}
                        {DATE_FIELDS.map(field => (
                            <View key={field.name} style={{ width: '100%' }}>
                                {renderDateField(field)}
                                {typeof errors[field.name]?.message === 'string' ? (
                                    <Text style={style.errorText}>
                                        {errors[field.name]?.message as string}
                                    </Text>
                                ) : null}
                            </View>
                        ))}
                        <View style={style.modalButtons}>
                            <TouchableOpacity style={style.modalButton} onPress={handleSubmit(onSubmit)}>
                                <Text style={style.modalButtonText}>Submit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={style.modalButton} onPress={toggleModal}>
                                <Text style={style.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
      backgroundColor:'#fff',
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

export default InboundVehicleScreen;
