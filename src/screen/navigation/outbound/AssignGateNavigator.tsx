import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors';
import { Image, TouchableOpacity, View } from 'react-native';
import React from 'react';
import AssignGateDoScreen from '../../page/outbound/assignGate/AssignGateDo.tsx';
import AssignGateActivity from '../../page/outbound/assignGate/AssignGateActivity.tsx';
import AssignGateVehicle from '../../page/outbound/assignGate/AssignGateVehicle.tsx';
import AssignGateLoading from '../../page/outbound/assignGate/AssignGateLoading.tsx';
import Ionicons from 'react-native-vector-icons/Ionicons';



export type AssignGateParamList = {
  AssignGateMain: undefined;
  AssignGateActivity: {
    item: any;
    mode?: "add" | "edit";
    assignedGate?: any;
  };
  AssignGateLoading: {
    item: any;
    mode?: "add" | "edit";
    assignedGate?: any;
  };
  AssignGateVehicle: { item: any };
}
const AssignGateStack = createStackNavigator<AssignGateParamList>();

const AssignGateStackNavigator = () => (
  <AssignGateStack.Navigator initialRouteName="AssignGateMain">
    <AssignGateStack.Screen
      name="AssignGateMain"
      component={AssignGateDoScreen}
      options={{
        headerShown: true,
        headerTitle: 'Assign Gate',
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor, // Full header background
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
          borderBottomWidth: 0, // Remove any border
        },
        // headerTitle: () => (
        //   <View
        //     style={{
        //       width: '100%',
        //       alignItems: 'center',
        //     }}
        //   >
        //     <Image
        //       source={require('../../../assets/images/icon-white-nna.png')}
        //       style={{ width: 100, height: 22, resizeMode: 'contain' }}
        //     />
        //   </View>
        // ),
      }}
    />
    <AssignGateStack.Screen
      name="AssignGateVehicle"
      component={AssignGateVehicle}
      options={({ navigation }) => ({
        headerTitle: 'Assign Gate - Vehicle',
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
    <AssignGateStack.Screen
      name="AssignGateActivity"
      component={AssignGateActivity}
      options={({ navigation }) => ({
        headerTitle: 'Assign Gate - Activity',
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
    <AssignGateStack.Screen
      name="AssignGateLoading"
      component={AssignGateLoading}
      options={({ navigation }) => ({
        headerTitle: 'Assign Gate - Loading',
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



  </AssignGateStack.Navigator>
);

export default AssignGateStackNavigator;
