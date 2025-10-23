import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Modal,
    Pressable,
} from "react-native";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { ItemDetail } from "../../service/inboundService";
import { StackNavigationProp } from "@react-navigation/stack";
import { useLoadingDialogStore } from "../../../../../store/useLoadingStore";
import { useDialogStore } from "../../../../../store/useGlobalDialog";
import InboundServices from "../../../../../service/inboundServices";
import Ionicons from "react-native-vector-icons/Ionicons";
import DatePicker from "react-native-date-picker";
import UserServices from "../../../../../service/userServices";
import { useAuthStore } from "../../../../../store/useAuthStore";

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
    weekNumber: string;
    stagingArea: string;
    stagingAreaName: string;
    productionDate: string;
    status: string;
};

const InspectionDetail = () => {
    const [pallets, setPallets] = useState<PalletItem[]>([]);
    const [editingItem, setEditingItem] = useState<PalletItem | null>(null);

    const [editQty, setEditQty] = useState("");
    const [palletCode, setPalletCode] = useState("");
    const [editCode, setEditCode] = useState("");
    const [editDate, setEditDate] = useState<Date>(new Date());
    const [editWeekNumber, setEditWeekNumber] = useState<string | null>(null);

    const [openDatePicker, setOpenDatePicker] = useState(false);
    const { user } = useAuthStore();
    const [isDataChanged, setIsDataChanged] = useState(false);


    const navigation = useNavigation<StackNavigationProp<any>>();
    const route = useRoute();
    const { item, payload } = route.params as RouteParams;
    const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
    const showDialog = useDialogStore((state) => state.showDialog);
    const [totalScan, setTotalScan] = useState(0);

    const fetchData = async () => {
        try {
            showLoadingDialog("Loading Pallets");
            const res = await InboundServices.getUnloadingScanList(
                payload.id,
                item.item_id
            );
            if (res?.data) {
                const mapped: PalletItem[] = res.data.map((d: any) => ({
                    id: d.id,
                    palletCode: d.pallet?.pallet_code || "-",
                    qty: d.quantity,
                    weekNumber: d.week_number,
                    stagingArea: d.m_warehouse_sub_id || "-",
                    stagingAreaName: d.warehouseSub?.name || "-",
                    productionDate: d.production_date || "-",
                    status: d.status || "-",
                }));
                setPallets(mapped);
                
        setTotalScan(mapped.reduce((sum, item) => sum + item.qty, 0));
            }
        } catch (err) {
            showDialog("error", "Error while Fetching Pallets!");
        } finally {
            hideLoadingDialog();
        }
    };

        useFocusEffect(
          useCallback(() => {
            fetchData();
          }, [])
        );

    useEffect(() => {
        fetchData();
        const unsubscribe = navigation.addListener("focus", fetchData);
        return unsubscribe;
    }, [navigation, item.inbound_id]);

    useEffect(() => {
        if (!editingItem) return;

        const hasChanged =
            palletCode !== editingItem.palletCode ||
            Number(editQty) !== Number(editingItem.qty) ||
            editCode !== editingItem.productionDate ||
            editWeekNumber !== editingItem.weekNumber;

        setIsDataChanged(hasChanged);
    }, [palletCode, editQty, editCode, editWeekNumber, editingItem]);

    const handleEdit = (pallet: PalletItem) => {
        setEditingItem(pallet);
        setEditQty(String(pallet.qty));
        setPalletCode(pallet.palletCode);
        setEditCode(pallet.productionDate);
        setEditWeekNumber(pallet.weekNumber);
        setEditDate(pallet.productionDate ? new Date(pallet.productionDate) : new Date());
        setIsDataChanged(false); // ✅ reset perubahan
    };

    const handleStatusApprove = async () => {
        try {
            showLoadingDialog("Approving...");
            if (!editingItem) return;
            await InboundServices.approveInspectionById(editingItem.id, "COMPLETED")
            await fetchData();
            setEditingItem(null);
        } catch (error) {
            showDialog("error", "Failed to Approve!");
        } finally {
            hideLoadingDialog();
        }
    }

    const handleSave = async () => {
    if (!editingItem) return;

    // ✅ Validasi data kosong / tidak valid
        if (
            !palletCode ||
            palletCode === "" ||
            editQty === "" ||
            Number(editQty) === 0 ||
            editQty === undefined ||
            editCode === "" ||
            editCode === undefined ||
            editWeekNumber === "" ||
            Number(editWeekNumber) === 0 ||
            editWeekNumber === undefined
        ) {
            showDialog("error", "Tolong lengkapi semua data!");
            return
        }

        if (Number(editQty) > totalScan){
            showDialog("error", "qty scan tidak boleh melebihi ");
            return
        }

    try {
        showLoadingDialog("Updating Pallet...");

        // Jika palletCode berubah, gunakan updateInspectionWhenPalletChange
        if (editingItem.palletCode !== palletCode) {
            const palletInfo = await InboundServices.getPalletInfo(palletCode); // Validasi pallet code dulu
            if (palletInfo?.data) {
                await InboundServices.updateInspectionWhenPalletChange(editingItem.id, {
                    production_date: editCode,
                    week_number: Number(editWeekNumber),
                    inbound_id: payload.id,
                    item_id: item.item_id,
                    quantity: editQty,
                    uom: item.uom,
                    user_id: user?.id ?? "",
                    user_name: user?.username ?? "",
                    pallet_code: palletCode,
                    m_warehouse_sub_id: editingItem.stagingArea,
                    status: editingItem.status,
                });
            } else {
                showDialog("error", "Pallet code tidak valid!");
                return;
            }
        } else {
            await InboundServices.updateInspectionData(editingItem.id, {
                quantity: editQty,
                production_date: editCode,
                week_number: Number(editWeekNumber),
            });
        }

        await fetchData();
        setEditingItem(null);
    } catch (error) {
        const errorMessage =
            typeof error === "object" && error !== null && "data" in error
                ? (error as any).data?.error?.toString() || "Failed to Update Pallet!"
                : "Failed to Update Pallet!";
        showDialog("error", errorMessage);
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
            // setEditingItem((prev) =>
            //     prev && prev.id === id ? { ...prev, weekNumber: minggu || prev.weekNumber } : prev
            // );

            // simpan ke form state
            setEditWeekNumber(minggu);
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

    const handleDateSelect = (selectedDate: Date) => {
        const formatted = formatDate(selectedDate);
        setEditDate(selectedDate);
        setEditCode(formatted);
        if (editingItem) {
            fetchWeek(formatted, editingItem.id);
        }
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
                    <Text style={styles.value}>{totalScan}</Text>
                </View>
            </View>

            <FlatList
                data={pallets}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.palletCard}>
                        <View style={styles.iconWrapper}>
                            <Ionicons name="pricetag" size={28} color="#f97316" />
                        </View>

                        <View style={[styles.cardContent, { flex: 1 }]}>
                            <Text style={styles.palletCode}>{item.palletCode}</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Staging:</Text>
                                <Text style={styles.infoValue}>
                                    {item.stagingAreaName}
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
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Status:</Text>
                                <Text style={styles.infoValue}>{item.status}</Text>
                            </View>
                        </View>

                        {item.status !== "COMPLETED" && (
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

            {/* Modal Edit */}
            <Modal
                visible={!!editingItem}
                transparent
                animationType="slide"
                onRequestClose={() => setEditingItem(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Pallet</Text>

                        {/* Pallet Code */}
                        <View style={styles.fieldRow}>
                            <Text style={styles.fieldLabel}>Pallet Code</Text>
                            <TextInput
                                style={styles.fieldInput}
                                value={palletCode}
                                onChangeText={setPalletCode}
                                placeholder="Pallet Code"
                            />
                        </View>

                        {/* Quantity */}
                        <View style={styles.fieldRow}>
                            <Text style={styles.fieldLabel}>Qty</Text>
                            <TextInput
                                style={styles.fieldInput}
                                value={editQty}
                                onChangeText={setEditQty}
                                placeholder="Quantity"
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Production Date */}
                        <View style={styles.fieldRow}>
                            <Text style={styles.fieldLabel}>Prod. Date</Text>
                            <Pressable
                                style={[styles.fieldInput, { justifyContent: "center" }]}
                                onPress={() => setOpenDatePicker(true)}
                            >
                                <Text style={{ color: editCode ? "#222" : "#aaa" }}>
                                    {editCode || "Select Production Date"}
                                </Text>
                            </Pressable>
                        </View>

                        {/* Week Info (readonly) */}
                        <View style={styles.fieldRow}>
                            <Text style={styles.fieldLabel}>Week</Text>
                            <Text
                                style={[
                                    styles.fieldInput,
                                    { borderBottomWidth: 0 },
                                    {
                                        fontWeight: "bold",
                                        color:
                                            pallets.find((p) => p.id === editingItem?.id)?.weekNumber !== editingItem?.weekNumber
                                                ? "green"
                                                : "#222",
                                    },
                                ]}
                            >
                                {editWeekNumber || "-"}
                            </Text>
                        </View>

                        {!isDataChanged && (
                            <View style={styles.actionRow}>
                                <TouchableOpacity
                                    style={[styles.saveBtn, { backgroundColor: "#f97316", flex: 1 }]}
                                    onPress={async () => {
                                        await handleStatusApprove();
                                        setEditingItem(null);
                                    }}
                                >
                                    <Text style={styles.saveText}>Approve</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        <View style={[styles.actionRow, { gap: 12 }]}>
                            <TouchableOpacity style={[styles.saveBtn, { flex: 1 }]}
                                onPress={async () => {
                                    // Approve action: save then close modal
                                    await handleSave();
                                    setEditingItem(null);
                                }}>
                                <Text style={styles.saveText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.cancelBtn, { flex: 1 }]}
                                onPress={() => setEditingItem(null)}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>



            {/* Date Picker */}
            <DatePicker
                modal
                mode="date"
                open={openDatePicker}
                date={editDate}
                onConfirm={(date) => {
                    setOpenDatePicker(false);
                    handleDateSelect(date);
                }}
                onCancel={() => setOpenDatePicker(false)}
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
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        fontSize: 15,
        paddingVertical: 6,
        marginBottom: 12,
        color: "#222",
    },

    actionRow: { flexDirection: "row", marginTop: 8, gap: 8, justifyContent: "center" },
    saveBtn: {
        backgroundColor: "#4CAF50",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 6,
        marginHorizontal: 20
    },
    cancelBtn: {
        backgroundColor: "#ddd",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 6,
        marginRight: 20
    },
    saveText: { color: "#fff", fontWeight: "600", textAlign: "center" },
    cancelText: { color: "#333", textAlign: "center" },

    empty: { textAlign: "center", color: "#bbb", marginTop: 24, fontSize: 15 },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
        color: "#222",
    },
    fieldRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    fieldLabel: {
        width: 100,              // lebar tetap biar rata
        fontSize: 15,
        color: "#555",
    },
    fieldInput: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        fontSize: 15,
        paddingVertical: 4,
        color: "#222",
    },

});

export default InspectionDetail;
