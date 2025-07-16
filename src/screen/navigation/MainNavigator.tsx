import React from 'react';
import { getFocusedRouteNameFromRoute, NavigatorScreenParams } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Colors from "../../constants/Colors";
import HomeStackNavigator, { HomeStackParamList } from "./HomeNavigator";
import Ionicons from 'react-native-vector-icons/FontAwesome5';
import InboundStackNavigator from './InboundNavigator.tsx';
import PutAwayNavigator from "./PutAwayNavigator.tsx";
import OutboundNavigator from './OutboundNavigator.tsx';

// Define the param list for MainTab
export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Inbound: NavigatorScreenParams<HomeStackParamList>;
  Outbond: NavigatorScreenParams<HomeStackParamList>;
  inventory: NavigatorScreenParams<HomeStackParamList>;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Define a union type for allowed icon names
type IconNames = 'american-sign-language-interpreting' | 'home' | 'inventory' | 'user' | 'cog' | 'arrow-up' | 'arrow-down' | 'person-outline' | 'settings-outline' | 'alert-circle';

const MainNavigator = () => (
  <Tab.Navigator
    initialRouteName="Home"
    screenOptions={({ route }) => {
      // Get the name of the currently focused route in nested navigator
      const routeName = getFocusedRouteNameFromRoute(route) ?? '';

      // Determine if tab bar should be hidden
      const hideTabBar = routeName === 'InboundVehicle' || routeName === 'InboundDetail' || routeName === 'InboundInputVehicle' || routeName === 'InboundDeliveryOrder';

      return {
        tabBarIcon: ({ color, size }) => {
          // Specify the iconName as one of the valid icon names in the IconNames type
          let iconName: IconNames = 'alert-circle'; // Default value

          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Inbound') iconName = 'arrow-down';
          else if (route.name === 'Outbond') iconName = 'arrow-up';
          else if (route.name === 'inventory') iconName = 'american-sign-language-interpreting';

          // Return the Ionicons component with the correct icon
          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarActiveTintColor: Colors.secondaryColor,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          paddingTop: 4,
          height: hideTabBar ? 0 : 60, // Hide tab bar by setting height 0
          display: hideTabBar ? 'none' : 'flex', // Also hide with display:none for Android/iOS
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginBottom: 0,
        },
        headerShown: false,
      };
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeStackNavigator}
      options={{
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="Inbound"
      component={InboundStackNavigator}
      options={{
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="Outbond"
      component={OutboundNavigator}
      options={{
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="inventory"
      component={HomeStackNavigator}
      options={{
        headerShown: false,
      }}
    />
  </Tab.Navigator>
);

export default MainNavigator;
