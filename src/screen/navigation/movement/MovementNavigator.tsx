import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors';
import { Image, TouchableOpacity, View } from 'react-native';
import React from 'react';
import MovementIndex from '../../page/Movement.tsx';
import MoveLocationNavigator from './MoveLocationNavigator.tsx';
import ForkliftMovementStackNavigator from './ForkliftMovementNavigator.tsx';
import UpdateInventoryStackNavigator from './UpdateInventoryNavigator.tsx';
import HelperMovementStackNavigator from './HelperMovementNavigator.tsx';
import Ionicons from 'react-native-vector-icons/Ionicons';



export type MovementParamList = {
  MovementIndex: undefined;
  MovementMain: undefined;
  MoveLocationNavigator: undefined;
  ForkliftMovementNavigator: undefined;
  UpdateInventoryNavigator:undefined;
  HelperMovementNavigator: undefined;
};

const MovementStack = createStackNavigator<MovementParamList>();

const MovementStackNavigator = () => (
  <MovementStack.Navigator initialRouteName="MovementIndex">
    <MovementStack.Screen
      name="MovementIndex"
      component={MovementIndex}
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
     <MovementStack.Screen
      name="MoveLocationNavigator"
      component={MoveLocationNavigator}
       options={{
        headerTitle: 'Move Location',
        headerShown: false,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
      <MovementStack.Screen
      name="ForkliftMovementNavigator"
      component={ForkliftMovementStackNavigator}
      options={({ navigation }) => ({
        headerTitle: 'Forklift Movement',
        headerShown: false,
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
    <MovementStack.Screen
      name="UpdateInventoryNavigator"
      component={UpdateInventoryStackNavigator}
      options={({ navigation }) => ({
        headerTitle: 'Update Inventory',
        headerShown: false,
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
    <MovementStack.Screen
      name="HelperMovementNavigator"
      component={HelperMovementStackNavigator}
      options={({ navigation }) => ({
        headerTitle: 'Update Helper',
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
  </MovementStack.Navigator>
);

export default MovementStackNavigator;
