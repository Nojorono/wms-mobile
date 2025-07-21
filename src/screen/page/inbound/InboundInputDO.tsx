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
import { Picker } from '@react-native-picker/picker';
import inboundServices from '../../../service/inboundServices.ts';
import { useLoadingDialogStore } from '../../../store/useLoadingStore.ts';

type FormInboundRouteProp = RouteProp<InboundParamList, 'InboundInputDO'>;
type FormActivityProps = {
  route: FormInboundRouteProp;
};
type NavigationProp = StackNavigationProp<InboundParamList, 'InboundMain'>;

function InboundInputDO({ route }: FormActivityProps) {
  const navigation = useNavigation<NavigationProp>();
  const stylex = GlobalStyles();
  const { items, uom } = useConstantStore();
  const [openDatePicker, setOpenDatePicker] = useState<{ [key: string]: boolean }>({});

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      number_delivery_order: '',
      items: [
        {
          item_id: '',
          qty_plan: 0,
          uom: '',
        },
      ],
    },
  });
  const { item, mode = 'add', initialValues } = route.params; // Default to 'add' if mode is undefined
  const { user } = useAuthStore();
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();

  // Reset form with initial values on component mount
  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const onSubmit = async (data: any) => {
    console.log(data);
    if (mode === 'add') {
      data = {
        ...data,
        inbound_plan_id: item.inbound_plan_id,
        inbound_transporter_id: item.inbound_transporter_id,
        number_delivery_order: data.number_delivery_order,
        created_by: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim(),
        updated_by: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim(),
      };
      console.log('Adding DO:', data);
      try {
        showLoadingDialog('Submitting Delivery Order...');
        await inboundServices.postInboundDeliveryOrder(data);
        navigation.goBack();
      } catch (error) {
        console.error(error);
        hideLoadingDialog();
      } finally {
        hideLoadingDialog();
      }
    } else {
      // Update existing vehicle logic
      const { inbound_delivery_order_id, ...restData } = data;
      data = {
        ...restData,
        inbound_plan_id: item.inbound_plan_id,
        inbound_transporter_id: item.inbound_transporter_id,
        number_delivery_order: data.number_delivery_order,
        created_by: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim(),
        updated_by: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim(),
      };
      console.log('Editing DO:', data);
      try {
        showLoadingDialog('Submitting Delivery Order...');
        await inboundServices.updateInboundDeliveryOrder(inbound_delivery_order_id,data);
        navigation.goBack();
      } catch (error) {
        console.error(error);
        hideLoadingDialog();
      } finally {
        hideLoadingDialog();
      }
    }
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
            {/* Nomor Surat Jalan (input only once) */}
            <Controller
              name="number_delivery_order"
              control={control}
              rules={{
                required: 'Nomor Surat Jalan is required',
              }}
              render={({ field: { value, onChange } }) => (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ marginBottom: 8 }}>No. Surat Jalan</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Input Nomor Surat Jalan"
                    value={value?.toString() || ''}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            {/* Items (SKU, Qty, UOM can be added multiple times) */}
            <Controller
              name="items"
              control={control}
              rules={{
                required: 'At least one item is required',
                validate: value => (Array.isArray(value) && value.length > 0 ? true : 'At least one item is required'),
              }}
              // removed defaultValue from Controller, handled in useForm
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
                        SKU {idx + 1}
                      </Text>

                      {/* SKU Selection */}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          width: '100%',
                        }}
                      >
                        <Text style={{ marginRight: 8, width: 90 }}>SKU</Text>
                        <View
                          style={[styles.input, { padding: 0, justifyContent: 'center' }]}
                        >
                          <Picker
                            selectedValue={item.item_id || ''}
                            onValueChange={itemValue => {
                              const updated = [...value];
                              updated[idx].item_id = itemValue;
                              onChange(updated);
                            }}
                            style={{ width: '100%' }}
                          >
                            <Picker.Item label="Select SKU" value="" />
                            {Array.isArray(items) &&
                              items.map(option => (
                                <Picker.Item
                                  key={option.id}
                                  label={option.sku || ''}
                                  value={option.id}
                                />
                              ))}
                          </Picker>
                        </View>
                      </View>

                      {/* Qty Input */}
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

                      {/* UOM Selection */}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          width: '100%',
                        }}
                      >
                        <Text style={{ marginRight: 8, width: 90 }}>UOM</Text>
                        <View
                          style={[styles.input, { padding: 0, justifyContent: 'center' }]}
                        >
                          <Picker
                            selectedValue={item.uom || ''}
                            onValueChange={itemValue => {
                              const updated = [...value];
                              updated[idx].uom = itemValue;
                              onChange(updated);
                            }}
                            style={{ width: '100%' }}
                          >
                            <Picker.Item label="Select UOM" value="" />
                            {Array.isArray(uom) &&
                              uom.map(option => (
                                <Picker.Item
                                  key={option.id}
                                  label={option.name || ''}
                                  value={option.id}
                                />
                              ))}
                          </Picker>
                        </View>
                      </View>

                      {/* Remove Item Button */}
                      <TouchableOpacity
                        onPress={() => {
                          const updated = value.filter((_: any, i: number) => i !== idx);
                          onChange(updated);
                        }}
                        style={{ marginTop: 8, alignSelf: 'flex-end' }}
                      >
                        <Text style={{ color: 'red' }}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  {/* Add Item Button */}
                  <TouchableOpacity
                    onPress={() => {
                      onChange([
                        ...value,
                        {
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
            {errors.items && (
              <>
                <Text style={styles.errorText}>Error: Please complete all fields</Text>
              </>
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

export default InboundInputDO;
