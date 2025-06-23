import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import GlobalStyles from '../../../util/GlobalStyles.ts';
import Colors from '../../../constants/Colors';
import StatusCard from '../../../components/NameCard';
import MenuGrid from '../../../components/MenuGrid';

function InboundScreen() {
  const styles = GlobalStyles();
  const { user } = useAuthStore();

  const menus = [
    {
      title: 'Persiapan',
      image: 'persiapan',
      onPress: () => {},
    },
    {
      title: 'Mulai Perjalnaan',
      image: 'mulai-perjalanan',
      onPress: () => console.log('Tasks'),
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
          {/*<StatusCard*/}
          {/*  title="JAT/2025/12/04.0001"*/}
          {/*  description="16/02/2024"*/}
          {/*  endDate="16/02/2025"*/}
          {/*  status="Active"*/}
          {/*  statusColor="#E5FFF2"*/}
          {/*  route="Luar Kota"*/}
          {/*/>*/}

          <View style={styles.activitiesHeader}>
            <Text style={styles.activitiesHeaderText}>List Inbound PO</Text>
          </View>
          <StatusCard
            title="PO/2025/12/04.0001"
            description="16/02/2024"
            endDate="16/02/2025"
            status="Active"
            statusColor="#E5FFF2"
            route="Luar Kota"
          />
          <StatusCard
            title="PO/2025/12/04.0002"
            description="16/02/2024"
            endDate="16/02/2025"
            status="Active"
            statusColor="#E5FFF2"
            route="Luar Kota"
          />
          <StatusCard
            title="PO/2025/12/04.0003"
            description="16/02/2024"
            endDate="16/02/2025"
            status="Active"
            statusColor="#E5FFF2"
            route="Luar Kota"
          />
          {/*<MenuGrid items={menus} />*/}
        </View>
      </ScrollView>
    </View>
  );
}

export default InboundScreen;

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
});
