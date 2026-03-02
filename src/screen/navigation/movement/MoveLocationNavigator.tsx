import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import { Image, View } from 'react-native';
import React from 'react';
import MoveLocationScreen from '../../page/movement/moveLocation/MoveLocationScreen.tsx';
import MoveLocationCreate from '../../page/movement/moveLocation/MoveLocationCreate.tsx';
import MoveLocationDetail from '../../page/movement/moveLocation/MoveLocationDetail.tsx';


export type MoveLocationParamList = {
  MoveLocationMain: undefined;
  MoveLocationCreate: undefined;
  MoveLocationDetail: {item:any};
};

const MoveLocationStack = createStackNavigator<MoveLocationParamList>();

const MoveLocationStackNavigator = () => (
  <MoveLocationStack.Navigator initialRouteName="MoveLocationMain">
    <MoveLocationStack.Screen
      name="MoveLocationMain"
      component={MoveLocationScreen}
      options={{
        headerTitle: 'Move Location',
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor, // Full header background
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
          borderBottomWidth: 0, // Remove any border
        },
      }}
    />
    <MoveLocationStack.Screen
      name="MoveLocationCreate"
      component={MoveLocationCreate}
      options={{
        headerTitle: 'Create Move Location',
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor, // Full header background
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
          borderBottomWidth: 0, // Remove any border
        },
      }}
    />
     <MoveLocationStack.Screen
      name="MoveLocationDetail"
      component={MoveLocationDetail}
      options={{
        headerTitle: 'Move Location Detail',
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor, // Full header background
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
          borderBottomWidth: 0, // Remove any border
        },
      }}
    />

  </MoveLocationStack.Navigator>
);

export default MoveLocationStackNavigator;
