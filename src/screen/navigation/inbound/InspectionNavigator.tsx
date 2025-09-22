import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import { Image, View } from 'react-native';
import React from 'react';
import InspectionScreen from '../../page/inbound/inboundMain/inspection/InspectionScreen.tsx';
import InspectionDetail from '../../page/inbound/inboundMain/inspection/InspectionDetail.tsx';


export type InspectionParamList = {
  InspectionMain: {item: any};
  InspectionDetail: { item: any; payload: any };
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
    <InspectionStack.Screen
      name="InspectionDetail"
      component={InspectionDetail}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    
  </InspectionStack.Navigator>
);

export default InspectionStackNavigator;
