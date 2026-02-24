import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAuthStore } from '../../../../store/useAuthStore.ts';

import ScannerService from '../../../../service/palletServices.ts';
import MovementService from '../../../../service/movementService.ts';
import { HelperMovementParamList } from '../../../navigation/movement/HelperMovementNavigator.tsx';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';




type NavigationProp = StackNavigationProp<HelperMovementParamList, 'HelperMovementMain'>;

export const UpdateHelperDetail = () => {
    const route = useRoute();
    const payload = route.params as any;
    const itemData = payload.item; // Data JSON yang Anda berikan
    const { user } = useAuthStore();
    const userId = user?.id || 'uuid-user-123';
    
      const navigation = useNavigation<NavigationProp>();

    const isMergeType = itemData.updateType === 'MERGE_PALLET';

    const [targetPalletNo, setTargetPalletNo] = useState('');
    const [isLoadingTarget, setIsLoadingTarget] = useState(false);
    const [targetPalletData, setTargetPalletData] = useState<any>(null);
    const [isTargetValid, setIsTargetValid] = useState(false);

    // Menghitung total QTY dari semua item yang akan di-merge
    const totalQtyToMove = useMemo(() => {
        return itemData.items.reduce((acc: number, curr: any) => acc + curr.quantity, 0);
    }, [itemData.items]);

    // Check Pallet Tujuan (Flow Sekarang)
    const checkTargetPallet = async () => {
        if (!targetPalletNo) return Alert.alert("Peringatan", "Masukkan nomor pallet tujuan");

        setIsLoadingTarget(true);
        setTargetPalletData(null);
        setIsTargetValid(false);

        try {
            const res = await ScannerService.getPalletByCode(targetPalletNo);
            const targetData = res.data?.[0]; // Ambil data pallet pertama

            if (targetData) {
                // Validasi UOM: Bandingkan dengan UOM item pertama di list
                const requiredUom = itemData.items[0]?.uom;
                if (targetData.uom && targetData.uom !== requiredUom) {
                    Alert.alert("Error", `UOM tidak cocok. Pallet tujuan memiliki UOM ${targetData.uom}, sedangkan item memerlukan ${requiredUom}`);
                } else {
                    console.log("Pallet tujuan valid:", targetData);
                    setTargetPalletData(targetData);
                    setIsTargetValid(true);
                    Alert.alert("Success", "Pallet tujuan valid.");
                }
            } else {
                Alert.alert("Error", "Pallet tujuan tidak ditemukan.");
            }
        } catch (error) {
            Alert.alert("Error", "Gagal mengecek pallet tujuan.");
        } finally {
            setIsLoadingTarget(false);
        }
    };

    const executeSubmit = async () => {
        try {
            // Karena ini MERGE, kita mengirim instruksi update berdasarkan pallet tujuan
            const submitPayload = {
                palletUpdateId: itemData.id,
                scanDate: new Date().toISOString(),
                scanByUserId: userId,
                palletId: targetPalletData.id,
                itemId: targetPalletData.item_id,
                quantity: totalQtyToMove,
                uom: targetPalletData.uom,
                productionDate: targetPalletData?.production_date || new Date().toISOString(),
                weekNumber: targetPalletData?.week_number,
                notes: "Merge Pallet Process via Mobile",
                status: "PENDING"
            };
            console.log("Payload for Merge Submit:", submitPayload);
            await MovementService.postPalletUpdateScanHelper(submitPayload);
            Alert.alert("Berhasil", "Proses Merge berhasil dikirim!");
             navigation.goBack();
        } catch (error) {
            Alert.alert("Error", "Gagal mengirim data.");
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>Update Number</Text>
                <Text style={styles.title}>{itemData.updateNumber}</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{itemData.updateType}</Text>
                </View>
            </View>

            {/* Bagian 1: Daftar Pallet Sumber (Otomatis Tampil) */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>1. Daftar Pallet Sumber</Text>
                {itemData.items.map((item: any, index: number) => (
                    <View key={index} style={styles.listItem}>
                        <View>
                            <Text style={styles.listPalletCode}>{item.pallet.pallet_code}</Text>
                            <Text style={styles.listSubText}>ID: {item.palletId.substring(0, 8)}...</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.listQty}>{item.quantity}</Text>
                            <Text style={styles.listSubText}>{item.uom}</Text>
                        </View>
                    </View>
                ))}
                <View style={styles.totalBox}>
                    <Text style={styles.totalLabel}>Total Qty Akan Dipindah:</Text>
                    <Text style={styles.totalValue}>{totalQtyToMove} {itemData.items[0]?.uom}</Text>
                </View>
            </View>

            {/* Bagian 2: Pallet Tujuan (Harus Scan) */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>2. Scan Pallet Tujuan</Text>
                <View style={styles.inputGroup}>
                    <TextInput
                        style={[styles.input, isTargetValid && styles.inputSuccess]}
                        placeholder="Input/Scan Pallet Tujuan"
                        value={targetPalletNo}
                        onChangeText={(txt) => { setTargetPalletNo(txt); setIsTargetValid(false); }}
                    />
                    <TouchableOpacity 
                        style={[styles.checkButton, isTargetValid && styles.validBtn]} 
                        onPress={checkTargetPallet} 
                        disabled={isLoadingTarget}
                    >
                        {isLoadingTarget ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.checkButtonText}>{isTargetValid ? "OK" : "CHECK"}</Text>}
                    </TouchableOpacity>
                </View>

                {isTargetValid && targetPalletData && (
                    <View style={styles.infoBoxSummary}>
                        <Text style={styles.summaryTitle}>Detail Pallet Tujuan:</Text>
                        <View style={styles.rowBetween}>
                            <Text style={styles.infoLabel}>Kode Pallet:</Text>
                            <Text style={styles.infoValue}>{targetPalletNo}</Text>
                        </View>
                        <View style={styles.rowBetween}>
                            <Text style={styles.infoLabel}>Qty Saat Ini:</Text>
                            <Text style={styles.infoValue}>{targetPalletData.current_quantity || 0} {targetPalletData.uom}</Text>
                        </View>
                        <View style={[styles.rowBetween, styles.borderTop, { marginTop: 8, paddingTop: 8 }]}>
                            <Text style={[styles.infoLabel, { color: '#1e293b', fontWeight: 'bold' }]}>Total Setelah Merge:</Text>
                            <Text style={[styles.infoValue, { color: '#16a34a', fontSize: 18 }]}>
                                {(targetPalletData.currentQuantity || 0) + totalQtyToMove} {targetPalletData.uom}
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            <TouchableOpacity
                style={[styles.button, !isTargetValid && styles.disabledButton]}
                onPress={() => Alert.alert("Konfirmasi", "Gabungkan semua pallet sumber ke pallet tujuan?", [{ text: "Batal" }, { text: "Ya, Proses", onPress: executeSubmit }])}
                disabled={!isTargetValid}
            >
                <Text style={styles.buttonText}>PROSES MERGE PALLET</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
    header: { marginBottom: 20, alignItems: 'center' },
    label: { fontSize: 12, color: '#64748b', fontWeight: '600' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
    badge: { backgroundColor: '#E2E8F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 4 },
    badgeText: { fontSize: 10, fontWeight: 'bold', color: '#475569' },
    card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#334155', marginBottom: 12 },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    listPalletCode: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    listQty: { fontSize: 16, fontWeight: 'bold', color: '#2563eb' },
    listSubText: { fontSize: 11, color: '#94a3b8' },
    totalBox: { marginTop: 12, padding: 12, backgroundColor: '#F1F5F9', borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 13, fontWeight: '600', color: '#475569' },
    totalValue: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    inputGroup: { flexDirection: 'row', gap: 10 },
    input: { flex: 1, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, height: 48, color: '#000', backgroundColor: '#fff' },
    inputSuccess: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
    checkButton: { backgroundColor: '#3b82f6', justifyContent: 'center', minWidth: 80, alignItems: 'center', borderRadius: 8 },
    validBtn: { backgroundColor: '#22c55e' },
    checkButtonText: { color: 'white', fontWeight: 'bold' },
    infoBoxSummary: { backgroundColor: '#F0F9FF', marginTop: 16, borderRadius: 8, borderWidth: 1, borderColor: '#BAE6FD', padding: 12 },
    summaryTitle: { fontSize: 13, fontWeight: 'bold', color: '#0369a1', marginBottom: 8 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    infoLabel: { fontSize: 12, color: '#64748b' },
    infoValue: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
    borderTop: { borderTopWidth: 1, borderTopColor: '#cbd5e1' },
    button: { backgroundColor: '#ff853a', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 40 },
    disabledButton: { backgroundColor: '#94a3b8' },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default UpdateHelperDetail;