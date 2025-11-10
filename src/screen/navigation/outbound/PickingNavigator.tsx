import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';

import React from 'react';
import PickingScreen from '../../page/outbound/picking/PickingScreen.tsx';



export type PickingParamList = {
  PickingMain: undefined;
  PickingDetail: { item: any };
  
};

const PickingStack = createStackNavigator<PickingParamList>();

const PickingStackNavigator = () => (
  <PickingStack.Navigator initialRouteName="PickingMain">
    <PickingStack.Screen
      name="PickingMain"
      component={PickingScreen}
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
    <PickingStack.Screen
      name="PickingMain"
      component={PickingScreen}
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
   

  </PickingStack.Navigator>
);

export default PickingStackNavigator;
