import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import { Image, View } from 'react-native';
import React from 'react';
import InspectionScreen from '../../page/inbound/inboundMain/inspection/InspectionScreen.tsx';
import InspectionDetail from '../../page/inbound/inboundMain/inspection/InspectionDetail.tsx';
import GoodReceiveScreen from '../../page/inbound/inboundMain/inspection/goodreceive/GoodReceiveScreen.tsx';
import GoodReceiveDetail from '../../page/inbound/inboundMain/inspection/goodreceive/GoodReceiveDetail.tsx';
import UpdateSaldoScreen from '../../page/inbound/inboundMain/updateSaldo/UpdateSaldoScreen.tsx';


export type UpdateSaldoParamList = {
  UpdateSaldoMain: {item: any};
  
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

  </UpdateSaldoStack.Navigator>
);

export default UpdateSaldoStackNavigator;
