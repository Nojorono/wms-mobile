import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors';
import { Image, View } from 'react-native';
import React from 'react';
import ScannerIndex from '../../page/scanner/ScannerPage.tsx';
import ScanPalletScreen from '../../page/scanner/ScanPalletScreen.tsx';
import ScanPalletDetail from '../../page/scanner/ScanPalletDetail.tsx';



export type ScannerParamList = {
  ScannerIndex: undefined;
  ScannerMain: undefined;
  ScanPalletScreen: undefined;
  ScanPalletDetail: { data: any };
};

const ScannerStack = createStackNavigator<ScannerParamList>();

const ScannerStackNavigator = () => (
  <ScannerStack.Navigator initialRouteName="ScannerIndex">
    <ScannerStack.Screen
      name="ScannerIndex"
      component={ScannerIndex}
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
    <ScannerStack.Screen
      name="ScanPalletScreen"
      component={ScanPalletScreen}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
    <ScannerStack.Screen
      name="ScanPalletDetail"
      component={ScanPalletDetail}
      options={{
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: Colors.secondaryColor,
        },
      }}
    />
  </ScannerStack.Navigator>
);

export default ScannerStackNavigator;
