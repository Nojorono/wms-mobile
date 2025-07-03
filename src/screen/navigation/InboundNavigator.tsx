import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../constants/Colors';
import { Image, View } from 'react-native';
import React from 'react';
import InboundScreen from '../page/inbound/InboundScreen.tsx';
import InboundVehicleScreen from '../page/inbound/InboundVehicleScreen.tsx';
import InboundDetailScreen from '../page/inbound/InboundDetailScreen.tsx';
import DeliveryLetterScreen from '../page/inbound/DeliveryLetterScreen.tsx';
import DeliveryLetterDetailScreen from '../page/inbound/DeliveryLetterDetailScreen.tsx';



export type InboundParamList = {
  InboundMain: undefined;
  InboundDeliveryLetter: { item: any };
  InboundDeliveryLetterDetail: { item: any, surjal:any };
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
      name="InboundDeliveryLetter"
      component={DeliveryLetterScreen}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    <InboundStack.Screen
      name="InboundDeliveryLetterDetail"
      component={DeliveryLetterDetailScreen}
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
