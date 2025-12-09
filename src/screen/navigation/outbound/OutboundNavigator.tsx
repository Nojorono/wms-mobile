import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors';
import { Image, View } from 'react-native';
import React from 'react';
import OutboundIndex from '../../page/Outbound.tsx';
import PickingNavigator from './PickingNavigator.tsx';
import InspectionNavigator from './InspectionNavigator.tsx';
import AssignGateNavigator from './AssignGateNavigator.tsx';
import ForkliftGateNavigator from './ForkliftGateNavigator.tsx';



export type OutboundParamList = {
  OutboundIndex: undefined;
  OutboundMain: undefined;
  OutboundAssign: { item:any };
  //Helper
  OutboundPicking: undefined;
  //WH STAFF
  OutboundInspection: undefined;
  OutboundAssignGate: undefined;
  //Driver Forklift
  OutboundForkliftGate: undefined;
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
              source={require('../../../assets/images/icon-white-nna.png')}
              style={{ width: 100, height: 22, resizeMode: 'contain' }}
            />
          </View>
        ),
      }}
    />
    <OutboundStack.Screen
      name="OutboundPicking"
      component={PickingNavigator}
      options={{
        headerShown: false,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />

     <OutboundStack.Screen
      name="OutboundInspection"
      component={InspectionNavigator}
      options={{
        headerShown: false,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
     <OutboundStack.Screen
      name="OutboundAssignGate"
      component={AssignGateNavigator}
      options={{
        headerShown: false,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
       <OutboundStack.Screen
      name="OutboundForkliftGate"
      component={ForkliftGateNavigator}
      options={{
        headerShown: false,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
  </OutboundStack.Navigator>
);

export default OutboundStackNavigator;
