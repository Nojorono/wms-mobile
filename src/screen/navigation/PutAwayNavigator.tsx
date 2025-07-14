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
import PutAwayScreen from '../page/putaway/PutAwayScreen.tsx';



export type PutAwayParamList = {
  PutAwayMain: undefined;
};

const PutAwayStack = createStackNavigator<PutAwayParamList>();

const InboundStackNavigator = () => (
  <PutAwayStack.Navigator initialRouteName="PutAwayMain">
    <PutAwayStack.Screen
      name="PutAwayMain"
      component={PutAwayScreen}
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
    {/*<InboundStack.Screen*/}
    {/*  name="InboundVehicle"*/}
    {/*  component={InboundVehicleScreen}*/}
    {/*  options={{*/}
    {/*    headerShown: true,*/}
    {/*    headerTintColor: '#fff',*/}
    {/*    headerStyle: {*/}
    {/*      backgroundColor: Colors.secondaryColor,*/}
    {/*    },*/}
    {/*  }}*/}
    {/*/>*/}
  </PutAwayStack.Navigator>
);

export default InboundStackNavigator;
