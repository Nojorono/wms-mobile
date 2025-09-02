import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import { Image, View } from 'react-native';
import React from 'react';
import InboundScreen from '../../page/inbound/inboundMain/InboundScreen.tsx';

import InboundIndex from '../../page/Inbound.tsx';
import PutAwayNavigator from './PutAwayNavigator.tsx';
import InboundVehicleScreen from '../../page/inbound/inboundMain2/InboundVehicleScreen.tsx';
import InboundDeliveryOrder from '../../page/inbound/inboundMain2/InboundDeliveryOrder.tsx';
import InboundDetailScreen from '../../page/inbound/inboundMain2/InboundDetailScreen.tsx';
import InboundInputVehicle from '../../page/inbound/inboundMain2/InboundInputVehicle.tsx';
import InboundInputDO from '../../page/inbound/inboundMain2/InboundInputDO.tsx';
import InboundCheck from '../../page/inbound/inboundMain/InboundCheck.tsx';
import InboundAssign from '../../page/inbound/inboundMain/InboundAssign.tsx';
import UnloadingNavigator from './UnloadingNavigator.tsx';
import InspectionNavigator from './InspectionNavigator.tsx';




export type InboundParamList = {
  InboundIndex: undefined;
  PutAwayNavigator: undefined;
  InboundMain: undefined;
  InboundInputDO: { item:any, mode:any, initialValues:any };
  InboundDeliveryOrder: { item: any, vehicle:any };
  InboundInputVehicle:{ item:any, mode:any, initialValues:any };
  InboundVehicle: { item: any };
  InboundDetail: { item: any; vehicle: any, doItem: any };
  //NEW WMS
  InboundCheck: { item: any };
  InboundAssign: {item:any}
  UnloadingNavigator: undefined;
  InspectionNavigator: undefined;
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
    <InboundStack.Screen
      name="InboundVehicle"
      component={InboundVehicleScreen}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    <InboundStack.Screen
      name="InboundDeliveryOrder"
      component={InboundDeliveryOrder}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    <InboundStack.Screen
      name="InboundDetail"
      component={InboundDetailScreen}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    <InboundStack.Screen
      name="InboundInputVehicle"
      component={InboundInputVehicle}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    <InboundStack.Screen
      name="InboundInputDO"
      component={InboundInputDO}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    {/* //NEW WMS */}
    <InboundStack.Screen
      name="InboundCheck"
      component={InboundCheck}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    <InboundStack.Screen
      name="InboundAssign"
      component={InboundAssign}
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
  </InboundStack.Navigator>
);

export default InboundStackNavigator;
