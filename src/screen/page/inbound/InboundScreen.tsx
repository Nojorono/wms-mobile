import React, { useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import GlobalStyles from '../../../util/GlobalStyles.ts';
import Colors from '../../../constants/Colors';
import InboundList from '../../../components/InboundList.tsx';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { InboundParamList } from '../../navigation/InboundNavigator.tsx';
import ConstantService from '../../../service/constantService.ts';
import useConstantStore from '../../../store/useConstantStore.ts';


type NavigationProp = StackNavigationProp<InboundParamList,'InboundMain'>;

function InboundScreen() {
  const styles = GlobalStyles();
  const navigation = useNavigation<NavigationProp>();
  const {setVehicle} = useConstantStore();
  const fetchConstants = async () => {
    try {
      try {
        const getVehicleType = await ConstantService.getVehicleType();
        console.log('getVehicleType', getVehicleType);
        setVehicle(getVehicleType.data);
      } catch (err) {
        console.error('Error fetching vehicle types:', err);
        throw new Error('Failed to fetch vehicle types');
      }
    } catch (error) {
      console.error('Error fetching constants:', error);
      Alert.alert(
        'Error',
        'Failed to fetch data. Please check your connection and try again.',
        [{text: 'OK'}]
      );
    }
  }

  useEffect(() => {
    const initialize = async () => {
      try {
        await fetchConstants();
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    initialize();
  })

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
