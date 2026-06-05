import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import { Image, TouchableOpacity, View } from 'react-native';
import React from 'react';
import InboundScreen from '../../page/inbound/inboundMain/InboundScreen.tsx';

import InboundIndex from '../../page/Inbound.tsx';
import UnloadingNavigator from './UnloadingNavigator.tsx';
import InspectionNavigator from './InspectionNavigator.tsx';
import InboundDetail from '../../page/inbound/inboundMain/InboundDetail.tsx';
import CheckerScreen from '../../page/inbound/inboundMain/checker/CheckerScreen.tsx';
import UpdateSaldoNavigator from './UpdateSaldoNavigator.tsx';
import ForkLiftNavigator from './ForkLiftNavigator.tsx';
import Ionicons from 'react-native-vector-icons/Ionicons';




export type InboundParamList = {
  InboundIndex: undefined;
  InboundMain: undefined;
  //NEW WMS
  InboundDetail: { item: any };
  CheckerScreen: { item: any };
  UnloadingNavigator: undefined;
  ForkLiftNavigator: undefined;
  InspectionNavigator: {
    screen: "InspectionMain";
    params: { item: any };
  };
  UpdateSaldoNavigator: {
    screen: "UpdateSaldoMain";
    params: { item: any };
  }
};

const InboundStack = createStackNavigator<InboundParamList>();

const InboundStackNavigator = () => (
  <InboundStack.Navigator initialRouteName="InboundIndex">
    <InboundStack.Screen
      name="InboundIndex"
      component={InboundIndex}
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
    <InboundStack.Screen
      name="InboundMain"
      component={InboundScreen}
      options={({ navigation }) => ({
        headerTitle: 'Inbound',
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

    {/* //NEW WMS */}
    <InboundStack.Screen
      name="InboundDetail"
      component={InboundDetail}
      options={({ navigation }) => ({
        headerTitle: 'Inbound Detail',
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
    <InboundStack.Screen
      name="CheckerScreen"
      component={CheckerScreen}
      options={({ navigation }) => ({
        headerTitle: 'Helper List',
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
        headerRight: () => (
          <></>
          // <TouchableOpacity
          //   onPress={() =>
          //     navigation.getParent()?.reset({
          //       index: 0,
          //       routes: [{ name: 'Home' }],
          //     })
          //   }
          //   style={{
          //     marginRight: 16,
          //   }}
          // >
          //   <Ionicons
          //     name="home"
          //     size={20}
          //     color="#fff"
          //   />
          // </TouchableOpacity>
        ),
      })}
    />
    <InboundStack.Screen
      name="UnloadingNavigator"
      component={UnloadingNavigator}
      options={{
        headerTitle: 'Unloading',
        headerShown: false,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    <InboundStack.Screen
      name="InspectionNavigator"
      component={InspectionNavigator}
      options={{
        headerTitle: 'Inspection',
        headerShown: false,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    <InboundStack.Screen
      name="UpdateSaldoNavigator"
      component={UpdateSaldoNavigator}
      options={{
        headerTitle: 'Update Saldo',
        headerShown: false,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    <InboundStack.Screen
      name="ForkLiftNavigator"
      component={ForkLiftNavigator}
      options={{
        headerTitle: 'Forklift',
        headerShown: false,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
  </InboundStack.Navigator>
);

export default InboundStackNavigator;
