import React from 'react';
import { getFocusedRouteNameFromRoute, NavigatorScreenParams } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Colors from "../../constants/Colors";
import HomeStackNavigator, { HomeStackParamList } from "./HomeNavigator";
import Ionicons from 'react-native-vector-icons/FontAwesome5';
import InboundStackNavigator from './inbound/InboundNavigator.tsx';
import OutboundNavigator from './outbound/OutboundNavigator.tsx';
import ScannerStackNavigator from './scanner/ScannerNavigator.tsx';

// Define the param list for MainTab
export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Inbound: NavigatorScreenParams<HomeStackParamList>;
  Outbond: NavigatorScreenParams<HomeStackParamList>;
  Scanner: NavigatorScreenParams<HomeStackParamList>;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Define allowed icon names
type IconNames =
  | 'american-sign-language-interpreting'
  | 'home'
  | 'inventory'
  | 'user'
  | 'cog'
  | 'arrow-up'
  | 'arrow-down'
  | 'person-outline'
  | 'settings-outline'
  | 'alert-circle';

const MainNavigator = () => (
  <Tab.Navigator
    initialRouteName="Home"
    screenOptions={({ route }) => {
      const routeName = getFocusedRouteNameFromRoute(route);
      // '' atau undefined akan jadi null (AMAN)
      const currentRoute = routeName || null;

      const isInboundHidden =
        route.name === 'Inbound' &&
        currentRoute !== null &&
        currentRoute !== 'InboundIndex';

      const isOutboundHidden =
        route.name === 'Outbond' &&
        currentRoute !== null &&
        currentRoute !== 'OutboundIndex';

      const hideTabBar = isInboundHidden || isOutboundHidden;

      return {
        tabBarIcon: ({ color }) => {
          let iconName: IconNames = 'alert-circle';

          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Inbound') iconName = 'arrow-down';
          else if (route.name === 'Outbond') iconName = 'arrow-up';
          else if (route.name === 'Scanner') iconName = 'american-sign-language-interpreting';

          return <Ionicons name={iconName} size={22} color={color} />;
        },

        tabBarActiveTintColor: Colors.secondaryColor,
        tabBarInactiveTintColor: 'gray',

        // IMPORTANT FIX → use undefined so RN does NOT cache hidden tab
        tabBarStyle: hideTabBar ? { display: 'none' } : undefined,

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },

        headerShown: false,
      };
    }}
  >
    <Tab.Screen name="Home" component={HomeStackNavigator} />
    <Tab.Screen
      name="Inbound"
      component={InboundStackNavigator}
      options={{
        tabBarItemStyle: { display: 'none' },  
        tabBarStyle: { display: 'none' },      
      }}
    />

    <Tab.Screen
      name="Outbond"
      component={OutboundNavigator}
      options={{
        tabBarItemStyle: { display: 'none' },  
        tabBarStyle: { display: 'none' },
      }}
    />
    <Tab.Screen name="Scanner" component={ScannerStackNavigator} />
  </Tab.Navigator>
);

export default MainNavigator;
