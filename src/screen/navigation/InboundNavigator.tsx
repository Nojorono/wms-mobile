import {createStackNavigator} from "@react-navigation/stack";
import HomeScreen from "../HomeScreen";
import Colors from "../../constants/Colors";
import {Image, View} from "react-native";
import Ionicons from '@react-native-vector-icons/ionicons';
import React from "react";
import InboundScreen from "../page/inbound/InboundScreen.tsx";


export type InboundParamList = {
    InboundMain: undefined;
};

const InboundStack = createStackNavigator<InboundParamList>();

const InboundStackNavigator = () => (
    <InboundStack.Navigator initialRouteName="InboundMain">
        <InboundStack.Screen name="InboundMain" component={InboundScreen} options={{
            headerShown: true,
            headerStyle: {
                backgroundColor: Colors.secondaryColor, // Full header background
                elevation: 0, // Remove shadow on Android
                shadowOpacity: 0, // Remove shadow on iOS
                borderBottomWidth: 0, // Remove any border
            },
            headerTitle: () => (
                <View style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <Image source={require('../../assets/images/icon-white-nna.png')}
                           style={{width: 100, height: 22, resizeMode: 'contain'}}/>
                    <Ionicons name="notifications-outline" size={24} color="#fff" style={{marginRight: 15}}/>
                </View>
            ),
        }}/>
    </InboundStack.Navigator>
);

export default InboundStackNavigator;
