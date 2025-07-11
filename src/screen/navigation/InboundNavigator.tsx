import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../constants/Colors';
import { Image, View } from 'react-native';
import React from 'react';
import InboundScreen from '../page/inbound/InboundScreen.tsx';
import InboundVehicleScreen from '../page/inbound/InboundVehicleScreen.tsx';
import InboundDetailScreen from '../page/inbound/InboundDetailScreen.tsx';
import InboundDeliveryOrder from '../page/inbound/InboundDeliveryOrder.tsx';
import InboundInputVehicle from '../page/inbound/InboundInputVehicle.tsx';
import InboundInputDO from '../page/inbound/InboundInputDO.tsx';



export type InboundParamList = {
  InboundMain: undefined;
  InboundInputDO: { item:any, mode:any, initialValues:any };
  InboundDeliveryOrder: { item: any, vehicle:any };
  InboundInputVehicle:{ item:any, mode:any, initialValues:any };
  InboundVehicle: { item: any };
  InboundDetail: { item: any; vehicle: any };
};

const InboundStack = createStackNavigator<InboundParamList>();

const InboundStackNavigator = () => (
  <InboundStack.Navigator initialRouteName="InboundMain">
    <InboundStack.Screen
      name="InboundMain"
      component={InboundScreen}
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
              source={require('../../assets/images/icon-white-nna.png')}
              style={{ width: 100, height: 22, resizeMode: 'contain' }}
            />
          </View>
        ),
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
  </InboundStack.Navigator>
);

export default InboundStackNavigator;
