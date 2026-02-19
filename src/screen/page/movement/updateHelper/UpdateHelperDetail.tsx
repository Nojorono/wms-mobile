import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAuthStore } from '../../../../store/useAuthStore.ts';

// Asumsi ScannerService sudah diimport
import ScannerService from '../../../../service/palletServices.ts';

export const UpdateHelperDetail = () => {
    const route = useRoute();
    const payload = route.params as any;
    const { user } = useAuthStore();
    const userId = user?.id || 'uuid-user-123';

    const [sourcePalletNo, setSourcePalletNo] = useState('');
    const [targetPalletNo, setTargetPalletNo] = useState('');

    const [isLoadingSource, setIsLoadingSource] = useState(false);
    const [isLoadingTarget, setIsLoadingTarget] = useState(false);

    // State untuk menyimpan detail item
    const [sourceItemDetail, setSourceItemDetail] = useState<any>(null);
    const [targetItemsApi, setTargetItemsApi] = useState<any[]>([]); // Ubah ke array untuk menyimpan hasil list API

    const [isSourceValid, setIsSourceValid] = useState(false);
    const [isTargetValid, setIsTargetValid] = useState(false);

    // 1. Check Pallet Sumber
    const checkSourcePallet = async () => {
        if (!sourcePalletNo) return Alert.alert("Peringatan", "Masukkan nomor pallet sumber");

        setIsLoadingSource(true);
        setSourceItemDetail(null);
        setIsSourceValid(false);

        try {
            const res = await ScannerService.getPalletByCode(sourcePalletNo);
            const palletData = res.data || [];

            // Pastikan palletData[0] ada sebelum akses .id
            const matchedItem = payload.item.items.find((i: any) => i.palletId === palletData[0]?.id);

            if (matchedItem) {
                setIsSourceValid(true);
                setSourceItemDetail(matchedItem);
                Alert.alert("Success", "Pallet Sumber sesuai dengan payload.");
            } else {
                Alert.alert("Error", "Pallet tidak terdaftar dalam instruksi ini.");
            }
        } catch (error) {
            Alert.alert("Error", "Gagal mengambil data pallet sumber.");
        } finally {
            setIsLoadingSource(false);
        }
    };

    // 2, 3, 4. Check Pallet Tujuan
    const checkTargetPallet = async () => {
        if (!targetPalletNo) return Alert.alert("Peringatan", "Masukkan nomor pallet tujuan");
        if (!isSourceValid) return Alert.alert("Peringatan", "Validasi pallet sumber dulu");

        setIsLoadingTarget(true);
        setTargetItemsApi([]);
        setIsTargetValid(false);

        try {
            const res = await ScannerService.getPalletByCode(targetPalletNo);
            const targetItems = res.data || [];
            setTargetItemsApi(targetItems);

            if (targetItems.length === 0) {
                setIsTargetValid(true);
                Alert.alert("Success", "Pallet tujuan kosong.");
            } else {
                const isSameUom = targetItems.every((item: any) => item.uom === sourceItemDetail.uom);

                if (isSameUom) {
                    setIsTargetValid(true);
                    Alert.alert("Success", "UOM Pallet tujuan sesuai.");
                } else {
                    Alert.alert("Error", `UOM tidak cocok. Butuh: ${sourceItemDetail.uom}`);
                }
            }
        } catch (error) {
            Alert.alert("Error", "Gagal cek pallet tujuan.");
        } finally {
            setIsLoadingTarget(false);
        }
    };

    const executeSubmit = () => {
        const submitPayload = {
            palletUpdateId: payload.item.id,
            scanDate: new Date().toISOString(),
            scanByUserId: userId,
            palletId: sourceItemDetail.palletId,
            targetPalletId: targetItemsApi[0]?.id || null, // Ambil palletId dari target jika ada
            itemId: sourceItemDetail.itemId,
            quantity: sourceItemDetail.quantity,
            uom: sourceItemDetail.uom,
            productionDate: sourceItemDetail.productionDate,
            weekNumber: sourceItemDetail.weekNumber || 1,
            notes: "Proses split pallet",
            status: "PENDING"
        };
        console.log("Submitting:", submitPayload);
        Alert.alert("Berhasil", "Data berhasil dikirim!");
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>Update Number</Text>
                <Text style={styles.title}>{payload.item.updateNumber}</Text>
            </View>

            {/* Input Pallet Sumber */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>1. Pallet Sumber</Text>
                <View style={styles.inputGroup}>
                    <TextInput
                        style={[styles.input, isSourceValid && styles.inputSuccess]}
                        placeholder="Scan Pallet Sumber"
                        value={sourcePalletNo}
                        onChangeText={(txt) => { setSourcePalletNo(txt); setIsSourceValid(false); setSourceItemDetail(null); }}
                    />
                    <TouchableOpacity style={[styles.checkButton, isSourceValid && styles.validBtn]} onPress={checkSourcePallet} disabled={isLoadingSource}>
                        {isLoadingSource ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.checkButtonText}>{isSourceValid ? "OK" : "CHECK"}</Text>}
                    </TouchableOpacity>
                </View>

                {/* FIX: Jangan gunakan .map() karena sourceItemDetail adalah Object */}
                {sourceItemDetail && (
                    <View style={styles.infoBox}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Quantity Split</Text>
                            <Text style={styles.infoValue}>{sourceItemDetail.quantity}</Text>
                        </View>
                        <View style={[styles.infoItem, { borderLeftWidth: 1, borderLeftColor: '#e2e8f0' }]}>
                            <Text style={styles.infoLabel}>UOM</Text>
                            <Text style={styles.infoValue}>{sourceItemDetail.uom}</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Input Pallet Tujuan */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>2. Pallet Tujuan</Text>
                <View style={styles.inputGroup}>
                    <TextInput
                        style={[styles.input, isTargetValid && styles.inputSuccess]}
                        placeholder="Scan Pallet Tujuan"
                        value={targetPalletNo}
                        onChangeText={(txt) => { setTargetPalletNo(txt); setIsTargetValid(false); setTargetItemsApi([]); }}
                    />
                    <TouchableOpacity style={[styles.checkButton, isTargetValid && styles.validBtn]} onPress={checkTargetPallet} disabled={isLoadingTarget || !isSourceValid}>
                        {isLoadingTarget ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.checkButtonText}>{isTargetValid ? "OK" : "CHECK"}</Text>}
                    </TouchableOpacity>
                </View>

                {/* Menampilkan isi pallet tujuan jika ada isinya */}
                {targetItemsApi.map((item, index) => (
                    <View key={index} style={styles.infoBox}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Current Qty</Text>
                            <Text style={styles.infoValue}>{item.current_quantity || item.quantity}</Text>
                        </View>
                        <View style={[styles.infoItem, { borderLeftWidth: 1, borderLeftColor: '#e2e8f0' }]}>
                            <Text style={styles.infoLabel}>UOM</Text>
                            <Text style={styles.infoValue}>{item.uom}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <TouchableOpacity
                style={[styles.button, (!isSourceValid || !isTargetValid) && styles.disabledButton]}
                onPress={() => Alert.alert("Konfirmasi", "Proses data?", [{ text: "Batal" }, { text: "Ya", onPress: executeSubmit }])}
                disabled={!isSourceValid || !isTargetValid}
            >
                <Text style={styles.buttonText}>PROSES SEKARANG</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

// ... (styles tetap sama)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA', padding: 16 },
    header: { marginBottom: 20, alignItems: 'center' },
    label: { fontSize: 12, color: '#64748b', fontWeight: '600' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
    card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 10 },
    inputGroup: { flexDirection: 'row', gap: 10 },
    input: { flex: 1, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, height: 45, color: '#000' },
    inputSuccess: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
    checkButton: { backgroundColor: '#3b82f6', justifyContent: 'center', minWidth: 70, alignItems: 'center', borderRadius: 8 },
    validBtn: { backgroundColor: '#22c55e' },
    checkButtonText: { color: 'white', fontWeight: 'bold' },
    button: { backgroundColor: '#1e293b', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10, marginBottom: 30 },
    disabledButton: { backgroundColor: '#94a3b8' },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        marginTop: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingVertical: 10
    },
    infoItem: { flex: 1, alignItems: 'center' },
    infoLabel: { fontSize: 10, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 },
    infoValue: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
});

export default UpdateHelperDetail;