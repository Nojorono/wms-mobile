import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import { Image, TouchableOpacity, View } from 'react-native';
import React from 'react';
import InspectionScreen from '../../page/inbound/inboundMain/inspection/InspectionScreen.tsx';
import InspectionDetail from '../../page/inbound/inboundMain/inspection/InspectionDetail.tsx';
import GoodReceiveScreen from '../../page/inbound/inboundMain/inspection/goodreceive/GoodReceiveScreen.tsx';
import GoodReceiveDetail from '../../page/inbound/inboundMain/inspection/goodreceive/GoodReceiveDetail.tsx';
import Ionicons from 'react-native-vector-icons/Ionicons';


export type InspectionParamList = {
  InspectionMain: {item: any};
  InspectionDetail: { item: any; payload: any };
  GoodReceive: { payload?: any };
  GoodReceiveDetail: { item: any; payload: any };
};

const InspectionStack = createStackNavigator<InspectionParamList>();

const InspectionStackNavigator = () => (
  <InspectionStack.Navigator initialRouteName="InspectionMain">
    <InspectionStack.Screen
      name="InspectionMain"
      component={InspectionScreen}
     options={({ navigation }) => ({
        headerTitle: 'Inspection',
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
    <InspectionStack.Screen
      name="InspectionDetail"
      component={InspectionDetail}
      options={({ navigation }) => ({
        headerTitle: 'Inspection Detail',
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
    <InspectionStack.Screen
      name="GoodReceive"
      component={GoodReceiveScreen}
      options={({ navigation }) => ({
        headerTitle: 'Good Receive',
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
    <InspectionStack.Screen
      name="GoodReceiveDetail"
      component={GoodReceiveDetail}
      options={({ navigation }) => ({
        headerTitle: 'Good Receive Detail',
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
    
  </InspectionStack.Navigator>
);

export default InspectionStackNavigator;
