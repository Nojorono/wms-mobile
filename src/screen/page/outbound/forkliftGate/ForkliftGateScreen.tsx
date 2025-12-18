import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
} from "react-native";
import OutboundService from "../../../../service/outboundService";
import { useAuthStore } from "../../../../store/useAuthStore";
import Ionicons from 'react-native-vector-icons/FontAwesome5';
import { StackNavigationProp } from "@react-navigation/stack";
import { ForkliftGateParamList } from "../../../navigation/outbound/ForkliftGateNavigator";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

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
    gate: { name: string };
    gate_id?: string;
    status: string;
    outbound_do: OutboundDO;
    assigned_gate_pallets?: Pallet[];
    // add other GateTask properties if needed
};
type NavigationProp = StackNavigationProp<
    ForkliftGateParamList,
    "ForkliftGateMain"
>;


function ForkliftGateScreen() {
    const [data, setData] = useState<GateTask[]>([]);
    const [outbound, setOutbound] = useState<any[] | null>(null);
    const { user } = useAuthStore();
    const userId = user?.id || "";
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation<NavigationProp>();


    const fetchData = async () => {
        try {
            console.log("Fetching gate tasks for user:", userId);
            const res = await OutboundService.getAssignedGateByUserId(userId);
            console.log("data:", res.data);
            setData(res.data);
            console.log("Fetched gate tasks:", res.data);
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

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

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
                console.log("Rendering item:", item);
                const pallets = item.assigned_gate_pallets || [];
                const gateName = item.gate.name || "Unknown Gate";

                return (
                    <View key={item.id} style={styles.card}>
                        {/* GATE TUJUAN */}
                        <View style={[styles.gateBanner, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Text style={styles.gateTitle}>{gateName} </Text>
                                <Text
                                    style={{
                                        color: "#FFF",
                                        fontWeight: "600",
                                        backgroundColor: item.status === "PENDING" ? "#ff9c07ff" : item.status === "DONE" ? "#4CAF50" : "#888",
                                        borderRadius: 6,
                                        paddingHorizontal: 10,
                                        paddingVertical: 4,
                                        overflow: "hidden",
                                        fontSize: 13,
                                        marginLeft: 8,
                                    }}
                                >
                                    {item.status}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate("ForkliftGateDetail", { item: item })} style={{ flexDirection: "row", alignItems: "center" }}>
                                <Ionicons name="chevron-right" size={24} color="#FFF" />
                            </TouchableOpacity>

                        </View>

                        {/* PALLET HIGHLIGHT */}
                        <Text style={styles.palletHeader}>{item.outbound_do.outbound_do_number}</Text>
                        {/* <Text style={styles.palletHeader}>Pallet yang telah di Gate</Text>

                        <View style={styles.palletWrapper}>
                            {pallets.length === 0 && (
                                <Text style={{ color: "#777", fontSize: 14 }}>No pallet assigned</Text>
                            )}

                            {pallets.map((pallet, idx) => (
                                <View key={idx} style={styles.palletBadge}>
                                    <Text style={styles.palletText}>{pallet?.pallet?.pallet_code}</Text>
                                </View>
                            ))}
                        </View> */}
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
