import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';

import React from 'react';
import PickingScreen from '../../page/outbound/picking/PickingDoScreen.tsx';
import PickingDetailScreen from '../../page/outbound/picking/PikingMemoScreen.tsx';
import PickingActivity from '../../page/outbound/picking/PickingActivity.tsx';
import PickingDetailActivity from '../../page/outbound/picking/PickingDetailActivity.tsx';
import PickingSkuScreen from '../../page/outbound/picking/PickingSkuScreen.tsx';
import PickingSkuByPallet from '../../page/outbound/picking/PickingSkuByPallet.tsx';
import PickingSkuTab from '../../page/outbound/picking/PickingSkuTab.tsx';



export type PickingParamList = {
  PickingDoMain: undefined;
  PickingMemo: { item: any };
  PickingSku: { item: any };
  PickingActivity: { item: any };
  PickingDetailActivity: {
    mode: "add" | "edit";
    itemBefore?: any;
    activity?: any;
  };
};

const PickingStack = createStackNavigator<PickingParamList>();

const PickingStackNavigator = () => (
  <PickingStack.Navigator initialRouteName="PickingDoMain">
    <PickingStack.Screen
      name="PickingDoMain"
      component={PickingScreen}
      options={{
        headerShown: true,
        headerTitle: 'Picking',
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
      name="PickingMemo"
      component={PickingDetailScreen}
      options={{
        headerShown: true,
        headerTitle: 'Picking - Memo',
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
      name="PickingSku"
      component={PickingSkuTab}
      options={{
        headerShown: true,
        headerTitle: 'Picking - SKU',
        headerTintColor: "#fff",
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
      }}
    />
    <PickingStack.Screen
      name="PickingActivity"
      component={PickingActivity}
      options={{
        headerShown: true,
          headerTitle: 'Picking - Activity',
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
      name="PickingDetailActivity"
      component={PickingDetailActivity}
      options={{
        headerShown: true,
          headerTitle: 'Picking - Detail Activity',
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
