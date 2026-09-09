import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import GlobalDialog from './components/GlobalDialog';
import LoadingDialog from './components/LoadingDialog';
import AppNavigator from './AppNavigator';
import "react-native-get-random-values";
import { StyleSheet } from 'react-native';
import Colors from './constants/Colors.ts';  
import GlobalConfirmation from './components/GlobalConfirmation.tsx';
import NotificationConnector from './util/notificationConnector.tsx';

enableScreens();

const Main = () => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeAreaBackground}>
        <NavigationContainer theme={DefaultTheme}>
          
          {/* 1. Render layar utama (Navigator) dan logic background terlebih dahulu */}
          <AppNavigator />
          <NotificationConnector />

          {/* 2. Komponen absolut / overlay diletakkan paling bawah agar menutupi layar navigasi */}
          <GlobalConfirmation />
          <GlobalDialog />
          <LoadingDialog />

        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default function App() {
  return <Main />;
}

const styles = StyleSheet.create({
  safeAreaBackground: {
    flex: 1,
    backgroundColor: Colors.secondaryColor,
    paddingTop: 0, 
  },
});