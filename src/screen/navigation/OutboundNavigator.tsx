import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../constants/Colors';
import { Image, View } from 'react-native';
import React from 'react';
import OutboundIndex from '../page/Outbound.tsx';



export type OutboundParamList = {
  OutboundIndex: undefined;
  OutboundMain: undefined;
  OutboundAssign: { item:any };
};

const OutboundStack = createStackNavigator<OutboundParamList>();

const OutboundStackNavigator = () => (
  <OutboundStack.Navigator initialRouteName="OutboundIndex">
    <OutboundStack.Screen
      name="OutboundIndex"
      component={OutboundIndex}
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
    {/* <OutboundStack.Screen
      name="OutboundMain"
      component={OutboundScreen}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    /> */}
  </OutboundStack.Navigator>
);

export default OutboundStackNavigator;
