import React, { useEffect, useState } from 'react';
import AuthNavigator from './screen/navigation/AuthNavigator';
import { ActivityIndicator, StatusBar, Text, View } from 'react-native';
import MainNavigator from "./screen/navigation/MainNavigator";
import { loadAuthState, useAuthStore } from "./store/useAuthStore";
import Colors from './constants/Colors.ts';
import Ionicons from 'react-native-vector-icons/FontAwesome5';

const AppNavigator = () => {
    const { isAuthenticated } = useAuthStore();
    const [isBooting, setIsBooting] = useState(true);


    useEffect(() => {
        const initializeAuthState = async () => {

            try {
                await loadAuthState(useAuthStore.setState);
            } catch (e) {
                console.error(e);
            } finally {
                setIsBooting(false);
            }

        };

        initializeAuthState();
    }, []);


    if (isBooting) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: Colors.secondaryColor,
                }}
            >
                <ActivityIndicator size="large" color="#fff" />
                <Ionicons
                    name="truck-moving"
                    size={60}
                    color="#fff"
                    style={{ marginTop: 25 }}
                />
                <Text
                    style={{
                        marginTop: 10,
                        fontSize: 18,
                        color: '#fff',
                        fontWeight: '600',
                        letterSpacing: 1,
                    }}
                >
                    WMS MOBILE APPLICATION
                </Text>
            </View>
        );
    }
    return (
        <>
            <StatusBar
                barStyle={'light-content'}
                backgroundColor={Colors.secondaryColor}
            />
            {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
        </>
    );
};

export default AppNavigator;
