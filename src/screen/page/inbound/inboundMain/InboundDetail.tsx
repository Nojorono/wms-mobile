// screens/InboundDetail.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    SafeAreaView,
    Alert,
} from "react-native";
import Ionicons from 'react-native-vector-icons/FontAwesome5';
import { useNavigation, useRoute } from "@react-navigation/native";
import { useLoadingDialogStore } from "../../../../store/useLoadingStore";
import InboundServices from "../../../../service/inboundServices";
import { StackNavigationProp } from "@react-navigation/stack";
import { InboundParamList } from "../../../navigation/inbound/InboundNavigator";
import { useConfirmationStore } from "../../../../store/useConfirmationStore";
import { useDialogStore } from "../../../../store/useGlobalDialog";

/* ========================
   1. Type & Merge Function
   ======================== */
type Item = {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    sku: string;
    item_number: string;
    description: string;
    inventory_item_id: string;
    dus_per_stack: number | null;
    bal_per_dus: number | null;
    press_per_bal: number | null;
    bks_per_press: number | null;
    btg_per_bks: number | null;
    organization_id: string | null;
};

type InboundItem = {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    inbound_id: string;
    inbound_do_id: string;
    item_id: string;
    quantity: number;
    classification_id: string | null;
    uom: string;
    item: Item;
};

type InboundDo = {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    inbound_id: string;
    inbound_do_number: string;
    inbound_do_date: string;
    attachment: string | null;
    inbound_po_number: string;
    inbound_po_date: string;
    flag_validated: boolean;
    inbound_items: InboundItem[];
};

type InboundItemWithPo = InboundItem & { inbound_po_number: string };

function mergeInboundDos(data: InboundDo[]): (Omit<InboundDo, 'inbound_items'> & { inbound_items: InboundItemWithPo[] })[] {
    // Group by inbound_do_number
    const map = new Map<string, Omit<InboundDo, 'inbound_items'> & { inbound_items: InboundItemWithPo[] }>();

    data.forEach((doItem) => {
        const key = `${doItem.inbound_do_number}`;
        // Gabungkan item_id yang sama dan jumlahkan quantity
        const itemMap = new Map<string, InboundItemWithPo>();
        doItem.inbound_items.forEach(item => {
            const itemKey = item.item_id;
            if (itemMap.has(itemKey)) {
                const existing = itemMap.get(itemKey)!;
                itemMap.set(itemKey, {
                    ...existing,
                    quantity: existing.quantity + item.quantity,
                });
            } else {
                itemMap.set(itemKey, {
                    ...item,
                    inbound_po_number: doItem.inbound_po_number,
                });
            }
        });
        const itemsWithPo = Array.from(itemMap.values());

        if (map.has(key)) {
            const existing = map.get(key)!;
            // Gabungkan item_id yang sama juga pada existing
            const combinedMap = new Map<string, InboundItemWithPo>();
            [...existing.inbound_items, ...itemsWithPo].forEach(item => {
                const itemKey = item.item_id;
                if (combinedMap.has(itemKey)) {
                    const exist = combinedMap.get(itemKey)!;
                    combinedMap.set(itemKey, {
                        ...exist,
                        inbound_po_number: exist.inbound_po_number + ', ' + item.inbound_po_number,
                        quantity: exist.quantity + item.quantity,
                    });
                } else {
                    combinedMap.set(itemKey, { ...item });
                }
            });
            existing.inbound_items = Array.from(combinedMap.values());
        } else {
            // Copy all fields except inbound_items, then add inbound_items with PO number
            const { inbound_items, ...rest } = doItem;
            map.set(key, { ...rest, inbound_items: itemsWithPo });
        }
    });
    console.log("Merged Data:", Array.from(map.values()));
    return Array.from(map.values());
}

export default function InboundDetail() {

    // Ambil payload dari route params
    type InboundDetailRouteParams = {
        item: {
            id: string;
            inbound_number: string;
            license_plate: string;
            inbound_dos: InboundDo[];
            status: string;
        };
    };

    type NavigationPropInbound = StackNavigationProp<InboundParamList, 'InboundMain'>;
    const navigationInbound = useNavigation<NavigationPropInbound>();
    const route = useRoute();
    const payload = route.params as InboundDetailRouteParams;
    const [mergedData, setMergedData] = useState<(Omit<InboundDo, 'inbound_items'> & { inbound_items: InboundItemWithPo[] })[]>([]);
    const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
    const [status, setStatus] = useState<string>(payload.item ? payload.item.status : ''); // Inisialisasi status dari payload
    const showDialog = useDialogStore((state) => state.showDialog);
    const confirm = useConfirmationStore();

    const handleAccept = () => {
        confirm.show("accept", "Are you sure to approve this?", async () => {
            try {
                await InboundServices.updateStatusInbound(payload.item.id, { status: 'UNLOADING' });
                navigationInbound.navigate("CheckerScreen", { item: payload.item });
            } catch (error) {
                console.error('Error Accepting inbound:', error);
                showDialog('error', 'Error while Accepting Inbound!' + error);
            }
        });
    };

    const handleDecline = () => {
        confirm.show("decline", "Are you sure to decline this?", async (reason) => {
            try {
                await InboundServices.updateStatusInbound(payload.item.id, { status: 'WAITING FOR REVISION', notes:reason });
                navigationInbound.goBack();
            } catch (error) {
                console.error('Error Declining inbound:', error);
                showDialog('error', 'Error while Declining Inbound!');
            }
        });
    };
    const fetchInboundById = async () => {
        try {
            showLoadingDialog("Loading List Inbound Planning")
            const response = await InboundServices.getInboundDetail(payload.item.id);
            setStatus(response.data.status); // Update status dari response
            const inbound_dos = response.data.inbound_dos;
            setMergedData(mergeInboundDos(inbound_dos));
        } catch (error) {
            hideLoadingDialog()
            console.error('Error fetching inbound data:', error);
            Alert.alert(
                'Error',
                'Failed to fetch inbound data. Please check your connection and try again.',
                [{ text: 'OK' }]
            );
        } finally {
            hideLoadingDialog()
        }
    }


    useEffect(() => {
        const initialize = async () => {
            try {
                await fetchInboundById()
            } catch (error) {
                console.error('Initialization error:', error);
            }
        };
        initialize();
    }, [])

    // Support multiple expanded cards
    const [expandedIds, setExpandedIds] = useState<string[]>(
        mergedData.map((item) => item.id)
    );

    const toggleExpand = (id: string) => {
        setExpandedIds((prev) =>
            prev.includes(id)
                ? prev.filter((itemId) => itemId !== id)
                : [...prev, id]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Inbound Planning Number</Text>
                <Text style={styles.headerNumber}>{payload.item.inbound_number}</Text>
                <Text style={styles.vehicle}> <Ionicons name="truck" size={20} /> {payload.item.license_plate}</Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 20 }}>
                <TouchableOpacity style={{ alignItems: "center", flex: 1 }} onPress={() => navigationInbound.navigate("CheckerScreen", { item: payload.item })}>
                    <Ionicons name="user-friends" size={28} color="#059669" />
                    <Text style={{ marginTop: 6, fontSize: 14, color: "#374151" }}>Helper List</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ alignItems: "center", flex: 1 }} onPress={() => console.log("Inspection pressed")}>
                    <Ionicons name="clipboard-check" size={28} color="#059669" />
                    <Text style={{ marginTop: 6, fontSize: 14, color: "#374151" }}>Inspection</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ alignItems: "center", flex: 1 }} onPress={() => console.log("Good Receive pressed")}>
                    <Ionicons name="box-open" size={28} color="#059669" />
                    <Text style={{ marginTop: 6, fontSize: 14, color: "#374151" }}>Good Receive</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ alignItems: "center", flex: 1 }} onPress={() => console.log("Forklift pressed")}>
                    <Ionicons name="truck-loading" size={28} color="#059669" />
                    <Text style={{ marginTop: 6, fontSize: 14, color: "#374151" }}>Forklift</Text>
                </TouchableOpacity>
            </View>

            {/* List Delivery Orders */}
            <FlatList
                data={mergedData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const expanded = expandedIds.includes(item.id);
                    return (
                        <View style={styles.card}>
                            <TouchableOpacity
                                style={styles.cardHeader}
                                onPress={() => toggleExpand(item.id)}
                            >
                                <Text style={styles.cardTitle}>
                                    Delivery Order {item.inbound_do_number}
                                </Text>
                                {/* Arrow icon */}
                                <Text style={{ fontSize: 18 }}>
                                    {expanded ? <Ionicons name="chevron-down" size={20} /> : <Ionicons name="chevron-right" size={20} />}
                                </Text>
                            </TouchableOpacity>
                            {/* Date below title */}
                            <View style={{ paddingHorizontal: 16, marginBottom: expanded ? 10 : 10 }}>
                                <Text style={styles.cardDate}>
                                    {new Date(item.inbound_do_date).toISOString().split("T")[0]}
                                </Text>
                            </View>
                            {expanded && (
                                <View style={styles.cardBody}>
                                    {item.inbound_items.map((sku, index) => (
                                        <View key={sku.id} style={styles.skuRow}>
                                            <Text style={styles.skuText}>
                                                {index + 1}. {sku.item.sku}
                                            </Text>
                                            <Text style={styles.skuQty}>
                                                {sku.quantity} {sku.uom}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    );
                }}
            />
            {status === "CREATED" && (
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.declineBtn} onPress={handleDecline}>
                        <Text style={styles.declineText}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.approveBtn} onPress={handleAccept}>
                        <Text style={styles.approveText}>Approve</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#F8FAFC" },
    header: {
        backgroundColor: "white",
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        alignItems: "center", // Center content horizontally
    },
    headerTitle: { fontSize: 18, color: "#6B7280", textAlign: "center" },
    headerNumber: { fontSize: 22, fontWeight: "700", marginTop: 4, textAlign: "center" },
    vehicle: {
        fontSize: 20,
        fontWeight: "600",
        marginTop: 8,
        color: "#DC2626",
        textAlign: "center",
    },
    card: {
        backgroundColor: "white",
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    cardTitle: { fontSize: 20, fontWeight: "600", color: "#111827" },
    cardDate: { fontSize: 18, color: "#6B7280" },
    cardBody: { padding: 16, borderTopWidth: 1, borderColor: "#E5E7EB" },
    skuRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    skuText: { fontSize: 16, color: "#374151" },
    skuQty: { fontSize: 16, fontWeight: "600" },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    declineBtn: {
        flex: 1,
        marginRight: 8,
        padding: 14,
        borderRadius: 12,
        backgroundColor: "#F87171",
    },
    approveBtn: {
        flex: 1,
        marginLeft: 8,
        padding: 14,
        borderRadius: 12,
        backgroundColor: "#F97316",
    },
    declineText: { textAlign: "center", fontSize: 18, color: "white" },
    approveText: { textAlign: "center", fontSize: 18, color: "white" },
});
