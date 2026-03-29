// GateLoadingScreen.js
import React, { useCallback, useRef, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from "react-native";
import { useLoadingDialogStore } from "../../../../store/useLoadingStore";
import { useDialogStore } from "../../../../store/useGlobalDialog";
import { useFocusEffect } from "@react-navigation/native";
import OutboundService from "../../../../service/outboundService";
import { useConfirmationStore } from "../../../../store/useConfirmationStore";

type ApprovalGateMemoPallet = {
    palletCode: string;
    skus: Sku[];
};

type ApprovalGateMemo = {
    memoNo: string;
    route: string;
    pallets: ApprovalGateMemoPallet[];
};

type ApprovalGateItem = {
    gate: string;
    doNumber: string;
    memos: ApprovalGateMemo[];
};

const mapApprovalGateToUI = (dataArr: any[]): ApprovalGateItem[] => {
    const arr = Array.isArray(dataArr) ? dataArr : [];

    return arr.map((gateItem) => {
        const loads = gateItem.assigned_gate_loads ?? [];
        const outboundMemos = gateItem.outbound_do?.outbound_memos ?? [];

        // lookup memoId -> memo info
        const memoInfoMap: Record<string, any> = {};
        outboundMemos.forEach((m: any) => {
            memoInfoMap[m.id] = {
                memoNo: m.outbound_memo_number,
                route: `${m.origin} → ${m.destination}`,
            };
        });

        // group load -> memo -> pallet
        const memoMap: Record<string, any> = {};

        loads.forEach((load: any) => {
            const memoId = load.outbound_memo_id ?? "UNKNOWN_MEMO";
            const palletCode = load.pallet?.pallet_code ?? "UNKNOWN_PALLET";

            if (!memoMap[memoId]) {
                memoMap[memoId] = {
                    memoNo: memoInfoMap[memoId]?.memoNo ?? "-",
                    route: memoInfoMap[memoId]?.route ?? "-",
                    pallets: {},
                };
            }

            if (!memoMap[memoId].pallets[palletCode]) {
                memoMap[memoId].pallets[palletCode] = [];
            }

            memoMap[memoId].pallets[palletCode].push({
                sku: load.item?.sku ?? "-",
                uom: load.uom,
                week: load.pallet?.currentWeekNumber,
                qtyPicking: load.quantity_picked,
                qtyLoad: load.quantity_loaded,
            });
        });

        return {
            id: gateItem.id, // ✅ INI YANG KAMU MAU
            gate: gateItem.gate?.name ?? "-",
            doNumber: gateItem.outbound_do?.outbound_do_number ?? "-",
            memos: Object.values(memoMap).map((memo: any) => ({
                memoNo: memo.memoNo,
                route: memo.route,
                pallets: Object.entries(memo.pallets).map(
                    ([palletCode, skus]) => ({
                        palletCode,
                        skus: skus as Sku[],
                    })
                ),
            })),
        };
    });
};






type Sku = {
    sku: string;
    uom: string;
    week: string | number;
    qtyPicking: number;
    qtyLoad: number;
};
const getSkuStatus = (item: Sku) => {
    if (item.qtyLoad === 0) return { label: "NOT LOADED", color: "#9CA3AF" };
    if (item.qtyLoad < item.qtyPicking) return { label: "PARTIAL", color: "#DC2626" };
    if (item.qtyLoad === item.qtyPicking) return { label: "COMPLETE", color: "#16A34A" };
    return { label: "OVER LOAD", color: "#DC2626" };
};

const SkuCard = ({ item }: { item: Sku }) => {
    const status = getSkuStatus(item);

    return (
        <View style={[styles.skuCard, { borderColor: status.color }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View>
                    <Text style={styles.sku}>{item.sku}</Text>
                    <Text style={styles.subValue}>
                        UOM {item.uom} · Week {item.week}
                    </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.qtyLabel}>Loading / Picking</Text>
                    <Text style={styles.qty}>{item.qtyLoad} / {item.qtyPicking}</Text>
                </View>
            </View>
        </View>
    );
};





export default function ApprovalGateScreen() {
    const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
    const showDialog = useDialogStore((state) => state.showDialog);
    const [approvalGate, setApprovalGate] = useState<ApprovalGateItem[]>([]);
    const listRef = useRef<FlatList>(null);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [collapsedDO, setCollapsedDO] = useState<Record<string, boolean>>({});
    
        const confirm = useConfirmationStore();

    const toggleDO = (doNumber: string) => {
        setCollapsedDO((prev) => ({
            ...prev,
            [doNumber]: !prev[doNumber],
        }));
    };;

    const getDOStatus = (memos: ApprovalGateMemo[]) => {
        let totalPicking = 0;
        let totalLoad = 0;

        memos.forEach((memo) => {
            memo.pallets.forEach((pallet) => {
                pallet.skus.forEach((sku) => {
                    totalPicking += sku.qtyPicking;
                    totalLoad += sku.qtyLoad;
                });
            });
        });

        if (totalLoad === 0)
            return { label: "NOT LOADED", color: "#9CA3AF" };

        if (totalLoad < totalPicking)
            return { label: "PARTIAL", color: "#F59E0B" };

        if (totalLoad === totalPicking)
            return { label: "COMPLETE", color: "#16A34A" };

        return { label: "OVER LOAD", color: "#DC2626" };
    };



    const fetchGate = async () => {
        try {
            setRefreshing(true);
            showLoadingDialog("Loading List Approval Gate");

            const response =
                await OutboundService.getAssignedGateByStatus("DONE");

            const data = response.data;
            if (!data) return;

            const mapped = mapApprovalGateToUI(data);
            console.log("Mapped Approval Gate Data:", mapped);
            setApprovalGate(mapped);

            // 👇 scroll ke atas setelah data refresh
            requestAnimationFrame(() => {
                listRef.current?.scrollToOffset({
                    offset: 0,
                    animated: true,
                });
            });
        } catch (error) {
            showDialog("error", "Error while Fetching Data Approval Gate!");
        } finally {
            hideLoadingDialog();
            setRefreshing(false);
        }
    };



    const GateItem = ({
        gateItem,
        collapsedDO,
        toggleDO,
        getDOStatus,
    }: any) => {
        const { gate, doNumber, memos = [] } = gateItem;
        const collapsed = collapsedDO[doNumber];
        const status = getDOStatus(memos);

        return (
            <View>
                {/* DO HEADER */}
                <View style={styles.doHeader}>
                    {/* AREA KIRI → TOGGLE */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => toggleDO(doNumber)}
                        style={{ flex: 1 }}
                    >
                        <Text style={styles.label}>GATE LOADING</Text>
                        <Text style={styles.value}>{gate}</Text>
                        <Text style={styles.do}>{doNumber}</Text>
                    </TouchableOpacity>

                    {/* AREA KANAN → APPROVE */}
                
                </View>

                {!collapsed &&
                    memos.map((memo: any) => (
                        <View key={memo.memoNo}>
                            <View style={styles.card}>
                                <Text style={styles.value}>{memo.memoNo}</Text>
                                <Text style={styles.subValue}>{memo.route}</Text>
                            </View>

                            {memo.pallets.map((pallet: any) => (
                                <View key={pallet.palletCode} style={styles.pallet}>
                                    <Text style={styles.palletTitle}>
                                        PALLET {pallet.palletCode}
                                    </Text>

                                    {/* 👇 FlatList TANPA scroll */}
                                    <FlatList
                                        data={pallet.skus}
                                        numColumns={1}
                                        keyExtractor={(item, idx) =>
                                            `${pallet.palletCode}-${item.sku}-${idx}`
                                        }
                                        renderItem={({ item }) => <SkuCard item={item} />}
                                    />
                                </View>
                            ))}
                        </View>
                    ))}
            </View>
        );
    };





    useFocusEffect(
        useCallback(() => {
            fetchGate();
        }, [])
    );
    if (!approvalGate.length) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>No data</Text>
            </View>
        );
    }


    return (
        <FlatList
            ref={listRef}
            data={approvalGate}
            keyExtractor={(item) => item.doNumber}
            contentContainerStyle={styles.container}
            refreshing={refreshing}
            onRefresh={fetchGate}
            renderItem={({ item }) => (
                <View>
                    <GateItem
                        gateItem={item}
                        collapsedDO={collapsedDO}
                        toggleDO={toggleDO}
                        getDOStatus={getDOStatus}
                    />
                    {!collapsedDO[item.doNumber] && (
                        <TouchableOpacity
                            style={{
                                backgroundColor: "#2563EB",
                                borderRadius: 8,
                                paddingVertical: 10,
                                alignItems: "center",
                                marginTop: -10,
                                marginBottom: 32,
                                shadowColor: "#000",
                                shadowOpacity: 0.08,
                                shadowRadius: 4,
                            }}
                            onPress={async () => {
                                console.log("Approve clicked:", item.id);
                                confirm.show(
                                    "accept",
                                    "Are you sure want to approve this gate?",
                                    async () => {
                                        try {
                                            showLoadingDialog("Approving Gate...");
                                            const res = await OutboundService.updateAssignedGateApprove(item.id);
                                            console.log("Approve response:", res);
                                            showDialog("success", "Gate approved successfully!");
                                            await fetchGate();
                                        } catch (error) {
                                            console.error("Approve error:", error);
                                            showDialog("error", "Failed to approve gate!");
                                        } finally {
                                            hideLoadingDialog();
                                        }
                                    }
                                );
                            }}
                        >
                            <Text style={{
                                color: "#FFF",
                                fontWeight: "700",
                                fontSize: 16,
                                letterSpacing: 0.5,
                            }}>
                                APPROVE GATE
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        />
    );


}

const styles = StyleSheet.create({
    screenTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 12,
    },
    container: {
        flexGrow: 1,
        backgroundColor: "#F6F8FA",
        padding: 12,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },

    label: {
        fontSize: 12,
        color: "#6B7280",
    },

    value: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
    },

    subValue: {
        fontSize: 12,
        color: "#6B7280",
    },

    do: {
        fontSize: 14,
        fontWeight: "700",
        color: "#2563EB",
    },

    sectionRow: {
        flexDirection: "row",
        gap: 8,
    },

    card: {
        backgroundColor: "#FFF",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },

    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 6,
    },

    chip: {
        backgroundColor: "#E5F0FF",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        marginRight: 6,
        marginBottom: 6,
    },

    chipText: {
        fontSize: 12,
        color: "#1D4ED8",
    },

    pallet: {
        backgroundColor: "#FFF",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },

    palletTitle: {
        fontWeight: "700",
        marginBottom: 8,
    },

    skuCard: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#34D399",
        borderRadius: 8,
        padding: 10,
        margin: 6,
        backgroundColor: "#F9FAFB",
    },

    sku: {
        fontSize: 14,
        fontWeight: "700",
    },

    qtyRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 10,
    },

    qtyLabel: {
        fontSize: 11,
        color: "#6B7280",
    },

    qty: {
        fontSize: 16,
        fontWeight: "700",
    },

    status: {
        backgroundColor: "#6FC7A1",
        paddingVertical: 6,
        borderRadius: 6,
        alignItems: "center",
    },

    statusText: {
        color: "#FFF",
        fontWeight: "700",
    },
    palletHeader: {
        fontWeight: "800",
        fontSize: 14,
        marginBottom: 6,
    },

    palletStatus: {
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
    },

    palletStatusText: {
        color: "#FFF",
        fontSize: 11,
        fontWeight: "700",
    },
    doHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#FFF",
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
    },

    doStatus: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
    },

    doStatusText: {
        color: "#FFF",
        fontSize: 12,
        fontWeight: "800",
    },

});

