import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import React from 'react';
import UpdateInventoryScreen from '../../page/movement/updateInventory/UpdateInventoryScreen.tsx';
import UpdateInventoryCreate from '../../page/movement/updateInventory/UpdateInventoryCreate.tsx';



export type UpdateInventoryParamList = {
  UpdateInventoryMain: undefined;
  UpdateInventoryCreate: undefined;
  UpdateInventoryDetail: {item:any};
};

const UpdateInventoryStack = createStackNavigator<UpdateInventoryParamList>();

const UpdateInventoryStackNavigator = () => (
  <UpdateInventoryStack.Navigator initialRouteName="UpdateInventoryMain">
    <UpdateInventoryStack.Screen
      name="UpdateInventoryMain"
      component={UpdateInventoryScreen}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor, // Full header background
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
          borderBottomWidth: 0, // Remove any border
        },
      }}
    />
     <UpdateInventoryStack.Screen
      name="UpdateInventoryCreate"
      component={UpdateInventoryCreate}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor, // Full header background
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
          borderBottomWidth: 0, // Remove any border
        },
      }}
    />
    {/* <UpdateInventoryStack.Screen
      name="UpdateInventoryDetail"
      component={UpdateInventoryDetail}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor, // Full header background
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
          borderBottomWidth: 0, // Remove any border
        },
      }}
    /> */}

  </UpdateInventoryStack.Navigator>
);

export default UpdateInventoryStackNavigator;
