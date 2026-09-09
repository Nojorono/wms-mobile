import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/FontAwesome5';
import Colors from '../../../constants/Colors';

type ForkLiftListProps = {
  item: any;
  index: number;
  onClick?: () => void;
};

const ForkLiftList: React.FC<ForkLiftListProps> = ({ item, index, onClick }) => {
  const formattedDate = new Date(item.createdAt).toISOString().split('T')[0];

  const statusColor =
    item.status === 'PENDING'
      ? '#FF9500'
      : item.status === 'COMPLETED'
      ? '#34C759'
      : '#006834ff';

  const palletCode = item?.inventoryTracking?.pallet?.pallet_code ?? '-';
  const stagingArea = item?.inventoryTracking?.warehouseSub?.name ?? '-';
  const destination = item?.destinationBin?.name ?? '-';
  const destinationZone = item?.destinationBin?.warehouseSub?.name ?? '-';
  const driverName = item?.driver_name ?? '-';
  const driverPhone = item?.driver_phone ?? '-';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onClick}
    >
      <View style={styles.row}>
        <Ionicons
          style={{ marginRight: 16, marginTop: 6 }}
          size={32}
          color={Colors.secondaryColor}
          name={'boxes'}
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{palletCode}</Text>
          <Text style={styles.date}>{formattedDate}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Driver</Text>
            <Text style={styles.value}>{driverName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{driverPhone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Staging</Text>
            <Text style={styles.value}>{stagingArea}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Destination</Text>
            <Text style={styles.value}>{destinationZone}  {destination}</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <Ionicons name="chevron-right" size={22} color={Colors.secondaryColor} />
      </View>
    </TouchableOpacity>
  );
};

export default ForkLiftList;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginVertical: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#222',
  },
  date: {
    fontSize: 16,
    color: '#888',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 15,
    color: '#666',
  },
  value: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FF6600',
  },
  statusBadge: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
