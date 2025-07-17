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
import useConstantStore from '../../../store/useConstantStore.ts';
import { useAuthStore } from '../../../store/useAuthStore.ts';

type FormInboundRouteProp = RouteProp<InboundParamList, 'InboundInputDO'>;
type FormActivityProps = {
  route: FormInboundRouteProp;
};
type NavigationProp = StackNavigationProp<InboundParamList, 'InboundMain'>;

function InboundInputDO({ route }: FormActivityProps) {
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
    console.log("woy"+JSON.stringify(data));
    if (mode === 'add') {
      data = {
        ...data,
        arrival_time: new Date(data.arrival_time).toISOString(),
        departure_time: new Date(data.departure_time).toISOString(),
        inbound_plan_id: item.inbound_plan_id,
        organization_id: item.inbound_plan.organization_id,
        created_by: user?.firstName + ' ' + user?.lastName,
      };

      // Add new vehicle
      console.log('Adding DO:', data);
    } else {
      // Update existing vehicle
      data = {
        ...data,
        arrival_time: new Date(data.arrival_time).toISOString(),
        departure_time: new Date(data.departure_time).toISOString(),
        unloading_start: new Date(data.unloading_start).toISOString(),
        unloading_end: new Date(data.unloading_end).toISOString(),
        inbound_plan_id: item.inbound_plan_id,
        organization_id: item.inbound_plan.organization_id,
        created_by: user?.firstName + ' ' + user?.lastName,
      };
      console.log('Editing DO:', data);
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
            {mode === 'add' ? 'Add Surat Jalan' : 'Edit Surat Jalan'}
          </Text>
          <View style={styles.formContainer}>
            <Controller
              name="items"
              control={control}
              rules={{
                required: 'At least one item is required',
                validate: value =>
                  Array.isArray(value) && value.length > 0
                    ? true
                    : 'At least one item is required',
              }}
              defaultValue={[
                {
                  inbound_delivery_order_id: '',
                  item_id: '',
                  qty_plan: 0,
                  uom: '',
                },
              ]}
              render={({ field: { value, onChange } }) => (
                <View>
                  {value.map((item: any, idx: number) => (
                    <View
                      key={idx}
                      style={{
                        marginBottom: 16,
                        borderWidth: 2,
                        borderColor: '#eee',
                        padding: 8,
                        borderRadius: 5,
                      }}
                    >
                      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
                        Surat Jalan {idx + 1}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          width: '100%',
                        }}
                      >
                        <Text style={{ marginRight: 8, width: 90 }}>
                          No. Surat Jalan
                        </Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Input Nomer Surat Jalan"
                          value={item.inbound_delivery_order_id}
                          onChangeText={text => {
                            const updated = [...value];
                            updated[idx].inbound_delivery_order_id = text;
                            onChange(updated);
                          }}
                        />
                      </View>

                      {/*<TextInput*/}
                      {/*  style={styles.input}*/}
                      {/*  placeholder="Item ID"*/}
                      {/*  value={item.item_id}*/}
                      {/*  onChangeText={(text) => {*/}
                      {/*    const updated = [...value];*/}
                      {/*    updated[idx].item_id = text;*/}
                      {/*    onChange(updated);*/}
                      {/*  }}*/}
                      {/*/>*/}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          width: '100%',
                        }}
                      >
                        <Text style={{ marginRight: 8, width: 90 }}>Qty</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Input Qty"
                          keyboardType="numeric"
                          value={item.qty_plan?.toString() || ''}
                          onChangeText={text => {
                            const updated = [...value];
                            updated[idx].qty_plan = Number(text);
                            onChange(updated);
                          }}
                        />
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          width: '100%',
                        }}
                      >
                        <Text style={{ marginRight: 8, width: 90 }}>UOM</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="UOM"
                          value={item.uom}
                          onChangeText={text => {
                            const updated = [...value];
                            updated[idx].uom = text;
                            onChange(updated);
                          }}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          const updated = value.filter(
                            (_: any, i: number) => i !== idx,
                          );
                          onChange(updated);
                        }}
                        style={{ marginTop: 8, alignSelf: 'flex-end' }}
                      >
                        <Text style={{ color: 'red' }}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity
                    onPress={() => {
                      onChange([
                        ...value,
                        {
                          inbound_delivery_order_id: '',
                          item_id: '',
                          qty_plan: 0,
                          uom: '',
                        },
                      ]);
                    }}
                    style={{
                      marginBottom: 16,
                      backgroundColor: Colors.primeColor,
                      padding: 8,
                      borderRadius: 5,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff' }}>Add Item</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.items && <Text style={styles.errorText}>error</Text>}
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

export default InboundInputDO;
