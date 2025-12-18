import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors';
import { Image, View } from 'react-native';
import React from 'react';
import AssignGateDoScreen from '../../page/outbound/assignGate/AssignGateDo.tsx';
import AssignGateActivity from '../../page/outbound/assignGate/AssignGateActivity.tsx';
import AssignGateVehicle from '../../page/outbound/assignGate/AssignGateVehicle.tsx';
import AssignGateLoading from '../../page/outbound/assignGate/AssignGateLoading.tsx';



export type AssignGateParamList = {
  AssignGateMain: undefined;
  AssignGateActivity: {
    item: any;
    mode?: "add" | "edit";
    assignedGate?: any;
  };
  AssignGateLoading: {
    item: any;
    mode?: "add" | "edit";
    assignedGate?: any;
  };
  AssignGateVehicle: { item: any };
}
const AssignGateStack = createStackNavigator<AssignGateParamList>();

const AssignGateStackNavigator = () => (
  <AssignGateStack.Navigator initialRouteName="AssignGateMain">
    <AssignGateStack.Screen
      name="AssignGateMain"
      component={AssignGateDoScreen}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor, // Full header background
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
          borderBottomWidth: 0, // Remove any border
        },
        // headerTitle: () => (
        //   <View
        //     style={{
        //       width: '100%',
        //       alignItems: 'center',
        //     }}
        //   >
        //     <Image
        //       source={require('../../../assets/images/icon-white-nna.png')}
        //       style={{ width: 100, height: 22, resizeMode: 'contain' }}
        //     />
        //   </View>
        // ),
      }}
    />
    <AssignGateStack.Screen
      name="AssignGateVehicle"
      component={AssignGateVehicle}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    <AssignGateStack.Screen
      name="AssignGateActivity"
      component={AssignGateActivity}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    <AssignGateStack.Screen
      name="AssignGateLoading"
      component={AssignGateLoading}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />



  </AssignGateStack.Navigator>
);

export default AssignGateStackNavigator;
