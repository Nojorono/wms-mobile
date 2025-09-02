import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors.ts';
import { Image, View } from 'react-native';
import React from 'react';
import InspectionScreen from '../../page/inbound/inspection/InspectionScreen.tsx';
import InspectionDo from '../../page/inbound/inspection/InspectionDo.tsx';
import InspectionList from '../../page/inbound/inspection/InspectionList.tsx';
import InspectionDetail from '../../page/inbound/inspection/InspectionLDetail.tsx';


export type InspectionParamList = {
  InspectionMain: undefined;
  InspectionDo: { item: any; };
  InspectionList: { id: string; };
  InspectionVehicle: { item: any; };
  InspectionDetail: { palletId: string; items: any[]; };
};

const InspectionStack = createStackNavigator<InspectionParamList>();

const InspectionStackNavigator = () => (
  <InspectionStack.Navigator initialRouteName="InspectionMain">
    <InspectionStack.Screen
      name="InspectionMain"
      component={InspectionScreen}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor, // Full header background
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
          borderBottomWidth: 0, // Remove any border
        },
      }}
    />
     <InspectionStack.Screen
      name="InspectionDo"
      component={InspectionDo}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
      <InspectionStack.Screen
      name="InspectionList"
      component={InspectionList}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
      <InspectionStack.Screen
      name="InspectionDetail"
      component={InspectionDetail}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    {/* <UnloadingStack.Screen
      name="UnloadingVehicle"
      component={UnloadingVehicleScreen}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    <UnloadingStack.Screen
      name="UnloadingDetail"
      component={UnloadingDetailScreen}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }} */}
    {/* /> */}
  </InspectionStack.Navigator>
);

export default InspectionStackNavigator;
