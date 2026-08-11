import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import { Image, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SortirScreen from '../../page/inbound/sortir/SortirScreen.tsx';
import SortirSkuList from '../../page/inbound/sortir/SortirSkuScreen.tsx';
import SortirSkuDetail from '../../page/inbound/sortir/SortirSkuDetail.tsx';



export type SortirParamList = {
  SortirMain: undefined;   
  SortirSku: { item: any; };                      
  SortirSkuDetail: { item: any; };
};

const SortirStack = createStackNavigator<SortirParamList>();

const SortirStackNavigator = () => (
  <SortirStack.Navigator initialRouteName="SortirMain">
    <SortirStack.Screen
      name="SortirMain"
      component={SortirScreen}
      options={({ navigation }) => ({
        headerTitle: 'Inbound Sortir Main',
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
     <SortirStack.Screen
      name="SortirSku"
      component={SortirSkuList}
      options={({ navigation }) => ({
        headerTitle: 'Inbound Sortir Sku',
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
     <SortirStack.Screen
      name="SortirSkuDetail"
      component={SortirSkuDetail}
      options={({ navigation }) => ({
        headerTitle: 'Inbound Sortir Sku Detail',
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
  </SortirStack.Navigator>
);

export default SortirStackNavigator;
