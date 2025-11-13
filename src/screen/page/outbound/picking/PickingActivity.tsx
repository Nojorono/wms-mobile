import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PickingParamList } from '../../../navigation/outbound/PickingNavigator';

type NavigationProp = StackNavigationProp<PickingParamList, 'PickingDoMain'>;

export default function PickingActivity() {
  const navigation = useNavigation<NavigationProp>();

  const handleAddActivity = () => {
    navigation.navigate('PickingDetailActivity', { item: {} });
  };

  // 🔹 Dummy data (3 contoh)
  const activities = [
    {
      preload: 'PRELOAD-06',
      details: [
        { label: 'Sumber', pallet: 'Pallet-003', location: 'JT 6 - D', qty: '25 DUS' },
        { label: 'Picking', pallet: 'Pallet-003', location: 'JT 6 - D', qty: '20 DUS' },
        { label: 'Switching', pallet: 'Pallet-303', location: 'JT 6 - D', qty: '5 DUS' },
      ],
      status: 'Inspection',
    },
    {
      preload: 'PRELOAD-07',
      details: [
        { label: 'Sumber', pallet: 'Pallet-101', location: 'JT 4 - A', qty: '30 DUS' },
        { label: 'Picking', pallet: 'Pallet-101', location: 'JT 4 - A', qty: '30 DUS' },
      ],
      status: 'Inspection',
    },
    
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Picking Activity</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Clasmild - 12</Text>
        <Text style={styles.subLabel}>
          <Text style={{ fontStyle: 'italic' }}>Suggested Location</Text>{'\n'}
          WEEK41 - JT6 - D - 0/40 DUS
        </Text>

        {activities.length === 0 ? (
          <Text style={styles.noActivityText}>
            Belum ada Activity, silahkan lakukan Activity Picking
          </Text>
        ) : (
          activities.map((activity, index) => (
            <View key={index} style={styles.activityCard}>
              <Text style={styles.headerText}>{activity.preload}</Text>

              {activity.details.map((item, i) => (
                <View
                  key={i}
                  style={[
                    styles.row,
                    item.label === 'Switching' && styles.switchingRow, // 🔸 beda style
                  ]}
                >
                  <Text
                    style={[
                      styles.rowLabel,
                      item.label === 'Switching' && styles.switchingLabel,
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text style={styles.rowValue}>{item.pallet}</Text>
                  <Text style={styles.location}>{item.location}</Text>
                  <Text style={styles.qty}>{item.qty}</Text>
                </View>
              ))}

              <View style={styles.statusBox}>
                <Text style={styles.statusText}>{activity.status}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddActivity}>
        <Text style={styles.addButtonText}>+ Add Activity</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#EDE8E3',
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F26E1F',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#F4F7FB',
    borderRadius: 12,
    padding: 16,
  },
  label: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  subLabel: {
    color: '#444',
    marginBottom: 12,
  },
  noActivityText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 12,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  headerText: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 8,
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    paddingVertical: 6,
  },
  switchingRow: {
    backgroundColor: '#FFF5E6', // 🔸 warna khusus baris switching
    borderRadius: 6,
  },
  rowLabel: {
    flex: 1.2,
    fontWeight: '600',
    color: '#333',
  },
  switchingLabel: {
    color: '#E67E22', // 🔸 teks oranye agar beda
  },
  rowValue: {
    flex: 1.5,
    color: '#333',
  },
  location: {
    flex: 1.2,
    color: '#F26E1F',
    fontWeight: '600',
  },
  qty: {
    flex: 1,
    textAlign: 'right',
    color: 'green',
    fontWeight: '600',
  },
  statusBox: {
    backgroundColor: '#D6B4F0',
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  statusText: {
    color: '#4A235A',
    fontWeight: '600',
  },
  addButton: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  addButtonText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#333',
  },
});
