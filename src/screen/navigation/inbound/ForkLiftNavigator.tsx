import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import React from 'react';
import ForkLiftScreen from '../../page/inbound/forkLift/ForkLiftScreen.tsx';
import ForkLiftDetailScreen from '../../page/inbound/forkLift/ForkLiftDetailScreen.tsx';
import CameraScreenForkLift from '../../page/inbound/forkLift/CameraScanForkLift.tsx';



export type ForkLiftParamList = {
  ForkLiftMain: undefined;
  ForkLiftDetail: {item:any}
  CameraScreen: {item:any}
};

const ForkLiftStack = createStackNavigator<ForkLiftParamList>();

const ForkLiftStackNavigator = () => (
  <ForkLiftStack.Navigator initialRouteName="ForkLiftMain">
    <ForkLiftStack.Screen
      name="ForkLiftMain"
      component={ForkLiftScreen}
      options={{
        headerTitle: 'Forklift',
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor, 
          elevation: 0, 
          shadowOpacity: 0,
          borderBottomWidth: 0, 
        },
      }}
    />
    <ForkLiftStack.Screen
      name="ForkLiftDetail"
      component={ForkLiftDetailScreen}
      options={{
        headerTitle: 'Forklift Detail',
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    <ForkLiftStack.Screen
      name="CameraScreen"
      component={CameraScreenForkLift}
      options={{
        headerTitle: 'Scan Forklift',
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
  </ForkLiftStack.Navigator>
);

export default ForkLiftStackNavigator;
