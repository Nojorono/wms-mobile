import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors';
import { Image, TouchableOpacity, View } from 'react-native';
import React from 'react';
import OutboundIndex from '../../page/Outbound.tsx';
import PickingNavigator from './PickingNavigator.tsx';
import InspectionNavigator from './InspectionNavigator.tsx';
import AssignGateNavigator from './AssignGateNavigator.tsx';
import ForkliftGateNavigator from './ForkliftGateNavigator.tsx';
import ApprovalGateScreen from '../../page/outbound/approvalGate/ApprovalGateActivity.tsx';
import Ionicons from 'react-native-vector-icons/Ionicons';



export type OutboundParamList = {
  OutboundIndex: undefined;
  OutboundMain: undefined;
  OutboundAssign: { item:any };
  //Helper
  OutboundPicking: undefined;
  //WH STAFF
  OutboundInspection: undefined;
  OutboundAssignGate: undefined;
  OutboundGateApproval: undefined;
  //Driver Forklift
  OutboundForkliftGate: undefined;
};

const OutboundStack = createStackNavigator<OutboundParamList>();

const OutboundStackNavigator = () => (
  <OutboundStack.Navigator initialRouteName="OutboundIndex">
    <OutboundStack.Screen
      name="OutboundIndex"
      component={OutboundIndex}
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
    <OutboundStack.Screen
      name="OutboundPicking"
      component={PickingNavigator}
      options={{
        headerShown: false,
        headerTitle: 'Picking',
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />

     <OutboundStack.Screen
      name="OutboundInspection"
      component={InspectionNavigator}
      options={{
        headerShown: false,
        headerTitle: 'Inspection',
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
     <OutboundStack.Screen
      name="OutboundAssignGate"
      component={AssignGateNavigator}
      options={{
        headerShown: false,
        headerTitle: 'Assign Gate',
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
       <OutboundStack.Screen
      name="OutboundForkliftGate"
      component={ForkliftGateNavigator}
      options={{
        headerShown: false,
        headerTitle: 'Forklift Gate',
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    <OutboundStack.Screen
      name="OutboundGateApproval"
      component={ApprovalGateScreen}
      options={({ navigation }) => ({
        headerTitle: 'Gate Approval',
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
  </OutboundStack.Navigator>
);

export default OutboundStackNavigator;
