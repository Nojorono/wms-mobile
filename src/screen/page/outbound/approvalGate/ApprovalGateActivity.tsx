// GateLoadingScreen.js
import React, { useCallback, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    FlatList,
} from "react-native";
import { useLoadingDialogStore } from "../../../../store/useLoadingStore";
import { useDialogStore } from "../../../../store/useGlobalDialog";
import { useFocusEffect } from "@react-navigation/native";
import OutboundService from "../../../../service/outboundService";

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
    // If data is not array, fallback to empty array
    const arr = Array.isArray(dataArr) ? dataArr : [];
    return arr.map((data) => ({
        gate: data.gate?.name ?? "-",
        doNumber: data.outbound_do?.outbound_do_number ?? "-",
        memos: (data.outbound_do?.outbound_memos ?? []).map((memo: any) => {
            const palletMap: Record<string, Sku[]> = {};

            (memo.transaction_pickings ?? []).forEach((tp: any) => {
                (tp.transactionScanPicking ?? []).forEach((scan: any) => {
                    const palletCode = scan.palletUse?.pallet_code ?? "UNKNOWN";

                    if (!palletMap[palletCode]) {
                        palletMap[palletCode] = [];
                    }

                    palletMap[palletCode].push({
                        sku: scan.item?.sku ?? "-",
                        uom: scan.uom,
                        week: scan.week_number,
                        qtyPicking: tp.quantity,
                        qtyLoad: scan.quantity_picked,
                    });
                });
            });

            return {
                memoNo: memo.outbound_memo_number,
                route: `${memo.origin} → ${memo.destination}`,
                pallets: Object.entries(palletMap).map(
                    ([palletCode, skus]) => ({
                        palletCode,
                        skus,
                    })
                ),
            };
        }),
    }));
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
    if (item.qtyLoad < item.qtyPicking) return { label: "PARTIAL", color: "#F59E0B" };
    if (item.qtyLoad === item.qtyPicking) return { label: "COMPLETE", color: "#16A34A" };
    return { label: "OVER LOAD", color: "#DC2626" };
};

const SkuCard = ({ item }: { item: Sku }) => {
    const status = getSkuStatus(item);

    return (
        <View style={[styles.skuCard, { borderColor: status.color }]}>
            <Text style={styles.sku}>{item.sku}</Text>
            <Text style={styles.subValue}>
                UOM {item.uom} · Week {item.week}
            </Text>

            <View style={styles.qtyRow}>
                <View>
                    <Text style={styles.qtyLabel}>Qty Picking</Text>
                    <Text style={styles.qty}>{item.qtyPicking}</Text>
                </View>
                <View>
                    <Text style={styles.qtyLabel}>Final Qty Load</Text>
                    <Text style={styles.qty}>{item.qtyLoad}</Text>
                </View>
            </View>

            <View style={[styles.status, { backgroundColor: status.color }]}>
                <Text style={styles.statusText}>{status.label}</Text>
            </View>
        </View>
    );
};





export default function ApprovalGateScreen() {
    const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
    const showDialog = useDialogStore((state) => state.showDialog);
    const [approvalGate, setApprovalGate] = useState<ApprovalGateItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [collapsedDO, setCollapsedDO] = useState<Record<string, boolean>>({});

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
                await OutboundService.getAssignedGateByStatus("PENDING");

            const data = response.data;
            if (!data) return;

            const mapped = mapApprovalGateToUI(data);
            console.log("Mapped Approval Gate Data:", mapped);
            setApprovalGate(mapped);
        } catch (error) {
            showDialog("error", "Error while Fetching Data Approval Gate!");
        } finally {
            hideLoadingDialog();
            setRefreshing(false);
        }
    };




    useFocusEffect(
        useCallback(() => {
            fetchGate();
        }, [])
    );
    if (!approvalGate.length) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Loading...</Text>
            </View>
        );
    }


    return (
        <ScrollView style={styles.container}>
            {approvalGate.map((gateItem: ApprovalGateItem, index: number) => {
  const { gate, doNumber, memos = [] } = gateItem;
  const collapsed = collapsedDO[doNumber];
  const status = getDOStatus(memos);

  return (
    <View key={index}>
      {/* DO HEADER (COLLAPSIBLE) */}
      <View
        style={styles.doHeader}
        onTouchEnd={() => toggleDO(doNumber)}
      >
        <View>
          <Text style={styles.label}>GATE LOADING</Text>
          <Text style={styles.value}>{gate}</Text>
          <Text style={styles.do}>{doNumber}</Text>
        </View>

        <View
          style={[
            styles.doStatus,
            { backgroundColor: status.color },
          ]}
        >
          <Text style={styles.doStatusText}>{status.label}</Text>
        </View>
      </View>

      {/* COLLAPSED CONTENT */}
      {!collapsed &&
        memos.map((memo) => (
          <View key={memo.memoNo}>
            {/* Memo */}
            <View style={styles.card}>
              <Text style={styles.label}>MEMO NO</Text>
              <Text style={styles.value}>{memo.memoNo}</Text>
              <Text style={styles.subValue}>{memo.route}</Text>
            </View>

            {/* Pallet */}
            {memo.pallets.map((pallet) => (
              <View key={pallet.palletCode} style={styles.pallet}>
                <Text style={styles.palletTitle}>
                  PALLET {pallet.palletCode}
                </Text>

                <FlatList
                  data={pallet.skus}
                  numColumns={2}
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
})}

        </ScrollView>
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
        flex: 1,
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

