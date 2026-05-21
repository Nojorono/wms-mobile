import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';

import React from 'react';
import PickingScreen from '../../page/outbound/picking/PickingDoScreen.tsx';
import PickingDetailScreen from '../../page/outbound/picking/PikingMemoScreen.tsx';
import PickingActivity from '../../page/outbound/picking/PickingActivity.tsx';
import PickingDetailActivity from '../../page/outbound/picking/PickingDetailActivity.tsx';
import PickingSkuScreen from '../../page/outbound/picking/PickingSkuScreen.tsx';
import PickingSkuByPallet from '../../page/outbound/picking/PickingSkuByPallet.tsx';
import PickingSkuTab from '../../page/outbound/picking/PickingSkuTab.tsx';
import { TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';



export type PickingParamList = {
  PickingDoMain: undefined;
  PickingMemo: { item: any };
  PickingSku: { item: any };
  PickingActivity: { item: any };
  PickingDetailActivity: {
    mode: "add" | "edit";
    itemBefore?: any;
    activity?: any;
  };
};

const PickingStack = createStackNavigator<PickingParamList>();

const PickingStackNavigator = () => (
  <PickingStack.Navigator initialRouteName="PickingDoMain">
    <PickingStack.Screen
      name="PickingDoMain"
      component={PickingScreen}
      options={({ navigation }) => ({
        headerTitle: 'Picking',
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
    <PickingStack.Screen
      name="PickingMemo"
      component={PickingDetailScreen}
      options={({ navigation }) => ({
        headerTitle: 'Picking Memo',
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
    <PickingStack.Screen
      name="PickingSku"
      component={PickingSkuTab}
      options={({ navigation }) => ({
        headerTitle: 'Picking - SKU',
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
    <PickingStack.Screen
      name="PickingActivity"
      component={PickingActivity}
      options={({ navigation }) => ({
        headerTitle: 'Picking - Activity',
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
    <PickingStack.Screen
      name="PickingDetailActivity"
      component={PickingDetailActivity}
      options={({ navigation }) => ({
        headerTitle: 'Picking - Detail Activity',
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


  </PickingStack.Navigator>
);

export default PickingStackNavigator;
