import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import { Image, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ReturScreen from '../../page/inbound/retur/ReturScreen.tsx';
import ReturDetailScreen from '../../page/inbound/retur/ReturDetailScreen.tsx';
import ReturHelperScreen from '../../page/inbound/retur/helper/ReturHelperScreen.tsx';
import ReturInspectionList from '../../page/inbound/retur/inspection/ReturInspectionScreen.tsx';
import ReturInspectionDetail from '../../page/inbound/retur/inspection/ReturInspectionDetail.tsx';



export type ReturParamList = {
  ReturMain: undefined;                         
  ReturDetail: { item: any; };
  ReturHelperList: { item: any; };
  ReturInspectionList: { item: any; };
  ReturInspectionDetail: { item: any; };
};

const ReturStack = createStackNavigator<ReturParamList>();

const ReturStackNavigator = () => (
  <ReturStack.Navigator initialRouteName="ReturMain">
    <ReturStack.Screen
      name="ReturMain"
      component={ReturScreen}
      options={({ navigation }) => ({
        headerTitle: 'Inbound Retur Main',
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
    <ReturStack.Screen
      name="ReturDetail"
      component={ReturDetailScreen}
      options={({ navigation }) => ({
        headerTitle: 'Inbound Retur Detail',
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
    <ReturStack.Screen
      name="ReturHelperList"
      component={ReturHelperScreen}
      options={({ navigation }) => ({
        headerTitle: 'Inbound Retur Helper List',
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
    <ReturStack.Screen
      name="ReturInspectionList"
      component={ReturInspectionList}
      options={({ navigation }) => ({
        headerTitle: 'Inspection Inbound Retur',
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
    
        <ReturStack.Screen
      name="ReturInspectionDetail"
      component={ReturInspectionDetail}
      options={({ navigation }) => ({
        headerTitle: 'Inspection Inbound Retur',
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
  </ReturStack.Navigator>
);

export default ReturStackNavigator;
