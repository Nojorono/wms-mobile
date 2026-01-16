import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Modal,
    Alert,
    RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ForkliftGateParamList } from "../../../navigation/outbound/ForkliftGateNavigator";
import OutboundService from "../../../../service/outboundService";
import Colors from "../../../../constants/Colors";
import { useDialogStore } from "../../../../store/useGlobalDialog";
import Ionicons from 'react-native-vector-icons/FontAwesome5';
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from "react-native-vision-camera";
import { useLoadingDialogStore } from "../../../../store/useLoadingStore";
import { useAuthStore } from "../../../../store/useAuthStore";

type NavigationProp = StackNavigationProp<
    ForkliftGateParamList,
    "ForkliftGateMain"
>;

export const ForkliftGateDetail = () => {
    const route = useRoute();
    const { item } = route.params as any;
    console.log("Route Params:", route.params);

    const navigation = useNavigation<NavigationProp>();
    const [dataOutbound, setDataOutbound] = useState<any>(null);
    const [dataItem, setDataItem] = useState<any>(null);
    const { user } = useAuthStore();
    const userId = user?.id || "";
    const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();

    // === MODAL STATE ===
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [targetPallet, setTargetPallet] = useState<string>("");
    const [scanPallet, setScanPallet] = useState<string>("");
    const showDialog = useDialogStore((state) => state.showDialog);
    const [targetGate, setTargetGate] = useState<string>("");
    const [scanGate, setScanGate] = useState<string>("");
    const [refreshing, setRefreshing] = useState(false);
    // SCANNER STATES
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scanTarget, setScanTarget] =
        useState<'pallet' | 'gate' | null>(null);

    const device = useCameraDevice('back');
    const { hasPermission, requestPermission } = useCameraPermission();

    const openScanner = async (type: 'pallet' | 'gate') => {
        // disable scanner in edit mode
        if (!hasPermission) {
            await requestPermission();
        }
        setScanTarget(type);
        setIsScannerOpen(true);
    };

    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13', 'code-128', 'code-39'],
        onCodeScanned: (codes) => {
            if (codes.length === 0) return;
            const value = codes[0].value ?? '';

            if (scanTarget === 'pallet') setScanPallet(value);
            if (scanTarget === 'gate') setScanGate(value);

            setIsScannerOpen(false);
            setScanTarget(null);
        },
    });


    // === FETCH DETAIL ===
    const fetchOutboundDetail = async () => {
        const resItem = await OutboundService.getAssignedGateByUserId(userId);
        const assignedItem = resItem.data.find((d: any) => d.id === item.id);
        setDataItem(assignedItem);

        const res = await OutboundService.getOutboundDetailById(
            item.outbound_do_id,
            { transaction_picking_status: "PENDING" }

        );
        setDataOutbound(res.data);
    };

    useFocusEffect(
        useCallback(() => {

            fetchOutboundDetail();
        }, [])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await fetchOutboundDetail();
        } catch (e) {
            console.log("Refresh error:", e);
        } finally {
            setRefreshing(false);
        }
    }, []);

    const groupByPallet = (tasks: any[]) => {
        const groups: any = {};

        tasks.forEach((task) => {
            const scans = task.transactionScanPicking || [];

            scans.forEach((scan: any) => {
                const palletCode = scan?.palletUse?.pallet_code;
                if (!palletCode) return;

                if (!groups[palletCode]) {
                    groups[palletCode] = [];
                }

                groups[palletCode].push({
                    sku: task.item?.sku,
                    taskId: task.id,
                    task,
                });
            });
        });

        return groups;
    };



    // === HANDLE OPEN MODAL ===
    const openModal = (task: any, palletCodes: string) => {
        setSelectedTask(task);
        setTargetPallet(palletCodes || "");
        setTargetGate(dataItem.gate.code);

        setScanPallet("");
        setScanGate("");

        setModalVisible(true);
    };

    // === LOGIC VALIDASI ===
    const isPalletMatch = scanPallet.trim() === targetPallet.trim();
    const isGateMatch = scanGate.trim() === targetGate.trim();

    const canSubmit = isPalletMatch && isGateMatch;

    // === HANDLE SUBMIT ===
    const handleSubmit = async () => {
        if (!canSubmit) return;

        const payload = {
            pallet_id: selectedTask.transactionScanPicking.find(
                (i: any) => i.palletUse?.pallet_code === targetPallet
            )?.palletUse?.id,
            status: "COMPLETED",
        };
        try {
            showLoadingDialog('Memproses data...');
            await OutboundService.postForkliftScanGate(item.id, payload);
            showDialog('success', 'Pallet dan Gate berhasil di-assign.');
            setModalVisible(false);
            await fetchOutboundDetail();
        } catch (error) {
            showDialog('error', 'Gagal meng-assign Pallet dan Gate.');
        } finally {
            hideLoadingDialog();
        }


    };

    return (
        <>
            <ScrollView style={{ padding: 16 }} refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[Colors.secondaryColor]} // Android
                    tintColor={Colors.secondaryColor} // iOS
                />
            }>
                <Text style={styles.title}>
                    Kamu memiliki {dataOutbound?.outbound_memos.length} memo
                </Text>

                {dataOutbound?.outbound_memos.map((memo: any) => {
                    const tasks = memo.transaction_pickings || [];

                    return (
                        <View key={memo.id} style={styles.card}>
                            <Text style={styles.memoNumber}>{memo.outbound_memo_number}</Text>
                            <Text style={styles.subTitle}>Total Task: {tasks.length}</Text>

                            {(() => {
                                const palletGroups = groupByPallet(tasks);
                                const completedPalletCodes = new Set(
                                    dataItem?.assigned_gate_pallets
                                        ?.filter((p: any) => p.status === "COMPLETED")
                                        ?.map((p: any) => p.pallet?.pallet_code)
                                );

                                return (
                                    <View style={{ marginTop: 6, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 }}>
                                        <Text style={styles.subTitle}>
                                            Total Pallet: {Object.keys(palletGroups).length}
                                        </Text>

                                        {
                                            Object.keys(palletGroups).map((palletCode) => {
                                                // const itemsInPallet = palletGroups[palletCode];
                                                // console.log("Items in Pallet:", item?.assigned_gate_pallets);

                                                // const assignedPallet = item?.assigned_gate_pallets?.find(
                                                //     (p: any) =>
                                                //         p.status === "COMPLETED" &&
                                                //         p.pallet?.pallet_code === palletCode
                                                // );

                                                // const palletTujuan = assignedPallet?.pallet?.pallet_code;
                                                // const isMatch = palletTujuan === palletCode;
                                                const itemsInPallet = palletGroups[palletCode];
                                                const isMatch = completedPalletCodes.has(palletCode);

                                                return (
                                                    <View key={palletCode} style={styles.taskBox}>
                                                        <View
                                                            style={{
                                                                flexDirection: "row",
                                                                justifyContent: "space-between",
                                                                alignItems: "center",
                                                            }}
                                                        >
                                                            <Text style={styles.taskTitle}>
                                                                • Pallet {palletCode}
                                                            </Text>

                                                            <TouchableOpacity
                                                                style={{ padding: 8 }}
                                                                onPress={() => {
                                                                    openModal(
                                                                        itemsInPallet[0].task,
                                                                        palletCode
                                                                    )
                                                                }
                                                                }
                                                            >
                                                                <Icon name="chevron-right" size={18} color="#888" />
                                                            </TouchableOpacity>
                                                        </View>

                                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                            <Text style={styles.palletItem}>
                                                                Digunakan oleh {itemsInPallet.length} item
                                                            </Text>

                                                            {isMatch && (
                                                                <Ionicons
                                                                    name="check-circle"
                                                                    size={16}
                                                                    color="green"
                                                                    style={{ marginLeft: 8 }}
                                                                />
                                                            )}
                                                        </View>

                                                        <View style={{ marginTop: 6 }}>
                                                            {itemsInPallet.map((row: any, idx: number) => (
                                                                <Text key={idx} style={{ color: "#666", marginVertical: 2 }}>
                                                                    - SKU {row.sku} (Task Ke : {idx + 1} )
                                                                </Text>
                                                            ))}
                                                        </View>
                                                    </View>
                                                );
                                            })
                                        }
                                    </View>
                                );
                            })()}

                        </View>
                    );
                })}
            </ScrollView>

            {/* Floating Button */}
            {/* {item.status !== "DONE" && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() =>
                        Alert.alert(
                            "Done Confirmation",
                            "Are you sure all your tasks are done?",
                            [
                                { text: "Cancel", style: "cancel" },
                                {
                                    text: "OK",
                                    onPress: async () => {
                                        try {
                                            const res = await OutboundService.updateStatusForkliftGateDone(item.id, "DONE");
                                            showDialog("success", "All tasks approved successfully!");
                                            navigation.goBack();
                                        } catch (error) {
                                            showDialog("error", "Failed to approve tasks!");
                                        }
                                    },
                                },
                            ]
                        )
                    }
                >
                    <Text style={styles.fabText}>All Done</Text>
                </TouchableOpacity>
            )} */}

            {/* ========================================================= */}
            {/* ====================== MODAL POPUP ====================== */}
            {/* ========================================================= */}

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Konfirmasi Pallet & Gate</Text>

                        {/* ROW 1 */}
                        <Text style={styles.row}>
                            Pallet Tujuan: <Text style={styles.bold}>{targetPallet}</Text>
                        </Text>
                        <Text style={styles.row}>
                            Gate Tujuan: <Text style={styles.bold}>{targetGate}</Text>
                        </Text>

                        {/* ROW 2 - SCAN PALLET */}
                        <View style={styles.scanRow}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <Text style={styles.scanLabel}>Scan Pallet</Text>
                                <TextInput
                                    placeholder="Masukkan kode pallet"
                                    style={[
                                        styles.input,
                                        { flex: 1 },
                                        !isPalletMatch && scanPallet ? styles.redBorder : {},
                                    ]}
                                    value={scanPallet}
                                    onChangeText={setScanPallet}
                                />
                                <TouchableOpacity style={styles.scanButton} onPress={() => openScanner('pallet')}>
                                    <Ionicons name="qrcode" size={20} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* ROW 3 - SCAN GATE */}
                        <View style={styles.scanRow}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <Text style={styles.scanLabel}>Scan Gate</Text>
                                <TextInput
                                    placeholder="Masukkan kode gate"
                                    style={[
                                        styles.input,
                                        { flex: 1 },
                                        !isGateMatch && scanGate ? styles.redBorder : {},
                                    ]}
                                    value={scanGate}
                                    onChangeText={setScanGate}
                                />
                                <TouchableOpacity style={styles.scanButton} onPress={() => openScanner('gate')}>
                                    <Ionicons name="qrcode" size={20} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* SUBMIT BUTTON */}
                        <TouchableOpacity
                            onPress={handleSubmit}
                            style={[styles.submitBtn, !canSubmit && styles.disabledBtn]}
                            disabled={!canSubmit}
                        >
                            <Text style={styles.submitText}>Submit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.closeBtn}
                        >
                            <Text style={[styles.closeText, { color: "#fff" }]}>Tutup</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* SCANNER MODAL */}
                {isScannerOpen && device && (
                    <View style={styles.scannerModal}>
                        <Camera
                            style={StyleSheet.absoluteFill}
                            device={device}
                            isActive={true}
                            codeScanner={codeScanner}
                        />

                        {/* FRAME */}
                        <View style={styles.scanFrame} />

                        <TouchableOpacity
                            onPress={() => setIsScannerOpen(false)}
                            style={styles.closeScannerBtn}
                        >
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                                CLOSE
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </Modal>
        </>
    );
};

/* ======================= STYLES ========================= */

const styles = StyleSheet.create({
    title: { fontSize: 18, fontWeight: "700", marginBottom: 12 },

    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 3,
    },

    memoNumber: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
    subTitle: { color: "#555", marginBottom: 12 },

    taskBox: {
        padding: 12,
        backgroundColor: "#f7f7f7",
        borderRadius: 8,
        marginBottom: 10,
    },

    taskTitle: { fontWeight: "600", marginBottom: 8 },
    noPallet: { color: "red", fontStyle: "italic" },

    palletLabel: { fontWeight: "600", marginBottom: 4 },
    palletItem: { marginLeft: 8, color: "#333" },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        padding: 20,
    },
    modalBox: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 12,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 10,
    },
    row: { marginBottom: 4 },
    bold: { fontWeight: "700" },

    scanRow: {
        marginTop: 12,
    },
    scanLabel: { fontWeight: "600", marginBottom: 4 },

    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 8,
        marginBottom: 6,
    },
    redBorder: {
        borderColor: "red",
        backgroundColor: "#ffe5e5",
    },
    // SCANNER MODAL
    scannerModal: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },

    scanFrame: {
        width: 260,
        height: 260,
        borderWidth: 3,
        borderColor: 'white',
        borderRadius: 20,
        position: 'absolute',
    },

    closeScannerBtn: {
        position: 'absolute',
        bottom: 60,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
    },
    scanButton: {
        backgroundColor: Colors.secondaryColor,
        padding: 8,
        borderRadius: 6,
        alignItems: "center",
    },
    scanButtonText: { color: "#fff", fontWeight: "600" },

    submitBtn: {
        backgroundColor: "#007bff",
        padding: 12,
        borderRadius: 10,
        marginTop: 16,
    },
    disabledBtn: {
        backgroundColor: "#b5b5b5",
    },
    submitText: { color: "#fff", textAlign: "center", fontWeight: "700" },

    closeBtn: {
        padding: 12,
        borderRadius: 10,
        marginTop: 8,
        backgroundColor: "red",
    },
    closeText: { textAlign: "center", fontWeight: "600" },
    fab: {
        position: "absolute",
        bottom: 30,
        left: 30,
        backgroundColor: "#F26E1F",
        width: 140,
        height: 50,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
    },
    fabText: {
        color: "white",
        fontWeight: "700",
    },
});
