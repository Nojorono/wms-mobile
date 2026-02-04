import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import { Image, View } from 'react-native';
import React from 'react';
import ForkliftMovementScreen from '../../page/movement/moveForklift/ForkliftMovementScreen.tsx';



export type ForkliftMovementParamList = {
  ForkliftMovementMain: undefined;
  ForkliftMovementCreate: undefined;
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
    {/* <ForkliftMovementStack.Screen
      name="ForkliftMovementCreate"
      component={ForkliftMovementCreate}
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

  </ForkliftMovementStack.Navigator>
);

export default ForkliftMovementStackNavigator;
