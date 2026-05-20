import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import React from 'react';
import ForkLiftScreen from '../../page/inbound/forkLift/ForkLiftScreen.tsx';
import ForkLiftDetailScreen from '../../page/inbound/forkLift/ForkLiftDetailScreen.tsx';
import CameraScreenForkLift from '../../page/inbound/forkLift/CameraScanForkLift.tsx';
import { TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';



export type ForkLiftParamList = {
  ForkLiftMain: undefined;
  ForkLiftDetail: { item: any }
  CameraScreen: { item: any }
};

const ForkLiftStack = createStackNavigator<ForkLiftParamList>();

const ForkLiftStackNavigator = () => (
  <ForkLiftStack.Navigator initialRouteName="ForkLiftMain">
    <ForkLiftStack.Screen
      name="ForkLiftMain"
      component={ForkLiftScreen}
      options={({ navigation }) => ({
        headerTitle: 'Forklift',
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
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
    <ForkLiftStack.Screen
      name="ForkLiftDetail"
      component={ForkLiftDetailScreen}
     options={({ navigation }) => ({
        headerTitle: 'Forklift Detail',
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
    <ForkLiftStack.Screen
      name="CameraScreen"
      component={CameraScreenForkLift}
      options={{
        headerTitle: 'Scan Forklift',
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
  </ForkLiftStack.Navigator>
);

export default ForkLiftStackNavigator;
