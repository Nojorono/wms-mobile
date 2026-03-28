import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';

import React from 'react';
import InspectionScreen from '../../page/outbound/inspection/InspectionDoScreen.tsx';
import InspectionMemoScreen from '../../page/outbound/inspection/InspectionMemoScreen.tsx';
import InspectionSkuScreen from '../../page/outbound/inspection/InspectionSkuScreen.tsx';
import InspectionActivity from '../../page/outbound/inspection/InspectionActivity.tsx';
import NewInspectionMemo from '../../page/outbound/inspection/NewInspectionMemo.tsx';
import InspectionEditActivity from '../../page/outbound/inspection/InspectionEditActivity.tsx';




export type InspectionParamList = {
  InspectionDoMain: undefined;
  InspectionMemo: { item: any };
  NewInspectionMemo : { item: any };
  InspectionEditActivity : { activity: any , mode: "add" | "edit", itemBefore:any};
  

  //gakepake
  InspectionSku: { data: any , dataBefore:any };
  InspectionActivity: { data: any , dataBefore:any};
  InspectionDetailActivity: { item: any };
};

const InspectionStack = createStackNavigator<InspectionParamList>();

const InspectionStackNavigator = () => (
  <InspectionStack.Navigator initialRouteName="InspectionDoMain">
    <InspectionStack.Screen
      name="InspectionDoMain"
      component={InspectionScreen}
      options={{
        headerShown: true,
        headerTitle: 'Inspection',
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
      name="InspectionMemo"
      component={InspectionMemoScreen}
      options={{
        headerShown: true,
        headerTitle: 'Inspection - Memo',
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
      name="InspectionSku"
      component={InspectionSkuScreen}
      options={{
        headerShown: true,
        headerTitle: 'Inspection - SKU',
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
      name="InspectionActivity"
      component={InspectionActivity}
      options={{
        headerShown: true,
        headerTitle: 'Inspection - Activity',
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
      name="NewInspectionMemo"
      component={NewInspectionMemo}
      options={{
        headerShown: true,
        headerTitle: 'Inspection - Memo',
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
      name="InspectionEditActivity"
      component={InspectionEditActivity}
      options={{
        headerShown: true,
        headerTitle: 'Inspection - Edit Activity',
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor, // Full header background
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
          borderBottomWidth: 0, // Remove any border
        },
      }}
    />
   

  </InspectionStack.Navigator>
);

export default InspectionStackNavigator;
