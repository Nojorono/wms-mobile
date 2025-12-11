import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors';
import { Image, View } from 'react-native';
import React from 'react';
import ForkliftGateScreen from '../../page/outbound/forkliftGate/ForkliftGateScreen';
import { ForkliftGateDetail } from '../../page/outbound/forkliftGate/ForkliftGateDetail';




export type ForkliftGateParamList = {
  ForkliftGateMain: undefined;
  ForkliftGateDetail: { item: any };
}
const ForkliftGateStack = createStackNavigator<ForkliftGateParamList>();

const ForkliftGateStackNavigator = () => (
  <ForkliftGateStack.Navigator initialRouteName="ForkliftGateMain">
    <ForkliftGateStack.Screen
      name="ForkliftGateMain"
      component={ForkliftGateScreen}
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
    <ForkliftGateStack.Screen
      name="ForkliftGateDetail"
      component={ForkliftGateDetail}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
  </ForkliftGateStack.Navigator>
);

export default ForkliftGateStackNavigator;
