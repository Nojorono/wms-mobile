import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import React from 'react';
import UpdateInventoryScreen from '../../page/movement/updateInventory/UpdateInventoryScreen.tsx';
import UpdateInventoryCreate from '../../page/movement/updateInventory/UpdateInventoryCreate.tsx';
import UpdateInventoryInspection from '../../page/movement/updateInventory/UpdateInventoryInspection.tsx';
import { TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';



export type UpdateInventoryParamList = {
  UpdateInventoryMain: undefined;
  UpdateInventoryCreate: undefined;
  UpdateInventoryInspection: {item:any};
};

const UpdateInventoryStack = createStackNavigator<UpdateInventoryParamList>();

const UpdateInventoryStackNavigator = () => (
  <UpdateInventoryStack.Navigator initialRouteName="UpdateInventoryMain">
    <UpdateInventoryStack.Screen
      name="UpdateInventoryMain"
      component={UpdateInventoryScreen}
     options={({ navigation }) => ({
        headerTitle: 'Update Inventory',
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
         headerRight: () => (
          <TouchableOpacity
            onPress={() =>
              navigation.getParent()?.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              })
            }
            style={{
              marginRight: 16,
            }}
          >
            <Ionicons
              name="home"
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        ),
      })}
    />
     <UpdateInventoryStack.Screen
      name="UpdateInventoryCreate"
      component={UpdateInventoryCreate}
      options={({ navigation }) => ({
        headerTitle: 'Update Inventory Create',
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
         headerRight: () => (
          <TouchableOpacity
            onPress={() =>
              navigation.getParent()?.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              })
            }
            style={{
              marginRight: 16,
            }}
          >
            <Ionicons
              name="home"
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        ),
      })}
    />
    <UpdateInventoryStack.Screen
      name="UpdateInventoryInspection"
      component={UpdateInventoryInspection}
      options={({ navigation }) => ({
        headerTitle: 'Update Inventory Inspection',
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
         headerRight: () => (
          <TouchableOpacity
            onPress={() =>
              navigation.getParent()?.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              })
            }
            style={{
              marginRight: 16,
            }}
          >
            <Ionicons
              name="home"
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        ),
      })}
    />

  </UpdateInventoryStack.Navigator>
);

export default UpdateInventoryStackNavigator;
