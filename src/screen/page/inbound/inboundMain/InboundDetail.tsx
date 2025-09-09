// screens/InboundDetail.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import Ionicons from 'react-native-vector-icons/FontAwesome5';
import { useRoute } from "@react-navigation/native";

/* ========================
   1. Type & Merge Function
   ======================== */
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
        const itemsWithPo = doItem.inbound_items.map(item => ({
            ...item,
            inbound_po_number: doItem.inbound_po_number,
        }));
        if (map.has(key)) {
            const existing = map.get(key)!;
            existing.inbound_items = [
                ...existing.inbound_items,
                ...itemsWithPo,
            ];
        } else {
            // Copy all fields except inbound_items, then add inbound_items with PO number
            const { inbound_items, ...rest } = doItem;
            map.set(key, { ...rest, inbound_items: itemsWithPo });
        }
    });

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
        // ...other fields if needed
    };
};

const route = useRoute();
const payload = route.params as InboundDetailRouteParams;
const inbound_dos = payload.item.inbound_dos;
const mergedData = mergeInboundDos(inbound_dos);
console.log("Merged Data:", mergedData);

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
                                    {expanded ?  <Ionicons name="chevron-down" size={20} /> :  <Ionicons name="chevron-right" size={20} />}
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
                                                {index + 1}. {sku.item_id}
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
            <View style={styles.actions}>
                <TouchableOpacity style={styles.declineBtn}>
                    <Text style={styles.declineText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.approveBtn}>
                    <Text style={styles.approveText}>Approve</Text>
                </TouchableOpacity>
            </View>
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
    },
    headerTitle: { fontSize: 18, color: "#6B7280" },
    headerNumber: { fontSize: 22, fontWeight: "700", marginTop: 4 },
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
