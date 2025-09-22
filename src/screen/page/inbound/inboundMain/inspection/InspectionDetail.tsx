import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ItemDetail } from "../../service/inboundService";
import { StackNavigationProp } from "@react-navigation/stack";
import { useLoadingDialogStore } from "../../../../../store/useLoadingStore";
import { useDialogStore } from "../../../../../store/useGlobalDialog";
import InboundServices from "../../../../../service/inboundServices";
import Ionicons from "react-native-vector-icons/Ionicons";
import DatePicker from "react-native-date-picker";

type ItemType = {
    inbound_id: string;
    uom: string;
    item_id: string;
    sku: string;
    quantity_plan: number;
    quantity_scan: number;
    item: ItemDetail;
};

type PayloadType = {
    inbound_number: string;
    id: string;
};

type RouteParams = {
    item: ItemType;
    payload: PayloadType;
};

type PalletItem = {
    id: string;
    palletCode: string;
    qty: number;
    weekNumber: number;
    stagingArea: string;
    productionDate: string;
};

const InspectionDetail = () => {
    const [pallets, setPallets] = useState<PalletItem[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editQty, setEditQty] = useState("");
    const [editCode, setEditCode] = useState(""); // string (yyyy-mm-dd)
    const [editDate, setEditDate] = useState<Date>(new Date());

    const navigation = useNavigation<StackNavigationProp<any>>();
    const route = useRoute();
    const { item, payload } = route.params as RouteParams;
    const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
    const showDialog = useDialogStore((state) => state.showDialog);

    // const [openPicker, setOpenPicker] = useState(false);
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);

    // buka datepicker → copy tanggal sekarang dulu
    const handleOpenDatePicker = (currentDate: Date) => {
        setTempDate(currentDate);
        setOpenDatePicker(true);
    };

    // konfirmasi pilih tanggal
    const handleConfirmDate = async (selectedDate: Date, palletId: string) => {
        setOpenDatePicker(false);
        setTempDate(null);

        // update tanggal
        setPallets((prev) =>
            prev.map((p) =>
                p.id === palletId ? { ...p, date: selectedDate.toISOString() } : p
            )
        );

        // fetch week number setelah konfirmasi
        await fetchWeek(selectedDate.toISOString(), palletId);
    };

    // cancel → jangan ubah apa-apa
    const handleCancelDate = () => {
        setOpenDatePicker(false);
        setTempDate(null);
    };

    const fetchData = async () => {
        try {
            showLoadingDialog("Loading Pallets");
            const res = await InboundServices.getUnloadingScanList(
                payload.id,
                "PENDING",
                item.item_id
            );
            console.log("Pallets Response:", res.data);
            if (res?.data) {
                const mapped: PalletItem[] = res.data.map((d: any) => ({
                    id: d.id,
                    palletCode: d.pallet?.pallet_code || "-",
                    qty: d.quantity,
                    weekNumber: d.week_number,
                    stagingArea: d.m_warehouse_sub_id || "-",
                    productionDate: d.production_date || "-",
                }));
                setPallets(mapped);
            }
        } catch (err) {
            showDialog("error", "Error while Fetching Pallets!");
        } finally {
            hideLoadingDialog();
        }
    };

    useEffect(() => {
        fetchData();
        const unsubscribe = navigation.addListener("focus", fetchData);
        return unsubscribe;
    }, [navigation, item.inbound_id]);

    const handleEdit = (pallet: PalletItem) => {
        setEditingId(pallet.id);
        setEditQty(String(pallet.qty));
        setEditCode(pallet.productionDate);
        setEditDate(pallet.productionDate ? new Date(pallet.productionDate) : new Date());
    };

    const handleSave = async (id: string) => {
        try {
            showLoadingDialog("Updating Pallet...");
            // Simpan ke backend
            // await InboundServices.updatePallet(id, {
            //     qty: Number(editQty),
            //     production_date: editCode,
            // });

            // Update state lokal
            await fetchData();
            setEditingId(null);
        } catch (error) {
            showDialog("error", "Failed to update pallet!");
        } finally {
            hideLoadingDialog();
        }
    };

    const fetchWeek = async (date: string, id: string) => {
        try {
            const res = await InboundServices.getWeekProduction(date);
            const minggu = res?.data?.[0]?.MINGGU?.toString() || null;
            setPallets((prev) =>
                prev.map((p) =>
                    p.id === id ? { ...p, weekNumber: minggu || p.weekNumber } : p
                )
            );
        } catch (error) {
            showDialog("error", "Error while Fetching Week Production!");
        }
    };

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const handleDateSelect = (selectedDate: Date, id: string) => {
        const formatted = formatDate(selectedDate);
        setEditDate(selectedDate);
        setEditCode(formatted);
        fetchWeek(formatted, id);
    };

    return (
        <View style={styles.container}>
            {/* Header Info */}
            <View style={styles.card}>
                <Text style={styles.title}>Inbound Planning Number</Text>
                <Text style={styles.number}>{payload.inbound_number}</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>SKU Number</Text>
                    <Text style={styles.value}>{item.sku}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Qty Plan</Text>
                    <Text style={styles.value}>{item.quantity_plan}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Qty Scan</Text>
                    <Text style={styles.value}>{item.quantity_scan}</Text>
                </View>
            </View>

            <FlatList
                data={pallets}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.palletCard}>
                        {/* Left Icon */}
                        <View style={styles.iconWrapper}>
                            <Ionicons name="pricetag" size={28} color="#f97316" />
                        </View>

                        <View style={[styles.cardContent, { flex: 1 }]}>
                            <Text style={styles.palletCode}>{item.palletCode}</Text>

                            {editingId === item.id ? (
                                <>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Staging:</Text>
                                        <Text style={styles.infoValue}>
                                            {item.stagingArea.slice(-15)}
                                        </Text>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Week:</Text>
                                        <Text style={styles.infoValue}>{item.weekNumber}</Text>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Qty:</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={editQty}
                                            onChangeText={setEditQty}
                                            keyboardType="numeric"
                                        />
                                    </View>

                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Code:</Text>
                                        <TouchableOpacity
                                            style={[styles.input, { justifyContent: "center", marginTop: 8 }]}
                                            onPress={() => handleOpenDatePicker(editDate)}
                                        >
                                            <Text style={{ color: "#111", textAlign: "right" }}>
                                                {editCode || "Select Production Date"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.actionRow}>
                                        <TouchableOpacity
                                            style={styles.saveBtn}
                                            onPress={() => handleSave(item.id)}
                                        >
                                            <Text style={styles.saveText}>Save</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.cancelBtn}
                                            onPress={() => setEditingId(null)}
                                        >
                                            <Text style={styles.cancelText}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Date Picker */}
                                    <DatePicker
                                        modal
                                        mode="date"
                                        open={openDatePicker}
                                        date={tempDate || new Date()}
                                        onConfirm={(date) => handleConfirmDate(date, item.id)}
                                        onCancel={handleCancelDate}
                                    />
                                </>
                            ) : (
                                <>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Staging:</Text>
                                        <Text style={styles.infoValue}>
                                            {item.stagingArea.slice(-15)}
                                        </Text>
                                    </View>
                                     <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Week:</Text>
                                        <Text style={styles.infoValue}>{item.weekNumber}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Qty Scan:</Text>
                                        <Text style={styles.infoValue}>{item.qty}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Code:</Text>
                                        <Text style={styles.infoValue}>{item.productionDate}</Text>
                                    </View>
                                   
                                </>
                            )}
                        </View>

                        {/* Edit Button */}
                        {editingId !== item.id && (
                            <TouchableOpacity onPress={() => handleEdit(item)}>
                                <Ionicons name="create-outline" size={22} color="#555" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.empty}>Belum ada data pending</Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: 16 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 1,
    },
    title: { fontSize: 16, fontWeight: "500", marginBottom: 2, color: "#888" },
    number: { fontSize: 20, fontWeight: "700", marginBottom: 10, color: "#222" },
    row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
    label: { fontSize: 16, color: "#888" },
    value: { fontSize: 16, fontWeight: "500", color: "#222" },

    palletCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#f6f6f6",
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
    },
    iconWrapper: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 8,
        marginRight: 12,
        borderWidth: 1,
        borderColor: "#eee",
    },
    cardContent: { flex: 1 },
    palletCode: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 6,
        color: "#222",
    },
    infoRow: { flexDirection: "row", marginBottom: 4, alignItems: "center" },
    infoLabel: { fontSize: 15, color: "#aaa", width: 70 },
    infoValue: { fontSize: 15, fontWeight: "500", color: "#222" },

    input: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        fontSize: 15,
        paddingVertical: 2,
        color: "#222",
    },

    actionRow: { flexDirection: "row", marginTop: 8, gap: 8 },
    saveBtn: {
        backgroundColor: "#4CAF50",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 6,
    },
    cancelBtn: {
        backgroundColor: "#ddd",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 6,
    },
    saveText: { color: "#fff", fontWeight: "600" },
    cancelText: { color: "#333" },

    empty: { textAlign: "center", color: "#bbb", marginTop: 24, fontSize: 15 },
});

export default InspectionDetail;
