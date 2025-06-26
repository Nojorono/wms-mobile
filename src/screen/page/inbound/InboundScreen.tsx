import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import GlobalStyles from '../../../util/GlobalStyles.ts';
import Colors from '../../../constants/Colors';
import InboundList from '../../../components/InboundList.tsx';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { InboundParamList } from '../../navigation/InboundNavigator.tsx';


type NavigationProp = StackNavigationProp<InboundParamList,'InboundMain'>;

function InboundScreen() {
  const styles = GlobalStyles();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();

  const inboundListData = [
    {
      id: 1,
      title: 'PO/2025/12/04.0001',
      status: 'Active',
      statusColor: '#E5FFF2',
    },
    {
      id: 2,
      title: 'PO/2025/12/04.0002',
      status: 'Active',
      statusColor: '#E5FFF2',
    },
    {
      id: 3,
      title: 'PO/2025/12/04.0003',
      status: 'Active',
      statusColor: '#E5FFF2',
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.secondaryColor }}>
      {/* Header */}
      <View style={styles.headerHome}>
        <View style={styles.profileSection}>
          <Text style={styles.profileText}>Hi! Handsome</Text>
          <Text style={styles.profileSubtext}>
            Selamat beraktifitas, jaga selalu kesehatan rumah tanggamu
          </Text>
        </View>
      </View>
      {/* Main Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.menuContainer}
        stickyHeaderIndices={[2]}
      >
        <View style={styles.menuCard}>
          <View
            style={[
              styles.activitiesHeader,
              { borderBottomWidth: 2, borderBottomColor: '#ccc' },
            ]}
          >
            <Text style={styles.activitiesHeaderText}>List Inbound Planning</Text>
          </View>
          {inboundListData.map(item => (
            <InboundList
              key={item.id}
              title={item.title}
              status={item.status}
              statusColor={item.statusColor}
              onClick={()=>{navigation.navigate('InboundVehicle', { item })}}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default InboundScreen;
