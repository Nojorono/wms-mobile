import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import { Image, TouchableOpacity, View } from 'react-native';
import React from 'react';
import MoveLocationScreen from '../../page/movement/moveLocation/MoveLocationScreen.tsx';
import MoveLocationCreate from '../../page/movement/moveLocation/MoveLocationCreate.tsx';
import MoveLocationDetail from '../../page/movement/moveLocation/MoveLocationDetail.tsx';
import Ionicons from 'react-native-vector-icons/Ionicons';


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
      options={({ navigation }) => ({
        headerTitle: 'Move Location Detail',
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
    <MoveLocationStack.Screen
      name="MoveLocationCreate"
      component={MoveLocationCreate}
      options={({ navigation }) => ({
        headerTitle: 'Create Move Location',
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
     <MoveLocationStack.Screen
      name="MoveLocationDetail"
      component={MoveLocationDetail}
     options={({ navigation }) => ({
        headerTitle: 'Move Location Detail',
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

  </MoveLocationStack.Navigator>
);

export default MoveLocationStackNavigator;
