import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import { Image, TouchableOpacity, View } from 'react-native';
import React from 'react';
import UnloadingScreen from '../../page/inbound/unloading/UnloadingScreen.tsx';
import UnloadingDetailScreen from '../../page/inbound/unloading/UnloadingDetail.tsx';
import UnloadingScan from '../../page/inbound/unloading/UnloadingScan.tsx';
import UnloadingScanScreen from '../../page/inbound/unloading/UnloadingScan.tsx';
import CameraScreen from '../../page/inbound/unloading/CameraScan.tsx';
import Ionicons from 'react-native-vector-icons/Ionicons';



export type UnloadingParamList = {
  UnloadingMain: undefined;
  UnloadingVehicle: { item: any; };
  UnloadingDetail: { item: any; };
  UnloadingScan: { item: any; payload: any; scannedData?: any; };
  CameraScreen: { item: any; dataExist?: any[];  };
};

const UnloadingStack = createStackNavigator<UnloadingParamList>();

const UnloadingStackNavigator = () => (
  <UnloadingStack.Navigator initialRouteName="UnloadingMain">
    <UnloadingStack.Screen
      name="UnloadingMain"
      component={UnloadingScreen}
      options={({ navigation }) => ({
        headerTitle: 'Unloading',
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
    <UnloadingStack.Screen
      name="UnloadingDetail"
      component={UnloadingDetailScreen}
      options={({ navigation }) => ({
        headerTitle: 'Unloading Detail',
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
    <UnloadingStack.Screen
      name="UnloadingScan"
     component={UnloadingScanScreen}
     options={({ navigation }) => ({
        headerTitle: 'Unloading Scan',
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
    <UnloadingStack.Screen
      name="CameraScreen"
      component={CameraScreen}
      options={{
        headerTitle: 'Scan Unloading',
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />  
  </UnloadingStack.Navigator>
);

export default UnloadingStackNavigator;
