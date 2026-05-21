import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';

import React from 'react';
import InspectionScreen from '../../page/outbound/inspection/InspectionDoScreen.tsx';
import InspectionMemoScreen from '../../page/outbound/inspection/InspectionMemoScreen.tsx';
import InspectionSkuScreen from '../../page/outbound/inspection/InspectionSkuScreen.tsx';
import InspectionActivity from '../../page/outbound/inspection/InspectionActivity.tsx';
import NewInspectionMemo from '../../page/outbound/inspection/NewInspectionMemo.tsx';
import InspectionEditActivity from '../../page/outbound/inspection/InspectionEditActivity.tsx';
import { TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';




export type InspectionParamList = {
  InspectionDoMain: undefined;
  InspectionMemo: { item: any };
  NewInspectionMemo: { item: any };
  InspectionEditActivity: { activity: any, mode: "add" | "edit", itemBefore: any };


  //gakepake
  InspectionSku: { data: any, dataBefore: any };
  InspectionActivity: { data: any, dataBefore: any };
  InspectionDetailActivity: { item: any };
};

const InspectionStack = createStackNavigator<InspectionParamList>();

const InspectionStackNavigator = () => (
  <InspectionStack.Navigator initialRouteName="InspectionDoMain">
    <InspectionStack.Screen
      name="InspectionDoMain"
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
      name="InspectionMemo"
      component={InspectionMemoScreen}
      options={({ navigation }) => ({
        headerTitle: 'Inspection - Memo',
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
      name="InspectionSku"
      component={InspectionSkuScreen}
      options={({ navigation }) => ({
        headerTitle: 'Inspection - SKU',
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
      name="InspectionActivity"
      component={InspectionActivity}
      options={({ navigation }) => ({
        headerTitle: 'Inspection - Activity',
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
      name="NewInspectionMemo"
      component={NewInspectionMemo}
      options={({ navigation }) => ({
        headerTitle: 'Inspection - Memo',
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
      name="InspectionEditActivity"
      component={InspectionEditActivity}
      options={({ navigation }) => ({
        headerTitle: 'Inspection - Edit Activity',
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
