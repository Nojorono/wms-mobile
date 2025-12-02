import React, { useState } from "react";
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager, TextInput, KeyboardAvoidingView, Modal, StyleSheet, Alert } from "react-native";
import OutboundService from "../../service/outboundService";
import { useLoadingDialogStore } from "../../store/useLoadingStore";
import { useDialogStore } from "../../store/useGlobalDialog";
import { useAuthStore } from "../../store/useAuthStore";

// enable animation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

const MemoItemCard: React.FC<any> = ({ item, onRefresh }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [weekNumber, setWeekNumber] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
    const showDialog = useDialogStore((state) => state.showDialog);
    const { user } = useAuthStore();
    const userId = user?.id || "";

    console.log('Rendering MemoItemCard for item:', item);


    const openDetailModal = (detail: any) => {
        setSelectedItem(detail);
        setWeekNumber(String(detail?.week_number ?? ""));
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

        try {
            showLoadingDialog("Submitting...");
            const payload = {
                week_number: Number(weekNumber),
            };

            // await OutboundService.updateScanDetail(selectedItem.id, payload);
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
                        Item: ...{item.item_id.slice(-12)}
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
                {!item.is_scanned ? (
                    <Text style={{ color: "#FF3B30", fontWeight: "bold" }}>
                        Belum ada scan.
                    </Text>
                ) : (
                    <View style={{ marginBottom: 10 }}>
                        <Text style={{ fontWeight: "700", marginBottom: 6 }}>Detail Scan</Text>

                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={{ fontWeight: "600" }}>User</Text>
                            <Text>{item.scan_detail?.user_name ?? "-"}</Text>
                        </View>

                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={{ fontWeight: "600" }}>Status</Text>
                            <Text style={{ color: isStatusOpen ? "red" : "black" }}>
                                {item.scan_detail?.status ?? "-"}
                            </Text>
                        </View>

                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={{ fontWeight: "600" }}>Week</Text>
                            <Text>{item.scan_detail?.week_number ?? "-"}</Text>
                        </View>

                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={{ fontWeight: "600" }}>Pallet Source</Text>
                            <Text>
                                {item.scan_detail?.pallet_source_id
                                    ? `...${item.scan_detail.pallet_source_id.slice(-12)}`
                                    : "-"}
                            </Text>
                        </View>

                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={{ fontWeight: "600" }}>Pallet Use</Text>
                            <Text>
                                {item.scan_detail?.pallet_use_id
                                    ? `...${item.scan_detail.pallet_use_id.slice(-12)}`
                                    : "-"}
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
                                onPress={() => openDetailModal(item.scan_detail)}
                            >
                                <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>
                                    Go To Detail
                                </Text>
                            </TouchableOpacity>
                        )}

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

                            {/* Status */}
                            <Text style={styles.inputLabel}>Status</Text>
                            <TextInput
                                value={selectedItem?.status || ""}
                                editable={false}
                                style={[styles.inputBox, { backgroundColor: '#e6e6e6' }]}
                            />

                            {/* Week */}
                            <Text style={styles.inputLabel}>Week Number</Text>
                            <TextInput
                                value={weekNumber}
                                onChangeText={onChangeWeek}
                                style={styles.inputBox}
                                placeholder="Masukkan week number"
                            />

                            {/* Submit */}
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleSubmitEdit}
                            >
                                <Text style={styles.submitText}>Submit</Text>
                            </TouchableOpacity>

                            {/* Approve Buttons */}
                            {!isEditing && (
                                <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>

                                    {/* APPROVE */}
                                    <TouchableOpacity
                                        style={[styles.approveButton, { flex: 1 }]}
                                        onPress={() => handleApproveAction("APPROVE")}
                                    >
                                        <Text style={styles.approveText}>Approve</Text>
                                    </TouchableOpacity>

                                    {/* FINAL */}
                                    {selectedItem?.status !== "APPROVED" && (
                                        <TouchableOpacity
                                            style={[
                                                styles.approveButton,
                                                { flex: 1, backgroundColor: "#f57f1eff" },
                                            ]}
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