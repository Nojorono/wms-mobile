import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import { Image, View } from 'react-native';
import React from 'react';
import UnloadingScreen from '../../page/inbound/unloading/UnloadingScreen.tsx';
import UnloadingVehicleScreen from '../../page/inbound/unloading/UnloadingVehicle.tsx';
import UnloadingDetailScreen from '../../page/inbound/unloading/UnloadingDetail.tsx';



export type UnloadingParamList = {
  UnloadingMain: undefined;
  UnloadingVehicle: { item: any; };
  UnloadingDetail: { item: any; };
};

const UnloadingStack = createStackNavigator<UnloadingParamList>();

const UnloadingStackNavigator = () => (
  <UnloadingStack.Navigator initialRouteName="UnloadingMain">
    <UnloadingStack.Screen
      name="UnloadingMain"
      component={UnloadingScreen}
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
    <UnloadingStack.Screen
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
      }}
    />
  </UnloadingStack.Navigator>
);

export default UnloadingStackNavigator;
