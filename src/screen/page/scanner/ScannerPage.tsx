import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ScannerParamList } from '../../navigation/scanner/scannerNavigator.tsx';
import GlobalStyles from '../../../util/GlobalStyles';
import { useAuthStore } from '../../../store/useAuthStore';
import MenuCard from '../../../components/MenuCard.tsx';
import { ROLES } from '../../../constants/Roles.ts';
import Colors from '../../../constants/Colors.ts';



type NavigationProp = StackNavigationProp<ScannerParamList, 'ScannerMain'>;

function ScannerIndex() {
  const styles = GlobalStyles();
  const { user } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();
  const roleName = user?.role?.name || "";

  return (
    <View style={{ flex: 1, backgroundColor: Colors.secondaryColor }}>
      {/* Header */}
      <View style={styles.headerHome}>
        <View style={styles.profileSection}>
          <Text style={styles.profileText}>Hi! {roleName}</Text>
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
            {roleName === ROLES.DRIVER_FORKLIFT && (
              <MenuCard
                title={"Pallet"}
              // onPress={() => navigationInbound.navigate("ForkLiftNavigator")}
              />
            )}

           {roleName === ROLES.WH_STAFF && (
              <>
                <MenuCard
                  title={"Pallet Scan"}
                // onPress={() => navigation.navigate("")}
                />
              </>
            )}

            {roleName === ROLES.HELPER && (
              <>
               <MenuCard
                  title={"Scan Pallet"}
                onPress={() => navigation.navigate("ScanPalletScreen")}
                />
                <MenuCard
                  title={"Scan Bin"}
                // onPress={() => navigation.navigate("ScannerInspection")}
                />
              </>

            )}

            {/* 🔸 Optional: fallback jika role tidak dikenali */}
             {!Object.values(ROLES).includes(roleName as typeof ROLES[keyof typeof ROLES]) && (
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

export default ScannerIndex;
