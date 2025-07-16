import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import GlobalStyles from '../../util/GlobalStyles.ts';
import Colors from '../../constants/Colors';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MenuCard from "../../components/MenuCard.tsx";
import { OutboundParamList } from '../navigation/OutboundNavigator.tsx';


type NavigationProp = StackNavigationProp<OutboundParamList,'OutboundMain'>;

function OutboundIndex() {
  const styles = GlobalStyles();
  const { user } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();

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
            <Text style={styles.activitiesHeaderText}>Outbound Menu</Text>
          </View>
          <MenuCard title={'Outbound Picking'} onPress={() => {navigation.navigate("OutboundMain")}}/>
          <MenuCard title={'Outbound Packing'} />
          <MenuCard title={'Outbound Checking'} />
        </View>
      </ScrollView>
    </View>
  );
}

export default OutboundIndex;
