import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import { Image, View } from 'react-native';
import React from 'react';
import ForkliftMovementScreen from '../../page/movement/moveForklift/ForkliftMovementScreen.tsx';
import ForkliftPallet from '../../page/movement/moveForklift/ForkliftPalletScan.tsx';
import ForkliftDestination from '../../page/movement/moveForklift/ForkliftDestinationScan.tsx';



export type ForkliftMovementParamList = {
  ForkliftMovementMain: undefined;
  ForkliftMovementCreate: undefined;
  ForkliftPallet: {item:any}; 
  ForkliftDestination : {pallet:any, item:any};
};

const ForkliftMovementStack = createStackNavigator<ForkliftMovementParamList>();

const ForkliftMovementStackNavigator = () => (
  <ForkliftMovementStack.Navigator initialRouteName="ForkliftMovementMain">
    <ForkliftMovementStack.Screen
      name="ForkliftMovementMain"
      component={ForkliftMovementScreen}
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
    <ForkliftMovementStack.Screen
      name="ForkliftPallet"
      component={ForkliftPallet}
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
     <ForkliftMovementStack.Screen
      name="ForkliftDestination"
      component={ForkliftDestination}
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

  </ForkliftMovementStack.Navigator>
);

export default ForkliftMovementStackNavigator;
