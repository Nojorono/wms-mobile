import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

export default function GoodReceiveDetail() {
    const data = {
        palletId: "PALLET - 01",
        suratJalanNo: "188258",
        poNo: "25210102629",
        receivedDate: "24/04/2025",
        grStatus: "",
        items: [
            {
                code: "ARO12",
                planned: 11,
                qtyReceived: 7,
                status: "Unbalanced",
            },
            {
                code: "AST16",
                planned: 9,
                qtyReceived: 9,
                status: "Balanced",
            },
        ],
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Detail Good Receiving</Text>
            </View>

            {/* Pallet Info */}
            <View style={styles.card}>
                <Text style={styles.label}>Pallet ID</Text>
                <Text style={styles.value}>{data.palletId}</Text>

                <Text style={styles.label}>Surat Jalan No.</Text>
                <TextInput style={styles.input} value={data.suratJalanNo} editable={false} />

                <Text style={styles.label}>PO No.</Text>
                <TextInput style={styles.input} value={data.poNo} editable={false} />

                <Text style={styles.label}>Received Date</Text>
                <TextInput style={styles.input} value={data.receivedDate} editable={false} />

                <Text style={styles.label}>GR Status</Text>
                <TextInput style={styles.input} placeholder="GR Status" value={data.grStatus} />
            </View>

            {/* Items */}
            {data.items.map((item, idx) => {
                const [qtyReceived, setQtyReceived] = React.useState(item.qtyReceived.toString());
                return (
                    <View style={styles.itemCard} key={item.code}>
                        <Text style={styles.itemCode}>{item.code}</Text>
                        <View style={styles.row}>
                            <Text style={styles.subLabel}>Planned</Text>
                            <TextInput
                                style={styles.smallInput}
                                value={item.planned.toString()}
                                editable={false}
                            />
                            <Text style={styles.subLabel}>Qty Received</Text>
                            <TextInput
                                style={styles.smallInput}
                                value={qtyReceived}
                                keyboardType="numeric"
                                onChangeText={setQtyReceived}
                            />
                        </View>
                        <Text style={qtyReceived === item.planned.toString() ? styles.balanced : styles.unbalanced}>
                            {qtyReceived === item.planned.toString() ? "Balanced" : "Unbalanced"}
                        </Text>
                    </View>
                );
            })}
            <TouchableOpacity style={styles.submitBtn}>
                <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FF6600",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginTop: 8,
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
    fontSize: 16,
    backgroundColor: "#F5F5F5",
  },
  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemCode: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#FF6600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
  },
  smallInput: {
    width: 60,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 6,
    textAlign: "center",
    fontSize: 16,
    backgroundColor: "#F5F5F5",
  },
  unbalanced: {
    fontSize: 15,
    color: "#D9534F",
    fontWeight: "600",
    textAlign: "right",
  },
  balanced: {
    fontSize: 15,
    color: "#5CB85C",
    fontWeight: "600",
    textAlign: "right",
  },
  submitBtn: {
    backgroundColor: "#FF6600",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "700",
  },
});
