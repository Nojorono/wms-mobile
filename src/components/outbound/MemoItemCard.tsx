import React, { useState } from "react";
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager, TextInput, KeyboardAvoidingView, Modal, StyleSheet, Alert } from "react-native";
import OutboundService from "../../service/outboundService";
import { useLoadingDialogStore } from "../../store/useLoadingStore";
import { useDialogStore } from "../../store/useGlobalDialog";
import { useAuthStore } from "../../store/useAuthStore";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { InspectionParamList } from "../../screen/navigation/outbound/InspectionNavigator";

interface MemoItemCardProps {
    item: {
        item_id: string;
        quantity_plan: number;
        uom: string;
        picked_quantity: number;
        is_scanned: boolean;
        scan_detail?: {
            user_name?: string;
            status?: string;
            pallet_source_id?: string;
            pallet_use_id?: string;
            week_number?: string;

        };
    };
    onRefresh: () => Promise<void> | void;
}
type NavigationProp = StackNavigationProp<InspectionParamList, 'InspectionDoMain'>;

const MemoItemCard: React.FC<any> = ({ item, onRefresh }) => {
      const navigation = useNavigation<NavigationProp>();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [weekNumber, setWeekNumber] = useState('');
    const [quantityPicked, setQuantityPicked] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
    const showDialog = useDialogStore((state) => state.showDialog);
    const { user } = useAuthStore();
    const userId = user?.id || "";
    const [quantitySwitch, setQuantitySwitch] = useState("");


    // Gabungkan data detail ke satu state (selectedItem) agar lebih mudah dikelola
    const openDetailModal = (detail: any) => {
        setSelectedItem(detail);
        setWeekNumber(String(detail?.week_number ?? ""));
        setQuantityPicked(String(detail?.quantity_picked ?? ""));
        setQuantitySwitch(String(item.quantity_switch || ""));
        setIsEditing(false);
        setModalVisible(true);
    };

    const onChangeWeek = (text: string) => {
        setWeekNumber(text);
        if (!isEditing) setIsEditing(true);
    };

    const handleSubmitEdit = async () => {
        if (!selectedItem) return;

        if (weekNumber.trim() === "") {
            return showDialog("error", "Week wajib diisi");
        }

        if (quantityPicked.trim() === "") {
            return showDialog("error", "Quantity picked wajib diisi");
        }

        try {
            showLoadingDialog("Updating...");

            const payload = {
                transaction_picking_id: selectedItem?.transaction_picking_id,
                pallet_source_id: selectedItem?.pallet_source_id,
                pallet_use_id: selectedItem?.pallet_use_id,
                pallet_switch_id: selectedItem?.pallet_switch_id || null,
                item_id: selectedItem?.item_id,
                quantity_picked: Number(quantityPicked),
                quantity_switch: quantitySwitch ? Number(quantitySwitch) : 0,
                uom: selectedItem?.uom,
                week_number: Number(weekNumber),
                status: selectedItem?.status,
                // inspection_by: user?.name,
                // user_id: user?.id,
                // user_name: user?.name,
            };

            await OutboundService.updateTransactionPickingDetail(selectedItem.id, payload);

            await onRefresh();
            showDialog("success", "Update berhasil!");
            setModalVisible(false);

        } catch (err: any) {
            showDialog("error", err?.message ?? "Gagal update");
        } finally {
            hideLoadingDialog();
        }
    };


    const handleApproveAction = async (type: "APPROVE" | "FINAL") => {
        if (!selectedItem) return;

        const nextStatus =
            type === "APPROVE" ? "INSPECTION" : "INSPECTION_APPROVED";

        Alert.alert(
            "Confirm Approve",
            "Apakah Anda yakin ingin meng-approve item ini?",
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Approve",
                    onPress: async () => {
                        try {
                            showLoadingDialog("Approving...");
                            const payload = {
                                status: nextStatus,
                                inspection_by: userId,
                                ids: [selectedItem.id],
                            };
                            await OutboundService.updateStatusPickingBulk(payload);
                            hideLoadingDialog();
                            await onRefresh();
                            showDialog("success", "Berhasil Update Status!");
                            setModalVisible(false);
                        } catch (error) {
                            hideLoadingDialog();
                            showDialog("error", "Gagal Update Status!");
                        }
                    },
                },
            ]
        );
    };


    // status flag
    const isStatusOpen = item.scan_detail?.status?.toUpperCase() === "OPEN";

    // Indicator warna
    let statusColor = "#FF3B30";

    if (item.is_scanned) statusColor = "#4CAF50";
    if (item.picked_quantity > 0 && item.picked_quantity < item.quantity_plan) statusColor = "#2196F3";

    // force red if status open
    if (isStatusOpen) statusColor = "#FF3B30";
    return (
        <TouchableOpacity
            //   onPress={handleToggle}
            style={{
                backgroundColor: "#fff",
                padding: 16,
                borderRadius: 12,
                marginBottom: 12,
                borderWidth: 2,
                borderColor: statusColor,
            }}
        >
            {/* HEADER */}
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View>
                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                        Item: {item.item.sku}
                    </Text>
                    <Text style={{ marginTop: 4 }}>
                        Plan: {item.quantity_plan} {item.uom}
                    </Text>
                    <Text>
                        Picked: {item.picked_quantity} {item.uom}
                    </Text>
                </View>

                {/* DOT STATUS */}
                <View
                    style={{
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: statusColor,
                        marginTop: 4,
                    }}
                />
            </View>

            <View style={{ marginTop: 12 }}>
                {(!item.is_scanned || !Array.isArray(item.scan_detail) || item.scan_detail.length === 0) ? (
                    <Text style={{ color: "#FF3B30", fontWeight: "bold" }}>
                        Belum ada scan.
                    </Text>
                ) : (
                    <View style={{ marginBottom: 10 }}>
                        <Text style={{ fontWeight: "700", marginBottom: 6 }}>Detail Scan</Text>
                        {item.scan_detail.map((detail: any, idx: number) => {
                           
                            const isStatusOpen = detail?.status?.toUpperCase() === "OPEN";
                            return (
                                <View key={detail.id ?? idx} style={{ marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderColor: "#eee" }}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                        <Text style={{ fontWeight: "600" }}>User</Text>
                                        <Text>{detail.user_name ?? "-"}</Text>
                                    </View>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                        <Text style={{ fontWeight: "600" }}>Status</Text>
                                        <Text style={{ color: isStatusOpen ? "red" : "black" }}>
                                            {detail.status ?? "-"}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                        <Text style={{ fontWeight: "600" }}>Week</Text>
                                        <Text>{detail.week_number ?? "-"}</Text>
                                    </View>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                        <Text style={{ fontWeight: "600" }}>Pallet Source</Text>
                                        <Text>
                                            {detail.pallet_source_id
                                                ? `${detail.palletSource.pallet_code}`
                                                : "-"}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                        <Text style={{ fontWeight: "600" }}>Pallet Use</Text>
                                        <Text>
                                            {detail.pallet_use_id
                                                ? `${detail.palletUse.pallet_code}`
                                                : "-"}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                        <Text style={{ fontWeight: "600" }}>Quantity Picked</Text>
                                        <Text>
                                            {detail.quantity_picked ?? "-"}
                                        </Text>
                                    </View>
                                    {/* Tombol buka modal edit */}
                                    {!isStatusOpen && (
                                        <TouchableOpacity
                                            style={{
                                                marginTop: 12,
                                                backgroundColor: "#F26E1F",
                                                paddingVertical: 8,
                                                borderRadius: 8,
                                            }}
                                            onPress={() => {
                                                // openDetailModal(detail)
                                                navigation.navigate("InspectionEditActivity", {
                                                    mode: "edit",
                                                    activity: detail,
                                                    itemBefore: item,   // kirim data item yang mau diedit
                                                })
                                            }}
                                        >
                                            <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>
                                                Go To Detail
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}


                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    transparent
                    onRequestClose={() => setModalVisible(false)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.modalOverlay}
                    >
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Edit Scan Detail</Text>

                            {/* STATUS */}
                            <Text style={styles.inputLabel}>Status</Text>
                            <TextInput
                                value={selectedItem?.status || ""}
                                editable={false}
                                style={[styles.inputBox, { backgroundColor: '#e6e6e6' }]}
                            />

                            {/* WEEK NUMBER */}
                            <Text style={styles.inputLabel}>Week Number</Text>
                            <TextInput
                                value={String(selectedItem?.week_number || "")}
                                editable={false}
                                style={[styles.inputBox, { backgroundColor: '#e6e6e6' }]}
                            />

                            {/* ITEM INFO */}
                            <Text style={styles.inputLabel}>Item</Text>
                            <View style={[styles.inputBox, { backgroundColor: '#e6e6e6', paddingVertical: 8 }]}>
                                <Text style={{ fontWeight: "600" }}>{selectedItem?.item?.sku || "-"}</Text>
                                <Text style={{ fontSize: 12 }}>{selectedItem?.item?.description || "-"}</Text>
                            </View>

                            {/* PALLET SOURCE */}
                            <Text style={styles.inputLabel}>Pallet Source</Text>
                            <View style={[styles.inputBox, { backgroundColor: '#e6e6e6', paddingVertical: 6 }]}>
                                <Text style={{ fontWeight: "600" }}>{selectedItem?.palletSource?.pallet_code || "-"}</Text>
                                <Text style={{ fontSize: 12 }}>Qty: {selectedItem?.palletSource?.currentQuantity || 0}</Text>
                            </View>

                            {/* PALLET USE */}
                            <Text style={styles.inputLabel}>Pallet Use</Text>
                            <View style={[styles.inputBox, { backgroundColor: '#e6e6e6', paddingVertical: 6 }]}>
                                <Text style={{ fontWeight: "600" }}>{selectedItem?.palletUse?.pallet_code || "-"}</Text>
                                <Text style={{ fontSize: 12 }}>Qty: {selectedItem?.palletUse?.currentQuantity || 0}</Text>
                            </View>

                            {/* PALLET SWITCH (optional) */}
                            {selectedItem?.pallet_switch_id && (
                                <>
                                    <Text style={styles.inputLabel}>Pallet Switch</Text>
                                    <View style={[styles.inputBox, { backgroundColor: '#e6e6e6', paddingVertical: 6 }]}>
                                        <Text style={{ fontWeight: "600" }}>{selectedItem?.palletSwitch?.pallet_code || "-"}</Text>
                                        <Text style={{ fontSize: 12 }}>Qty: {selectedItem?.palletSwitch?.currentQuantity || 0}</Text>
                                    </View>
                                </>
                            )}

                            {/* QUANTITY PICKED */}
                            <Text style={styles.inputLabel}>Quantity Picked</Text>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <TextInput
                                    value={String(quantityPicked)}
                                    onChangeText={setQuantityPicked}
                                    style={[styles.inputBox, { flex: 1 }]}
                                    keyboardType="numeric"
                                    placeholder="Masukan quantity picked"
                                />
                                <Text style={styles.inputLabel}>{selectedItem?.uom || ""}</Text>
                            </View>

                            {/* QUANTITY SWITCH (optional input) */}
                            {selectedItem?.quantity_switch !== null && (
                                <>
                                    <Text style={styles.inputLabel}>Quantity Switch</Text>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                        <TextInput
                                            value={String(quantitySwitch)}
                                            onChangeText={setQuantitySwitch}
                                            style={[styles.inputBox, { flex: 1 }]}
                                            keyboardType="numeric"
                                            placeholder="Masukan quantity switch"
                                        />
                                        <Text style={styles.inputLabel}>{selectedItem?.uom || ""}</Text>
                                    </View>
                                </>
                            )}

                            {/* SUBMIT */}
                            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitEdit}>
                                <Text style={styles.submitText}>Submit</Text>
                            </TouchableOpacity>

                            {/* APPROVE BUTTONS */}
                            {!isEditing && (
                                <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                                    <TouchableOpacity
                                        style={[styles.approveButton, { flex: 1 }]}
                                        onPress={() => handleApproveAction("APPROVE")}
                                    >
                                        <Text style={styles.approveText}>Approve</Text>
                                    </TouchableOpacity>

                                    {selectedItem?.status !== "APPROVED" && (
                                        <TouchableOpacity
                                            style={[styles.approveButton, { flex: 1, backgroundColor: "#f57f1e" }]}
                                            onPress={() => handleApproveAction("FINAL")}
                                        >
                                            <Text style={styles.approveText}>Final</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.closeText}>Close</Text>
                            </TouchableOpacity>
                        </View>

                    </KeyboardAvoidingView>
                </Modal>


            </View>
        </TouchableOpacity>
    );
};

export default MemoItemCard;

const styles = StyleSheet.create(
    {
        // modal
        modalOverlay: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 16,
            backgroundColor: 'rgba(0,0,0,0.4)',
        },
        modalContainer: {
            width: '100%',
            maxWidth: 540,
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 12,
        },
        modalTitle: {
            fontWeight: '700',
            fontSize: 16,
            marginBottom: 15,
        },
        inputLabel: {
            fontWeight: '600',
            marginTop: 10,
        },
        inputBox: {
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            borderRadius: 8,
            marginTop: 5,
            textAlignVertical: 'top',
        },
        submitButton: {
            marginTop: 20,
            backgroundColor: '#2D9CDB',
            paddingVertical: 10,
            borderRadius: 8,
        },
        submitText: {
            color: 'white',
            textAlign: 'center',
            fontWeight: '700',
        },
        approveButton: {
            marginTop: 10,
            backgroundColor: 'green',
            paddingVertical: 10,
            borderRadius: 8,
        },
        approveText: {
            color: 'white',
            textAlign: 'center',
            fontWeight: '700',
        },
        closeButton: {
            marginTop: 15,
            paddingVertical: 8,
        },
        closeText: {
            color: 'red',
            fontWeight: '600',
            textAlign: 'center',
        },

        fab: {
            position: "absolute",
            bottom: 30,
            left: 25,
            backgroundColor: "#F26E1F",
            width: 100,
            height: 60,
            borderRadius: 40,
            justifyContent: "center",
            alignItems: "center",
            elevation: 6,
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowOffset: { width: 0, height: 3 },
        },
    });