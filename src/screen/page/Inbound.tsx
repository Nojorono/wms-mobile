import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import GlobalStyles from '../../util/GlobalStyles.ts';
import Colors from '../../constants/Colors';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { InboundParamList } from '../navigation/InboundNavigator.tsx';
import MenuCard from "../../components/MenuCard.tsx";
import {PutAwayParamList} from "../navigation/PutAwayNavigator.tsx";


type NavigationPropInbound = StackNavigationProp<InboundParamList,'InboundMain'>;
type NavigationPropPutaway = StackNavigationProp<PutAwayParamList,'PutAwayMain'>;

function InboundIndex() {
    const styles = GlobalStyles();
    const { user } = useAuthStore();
    const navigationInbound = useNavigation<NavigationPropInbound>();
    const navigationPutaway = useNavigation<NavigationPropPutaway>();

    return (
      <View style={{ flex: 1, backgroundColor: Colors.secondaryColor }}>
        {/* Header */}
        <View style={styles.headerHome}>
          <View style={styles.profileSection}>
            <Text style={styles.profileText}>Hi! {user?.firstName}</Text>
            <Text style={styles.profileSubtext}>
              Selamat beraktifitas, jaga selalu kesehatan rumah tanggamu
            </Text>
          </View>
        </View>
        {/* Main Scrollable Content */}
        <ScrollView
          contentContainerStyle={styles.menuContainer}
          stickyHeaderIndices={[2]}
          style={styles.scrollViewContent}
        >
          <View style={styles.menuCard}>
            <View
              style={[
                styles.activitiesHeader,
                { borderBottomWidth: 2, borderBottomColor: '#ccc' },
              ]}
            >
              <Text style={styles.activitiesHeaderText}>Inbound Menu</Text>
            </View>
            <MenuCard title={'Inbound'} onPress={() => {navigationInbound.navigate("InboundMain")}}/>
            <MenuCard title={'Put Away'} onPress={() => {navigationInbound.navigate("PutAwayNavigator")}}/>
          </View>
        </ScrollView>
      </View>
    );
}

export default InboundIndex;
