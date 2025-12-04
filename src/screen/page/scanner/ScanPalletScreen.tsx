import React, { useCallback, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Modal,
    ScrollView,
    Alert,
    ActivityIndicator,
} from "react-native";

import {
    Camera,
    useCameraDevice,
    useCameraPermission,
    useCodeScanner,
} from "react-native-vision-camera";
import ScannerService from "../../../service/palletServices";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ScannerParamList } from "../../navigation/scanner/ScannerNavigator";
type NavigationProp = StackNavigationProp<ScannerParamList, 'ScannerMain'>;

async function updatePallet(palletId: string, payload: any) {
    // Ganti dengan API asli
    return new Promise((resolve) =>
        setTimeout(() => resolve({ success: true, ...payload }), 800)
    );
}
// ===============================

const ScanPalletScreen = () => {
    const [scannedId, setScannedId] = useState<string>("");
    const [manualInput, setManualInput] = useState<string>("");

    const [palletData, setPalletData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
      const navigation = useNavigation<NavigationProp>();

    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);


    // Camera permission
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice("back");

    const handleOpenScanner = async () => {
        const ok = await requestPermission();
        if (!ok) {
            Alert.alert("Permission denied", "Camera access is required");
            return;
        }
        setIsScannerOpen(true);
    };

    const codeScanner = useCodeScanner({
        codeTypes: ["qr", "code-128", "ean-13"],
        onCodeScanned: (codes) => {
            const val = codes[0]?.value ?? "";
            if (!val) return;

            if (isProcessing) return;

            setIsProcessing(true);

            setIsScannerOpen(false);
            setScannedId(val);

            fetchPalletData(val);

            setTimeout(() => {
                setIsProcessing(false);
            }, 5000);
        },
    });


    const fetchPalletData = async (id: string) => {
        try {
            setLoading(true);
            const res: any = await ScannerService.getPalletByCode(id);
            setPalletData(res.data || []);
        } catch (err) {
            Alert.alert("Error", "Failed to get pallet data");
        } finally {
            setLoading(false);
        }
    };

    const handleManualCheck = () => {
        if (!manualInput.trim()) return;
        setScannedId(manualInput);
        fetchPalletData(manualInput);
    };

    if (!hasPermission) {
        return (
            <View style={styles.center}>
                <Text>Requesting camera permission...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Scan button */}
            <TouchableOpacity style={styles.scanBtn} onPress={handleOpenScanner}>
                <Text style={styles.scanBtnText}>Scan Pallet First</Text>
            </TouchableOpacity>

            {/* OR separator */}
            <Text style={styles.orText}>— OR —</Text>

            {/* Manual Input */}
            <View style={styles.manualBox}>
                <TextInput
                    value={manualInput}
                    onChangeText={setManualInput}
                    placeholder="Enter Pallet ID"
                    style={styles.input}
                />
                <TouchableOpacity style={styles.checkBtn} onPress={handleManualCheck}>
                    <Text style={styles.checkText}>Check</Text>
                </TouchableOpacity>
            </View>

            {/* Loading indicator */}
            {loading && (
                <View style={{ marginTop: 20 }}>
                    <ActivityIndicator size="large" />
                </View>
            )}

            {/* Pallet Data */}
            {/* MULTIPLE PALLET CARDS */}
            {palletData.length > 0 && !loading && (
                <ScrollView style={{ marginTop: 20 }}>
                    {palletData.map((item: any, index: any) => {

                        // COLOR LOGIC FOR WEEK BADGE
                        let weekBg = "#FFE4CC"; // orange light
                        let weekColor = "#C2410C";

                        if (item.week_number > 48) {
                            weekBg = "#FEE2E2"; // red light
                            weekColor = "#B91C1C";
                        } else if (item.week_number >= 44) {
                            weekBg = "#FEF3C7"; // yellow light
                            weekColor = "#B45309";
                        } else {
                            weekBg = "#DCFCE7"; // green light
                            weekColor = "#166534";
                        }

                        return (
                            <TouchableOpacity
                                key={index}
                                style={styles.cardItem}
                                onPress={() => {
                                    navigation.navigate('ScanPalletDetail', { data: item });
                                }}
                            >
                                {/* BADGE ROW */}
                                <View style={styles.badgeRow}>
                                    <Text style={styles.cardTitle}>{item.item_name}</Text>
                                    {/* Location Badge */}
                                    <View style={[styles.badge, { backgroundColor: "#DCFCE7" }]}>
                                        <Ionicons name="location" size={12} color="#166534" />
                                        <Text style={[styles.badgeText, { color: "#166534" }]}>
                                            {item.warehouse_sub_name}
                                        </Text>
                                    </View>
                                    {/* Week Badge (AUTO COLOR) */}
                                    <View style={[styles.badge, { backgroundColor: weekBg }]}>
                                        <Ionicons name="calendar" size={12} color={weekColor} />
                                        <Text style={[styles.badgeText, { color: weekColor }]}>
                                            WEEK {item.week_number}
                                        </Text>
                                    </View>
                                </View>
                                {/* Quantity */}
                                <View style={styles.row}>
                                    <Text style={styles.label}>Quantity</Text>
                                    <Text style={styles.value}>{item.current_quantity} {item.uom}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            )}

            {/* SCANNER MODAL */}
            <Modal visible={isScannerOpen} animationType="slide">
                <View style={styles.scannerContainer}>
                    {device ? (
                        <Camera
                            device={device}
                            isActive={true}
                            style={StyleSheet.absoluteFill}
                            codeScanner={codeScanner}
                        />
                    ) : (
                        <Text>No Camera Detected</Text>
                    )}

                    {/* Close Button */}
                    <TouchableOpacity
                        style={styles.closeScannerBtn}
                        onPress={() => setIsScannerOpen(false)}
                    >
                        <Text style={styles.closeScannerText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

export default ScanPalletScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#F9FAFB",
    },

    title: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 12,
    },
    scanBtn: {
        backgroundColor: "#111827",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    scanBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },

    orText: {
        textAlign: "center",
        marginVertical: 16,
        fontSize: 14,
        color: "#6B7280",
    },

    manualBox: {
        flexDirection: "row",
        gap: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 45,
        backgroundColor: "#fff",
    },
    checkBtn: {
        backgroundColor: "#059669",
        paddingHorizontal: 18,
        borderRadius: 10,
        justifyContent: "center",
    },
    checkText: { color: "#fff", fontWeight: "700" },

    dataCard: {
        marginTop: 20,
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 12,
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 12,
    },

    label: {
        fontSize: 14,
        fontWeight: "600",
        marginTop: 10,
    },
    editInput: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 45,
        backgroundColor: "#fff",
        marginTop: 4,
    },

    saveBtn: {
        backgroundColor: "#1D4ED8",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
    },
    saveText: {
        color: "#fff",
        fontWeight: "700",
    },

    scannerContainer: {
        flex: 1,
        backgroundColor: "#000",
    },

    closeScannerBtn: {
        position: "absolute",
        bottom: 40,
        alignSelf: "center",
        backgroundColor: "rgba(0,0,0,0.7)",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    closeScannerText: { color: "#fff", fontWeight: "600" },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    cardItem: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },

    badgeRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginVertical: 5,
    },

    badge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 20,
    },

    badgeText: {
        fontSize: 12,
        fontWeight: "700",
    },

    row: {
        marginTop: 6,
    },

    value: {
        fontSize: 15,
        fontWeight: "500",
        color: "#374151",
        marginTop: 2,
    },

});
