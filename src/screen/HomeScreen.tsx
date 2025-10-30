import React, { useState } from 'react';
import { StyleSheet, ScrollView, Text, TouchableOpacity, View, Image } from "react-native";
import { useAuthStore } from "../store/useAuthStore";
// import Ionicons from '@react-native-vector-icons/ionicons';

import GlobalStyles from "../util/GlobalStyles.ts";
import Colors from "../constants/Colors";
import StatusCard from "../components/NameCard";
import MenuGrid from "../components/MenuGrid";
import { useDialogStore } from "../store/useGlobalDialog";
import { useLoadingDialogStore } from "../store/useLoadingStore";
import Ionicons from 'react-native-vector-icons/FontAwesome5';

import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './navigation/MainNavigator.tsx';
type TabNavProp = BottomTabNavigationProp<MainTabParamList, 'Home'>;

function HomeScreen() {
  const styles = GlobalStyles();
  const { user } = useAuthStore();
   const roleName = user?.role?.name || "";


  const navigation = useNavigation<TabNavProp>();


  return (
    <View style={{ flex: 1, backgroundColor: Colors.secondaryColor }}>
      {/* Header */}
      <View style={styles.headerHome}>
        <View style={styles.profileSection}>
          <Text style={styles.profileText}>Hi! {roleName}</Text>
          <Text style={styles.profileSubtext}>Selamat beraktifitas, jaga selalu kesehatan</Text>
        </View>
      </View>
      {/* Main Scrollable Content */}
      <ScrollView contentContainerStyle={styles.menuContainer} style={styles.scrollViewContent} stickyHeaderIndices={[2]} >
        <View style={styles.menuCard}>
          <View style={styles.activitiesHeader}>
            <Text style={styles.activitiesHeaderText}>Menu</Text>
          </View>
          <View style={stylez.rowWithMargin}>
            <TouchableOpacity
              style={[stylez.cardx, stylez.flexOne, stylez.marginRight8]}
              onPress={() => {
                // TODO: handle inbound card press
                navigation.navigate('Inbound', { screen: 'inboundIndex' });
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-down" size={32} color={Colors.secondaryColor} />
              <Text style={stylez.titlex}>Inbound</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[stylez.cardx, stylez.flexOne, stylez.marginRight8]}
              onPress={() => {
                // TODO: handle inbound card press
                navigation.navigate('Outbond', { screen: 'outBoundIndex' });
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-up" size={32} color={Colors.primeColor} />
              <Text style={stylez.titlex}>Outbound</Text>
            </TouchableOpacity>
           
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default HomeScreen;
const stylez = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    backgroundColor: '#fff',
  },
  icon: {
    width: 70,
    height: 70,
    marginRight: 10,
    color: '#333',
  },
  title: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  cardx: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  titlex: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  rowWithMargin: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flexOne: {
    flex: 1,
  },
  marginRight8: {
    marginRight: 8,
  },
  marginLeft8: {
    marginLeft: 8,
  },
  inboundText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primeColor,
  },
  outboundText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.secondaryColor,
  },
})

