import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

export default function ReturInspectionDetail() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Info Card */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.rowCenter}>
              <Icon name="box" size={16} color="#333" />
              <Text style={styles.inboundText}>IN-030226-0001</Text>
            </View>
            <Text style={styles.doText}>0123456789</Text>
          </View>
          <View style={styles.vehicleBadge}>
            <Icon name="truck" size={14} color="#F47524" />
            <Text style={styles.vehicleText}>K 9985 AT</Text>
          </View>
        </View>

        {/* Selected Item Info */}
        <View style={styles.selectedItemHeader}>
          <Text style={styles.selectedItemTitle}>Class Mild - 16</Text>
          <View style={styles.qtyBadge}>
            <Text style={styles.qtyBadgeText}>dari 30 BKS</Text>
          </View>
        </View>

        {/* Form Item 1 */}
        <View style={styles.card}>
          <View style={styles.itemHeaderRow}>
            <Text style={styles.itemTitle}>Item 01</Text>
            <TouchableOpacity style={styles.deleteBtn}>
              <Icon name="trash" size={12} color="#D12053" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.sectionSubTitle}>Item Information</Text>
          <View style={styles.inputRow3}>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Claim</Text>
              <TextInput style={styles.textInputCentered} defaultValue="10" keyboardType="numeric" />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Unclaim</Text>
              <TextInput style={styles.textInputCentered} defaultValue="3" keyboardType="numeric" />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Tracking</Text>
              <TextInput style={styles.textInputCentered} defaultValue="2" keyboardType="numeric" />
            </View>
          </View>

          <Text style={styles.inputLabel}>Tahun BS</Text>
          <TextInput style={styles.textInputFull} defaultValue="2025" keyboardType="numeric" />

          <Text style={styles.sectionSubTitle}>Additional</Text>
          <View style={styles.inputRow2}>
            <View style={[styles.inputCol, { flex: 0.4 }]}>
              <Text style={styles.inputLabel}>HJE</Text>
              <TextInput style={styles.textInputCentered} defaultValue="2300" keyboardType="numeric" />
            </View>
            <View style={[styles.inputCol, { flex: 0.6 }]}>
              <Text style={styles.inputLabel}>Keterangan</Text>
              <TextInput style={styles.textInputFull} defaultValue="KODE001" />
            </View>
          </View>
        </View>

        {/* Form Item 2 */}
        <View style={styles.card}>
          <View style={styles.itemHeaderRow}>
            <Text style={styles.itemTitle}>Item 02</Text>
            <TouchableOpacity style={styles.deleteBtn}>
              <Icon name="trash" size={12} color="#D12053" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.sectionSubTitle}>Item Information</Text>
          <View style={styles.inputRow3}>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Claim</Text>
              <TextInput style={styles.textInputCentered} defaultValue="10" keyboardType="numeric" />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Unclaim</Text>
              <TextInput style={styles.textInputCentered} defaultValue="2" keyboardType="numeric" />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Tracking</Text>
              <TextInput style={styles.textInputCentered} defaultValue="3" keyboardType="numeric" />
            </View>
          </View>

          <Text style={styles.inputLabel}>Tahun BS</Text>
          <TextInput style={styles.textInputFull} defaultValue="2025" keyboardType="numeric" />

          <Text style={styles.sectionSubTitle}>Additional</Text>
          <View style={styles.inputRow2}>
            <View style={[styles.inputCol, { flex: 0.4 }]}>
              <Text style={styles.inputLabel}>HJE</Text>
              <TextInput style={styles.textInputCentered} defaultValue="2400" keyboardType="numeric" />
            </View>
            <View style={[styles.inputCol, { flex: 0.6 }]}>
              <Text style={styles.inputLabel}>Keterangan</Text>
              <TextInput style={styles.textInputFull} defaultValue="KODE002" />
            </View>
          </View>

          <TouchableOpacity style={styles.addOutlineButton}>
            <Icon name="plus" size={12} color="#4C6FFF" style={{ marginRight: 8 }} />
            <Text style={styles.addButtonText}>Tambah</Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0F4F8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#F47524' },
  container: { padding: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  inboundText: { fontSize: 14, fontWeight: 'bold', color: '#333', marginLeft: 8 },
  doText: { fontSize: 12, color: '#A0A0A0' },
  vehicleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 8,
    paddingVertical: 10,
  },
  vehicleText: { marginLeft: 8, color: '#F47524', fontWeight: 'bold', fontSize: 14 },
  
  // Selected Item Styles
  selectedItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  selectedItemTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  qtyBadge: { backgroundColor: '#FFF4ED', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  qtyBadgeText: { color: '#F47524', fontSize: 12, fontWeight: 'bold' },

  // Form Item Styles
  itemHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 8 },
  itemTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  deleteBtn: { backgroundColor: '#FFEBF0', padding: 8, borderRadius: 6 },
  
  sectionSubTitle: { fontSize: 12, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 4 },
  inputLabel: { fontSize: 12, color: '#888', marginBottom: 6 },
  
  inputRow3: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 16 },
  inputRow2: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 16 },
  inputCol: { flex: 1 },
  
  textInputCentered: {
    backgroundColor: '#F0F2F5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    textAlign: 'center',
    color: '#333',
    fontWeight: 'bold',
    fontSize: 13,
  },
  textInputFull: {
    backgroundColor: '#F0F2F5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#333',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 16,
  },

  addOutlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4C6FFF',
    backgroundColor: '#EEF2FF',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  addButtonText: { color: '#4C6FFF', fontWeight: 'bold', fontSize: 14 },

  submitButton: {
    backgroundColor: '#F47524',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});