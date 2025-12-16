import React, { useCallback, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useLoadingDialogStore } from "../../../../store/useLoadingStore";
import { useDialogStore } from "../../../../store/useGlobalDialog";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import OutboundService from "../../../../service/outboundService";

const PickingSkuByPallet = () => {
    const [refreshing, setRefreshing] = useState(false);
    const [PickingList, setPickingList] = useState<any[]>([]);
    const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
    const showDialog = useDialogStore((state) => state.showDialog);
    const route = useRoute();
    const itemBefore = route.params as any

    const fetchPicking = async () => {
        try {
            setRefreshing(true);
            showLoadingDialog('Loading List Picking SKU');
            const response = await OutboundService.getSkuByMemoId(itemBefore.itemBefore.item.id, 'PENDING');
            console.log("Fetched Picking SKU Response:", response);
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
                        items: [],
                    };
                }

                palletMap[palletCode].items.push({
                    item_id: item.item?.id,
                    description: item.item?.description,
                    code: item.item?.sku,
                    week:item.item.currentWeekNumber,
                    quantity: scan.quantity_picked || 0,
                    uom: scan.uom || item.uom,
                });
            });
        });
        console.log("Transformed Pallet Data:", Object.values(palletMap));
        return Object.values(palletMap);
    };


    const transformedData = transformPickingData(PickingList);

    return (
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
                            </View>

                            <Text style={styles.itemCount}>
                                {item.items.length} Item
                            </Text>
                        </View>

                        <View style={styles.divider} />

                        {/* ITEM LIST */}
                        {item.items.map((itm: any, index: number) => (
                            console.log("Rendering item:", itm),
                            <View key={`${itm.item_id}-${index}`} style={styles.itemRow}>
                                <Text style={styles.itemName}>
                                    {itm.code}
                                </Text>
                                <Text style={styles.itemName}>
                                    {itm.week}
                                </Text>

                                <Text style={styles.qtyText}>
                                    {itm.quantity} {itm.uom}
                                </Text>
                            </View>
                        ))}
                    </View>
                );
            }}
        />
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

});

