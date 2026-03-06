import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuthStore } from '../../../../store/useAuthStore.ts';

import ScannerService from '../../../../service/palletServices.ts';
import MovementService from '../../../../service/movementService.ts';
import { HelperMovementParamList } from '../../../navigation/movement/HelperMovementNavigator.tsx';
import { Camera, useCameraDevices, useCodeScanner } from 'react-native-vision-camera';
import Ionicons from 'react-native-vector-icons/FontAwesome5';
import { set } from 'react-hook-form';

const dummyData = {
    "id": "1f3dfd5e-57d2-4e1e-9cdb-0d4fbf094a8d",
    "updateNumber": "MPU-2026-0003",
    "updateType": "MERGE_PALLET",
    "uom": null,
    "productionCode": null,
    "status": "PENDING_HELPER_ACTION",
    "initiatedByUserId": "683c079d-45cc-4e8d-a0e7-9f9e7db4eb0f",
    "inspectionStatus": "PENDING",
    "inspectionByUserId": "683c079d-45cc-4e8d-a0e7-9f9e7db4eb0f",
    "notes": "Merge pallet request via mobile",
    "completedDate": "2026-03-03T03:59:26.823Z",
    "items": [
        {
            "id": "023b4910-c77d-459e-b07f-733ee204910b",
            "palletUpdateId": "1f3dfd5e-57d2-4e1e-9cdb-0d4fbf094a8d",
            "sequence": 1,
            "palletId": "f906dbfc-5523-4cb0-8623-95e6ce46bcb7",
            "pallet": {
                "id": "f906dbfc-5523-4cb0-8623-95e6ce46bcb7",
                "pallet_code": "SPLIT-01",
                "uom": "DUS",
                "currentQuantity": 43
            },
            "itemId": "90df9437-5790-43bd-a84f-f970d50c350b",
            "quantity": 43,
            "uom": "DUS",
            "productionDate": "2026-02-26T04:20:43.000Z",
            "createdAt": "2026-03-03T03:59:28.079Z",
            "updatedAt": "2026-03-03T03:59:28.079Z"
        },
        {
            "id": "248d146f-daef-46fd-acf7-115a2efbf49e",
            "palletUpdateId": "1f3dfd5e-57d2-4e1e-9cdb-0d4fbf094a8d",
            "sequence": 2,
            "palletId": "9469996c-f947-48c7-b967-b7f6604cdb4f",
            "pallet": {
                "id": "9469996c-f947-48c7-b967-b7f6604cdb4f",
                "pallet_code": "PAL-002",
                "uom": "DUS",
                "currentQuantity": 28
            },
            "itemId": "90df9437-5790-43bd-a84f-f970d50c350b",
            "quantity": 27,
            "uom": "DUS",
            "productionDate": "2026-02-26T00:00:00.000Z",
            "createdAt": "2026-03-03T03:59:28.079Z",
            "updatedAt": "2026-03-03T03:59:28.079Z"
        },
        {
      "id": "248d146f-daef-46fd-acf7-115a2333rxxxx",
      "palletUpdateId": "1f3dfd5e-57d2-4e1e-9cdb-0d4fbf094a8d",
      "sequence": 3,
      "palletId": "9469996c-f947-48c7-b967-b7f6604xxxxxx",
      "pallet": {
        "id": "9469996c-f947-48c7-b967-b7f6604cxxxx",
        "pallet_code": "PAL-002",
        "uom": "DUS",
        "currentQuantity": 28
      },
      "itemId": "90df9437-5790-43bd-a84f-f970d50cxxx",
      "quantity": 1,
      "uom": "DUS",
      "productionDate": "2026-02-26T00:00:00.000Z",
      "createdAt": "2026-03-03T03:59:28.079Z",
      "updatedAt": "2026-03-03T03:59:28.079Z"
    }
    ],
    "scans": [],
    "assigned": [
        {
            "id": "69ee20ed-6fa6-4da4-9ff0-7de763b8a01d",
            "palletUpdateId": "1f3dfd5e-57d2-4e1e-9cdb-0d4fbf094a8d",
            "userId": "aab1117f-57ff-4da8-9a0d-a651064b9625",
            "assignedAt": "2026-03-03T03:59:26.823Z",
            "createdAt": "2026-03-03T03:59:28.079Z",
            "updatedAt": "2026-03-03T03:59:28.079Z"
        }
    ],
    "createdAt": "2026-03-03T03:59:28.079Z",
    "updatedAt": "2026-03-03T03:59:28.079Z"
}


type NavigationProp = StackNavigationProp<HelperMovementParamList, 'HelperMovementMain'>;

export const UpdateHelperDetail = () => {
    // --- State Camera ---
    const [isScannerVisible, setIsScannerVisible] = useState(false);
    const [scannerTarget, setScannerTarget] = useState<'source' | 'target'>('source');
    const [hasPermission, setHasPermission] = useState(false);

    const route = useRoute();
    const navigation = useNavigation<NavigationProp>();
    const payload = route.params as any;
    // const itemData = dummyData;
    const itemData = payload.item;

    const { user } = useAuthStore();
    const userId = user?.id || 'uuid-user-123';

    // Deteksi Tipe Update
    const isMergeType = itemData.updateType === 'MERGE_PALLET';

    // State untuk Pallet Sumber (Hanya digunakan jika SPLIT)
    const [sourcePalletNo, setSourcePalletNo] = useState('');
    const [isLoadingSource, setIsLoadingSource] = useState(false);
    const [isSourceValid, setIsSourceValid] = useState(isMergeType); // Jika merge, otomatis dianggap valid
    const [sourceItemDetail, setSourceItemDetail] = useState<any>(null);

    // State untuk Pallet Tujuan
    const [targetPalletNo, setTargetPalletNo] = useState('');
    const [isLoadingTarget, setIsLoadingTarget] = useState(false);
    const [targetPalletData, setTargetPalletData] = useState<any>(null);
    const [isTargetValid, setIsTargetValid] = useState(false);
    const [capacityTarget, setCapacityTarget] = useState<any>(null);

    

    // Cek Izin Kamera
    useEffect(() => {
        (async () => {
            const status = await Camera.requestCameraPermission();
            setHasPermission(status === 'granted');
        })();
    }, []);

    // Konfigurasi Code Scanner
    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'code-128', 'ean-13'], // sesuaikan dengan jenis barcode pallet
        onCodeScanned: (codes) => {
            if (codes.length > 0 && isScannerVisible) {
                const value = codes[0].value;
                if (value) {
                    handleScanSuccess(value);
                }
            }
        }
    });

    const devices = useCameraDevices();
    const device = devices.find((d) => d.position === 'back');

    // Fungsi handle hasil scan
    const handleScanSuccess = (value: string) => {
        setIsScannerVisible(false);
        if (scannerTarget === 'source') {
            setSourcePalletNo(value);
            setIsSourceValid(false);
        } else {
            setTargetPalletNo(value);
            setIsTargetValid(false);
        }
    };

    const openScanner = (target: 'source' | 'target') => {
        if (!hasPermission) {
            return Alert.alert("Error", "Izin kamera ditolak");
        }
        setScannerTarget(target);
        setIsScannerVisible(true);
    };

    // Menghitung total QTY (khusus Merge)
    const totalQtyToMove = useMemo(() => {
        return itemData.items.reduce((acc: number, curr: any) => acc + curr.quantity, 0);
    }, [itemData.items]);


    // 1. Cek Pallet Sumber (Hanya untuk SPLIT)
    const checkSourcePallet = async () => {
        if (!sourcePalletNo) return Alert.alert("Peringatan", "Masukkan nomor pallet sumber");
        setIsLoadingSource(true);

        try {
            const res = await ScannerService.getPalletByCode(sourcePalletNo);
            const palletData = res.data || [];
            const matchedItem = itemData.items.find((i: any) => i.palletId === palletData[0]?.id);

            if (matchedItem) {
                setIsSourceValid(true);
                setSourceItemDetail({
                    ...matchedItem,
                    week_number: palletData[0]?.week_number
                });
                Alert.alert("Success", "Pallet Sumber tervalidasi.");
            } else {
                Alert.alert("Error", "Pallet tidak terdaftar dalam instruksi ini.");
            }
        } catch (error) {
            Alert.alert("Error", "Gagal mengambil data pallet sumber.");
        } finally {
            setIsLoadingSource(false);
        }
    };

    // 2. Cek Pallet Tujuan
    const checkTargetPallet = async () => {
        if (!targetPalletNo) return Alert.alert("Peringatan", "Masukkan nomor pallet tujuan");
        if (!isSourceValid) return Alert.alert("Peringatan", "Validasi pallet sumber dulu");
        if (isMergeType) {
                    const palletExists = itemData.items.some((item: any) => item.pallet.pallet_code === targetPalletNo);
                    if (!palletExists) {
                        Alert.alert("Error", "Pallet tujuan tidak sesuai dengan list instruksi.");
                        setIsLoadingTarget(false);
                        return;
                    }
                }

        setIsLoadingTarget(true);
        try {
            const res = await ScannerService.getPalletByCode(targetPalletNo);
            const targetData = res.data?.find((pallet: any) => 
                pallet.current_quantity !== 0 && 
                itemData.items.some((item: any) => item.itemId === pallet.item_id)
            );
            if (targetData) {
                
            const response = await ScannerService.getPalletDetailById(targetData.id);
            const capacityLimit = response.data.capacity; // Ambil nilai kapasitas
            setCapacityTarget(capacityLimit);

            // --- LOGIKA VALIDASI KAPASITAS DI SINI ---
            // Hitung berapa qty yang mau dipindah
            const qtyToMove = isMergeType ? totalQtyToMove : (sourceItemDetail?.quantity || 0);
            // Hitung total setelah digabung (qty lama + qty baru)
            const projectedTotal = (targetData.current_quantity || 0) + qtyToMove;

            if (projectedTotal > capacityLimit) {
                Alert.alert(
                    "Error: Kapasitas Penuh", 
                    `Kapasitas pallet (${capacityLimit}) tidak mencukupi.\n` +
                    `Kapasitas yang dibutuhkan: ${projectedTotal}\n`
                );
                setIsTargetValid(false);
                return; // Berhenti di sini
            }

           
                // Ambil UOM acuan (dari source detail jika split, atau dari list pertama jika merge)
                const requiredUom = isMergeType ? itemData.items[0]?.uom : sourceItemDetail?.uom;

                if (targetData.uom && targetData.uom !== requiredUom) {
                    Alert.alert("Error", `UOM tidak cocok. Butuh: ${requiredUom}`);
                } else {
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
        // 1. Kelompokkan items berdasarkan itemId
        // Kita gunakan reduce untuk membuat object grouping
        const groupedItems = itemData.items.reduce((acc: any, curr: any) => {
            const key = curr.itemId;
            if (!acc[key]) {
                // Jika belum ada, buat entry baru (clone objectnya)
                acc[key] = { ...curr };
            } else {
                // Jika sudah ada, tambahkan quantity-nya
                acc[key].quantity += curr.quantity;
            }
            return acc;
        }, {});

        // 2. Ubah object grouping kembali menjadi array
        const finalItemsToSubmit = Object.values(groupedItems);

        // 3. Looping untuk hit API
        // Menggunakan for...of agar bisa menggunakan await dengan benar
        for (const item of finalItemsToSubmit as any[]) {
            const submitPayload = {
                palletUpdateId: itemData.id,
                scanDate: new Date().toISOString(),
                scanByUserId: userId,
                palletId: targetPalletData.id,
                
                // Gunakan data dari item hasil grouping
                quantity: isMergeType ? item.quantity : sourceItemDetail.quantity,
                itemId: isMergeType ? item.itemId : sourceItemDetail.itemId,
                uom: isMergeType ? item.uom : sourceItemDetail.uom,
                
                // Mengambil production date dari item terkait
                productionDate: isMergeType ? item.productionDate : sourceItemDetail?.productionDate,
                weekNumber: isMergeType ? targetPalletData?.week_number : sourceItemDetail?.week_number,
                
                notes: isMergeType ? "Merge Pallet Process" : "Split Pallet Process",
                status: "PENDING"
            };

            console.log("Submitting Payload for Item:", item.itemId, submitPayload);
            await MovementService.postPalletUpdateScanHelper(submitPayload);
        }

        Alert.alert("Berhasil", "Semua data berhasil digabungkan dan dikirim!");
        navigation.goBack();

    } catch (error) {
        console.error("Submit Error:", error);
        Alert.alert("Error", "Gagal mengirim satu atau beberapa data.");
    }
};

    return (
        <ScrollView style={styles.container}>
            <Modal visible={isScannerVisible} animationType="slide">
                <View style={styles.scannerContainer}>
                    {device && (
                        <Camera
                            style={StyleSheet.absoluteFill}
                            device={device}
                            isActive={isScannerVisible}
                            codeScanner={codeScanner}
                        />
                    )}
                    <View style={styles.scannerOverlay}>
                        <Text style={styles.scannerText}>Scanning {scannerTarget === 'source' ? 'Source' : 'Target'} Pallet...</Text>
                        <TouchableOpacity
                            style={styles.closeScanner}
                            onPress={() => setIsScannerVisible(false)}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>BATAL</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <View style={styles.header}>
                <Text style={styles.label}>Update Number</Text>
                <Text style={styles.title}>{itemData.updateNumber}</Text>
                <View style={[styles.badge, { backgroundColor: isMergeType ? '#E2E8F0' : '#FFEDD5' }]}>
                    <Text style={styles.badgeText}>{itemData.updateType}</Text>
                </View>
            </View>

            {/* Bagian 1: SUMBER */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}> {isMergeType ? "1. Source Pallet" : "1. Split Using " + itemData.items[0]?.pallet?.pallet_code}</Text>

                {isMergeType ? (
                    // Tampilan MERGE: Langsung List
                    itemData.items.map((item: any, index: number) => (
                        <View key={index} style={styles.listItem}>
                            <Text style={styles.listPalletCode}>{item.pallet.pallet_code}</Text>
                            <Text style={styles.listPalletCode}>{item.itemId.substring(item.itemId.length - 8)}</Text>
                            <Text style={styles.listQty}>{item.quantity} {item.uom}</Text>
                        </View>
                    ))
                ) : (
                    // Tampilan SPLIT: Input Scan
                    <>
                        <View style={styles.inputGroup}>
                            <TextInput
                                style={[styles.input, isSourceValid && styles.inputSuccess]}
                                placeholder="Scan Pallet Sumber"
                                value={sourcePalletNo}
                                onChangeText={(txt) => { setSourcePalletNo(txt); setIsSourceValid(false); }}
                            />
                            {/* TOMBOL SCAN BARU */}
                            <TouchableOpacity style={styles.scanBtn} onPress={() => openScanner('source')}>

                                <Ionicons name="barcode" size={16} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.checkButton, isSourceValid && styles.validBtn]} onPress={checkSourcePallet} disabled={isLoadingSource}>
                                {isLoadingSource ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.checkButtonText}>{isSourceValid ? "OK" : "CHECK"}</Text>}
                            </TouchableOpacity>
                        </View>
                        {isSourceValid && sourceItemDetail && (
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Qty Available: <Text style={styles.infoValue}>{sourceItemDetail.pallet.currentQuantity} {sourceItemDetail.uom}</Text></Text>
                                <Text style={styles.infoLabel}>Qty to Split: <Text style={styles.infoValue}>{sourceItemDetail.quantity} {sourceItemDetail.uom}</Text></Text>
                            </View>
                        )}
                    </>
                )}
            </View>

            {/* Bagian 2: TUJUAN */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>2. Pallet Destination</Text>
                <View style={styles.inputGroup}>
                    <TextInput
                        style={[styles.input, isTargetValid && styles.inputSuccess]}
                        placeholder="Scan Pallet Tujuan"
                        value={targetPalletNo}
                        onChangeText={(txt) => { setTargetPalletNo(txt); setIsTargetValid(false); }}
                    />
                    {/* TOMBOL SCAN BARU */}
                    <TouchableOpacity style={styles.scanBtn} onPress={() => openScanner('target')}>
                        <Ionicons name="barcode" size={16} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.checkButton, isTargetValid && styles.validBtn]}
                        onPress={checkTargetPallet}
                        disabled={isLoadingTarget || (!isMergeType && !isSourceValid)}
                    >
                        {isLoadingTarget ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.checkButtonText}>{isTargetValid ? "OK" : "CHECK"}</Text>}
                    </TouchableOpacity>
                </View>

                {isTargetValid && targetPalletData && (
                    <View style={styles.infoBoxSummary}>
                        <Text style={styles.summaryTitle}>VALID DESTINATION</Text>
                        {/* <View style={styles.rowBetween}>
                            <Text style={styles.infoLabel}>Qty Eksisting:</Text>
                            <Text style={styles.infoValue}>{targetPalletData.current_quantity || 0}</Text>
                        </View>
                        <View style={styles.rowBetween}>
                            <Text style={styles.infoLabel}>Qty Masuk:</Text>
                            <Text style={styles.infoValue}>{isMergeType ? totalQtyToMove : sourceItemDetail?.quantity}</Text>
                        </View> */}
                    </View>
                )}
            </View>

            <TouchableOpacity
                style={[
                    styles.button,
                    { backgroundColor: (!isSourceValid || !isTargetValid) ? '#94a3b8' : '#fb7c2d' }
                ]}
                onPress={executeSubmit}
                disabled={!isSourceValid || !isTargetValid}
            >
                <Text style={styles.buttonText}>PROCESS</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
    header: { marginBottom: 20, alignItems: 'center' },
    label: { fontSize: 12, color: '#64748b', fontWeight: '600' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 4 },
    badgeText: { fontSize: 10, fontWeight: 'bold', color: '#475569' },
    card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 3 },
    sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#334155', marginBottom: 12 },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    listPalletCode: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
    listQty: { fontSize: 14, color: '#2563eb', fontWeight: '600' },
    input: { flex: 1, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, height: 48, color: '#000' },
    inputSuccess: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
    checkButton: {
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        height: 48,
        width: 70, // Lebar tetap untuk tombol Check
    },
    validBtn: { backgroundColor: '#22c55e' },
    checkButtonText: { color: 'white', fontWeight: 'bold' },
    infoBox: { marginTop: 10, padding: 8, backgroundColor: '#f8fafc', borderRadius: 4 },
    infoBoxSummary: { backgroundColor: '#F0F9FF', marginTop: 16, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#BAE6FD' },
    summaryTitle: { fontSize: 12, fontWeight: 'bold', color: '#0369a1', marginBottom: 5 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
    infoLabel: { fontSize: 12, color: '#64748b' },
    infoValue: { fontSize: 13, fontWeight: 'bold', color: '#1e293b' },
    button: { padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 40 },
    disabledButton: { backgroundColor: '#94a3b8' },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    inputGroup: { flexDirection: 'row', gap: 5, alignItems: 'center' }, // perkecil gap agar muat
    scanBtn: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 12,
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
    },
    scanBtnText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    // Scanner Styles
    scannerContainer: { flex: 1, backgroundColor: 'black' },
    scannerOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 50
    },
    scannerText: { color: 'white', marginBottom: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10 },
    closeScanner: { backgroundColor: '#ef4444', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center' }
});

export default UpdateHelperDetail;