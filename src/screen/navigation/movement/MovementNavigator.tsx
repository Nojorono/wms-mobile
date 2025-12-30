import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../../../constants/Colors';
import { Image, View } from 'react-native';
import React from 'react';
import MovementIndex from '../../page/Movement.tsx';



export type MovementParamList = {
  MovementIndex: undefined;
  MovementMain: undefined;
};

const MovementStack = createStackNavigator<MovementParamList>();

const MovementStackNavigator = () => (
  <MovementStack.Navigator initialRouteName="MovementIndex">
    <MovementStack.Screen
      name="MovementIndex"
      component={MovementIndex}
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
   
  </MovementStack.Navigator>
);

export default MovementStackNavigator;
