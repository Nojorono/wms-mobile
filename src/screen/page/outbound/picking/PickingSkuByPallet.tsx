import React, { useCallback, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useLoadingDialogStore } from "../../../../store/useLoadingStore";
import { useDialogStore } from "../../../../store/useGlobalDialog";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import OutboundService from "../../../../service/outboundService";
import {
    Camera,
    useCameraDevice,
    useCameraPermission,
    useCodeScanner,
} from 'react-native-vision-camera';
import { useRef } from "react";
import { useAuthStore } from "../../../../store/useAuthStore";




const PickingSkuByPallet = () => {
    const [refreshing, setRefreshing] = useState(false);
    const [PickingList, setPickingList] = useState<any[]>([]);
      const { user } = useAuthStore();
  const userName = user?.username || '';
    const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
    const showDialog = useDialogStore((state) => state.showDialog);
    const [scannerVisible, setScannerVisible] = useState(false);
    const [currentPallet, setCurrentPallet] = useState<any>(null);
    const [manualCode, setManualCode] = useState("");
    const [scannedValue, setScannedValue] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const scanLockedRef = useRef(false);
    const device = useCameraDevice("back");
    const { hasPermission, requestPermission } = useCameraPermission();
    const route = useRoute();
    const itemBefore = route.params as any

    const closeScanner = () => {
        setScannerVisible(false);
        setManualCode("");
        setScannedValue(null);
        scanLockedRef.current = false;
    };

    const sendToWH = async () => {
        try {
            if (!currentPallet) {
                showDialog("error", "Pallet tidak ditemukan");
                return;
            }

            setIsSubmitting(true);
            showLoadingDialog("Sending to WH Staff...");

            const payload = {
                status: "PENDING",
                inspection_by: userName,
                ids: currentPallet.ids, // ✅ sesuai card yang dipilih
            };
            
            const res = await OutboundService.updateStatusPickingBulk(payload);

            hideLoadingDialog();
            await fetchPicking();
            showDialog("success", `Pallet ${currentPallet.pallet_code} berhasil dikirim`);
            closeScanner();
        } catch (error) {
            hideLoadingDialog();
            showDialog("error", "Gagal mengirim ke WH Staff!");
        } finally {
            setIsSubmitting(false);
            scanLockedRef.current = false;
        }
    };





    const codeScanner = useCodeScanner({
        codeTypes: ["qr", "code-128", "ean-13"],
        onCodeScanned: (codes) => {
            if (!scannerVisible) return;
            if (scanLockedRef.current) return;

            const value = codes[0]?.value;
            if (!value) return;

            scanLockedRef.current = true; // lock scan
            setScannedValue(value);
            setManualCode(value); // auto isi text input
        },
    });


    const handleCheckAndSend = () => {
        if (isSubmitting) return;

        const finalCode = manualCode.trim();
        if (!finalCode) {
            showDialog("error", "Kode pallet wajib diisi");
            return;
        }

        const targetBin = currentPallet?.destination_bin_code;
        // ⬆️ ganti ke pallet.bin jika field backend = bin

        if (finalCode !== targetBin) {
            showDialog("error", "Tujuan PRELOAD tidak sesuai");
            return;
        }

        sendToWH();
    };





    const fetchPicking = async () => {
        try {
            setRefreshing(true);
            showLoadingDialog('Loading List Picking SKU');
            const response = await OutboundService.getSkuByMemoId(itemBefore.itemBefore.item.id, 'PENDING');
            setPickingList(response.data || []);
        } catch (error) {
            hideLoadingDialog();
            showDialog('error', 'Error while Fetching Data Picking!');
        } finally {
            hideLoadingDialog();
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchPicking();
        }, [])
    );

    // const handleSendToWH = async () => {

    //     // Kalau tidak ada pallet dengan status OPEN
    //     // if (createdPallets.length === 0) {
    //     //   showDialog("success", "Semua data sudah dikirim ke WH STAFF!");
    //     //   return;
    //     // }

    //     try {
    //         showLoadingDialog("Sending to WH Staff...");
    //         //   const payload = {
    //         //     status: "PENDING",
    //         //     inspection_by: userIdNewest,
    //         //     ids: createdPallets.map((item) => item.id),
    //         //   };
    //         //   const res = await OutboundService.updateStatusPickingBulk(payload);
    //         hideLoadingDialog();
    //         await fetchPicking();
    //         showDialog("success", "Berhasil dikirim ke WH Staff!");
    //     } catch (error) {
    //         hideLoadingDialog();
    //         showDialog("error", "Gagal mengirim ke WH Staff!");
    //     }
    // };

    const handleSendToWH = async (pallet: any) => {
        if (!hasPermission) {
            const res = await requestPermission();
            if (!res) {
                showDialog("error", "Camera permission denied");
                return;
            }
        }

        setCurrentPallet(pallet);
        setScannerVisible(true);
    };

    const transformPickingData = (data: any[]) => {
        const palletMap: Record<string, any> = {};

        data.forEach(item => {
            const scans = item.transactionScanPicking || [];

            scans.forEach((scan: any) => {
                const pallet = scan?.palletUse;
                if (!pallet) return;

                const palletCode = pallet.pallet_code;

                if (!palletMap[palletCode]) {
                    palletMap[palletCode] = {
                        pallet_code: palletCode,
                        pallet_use_id: pallet.id,
                        destination_bin_code: item.destinationBin?.code || "-", // ✅ TAMBAHAN
                        destination_bin_id: item.destinationBin?.id || null,   // (opsional)
                        ids: [],
                        items: [],
                    };
                }

                // simpan id scan (hindari duplikat)
                if (!palletMap[palletCode].ids.includes(scan.id)) {
                    palletMap[palletCode].ids.push(scan.id);
                }

                palletMap[palletCode].items.push({
                    item_id: item.item?.id,
                    description: item.item?.description,
                    code: item.item?.sku,
                    status: scan.status,
                    week: item.week_number,
                    quantity: scan.quantity_picked || 0,
                    uom: scan.uom || item.uom,
                });
            });
        });

        const result = Object.values(palletMap);
        return result;
    };

    const transformedData = transformPickingData(PickingList);

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={transformedData}
                keyExtractor={(item) => item.pallet_use_id}
                contentContainerStyle={styles.container}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        Belum ada data scan
                    </Text>
                }
                renderItem={({ item }) => {
                    return (
                        <View style={styles.card}>
                            {/* PALLET HEADER */}
                            <View style={styles.palletHeader}>
                                <View style={styles.palletLeft}>
                                    <Icon
                                        name="check-circle"
                                        size={18}
                                        color="#16A34A"
                                    />
                                    <Text style={styles.palletTitle}>
                                        {item.pallet_code}
                                    </Text>
                                    <Text style={styles.subText}>
                                        | {item.destination_bin_code}
                                    </Text>
                                </View>

                                <Text style={styles.itemCount}>
                                    {item.items.length} Item
                                </Text>
                            </View>

                            <View style={styles.divider} />

                            {item.items.map((itm: any, index: number) => (
                                <View key={`${itm.item_id}-${index}`} style={styles.itemRow}>
                                    <Text style={styles.itemName}>
                                        {itm.code}
                                    </Text>
                                    <Text style={styles.itemName}>
                                        W-{itm.week} 
                                    </Text>
                                    <Text style={styles.qtyText}>
                                        {itm.quantity} {itm.uom}
                                    </Text>
                                </View>
                            ))}
                          {!item.items.some((itm: any) => itm.status === "PENDING") && (
                                <View style={{ marginTop: 12 }}>
                                    <Text
                                        style={{
                                            backgroundColor: isSubmitting ? "#9CA3AF" : "#16A34A",
                                            color: "#fff",
                                            textAlign: "center",
                                            paddingVertical: 10,
                                            borderRadius: 8,
                                            fontWeight: "bold",
                                            fontSize: 16,
                                            opacity: isSubmitting ? 0.7 : 1,
                                        }}
                                        onPress={() => {
                                            if (isSubmitting) return; // 🛑 BLOCK DOUBLE CLICK
                                            handleSendToWH(item);
                                        }}
                                    >
                                        {isSubmitting ? "Processing..." : "Scan to Preload Line"}
                                    </Text>
                                </View>
                            )}

                        </View>
                    );
                }}
            />
            {scannerVisible && device && (
                <View style={StyleSheet.absoluteFillObject}>
                    <Camera
                        style={StyleSheet.absoluteFill}
                        device={device}
                        isActive={scannerVisible}
                        codeScanner={codeScanner}
                    />

                    {/* Overlay UI */}
                    <View style={styles.cameraPanel}>
                        <Text style={styles.cameraTitle}>Scan / Input Tujuan Preload</Text>
                        <Text style={styles.cameraTitle}>{currentPallet?.destination_bin_code}</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Scan atau ketik Tujuan Preaload"
                            placeholderTextColor="#9CA3AF"
                            value={manualCode}
                            onChangeText={setManualCode}
                        />

                        <TouchableOpacity
                            style={[
                                styles.checkButton,
                                isSubmitting && { backgroundColor: "#9CA3AF" },
                            ]}
                            disabled={isSubmitting}
                            onPress={handleCheckAndSend}
                        >
                            <Text style={styles.checkButtonText}>
                                {isSubmitting ? "Processing..." : "Check & Send"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={closeScanner}
                        >
                            <Text style={styles.closeButtonText}>Close Camera</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );

};

export default PickingSkuByPallet;

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
    },
    subText: {
        marginTop: 4,
        fontSize: 13,
        color: "#6B7280",
    },
    divider: {
        height: 1,
        backgroundColor: "#E5E7EB",
        marginVertical: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 8,
    },
    emptyText: {
        fontStyle: "italic",
        color: "#9CA3AF",
    },
    palletRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#F0FDF4",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginBottom: 6,
    },
    palletLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    palletCode: {
        fontSize: 14,
        fontWeight: "500",
        color: "#166534",
    },
    qtyText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#065F46",
    },
    palletHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    palletTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#166534",
    },
    itemCount: {
        fontSize: 13,
        color: "#6B7280",
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    itemName: {
        fontSize: 14,
        color: "#111827",
        flex: 1,
        paddingRight: 8,
    },
    scanOverlay: {
        position: "absolute",
        bottom: 40,
        alignSelf: "center",
        backgroundColor: "rgba(0,0,0,0.6)",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
    },
    scanText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    cameraPanel: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.75)",
        padding: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    cameraTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 12,
        textAlign: "center",
    },
    input: {
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 16,
        marginBottom: 12,
    },
    checkButton: {
        backgroundColor: "#16A34A",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    checkButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    closeButton: {
        marginTop: 10,
        paddingVertical: 10,
        alignItems: "center",
    },
    closeButtonText: {
        color: "#F87171",
        fontSize: 15,
        fontWeight: "600",
    },


});

