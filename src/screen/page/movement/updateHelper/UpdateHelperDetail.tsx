import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const data = {
  updateNumber: "SPU-2026-0003",
  updateType: "SPLIT_PALLET",
  status: "PENDING_HELPER_ACTION",
  notes: "Split pallet request via mobile",
  createdAt: "2026-02-18T07:27:10.693Z",
  items: [
    {
      id: "942ee18a-89aa-4e71-9531-c885ef1417f7",
      quantity: 100,
      uom: "PRESS",
      productionDate: "2026-02-12T00:00:00.000Z",
    }
  ],
  assigned: [
    { userId: "aab1117f-57ff-4da8-9a0d-a651064b9625" }
  ]
};

export const UpdateHelperDetail = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.label}>Update Number</Text>
        <Text style={styles.title}>{data.updateNumber}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{data.updateType.replace('_', ' ')}</Text>
        </View>
      </View>

      {/* Status Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Status Transaksi</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: '#FFA500' }]} />
          <Text style={styles.statusText}>{data.status.replace(/_/g, ' ')}</Text>
        </View>
        <Text style={styles.dateText}>Dibuat: {new Date(data.createdAt).toLocaleString()}</Text>
      </View>

     

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>PROSES SEKARANG</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 16 },
  header: { marginBottom: 20, alignItems: 'center' },
  label: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  badge: { backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 8 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 10 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  statusText: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  dateText: { fontSize: 12, color: '#94a3b8' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
  subText: { fontSize: 12, color: '#64748b' },
  itemIdText: { fontSize: 10, color: '#94a3b8', fontStyle: 'italic' },
  notesText: { fontSize: 14, color: '#475569', lineHeight: 20 },
  footer: { padding: 10, alignItems: 'center' },
  userId: { fontSize: 11, color: '#94a3b8' },
  button: { backgroundColor: '#1e293b', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default UpdateHelperDetail;