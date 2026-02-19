import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import { Image, View } from 'react-native';
import React from 'react';
import UpdateHelperScreen from '../../page/movement/updateHelper/UpdateHelperScreen.tsx';
import UpdateHelperDetail from '../../page/movement/updateHelper/UpdateHelperDetail.tsx';




export type HelperMovementParamList = {
  HelperMovementMain: undefined;
    UpdateHelperDetail:  undefined;
};

const HelperMovementStack = createStackNavigator<HelperMovementParamList>();

const HelperMovementStackNavigator = () => (
  <HelperMovementStack.Navigator initialRouteName="HelperMovementMain">
    <HelperMovementStack.Screen
      name="HelperMovementMain"
      component={UpdateHelperScreen}
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
    <HelperMovementStack.Screen
      name="UpdateHelperDetail"
      component={UpdateHelperDetail}
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

  </HelperMovementStack.Navigator>
);

export default HelperMovementStackNavigator;
