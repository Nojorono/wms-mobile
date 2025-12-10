import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Modal,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ForkliftGateParamList } from "../../../navigation/outbound/ForkliftGateNavigator";
import OutboundService from "../../../../service/outboundService";
import Colors from "../../../../constants/Colors";
import { useDialogStore } from "../../../../store/useGlobalDialog";
import Ionicons from 'react-native-vector-icons/FontAwesome5';
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from "react-native-vision-camera";

type NavigationProp = StackNavigationProp<
    ForkliftGateParamList,
    "ForkliftGateMain"
>;

export const ForkliftGateDetail = () => {
    const route = useRoute();
    const { item } = route.params as any;

    const navigation = useNavigation<NavigationProp>();
    const [dataOutbound, setDataOutbound] = useState<any>(null);

    // === MODAL STATE ===
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [targetPallet, setTargetPallet] = useState<string>("");
    const [scanPallet, setScanPallet] = useState<string>("");
    const showDialog = useDialogStore((state) => state.showDialog);
    const [targetGate, setTargetGate] = useState<string>("");
    const [scanGate, setScanGate] = useState<string>("");
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
        const res = await OutboundService.getOutboundDetailById(
            item.outbound_do_id
        );
        setDataOutbound(res.data);
    };

    useEffect(() => {
        fetchOutboundDetail();
    }, []);

    // === HANDLE OPEN MODAL ===
    const openModal = (task: any, palletCodes: string[]) => {
        setSelectedTask(task);
        setTargetPallet(palletCodes.join(", "));
        setTargetGate(item.gate.code);

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
            id: "uuid-assigned-gate-pallet-123",
            pallet_id: selectedTask?.pallet_id, // sesuaikan jika berbeda
            status: "ASSIGNED",
        };

        console.log("PAYLOAD:", payload);

        // contoh hit API
        // await OutboundService.assignGatePallet(payload)

        setModalVisible(false);
    };

    return (
        <>
            <ScrollView style={{ padding: 16 }}>
                <Text style={styles.title}>
                    Kamu memiliki {dataOutbound?.outbound_memos.length} memo
                </Text>

                {dataOutbound?.outbound_memos.map((memo: any) => {
                    const tasks = memo.transaction_pickings || [];

                    return (
                        <View key={memo.id} style={styles.card}>
                            <Text style={styles.memoNumber}>{memo.outbound_memo_number}</Text>
                            <Text style={styles.subTitle}>Total Task: {tasks.length}</Text>

                            {tasks.map((task: any, tIndex: number) => {
                                const scans = task.transactionScanPicking || [];
                                const palletCodes = scans.map(
                                    (scan: any) => scan?.palletUse.pallet_code
                                );

                                return (
                                    <View key={task.id} style={styles.taskBox}>
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Text style={styles.taskTitle}>
                                                • Task {tIndex + 1} – Item {task.item?.sku}
                                            </Text>

                                            {/* === OPEN MODAL === */}
                                            <TouchableOpacity
                                                style={{ padding: 8 }}
                                                onPress={() => {
                                                    if (!palletCodes || palletCodes.length === 0) {
                                                        showDialog('error', 'Belum ada pallet tujuan.\nSilakan scan pallet terlebih dahulu.');
                                                        return;
                                                    }
                                                    openModal(task, palletCodes);
                                                }}
                                            >
                                                <Icon name="chevron-right" size={18} color="#888" />
                                            </TouchableOpacity>
                                        </View>

                                        {palletCodes.length === 0 ? (
                                            <Text style={styles.noPallet}>
                                                Belum ada pallet di-scan
                                            </Text>
                                        ) : (
                                            <View>
                                                <Text style={styles.palletLabel}>
                                                    Pallet hasil scan:
                                                </Text>
                                                <Text style={styles.palletItem}>
                                                    {palletCodes.join(", ")}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    );
                })}
            </ScrollView>

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
});
