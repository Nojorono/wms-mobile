import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors';
import { Image, TouchableOpacity, View } from 'react-native';
import React from 'react';
import ForkliftGateScreen from '../../page/outbound/forkliftGate/ForkliftGateScreen';
import { ForkliftGateDetail } from '../../page/outbound/forkliftGate/ForkliftGateDetail';
import Ionicons from 'react-native-vector-icons/Ionicons';




export type ForkliftGateParamList = {
  ForkliftGateMain: undefined;
  ForkliftGateDetail: { item: any };
}
const ForkliftGateStack = createStackNavigator<ForkliftGateParamList>();

const ForkliftGateStackNavigator = () => (
  <ForkliftGateStack.Navigator initialRouteName="ForkliftGateMain">
    <ForkliftGateStack.Screen
      name="ForkliftGateMain"
      component={ForkliftGateScreen}
      options={({ navigation }) => ({
        headerTitle: 'Forklift Gate',
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
    <ForkliftGateStack.Screen
      name="ForkliftGateDetail"
      component={ForkliftGateDetail}
      options={({ navigation }) => ({
        headerTitle: 'Forklift Gate Detail',
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
  </ForkliftGateStack.Navigator>
);

export default ForkliftGateStackNavigator;
