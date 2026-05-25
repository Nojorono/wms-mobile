import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import { Image, TouchableOpacity, View } from 'react-native';
import React from 'react';
import UpdateHelperScreen from '../../page/movement/updateHelper/UpdateHelperScreen.tsx';
import UpdateHelperDetail from '../../page/movement/updateHelper/UpdateHelperDetail.tsx';
import Ionicons from 'react-native-vector-icons/Ionicons';




export type HelperMovementParamList = {
  HelperMovementMain: undefined;
    UpdateHelperDetail:  {item:any};
};

const HelperMovementStack = createStackNavigator<HelperMovementParamList>();

const HelperMovementStackNavigator = () => (
  <HelperMovementStack.Navigator initialRouteName="HelperMovementMain">
    <HelperMovementStack.Screen
      name="HelperMovementMain"
      component={UpdateHelperScreen}
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
    <HelperMovementStack.Screen
      name="UpdateHelperDetail"
      component={UpdateHelperDetail}
     options={({ navigation }) => ({
        headerTitle: 'Update Helper Detail',
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

  </HelperMovementStack.Navigator>
);

export default HelperMovementStackNavigator;
