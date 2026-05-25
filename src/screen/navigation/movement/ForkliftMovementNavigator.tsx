import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import { Image, TouchableOpacity, View } from 'react-native';
import React from 'react';
import ForkliftMovementScreen from '../../page/movement/moveForklift/ForkliftMovementScreen.tsx';
import ForkliftPallet from '../../page/movement/moveForklift/ForkliftPalletScan.tsx';
import ForkliftDestination from '../../page/movement/moveForklift/ForkliftDestinationScan.tsx';
import Ionicons from 'react-native-vector-icons/Ionicons';



export type ForkliftMovementParamList = {
  ForkliftMovementMain: undefined;
  ForkliftMovementCreate: undefined;
  ForkliftPallet: {item:any}; 
  ForkliftDestination : {pallet:any, item:any};
};

const ForkliftMovementStack = createStackNavigator<ForkliftMovementParamList>();

const ForkliftMovementStackNavigator = () => (
  <ForkliftMovementStack.Navigator initialRouteName="ForkliftMovementMain">
    <ForkliftMovementStack.Screen
      name="ForkliftMovementMain"
      component={ForkliftMovementScreen}
      options={({ navigation }) => ({
        headerTitle: 'Forklift Movement',
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
         headerRight: () => (
          <TouchableOpacity
            onPress={() =>
              navigation.getParent()?.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              })
            }
            style={{
              marginRight: 16,
            }}
          >
            <Ionicons
              name="home"
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        ),
      })}
    />
    <ForkliftMovementStack.Screen
      name="ForkliftPallet"
      component={ForkliftPallet}
     options={({ navigation }) => ({
        headerTitle: 'Scan Pallet',
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
         headerRight: () => (
          <TouchableOpacity
            onPress={() =>
              navigation.getParent()?.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              })
            }
            style={{
              marginRight: 16,
            }}
          >
            <Ionicons
              name="home"
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        ),
      })}
    />
     <ForkliftMovementStack.Screen
      name="ForkliftDestination"
      component={ForkliftDestination}
      options={({ navigation }) => ({
        headerTitle: 'Scan Destination',
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
         headerRight: () => (
          <TouchableOpacity
            onPress={() =>
              navigation.getParent()?.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              })
            }
            style={{
              marginRight: 16,
            }}
          >
            <Ionicons
              name="home"
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        ),
      })}
    />

  </ForkliftMovementStack.Navigator>
);

export default ForkliftMovementStackNavigator;
