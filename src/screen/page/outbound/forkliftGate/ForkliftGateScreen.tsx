import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import OutboundService from "../../../../service/outboundService";
import { useAuthStore } from "../../../../store/useAuthStore";

type Pallet = {
    pallet: {
        pallet_code: string;
        // add other pallet properties if needed
    }
};

type OutboundDO = {
    outbound_do_number: string;
    expedition?: string;
    driver_name?: string;
    driver_phone?: string;
    // add other OutboundDO properties if needed
};

type GateTask = {
    id: string | number;
    gate_name?: string;
    gate_id?: string;
    outbound_do: OutboundDO;
    assigned_gate_pallets?: Pallet[];
    // add other GateTask properties if needed
};

function ForkliftGateScreen() {
    const [data, setData] = useState<GateTask[]>([]);
    const { user } = useAuthStore();
    const userId = user?.id || "";
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const res = await OutboundService.getAssignedGateByUserId(userId);
            setData(res.data);
        } catch (err) {
            console.log("Fetch error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#444" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#000"]} />
            }
        >
            <Text style={styles.title}>Assigned Gate Tasks</Text>

            {data.map((item, index) => {
                const doData = item.outbound_do;
                const pallets = item.assigned_gate_pallets || [];
                console.log("Pallets for item " + item.id + ": ", pallets);
                const gateName = item.gate_name || item.gate_id || "Unknown Gate";

                return (
                    <View key={item.id} style={styles.card}>
                        {/* GATE TUJUAN */}
                        <View style={styles.gateBanner}>
                            <Text style={styles.gateTitle}>Gate: {gateName}</Text>
                        </View>

                        {/* PALLET HIGHLIGHT */}
                        <Text style={styles.palletHeader}>Pallet to Pick</Text>

                        <View style={styles.palletWrapper}>
                            {pallets.length === 0 && (
                                <Text style={{ color: "#777", fontSize: 14 }}>No pallet assigned</Text>
                            )}

                            {pallets.map((pallet, idx) => (
                                <View key={idx} style={styles.palletBadge}>
                                    <Text style={styles.palletText}>{pallet?.pallet?.pallet_code}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                );
            })}
        </ScrollView>
    );
}

export default ForkliftGateScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA",
        padding: 16,
    },

    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    title: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 18,
        color: "#111",
    },

    card: {
        backgroundColor: "#FFF",
        borderRadius: 16,
        paddingBottom: 18,
        marginBottom: 18,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
        elevation: 2,
    },

    gateBanner: {
        backgroundColor: "#1A73E8",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },

    gateTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFF",
    },

    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 14,
        paddingHorizontal: 16,
    },

    cardIndex: {
        fontSize: 15,
        fontWeight: "700",
        color: "#777",
        marginRight: 8,
    },

    cardTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#222",
    },

    cardContent: {
        paddingHorizontal: 16,
        marginTop: 10,
    },

    label: {
        fontSize: 12,
        color: "#777",
        marginTop: 10,
    },

    value: {
        fontSize: 15,
        fontWeight: "500",
        color: "#222",
    },

    palletHeader: {
        fontSize: 16,
        fontWeight: "700",
        marginTop: 18,
        paddingHorizontal: 16,
        marginBottom: 8,
        color: "#333",
    },

    palletWrapper: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 16,
    },

    palletBadge: {
        backgroundColor: "#E3F2FD",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginRight: 8,
        marginBottom: 8,
    },

    palletText: {
        color: "#1A73E8",
        fontWeight: "600",
        fontSize: 13,
    },
});
