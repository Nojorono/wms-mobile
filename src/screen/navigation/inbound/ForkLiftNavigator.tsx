import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import React from 'react';
import ForkLiftScreen from '../../page/inbound/ForkLift/ForkLiftScreen.tsx';



export type ForkLiftParamList = {
  ForkLiftMain: undefined;
};

const ForkLiftStack = createStackNavigator<ForkLiftParamList>();

const ForkLiftStackNavigator = () => (
  <ForkLiftStack.Navigator initialRouteName="ForkLiftMain">
    <ForkLiftStack.Screen
      name="ForkLiftMain"
      component={ForkLiftScreen}
      options={{
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
  </ForkLiftStack.Navigator>
);

export default ForkLiftStackNavigator;
