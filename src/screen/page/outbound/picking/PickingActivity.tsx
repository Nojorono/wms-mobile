import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PickingParamList } from '../../../navigation/outbound/PickingNavigator';
import { OutboundItemParam } from '../../../../interface/outbound/outbound';

type NavigationProp = StackNavigationProp<PickingParamList, 'PickingDoMain'>;

export default function PickingActivity() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const itemBefore = route.params as OutboundItemParam

  const handleAddActivity = () => {
    navigation.navigate('PickingDetailActivity', {item: itemBefore.item });
  };

  // 🔹 Dummy data (3 contoh)
  const activities = [
    {
      preload: 'PRELOAD-07 DUMMY',
      details: [
        { label: 'Sumber', pallet: 'Pallet-101', location: 'JT 4 - A', qty: '30 DUS' },
        { label: 'Picking', pallet: 'Pallet-101', location: 'JT 4 - A', qty: '30 DUS' },
      ],
      status: 'Inspection',
    },

  ];
  console.log('Item Before:', itemBefore);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: 'bold',
            color: 'black',
            textAlign: 'center',
            marginBottom: 12,
            backgroundColor: '#FFF5E6',
            borderRadius: 8,
            paddingVertical: 10,
            paddingHorizontal: 16,
            elevation: 2,
            shadowColor: '#F26E1F',
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
        >
          {itemBefore.item.item.description}
        </Text>
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontStyle: 'italic', fontSize: 14, color: '#F26E1F', fontWeight: '700' }}>
            Suggested Destination Location
          </Text>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 16,
              color: '#333',
              fontWeight: '700',
              marginTop: 4,
              backgroundColor: '#FFF5E6',
              borderRadius: 8,
              paddingVertical: 6,
              paddingHorizontal: 12,
            }}
          >
            {itemBefore.item.destinationWarehouseSub?.name} - {itemBefore.item.destinationBin?.name} - {itemBefore.item.quantity} {itemBefore.item.uom} - Week-{itemBefore.item.week_number}
          </Text>
        </View>

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
