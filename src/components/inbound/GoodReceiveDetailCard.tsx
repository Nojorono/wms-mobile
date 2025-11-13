// components/InboundCard.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { TextInput } from "react-native";
import InboundServices from "../../service/inboundServices";
import Colors from "../../constants/Colors";
import { useLoadingDialogStore } from "../../store/useLoadingStore";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { InspectionParamList } from "../../screen/navigation/inbound/InspectionNavigator";


interface Detail {
    item_id_inbound: string;
    inbound_do_id: string;
    do_number: string;
    po_number: string;
    quantity_plan: number;
    quantity_scanned: number;
    quantity_inspected?: number;
    uom: string;
}

interface Item {
    item_id: string;
    inspection_status: string;
    quantities: { [uom: string]: { plan: number; scan: number; inspected: number } };
    sku: string;
    do_id: string;
    description: string;
    uom: string;
    quantity_plan: number;
    quantity_scanned: number;
    details: Detail[];
}
type NavigationProp = StackNavigationProp<InspectionParamList, 'InspectionMain'>;

const GoodReceiveDetailCard: React.FC<{ data: Item; onApprove?: () => void, inbound_id: string }> = ({
    data,
    inbound_id,
    onApprove,
}) => {
    const navigation = useNavigation<NavigationProp>();
    const { showLoadingDialog, hideLoadingDialog, setLoadingMessage } = useLoadingDialogStore();
    const [details, setDetails] = useState(data.details);

    const handleScannedChange = (value: string, idx: number) => {
        const newDetails = [...details];
        const numericValue = Number(value.replace(/[^0-9]/g, ""));
        const maxPlan = newDetails[idx].quantity_plan;


        if (numericValue > maxPlan) {
            Alert.alert("Invalid Input", "Quantity scanned tidak boleh lebih besar dari quantity plan");
            return;
        }

        newDetails[idx].quantity_scanned = numericValue;
        setDetails(newDetails);
    };

    return (
        <View style={styles.card}>
            <View style={styles.row}>
                <View style={styles.infoBlock}>
                    <Text style={styles.label}>SKU</Text>
                    <Text style={styles.value}>{data.sku}</Text>
                </View>
                <View style={styles.infoBlock}>
                    <Text style={styles.label}>Plan</Text>
                    {/* <Text style={styles.value}>{data.quantity_plan}</Text> */}
                    <Text style={styles.value}>
                        {Object.entries(data.quantities)
                            .sort(([a], [b]) => (a === "DUS" ? -1 : b === "DUS" ? 1 : 0)) // urutan: DUS dulu
                            .map(([uom, q]) => `${q.plan} ${uom}`)
                            .join(", ")}
                    </Text>

                </View>
                <View style={styles.infoBlock}>
                    <Text style={styles.label}>Inspec</Text>
                    {/* <Text style={styles.value}>{data.quantity_scanned}</Text> */}
                    <Text style={styles.value}> {Object.entries(data.quantities)
                        .sort(([a], [b]) => (a === "DUS" ? -1 : b === "DUS" ? 1 : 0)) // urutan: DUS dulu
                        .map(([uom, q]) => `${q.scan} ${uom}`)
                        .join(", ")}</Text>
                </View>
                <View style={styles.infoBlock}>
                    <Text style={styles.label}>Sisa</Text>
                    <Text style={styles.value}>{data.quantity_scanned - data.details.reduce((acc, item) => acc + (item.quantity_scanned || 0), 0)}</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Detail SKU</Text>
            <View style={{ flexGrow: 1 }}>
                <FlatList
                    data={details}
                    keyExtractor={(item) => item.item_id_inbound}
                    renderItem={({ item, index }) => (
                        <View style={styles.detailCard}>
                            {/* Baris 1 */}
                            <View style={styles.detailRow}>
                                <View style={styles.infoBlock}>
                                    <Text style={styles.detailLabel}>DO</Text>
                                    <Text style={styles.detailValue}>{item.do_number}</Text>
                                </View>
                                <View style={styles.infoBlock}>
                                    <Text style={styles.detailLabel}>PO</Text>
                                    <Text style={styles.detailValue}>{item.po_number}</Text>
                                </View>
                            </View>

                            {/* Baris 2 */}
                            <View style={styles.detailRow}>
                                <View style={styles.infoBlock}>
                                    <Text style={styles.detailLabel}>Plan</Text>
                                    <Text style={styles.detailValue}>{item.quantity_plan} {item.uom}</Text>
                                </View>
                                <View style={styles.infoBlock}>
                                    <Text style={styles.detailLabel}>Inspected</Text>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={styles.input}
                                            value={String(item.quantity_scanned)}
                                            keyboardType="numeric"
                                            onChangeText={(val) => handleScannedChange(val, index)}
                                            editable={false}
                                            placeholder="0"
                                            placeholderTextColor="#B0B0B0"
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}
                    scrollEnabled={false}
                />
            </View>



            {data.inspection_status?.toUpperCase() !== "APPROVED" && (
                <TouchableOpacity
                    style={[styles.approveButton, { backgroundColor: Colors.secondaryColor }]}
                    onPress={async () => {
                        try {
                            // Step 1: Update Good Receive Detail
                            showLoadingDialog("Updating Good Receive...");
                            // Asumsikan data berasal dari variabel bernama `dataArray`
                            for (const [do_id, details] of Object.entries(
                                data.details.reduce<Record<string, any[]>>((acc, item) => {
                                    if (!acc[item.inbound_do_id]) acc[item.inbound_do_id] = [];
                                    acc[item.inbound_do_id].push(item);
                                    return acc;
                                }, {})
                            )) {
                                const payload = {
                                    inbound_do_id: do_id,
                                    items: details.map((d) => ({
                                        id: d.item_id_inbound,
                                        quantity_inspection: d.quantity_scanned,
                                    })),
                                };
                                const response = await InboundServices.updateGoodReceiveDetail(payload);
                            }



                            // Step 2: Ubah teks tanpa menutup loading
                            setLoadingMessage("Updating Status After Good Receive...");
                            await InboundServices.updateStatusAfterGoodReceive(inbound_id);



                            // Step 3: Selesai
                            hideLoadingDialog();
                            Alert.alert("Success", "Data berhasil diperbarui dan status diperbarui", [
                                {
                                    text: "OK",
                                    onPress: () => {
                                        navigation.pop(1);
                                    },
                                },
                            ]);
                        } catch (error) {
                            hideLoadingDialog();
                            Alert.alert("Error", "Gagal memperbarui data");
                            console.error(error);
                        }
                    }}
                    activeOpacity={0.85}
                >
                    <Icon name="check-circle-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.approveText}>Approve</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        margin: 12,
        padding: 18,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 18,
    },
    infoBlock: {
        flex: 1,
        alignItems: "flex-start",
        marginHorizontal: 4,
    },
    label: {
        fontSize: 11,
        fontWeight: "500",
        color: "#A0A0A0",
        marginBottom: 2,
        letterSpacing: 0.2,
    },
    value: {
        fontSize: 12,
        fontWeight: "600",
        color: "#222",
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: "700",
        marginBottom: 10,
        color: "#222",
        letterSpacing: 0.3,
    },
    detailCard: {
        backgroundColor: "#FAFAFA",
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 11,
        fontWeight: "500",
        color: "#B0B0B0",
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: "500",
        color: "#222",
    },
    inputWrapper: {
        backgroundColor: "#F5F5F5",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginTop: 2,
        minWidth: 48,
    },
    input: {
        fontSize: 15,
        color: "#222",
        padding: 0,
        minWidth: 40,
        textAlign: "left",
        fontWeight: "600",
        letterSpacing: 0.2,
    },
    approveButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2D8CFF",
        borderRadius: 10,
        paddingVertical: 12,
        marginTop: 18,
        shadowColor: "#2D8CFF",
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 6,
    },
    approveText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
});

export default GoodReceiveDetailCard;

