import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import GlobalStyles from '../../util/GlobalStyles.ts';
import Colors from '../../constants/Colors';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { InboundParamList } from '../navigation/inbound/InboundNavigator.tsx';
import MenuCard from "../../components/MenuCard.tsx";


type NavigationPropInbound = StackNavigationProp<InboundParamList,'InboundMain'>;

function InboundIndex() {
    const styles = GlobalStyles();
    const { user } = useAuthStore();
    const navigationInbound = useNavigation<NavigationPropInbound>();
     const roleName = user?.role?.name || "";

    return (
      <View style={{ flex: 1, backgroundColor: Colors.secondaryColor }}>
        {/* Header */}
        <View style={styles.headerHome}>
          <View style={styles.profileSection}>
            <Text style={styles.profileText}>Hi!</Text>
            <Text style={styles.profileSubtext}>
              Selamat beraktifitas, jaga selalu kesehatan
            </Text>
          </View>
        </View>
        {/* Main Scrollable Content */}
        <View style={{ flex: 1 }}>
          {/* Sticky Header */}
          <View
            style={[
              styles.activitiesHeader,
              {
          borderBottomWidth: 2,
          borderBottomColor: '#ccc',
          zIndex: 1,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
          backgroundColor: "#fff" // Tambahkan ini agar background tetap sesuai
              }
            ]}
          >
            <Text style={styles.activitiesHeaderText}>Inbound Menu</Text>
          </View>
          <ScrollView
            contentContainerStyle={[styles.menuContainer, { paddingTop: 60 }]}
            style={styles.scrollViewContent}
          >
            <View style={styles.menuCard}>
              {roleName === "DRIVER FORKLIFT" && (
          <MenuCard
            title={"Put Away"}
            onPress={() => navigationInbound.navigate("ForkLiftNavigator")}
          />
        )}

        {roleName === "WH STAFF" && (
          <MenuCard
            title={"Inbound"}
            onPress={() => navigationInbound.navigate("InboundMain")}
          />
        )}

        {roleName === "HELPER" && (
          <MenuCard
            title={"Unloading"}
            onPress={() => navigationInbound.navigate("UnloadingNavigator")}
          />
        )}

        {/* 🔸 Optional: fallback jika role tidak dikenali */}
        {!["DRIVER FORKLIFT", "WH STAFF", "HELPER"].includes(roleName) && (
          <Text style={{
              textAlign: "center",
              color: "#999",
              marginTop: 20
            }}>
            Role "{roleName}" belum memiliki menu khusus.
          </Text>
        )}
            </View>
          </ScrollView>
        </View>
      </View>
    );
}

export default InboundIndex;
