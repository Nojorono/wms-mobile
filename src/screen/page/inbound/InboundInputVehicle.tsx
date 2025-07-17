// InboundInputVehicle.tsx
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import Colors from '../../../constants/Colors';
import { InboundParamList } from '../../navigation/InboundNavigator.tsx';
import { StackNavigationProp } from '@react-navigation/stack';
import GlobalStyles from '../../../util/GlobalStyles.ts';
import { Picker } from '@react-native-picker/picker';
import useConstantStore from '../../../store/useConstantStore.ts';
import Ionicons from 'react-native-vector-icons/FontAwesome5';
import DatePicker from 'react-native-date-picker';
import { useAuthStore } from '../../../store/useAuthStore.ts';

type FormInboundRouteProp = RouteProp<InboundParamList, 'InboundInputVehicle'>;
type FormActivityProps = {
  route: FormInboundRouteProp;
};
type NavigationProp = StackNavigationProp<InboundParamList, 'InboundMain'>;

function InboundInputVehicle({ route }: FormActivityProps) {
  const navigation = useNavigation<NavigationProp>();
  const stylex = GlobalStyles();
  const { vehicle } = useConstantStore();
  const [openDatePicker, setOpenDatePicker] = useState<{
    [key: string]: boolean;
  }>({});

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const { item, mode, initialValues } = route.params;
  const { user } = useAuthStore();

  // Reset form with initial values on component mount
  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const onSubmit = (data: any) => {
    // Handle form submission (e.g., send data to backend)
    if (mode === 'add') {
      data = {
        ...data,
        arrival_time: new Date(data.arrival_time).toISOString(),
        derpature_time: new Date(data.derpature_time).toISOString(),
        inbound_plan_id: item.inbound_plan_id,
        organization_id: item.inbound_plan.organization_id,
        created_by: user?.firstName + ' ' + user?.lastName,
      };

      // Add new vehicle
      console.log('Adding vehicle:', data);
    } else {
      // Update existing vehicle
      data = {
        ...data,
        inbound_plan_id: item.inbound_plan_id,
        organization_id: item.inbound_plan.organization_id,
        created_by: user?.firstName + ' ' + user?.lastName,
      };
      console.log('Editing vehicle:', data);
    }
    // navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.secondaryColor }}>
      <View style={stylex.headerHome}>
        <View style={[stylex.profileSection, { alignItems: 'center' }]}>
          <Text style={stylex.profileText}>{item.title || 'Undefined'}</Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={stylex.menuContainer}
        style={stylex.scrollViewContent}
      >
        <View style={stylex.menuCard}>
          <Text style={styles.title}>
            {mode === 'add' ? 'Add Vehicle' : 'Edit Vehicle'}
          </Text>
          <View style={styles.formContainer}>
            <Controller
              name="transporter_code_number"
              control={control}
              rules={{ required: 'Plat Number is required' }}
              render={({ field: { value, onChange } }) => (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <Text style={{ marginRight: 8, width: 90 }}>Plat Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Plat Number"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            {errors.transporter_code_number && (
              <Text style={styles.errorText}>{'error'}</Text>
            )}

            <Controller
              name="transporter_name"
              control={control}
              rules={{ required: 'Driver Name is required' }}
              render={({ field: { value, onChange } }) => (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <Text style={{ marginRight: 8, width: 90 }}>Driver Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Driver Name"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            {errors.transporter_name && (
              <Text style={styles.errorText}>{'Error'}</Text>
            )}

            <Controller
              name="transporter_phone"
              control={control}
              rules={{ required: 'Driver Phone is required' }}
              render={({ field: { value, onChange } }) => (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <Text style={{ marginRight: 8, width: 90 }}>
                    Phone Number
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            {errors.transporter_phone && (
              <Text style={styles.errorText}>{'Error'}</Text>
            )}

            <Controller
              name="vehicle_id"
              control={control}
              rules={{ required: 'Vehicle Type is required' }}
              render={({ field: { value, onChange } }) => (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <Text style={{ marginRight: 8, width: 90 }}>
                    Vehicle Type
                  </Text>
                  <View
                    style={[
                      styles.input,
                      { padding: 0, justifyContent: 'center' },
                    ]}
                  >
                    <Picker
                      selectedValue={value ?? ''}
                      onValueChange={itemValue => {
                        onChange(itemValue);
                        console.log('Selected vehicle_id:', itemValue);
                      }}
                      style={{ width: '100%' }}
                    >
                      <Picker.Item label="Select Type" value="" />
                      {Array.isArray(vehicle) &&
                        vehicle.map(
                          (option: { id: string; vehicle_type: string }) => (
                            <Picker.Item
                              key={option.id}
                              label={option.vehicle_type ?? ''}
                              value={option.id}
                            />
                          ),
                        )}
                    </Picker>
                  </View>
                </View>
              )}
            />
            {errors.vehicle_id && (
              <Text style={styles.errorText}>{'Error'}</Text>
            )}

            <Controller
              name="transporter_seal_number"
              control={control}
              rules={{ required: 'Seal Number is required' }}
              render={({ field: { value, onChange } }) => (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <Text style={{ marginRight: 8, width: 90 }}>Seal Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Seal Number"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            {errors.transporter_seal_number && (
              <Text style={styles.errorText}>{'Error'}</Text>
            )}

            <Controller
              name="arrival_time"
              control={control}
              rules={{ required: 'Arrival Time is required' }}
              render={({ field: { value, onChange, name } }) => (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <Text style={{ marginRight: 8, width: 120 }}>
                    Arrival Time
                  </Text>
                  <TextInput
                    style={[styles.input, { flex: 1, marginRight: 8 }]}
                    placeholder="Arrival Time"
                    value={value ? new Date(value).toLocaleString() : ''}
                    editable={false}
                  />
                  <Ionicons
                    size={25}
                    color={Colors.secondaryColor}
                    name={'calendar'}
                    onPress={() =>
                      setOpenDatePicker((prev: any) => ({
                        ...prev,
                        [name]: true,
                      }))
                    }
                    style={{ marginLeft: 4 }}
                  />
                  <DatePicker
                    modal
                    open={!!openDatePicker?.[name]}
                    date={value ? new Date(value) : new Date()}
                    onConfirm={d => {
                      setOpenDatePicker((prev: any) => ({
                        ...prev,
                        [name]: false,
                      }));
                      onChange(d);
                    }}
                    onCancel={() =>
                      setOpenDatePicker((prev: any) => ({
                        ...prev,
                        [name]: false,
                      }))
                    }
                  />
                </View>
              )}
            />
            {errors.arrival_time && (
              <Text style={styles.errorText}>{'Error'}</Text>
            )}

            <Controller
              name="departure_time"
              control={control}
              rules={{ required: 'Departure Time is required' }}
              render={({ field: { value, onChange, name } }) => (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <Text style={{ marginRight: 8, width: 120 }}>
                    Departure Time
                  </Text>
                  <TextInput
                    style={[styles.input, { flex: 1, marginRight: 8 }]}
                    placeholder="Departure Time"
                    value={value ? new Date(value).toLocaleString() : ''}
                    editable={false}
                  />
                  <Ionicons
                    size={25}
                    color={Colors.secondaryColor}
                    name={'calendar'}
                    onPress={() =>
                      setOpenDatePicker((prev: any) => ({
                        ...prev,
                        [name]: true,
                      }))
                    }
                    style={{ marginLeft: 4 }}
                  />
                  <DatePicker
                    modal
                    open={!!openDatePicker?.[name]}
                    date={value ? new Date(value) : new Date()}
                    onConfirm={d => {
                      setOpenDatePicker((prev: any) => ({
                        ...prev,
                        [name]: false,
                      }));
                      onChange(d);
                    }}
                    onCancel={() =>
                      setOpenDatePicker((prev: any) => ({
                        ...prev,
                        [name]: false,
                      }))
                    }
                  />
                </View>
              )}
            />
            {errors.departure_time && (
              <Text style={styles.errorText}>{'Error'}</Text>
            )}
            {mode !== 'add' ? (
              <Controller
                name="unloading_start"
                control={control}
                rules={{ required: 'Unloading Start is required' }}
                render={({ field: { value, onChange, name } }) => (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <Text style={{ marginRight: 8, width: 120 }}>
                      Unloading Start
                    </Text>
                    <TextInput
                      style={[styles.input, { flex: 1, marginRight: 8 }]}
                      placeholder="Unloading Start"
                      value={value ? new Date(value).toLocaleString() : ''}
                      editable={false}
                    />
                    <Ionicons
                      size={25}
                      color={Colors.secondaryColor}
                      name={'calendar'}
                      onPress={() =>
                        setOpenDatePicker((prev: any) => ({
                          ...prev,
                          [name]: true,
                        }))
                      }
                      style={{ marginLeft: 4 }}
                    />
                    <DatePicker
                      modal
                      open={!!openDatePicker?.[name]}
                      date={value ? new Date(value) : new Date()}
                      onConfirm={d => {
                        setOpenDatePicker((prev: any) => ({
                          ...prev,
                          [name]: false,
                        }));
                        onChange(d);
                      }}
                      onCancel={() =>
                        setOpenDatePicker((prev: any) => ({
                          ...prev,
                          [name]: false,
                        }))
                      }
                    />
                  </View>
                )}
              />
            ) : null}

            {errors.unloading_start && (
              <Text style={styles.errorText}>{'Error'}</Text>
            )}

            {mode !== 'add' ? (
              <Controller
                name="unloading_finished"
                control={control}
                rules={{ required: 'Unloading Finished is required' }}
                render={({ field: { value, onChange, name } }) => (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <Text style={{ marginRight: 8, width: 120 }}>
                      Unloading Finished
                    </Text>
                    <TextInput
                      style={[styles.input, { flex: 1, marginRight: 8 }]}
                      placeholder="Unloading Finished"
                      value={value ? new Date(value).toLocaleString() : ''}
                      editable={false}
                    />
                    <Ionicons
                      size={25}
                      color={Colors.secondaryColor}
                      name={'calendar'}
                      onPress={() =>
                        setOpenDatePicker((prev: any) => ({
                          ...prev,
                          [name]: true,
                        }))
                      }
                      style={{ marginLeft: 4 }}
                    />
                    <DatePicker
                      modal
                      open={!!openDatePicker?.[name]}
                      date={value ? new Date(value) : new Date()}
                      onConfirm={d => {
                        setOpenDatePicker((prev: any) => ({
                          ...prev,
                          [name]: false,
                        }));
                        onChange(d);
                      }}
                      onCancel={() =>
                        setOpenDatePicker((prev: any) => ({
                          ...prev,
                          [name]: false,
                        }))
                      }
                    />
                  </View>
                )}
              />
            ) : null}
            {errors.unloading_finished && (
              <Text style={styles.errorText}>{'Error'}</Text>
            )}

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.primeColor,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    flex: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: Colors.primeColor,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default InboundInputVehicle;
