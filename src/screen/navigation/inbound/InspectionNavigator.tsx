import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import { Image, View } from 'react-native';
import React from 'react';
import InspectionScreen from '../../page/inbound/inboundMain/inspection/InspectionScreen.tsx';


export type InspectionParamList = {
  InspectionMain: {item: any};
};

const InspectionStack = createStackNavigator<InspectionParamList>();

const InspectionStackNavigator = () => (
  <InspectionStack.Navigator initialRouteName="InspectionMain">
    <InspectionStack.Screen
      name="InspectionMain"
      component={InspectionScreen}
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
    {/* <UnloadingStack.Screen
      name="UnloadingVehicle"
      component={UnloadingVehicleScreen}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    <UnloadingStack.Screen
      name="UnloadingDetail"
      component={UnloadingDetailScreen}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }} */}
    {/* /> */}
  </InspectionStack.Navigator>
);

export default InspectionStackNavigator;
