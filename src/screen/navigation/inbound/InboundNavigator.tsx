import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import { Image, View } from 'react-native';
import React from 'react';
import InboundScreen from '../../page/inbound/inboundMain/InboundScreen.tsx';

import InboundIndex from '../../page/Inbound.tsx';
import PutAwayNavigator from './PutAwayNavigator.tsx';
import UnloadingNavigator from './UnloadingNavigator.tsx';
import InspectionNavigator from './InspectionNavigator.tsx';
import InboundDetail from '../../page/inbound/inboundMain/InboundDetail.tsx';
import CheckerScreen from '../../page/inbound/inboundMain/checker/CheckerScreen.tsx';
import UpdateSaldoNavigator from './UpdateSaldoNavigator.tsx';




export type InboundParamList = {
  InboundIndex: undefined;
  PutAwayNavigator: undefined;
  InboundMain: undefined;
  //NEW WMS
  InboundDetail: { item: any };
  CheckerScreen: { item: any };
  UnloadingNavigator: undefined;
  InspectionNavigator: {
    screen: "InspectionMain";
    params: { item: any };
  };
  UpdateSaldoNavigator:{
    screen: "UpdateSaldoMain";
    params: { item: any };
  }
};

const InboundStack = createStackNavigator<InboundParamList>();

const InboundStackNavigator = () => (
  <InboundStack.Navigator initialRouteName="InboundIndex">
    <InboundStack.Screen
      name="InboundIndex"
      component={InboundIndex}
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
            <Image
              source={require('../../../assets/images/icon-white-nna.png')}
              style={{ width: 100, height: 22, resizeMode: 'contain' }}
            />
          </View>
        ),
      }}
    />
    <InboundStack.Screen
      name="InboundMain"
      component={InboundScreen}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    <InboundStack.Screen
      name="PutAwayNavigator"
      component={PutAwayNavigator}
      options={{
        headerShown: false,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    {/* //NEW WMS */}
    <InboundStack.Screen
      name="InboundDetail"
      component={InboundDetail}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    <InboundStack.Screen
      name="CheckerScreen"
      component={CheckerScreen}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    <InboundStack.Screen
      name="UnloadingNavigator"
      component={UnloadingNavigator}
      options={{
        headerShown: false,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    <InboundStack.Screen
      name="InspectionNavigator"
      component={InspectionNavigator}
      options={{
        headerShown: false,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    <InboundStack.Screen
      name="UpdateSaldoNavigator"
      component={UpdateSaldoNavigator}
      options={{
        headerShown: false,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
  </InboundStack.Navigator>
);

export default InboundStackNavigator;
