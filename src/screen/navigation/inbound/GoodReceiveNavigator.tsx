import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import { Image, View } from 'react-native';
import React from 'react';
import GoodReceiveScreen from '../../page/inbound/goodReceiving/GoodReceiveScreen.tsx';
import GoodReceivePallet from '../../page/inbound/goodReceiving/GoodReceivePallet.tsx';
import GoodReceiveDetail from '../../page/inbound/goodReceiving/GoodReceiveDetail.tsx';


export type GoodReceiveParamList = {
  GoodReceiveMain: undefined;
  GoodReceivePallet: { item: any };
  GoodReceiveDetail: { item: any };
};

const GoodReceiveStack = createStackNavigator<GoodReceiveParamList>();

const GoodReceiveStackNavigator = () => (
  <GoodReceiveStack.Navigator initialRouteName="GoodReceiveMain">
    <GoodReceiveStack.Screen
      name="GoodReceiveMain"
      component={GoodReceiveScreen}
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
     <GoodReceiveStack.Screen
      name="GoodReceivePallet"
      component={GoodReceivePallet}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    <GoodReceiveStack.Screen
      name="GoodReceiveDetail"
      component={GoodReceiveDetail}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
  </GoodReceiveStack.Navigator>
);

export default GoodReceiveStackNavigator;
