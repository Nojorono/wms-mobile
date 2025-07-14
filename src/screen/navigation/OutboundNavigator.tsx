import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../constants/Colors';
import { Image, View } from 'react-native';
import React from 'react';
import PutAwayScreen from '../page/putaway/PutAwayScreen.tsx';
import OutboundScreen from '../page/outbound/OutboundScreen.tsx';



export type OutboundParamList = {
  OutboundMain: undefined;
};

const OutboundStack = createStackNavigator<OutboundParamList>();

const OutboundStackNavigator = () => (
  <OutboundStack.Navigator initialRouteName="OutboundMain">
    <OutboundStack.Screen
      name="OutboundMain"
      component={OutboundScreen}
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
  </OutboundStack.Navigator>
);

export default OutboundStackNavigator;
