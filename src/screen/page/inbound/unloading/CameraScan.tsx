import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
} from "react-native";
import {
    Camera,
    useCameraDevice,
    useCameraPermission,
    useCodeScanner,
} from "react-native-vision-camera";
import { useRoute, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import DatePicker from "react-native-date-picker";
import { UnloadingParamList } from "../../../navigation/inbound/UnloadingNavigator";
import InboundServices from "../../../../service/inboundServices";
import { useAuthStore } from "../../../../store/useAuthStore";
import { Picker } from "@react-native-picker/picker";
import { useDialogStore } from "../../../../store/useGlobalDialog";

type NavigationProp = StackNavigationProp<
    UnloadingParamList,
    "UnloadingMain"
>;

interface RouteParams {
    item: { id: string; inbound_id: string; uom: string };
    payload?: any;
    onScanFinish?: (data: PalletItem | null) => void;
}

interface PalletItem {
    id: string;
    palletNo: string;
    qty: string;
    production_date: string | null;
    week: string | null;
    inbound_id: string;
    item_id: string;
    user_id: string;
    user_name: string;
    uom: string;
    status: string;
    staging_area_id?: string; // 🔥 tambahkan field staging
}

const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const CameraScreen = () => {
    const route = useRoute<any>();
    const { user } = useAuthStore();
    const navigation = useNavigation<NavigationProp>();
    const { item } = route.params as RouteParams;
    const showDialog = useDialogStore((state) => state.showDialog);

    const device = useCameraDevice("back");
    const { hasPermission, requestPermission } = useCameraPermission();
    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13'],
        onCodeScanned: (codes) => {
            setManualInput(codes[0]?.value ?? ""); // langsung isi ke input
        }
    })

    // hanya 1 pallet
    const [scan, setScan] = useState<PalletItem | null>(null);
    const [manualInput, setManualInput] = useState("");

    // date picker
    const [openPicker, setOpenPicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());

    // staging area
    const [stagingAreas, setStagingAreas] = useState<any[]>([]);

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
    }, [hasPermission]);

    // fetch staging area
    useEffect(() => {
        const fetchStaging = async () => {
            try {
                const res = await InboundServices.getStagingArea();
                setStagingAreas(res?.data || []);
                console
            } catch (err) {
                console.error("Gagal fetch staging area:", err);
            }
        };
        fetchStaging();
    }, []);

    const addManual = async () => {
        if (!manualInput.trim() || !user) return;

        try {
            // 🔥 Panggil API validasi pallet
            const res = await InboundServices.getPalletInfo(manualInput.trim());
            const palletData = res?.data;

            if (!palletData) {
                return;
            }

            // Jika valid, buat PalletItem
            const newItem: PalletItem = {
                id: Date.now().toString(),
                palletNo: manualInput.trim(),
                qty: palletData.qty?.toString() || "", // isi qty kalau ada dari API
                production_date: palletData.production_date || null,
                week: palletData.week?.toString() || null,
                inbound_id: item.inbound_id,
                item_id: item.id,
                user_id: user.id,
                user_name: user.username,
                status: "PENDING",
                uom: item.uom,
                staging_area_id: "", // default kosong
            };

            setScan(newItem); // replace, hanya 1 card
            setManualInput("");
        } catch (err) {
            showDialog('error', 'Error, Pallet not found or invalid!');
        }
    };


    const deletePallet = () => {
        setScan(null);
    };

    const updatePallet = (field: keyof PalletItem, value: string | null) => {
        if (scan) {
            setScan({ ...scan, [field]: value || "" });
        }
    };

    const fetchWeek = async (date: string) => {
        try {
            const res = await InboundServices.getWeekProduction(date);
            const minggu = res?.data?.[0]?.MINGGU?.toString() || null;
            setScan((prev) => (prev ? { ...prev, week: minggu } : prev));
        } catch (error) {
            showDialog('error', 'Error while Fetching Week Production!');
        }
    };

    const handleDateSelect = (selectedDate: Date) => {
        if (scan) {
            const formatted = formatDate(selectedDate);
            setScan({ ...scan, production_date: formatted });
            fetchWeek(formatted);
        }
    };

    const handleNext = () => {
        if (scan) {
            const data = {
                production_date: scan.production_date ?? "",
                week_number: scan.week ? Number(scan.week) : 0,
                inbound_id: scan.inbound_id,
                item_id: scan.item_id,
                quantity: Number(scan.qty) || 0,
                uom: scan.uom,
                user_id: scan.user_id,
                user_name: scan.user_name,
                pallet_code: scan.palletNo,
                status: scan.status,
                m_warehouse_sub_id: scan.staging_area_id || "", // 🔥 ikut dikirim
            };
            InboundServices.postUnloading(data)
                .then(() => {
                    navigation.goBack();
                })
                .catch((err) => {
                    showDialog('error', 'Error while Posting Unloading Data!');
                });
        }
    };

    if (!device) return <Text>Loading camera...</Text>;
    if (!hasPermission) return <Text>No camera permission</Text>;

    return (
        <View style={styles.container}>
            <Camera style={StyleSheet.absoluteFill} device={device} isActive={true} codeScanner={codeScanner} />

            <View style={styles.overlay}>
                {/* Manual input */}
                <View style={styles.row}>
                    <TextInput
                        style={styles.input}
                        placeholder="Input manual jika QR gagal"
                        value={manualInput}
                        onChangeText={setManualInput}
                    />
                    <TouchableOpacity
                        style={[
                            styles.addBtn,
                            { backgroundColor: manualInput ? "#f97316" : "#6b7280" },
                        ]}
                        onPress={addManual}
                        disabled={!manualInput}
                    >
                        <Text style={styles.btnText}>Add</Text>
                    </TouchableOpacity>
                </View>

                {/* Card hanya 1 */}
                {scan ? (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.palletTitle}>{scan.palletNo}</Text>
                            <TouchableOpacity style={styles.deleteBtn} onPress={deletePallet}>
                                <Text style={{ color: "#fff" }}>Delete</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Staging Area */}
                        <View style={{ marginBottom: 12 }}>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={scan.staging_area_id ?? ""}
                                    onValueChange={(itemValue) =>
                                        updatePallet("staging_area_id", itemValue)
                                    }
                                    style={styles.picker}
                                    dropdownIconColor="#111"
                                >
                                    <Picker.Item label="Select Staging Area" value="" />
                                    {stagingAreas.map((area: any) => (
                                        <Picker.Item
                                            key={area.id}
                                            label={area.code}
                                            value={area.id}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {/* Qty */}
                        <View style={styles.rowInput}>
                            <TextInput
                                style={styles.input}
                                placeholder="Qty"
                                keyboardType="numeric"
                                value={scan.qty}
                                onChangeText={(val) => updatePallet("qty", val)}
                                textAlign="right"
                            />
                        </View>

                        {/* Week (readonly) */}
                        <View style={[styles.rowInput, { marginTop: 8 }]}>
                            <TextInput
                                style={[styles.input, { backgroundColor: "#fef9c3" }]}
                                placeholder="Week (auto)"
                                value={scan.week ?? ""}
                                editable={false}
                                textAlign="right"
                            />
                        </View>

                        {/* Production Date */}
                        <TouchableOpacity
                            style={[styles.input, { justifyContent: "center", marginTop: 8 }]}
                            onPress={() => {
                                setTempDate(
                                    scan.production_date ? new Date(scan.production_date) : new Date()
                                );
                                setOpenPicker(true);
                            }}
                        >
                            <Text
                                style={{
                                    color: scan.production_date ? "#111" : "#9ca3af",
                                    textAlign: "right",
                                }}
                            >
                                {scan.production_date || "Select Production Date"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Text style={{ color: "#9ca3af" }}>Belum ada hasil scan</Text>
                )}

                {/* Next button */}
                <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                    <Text style={styles.btnText}>Next</Text>
                </TouchableOpacity>
            </View>

            {/* Date Picker Modal */}
            <DatePicker
                modal
                open={openPicker}
                date={tempDate}
                mode="date"
                onConfirm={(selectedDate) => {
                    handleDateSelect(selectedDate);
                    setOpenPicker(false);
                }}
                onCancel={() => setOpenPicker(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    overlay: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: 16,
    },
    row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    rowInput: { flexDirection: "row" },
    input: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 10,
    },
    addBtn: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        marginLeft: 8,
    },
    deleteBtn: {
        backgroundColor: "#dc2626",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    nextBtn: {
        backgroundColor: "#16a34a",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 12,
    },
    btnText: { color: "#fff", fontWeight: "600" },
    palletTitle: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    card: {
        backgroundColor: "rgba(255,255,255,0.1)",
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
        alignItems: "center",
    },
    label: {
        color: "#e5e7eb",
        fontSize: 14,
        marginBottom: 4,
    },
    pickerWrapper: {
        backgroundColor: "#fff",
        borderRadius: 8,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#d1d5db",
    },
    picker: {
        height: 50,
        fontSize: 13,
        color: "#111",
    },
});

export default CameraScreen;
