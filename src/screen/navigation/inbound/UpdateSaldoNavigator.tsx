import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';

import React from 'react';
import UpdateSaldoScreen from '../../page/inbound/inboundMain/updateSaldo/UpdateSaldoScreen.tsx';
import UpdateSaldoDetail from '../../page/inbound/inboundMain/updateSaldo/UpdateSaldoDetail.tsx';


export type UpdateSaldoParamList = {
  UpdateSaldoMain: {item: any};
  UpdateSaldoDetail:  { item: any; payload: any };
  
};

const UpdateSaldoStack = createStackNavigator<UpdateSaldoParamList>();

const UpdateSaldoStackNavigator = () => (
  <UpdateSaldoStack.Navigator initialRouteName="UpdateSaldoMain">
    <UpdateSaldoStack.Screen
      name="UpdateSaldoMain"
      component={UpdateSaldoScreen}
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
    <UpdateSaldoStack.Screen
      name="UpdateSaldoDetail"
      component={UpdateSaldoDetail}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />

  </UpdateSaldoStack.Navigator>
);

export default UpdateSaldoStackNavigator;
