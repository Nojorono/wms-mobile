import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors';
import { Image, View } from 'react-native';
import React from 'react';
import ForkliftGateScreen from '../../page/outbound/forkliftGate/ForkliftGateScreen';




export type ForkliftGateParamList = {
  ForkliftGateMain: undefined;
  ForkliftGateActivity: {item:any};
}
const ForkliftGateStack = createStackNavigator<ForkliftGateParamList>();

const ForkliftGateStackNavigator = () => (
  <ForkliftGateStack.Navigator initialRouteName="ForkliftGateMain">
    <ForkliftGateStack.Screen
      name="ForkliftGateMain"
      component={ForkliftGateScreen}
      options={{
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.secondaryColor, // Full header background
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
          borderBottomWidth: 0, // Remove any border
        },
        headerTitle: () => (
          <View
            style={{
              width: '100%',
              alignItems: 'center',
            }}
          >
          </View>
        ),
      }}
    />
    {/* <ForkliftGateStack.Screen
      name="ForkliftGateVehicle"
      component={ForkliftGateVehicle}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    /> */}
  </ForkliftGateStack.Navigator>
);

export default ForkliftGateStackNavigator;
