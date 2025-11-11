import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../HomeScreen";
import Colors from "../../constants/Colors";
import { Alert, Image, TouchableOpacity, View } from "react-native";
import Ionicons from 'react-native-vector-icons/FontAwesome5';
import React from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useConfirmationStore } from "../../store/useConfirmationStore";


export type HomeStackParamList = {
    HomeMain: undefined;
    inboundIndex: undefined;
    outBoundIndex: undefined;
};


const HomeStack = createStackNavigator<HomeStackParamList>();

const HomeStackNavigator = () => {
    const { clearAuth } = useAuthStore();
    const confirm = useConfirmationStore();
    return (
        <HomeStack.Navigator initialRouteName="HomeMain">
            <HomeStack.Screen name="HomeMain" component={HomeScreen} options={{
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
                            style={{ width: 100, height: 22, resizeMode: 'contain' }} />
                        
                        <TouchableOpacity
                            style={{ marginRight: 15 }}
                            onPress={() => {
                                console.log("Sign out pressed"); 
                                clearAuth()   
                            //     confirm.show("decline", "Are you sure want to sign out ?", () => {
                            //         clearAuth()
                            //     }, false
                            //     );
                            }
                        }
                        >
                            <Ionicons
                                name="sign-out-alt"
                                size={24}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    </View>
                ),
            }} />
        </HomeStack.Navigator>
    );
};

export default HomeStackNavigator;
