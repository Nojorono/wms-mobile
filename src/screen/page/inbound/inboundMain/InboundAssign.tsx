import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

export default function InboundAssign() {
    const [helpers, setHelpers] = useState([
        { id: "", name: "", contact: "" },
    ]);

    const addHelper = () => {
        setHelpers([...helpers, { id: "", name: "", contact: "" }]);
    };

    const updateHelper = (
        index: number,
        field: "id" | "name" | "contact",
        value: string
    ) => {
        const newHelpers = [...helpers];
        newHelpers[index][field] = value;
        setHelpers(newHelpers);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.plate}>🚚 B 2324 TRS</Text>

                {helpers.map((helper, index) => (
                    <View key={index} style={styles.helperBox}>
                        <View style={styles.helperHeader}>
                            <Text style={styles.helperTitle}>
                                Helper {index + 1}
                            </Text>
                            {helpers.length > 1 && (
                                <TouchableOpacity
                                    style={styles.removeBtn}
                                    onPress={() => {
                                        const newHelpers = helpers.filter((_, i) => i !== index);
                                        setHelpers(newHelpers.length > 0 ? newHelpers : helpers);
                                    }}
                                >
                                    <Text style={styles.removeBtnText}>-</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Helper ID / Device ID"
                            value={helper.id}
                            onChangeText={(text) => updateHelper(index, "id", text)}
                            placeholderTextColor="#B0B0B0"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Helper Name"
                            value={helper.name}
                            onChangeText={(text) => updateHelper(index, "name", text)}
                            placeholderTextColor="#B0B0B0"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Helper Contact"
                            value={helper.contact}
                            onChangeText={(text) => updateHelper(index, "contact", text)}
                            placeholderTextColor="#B0B0B0"
                            keyboardType="phone-pad"
                        />
                    </View>
                ))}

                <TouchableOpacity style={styles.addBtn} onPress={addHelper}>
                    <Text style={styles.addBtnText}>+ Add More Helper</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveBtn}>
                    <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAFAFA",
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        marginBottom: 18,
        color: "#FF9800",
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 24,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 2,
    },
    plate: {
        textAlign: "center",
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 18,
        color: "#F44336",
        letterSpacing: 1,
    },
    helperBox: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
        paddingBottom: 16,
    },
    helperHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    helperTitle: {
        fontWeight: "600",
        fontSize: 20,
        color: "#222",
    },
    removeBtn: {
        backgroundColor: "#FFF0F0",
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    removeBtnText: {
        color: "#F44336",
        fontWeight: "700",
        fontSize: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
        fontSize: 18,
        backgroundColor: "#F7F7F7",
        color: "#222",
    },
    addBtn: {
        borderWidth: 1,
        borderColor: "#FF9800",
        borderRadius: 10,
        padding: 16,
        alignItems: "center",
        marginBottom: 18,
        backgroundColor: "#FFF8F0",
    },
    addBtnText: {
        color: "#FF9800",
        fontWeight: "700",
        fontSize: 18,
        letterSpacing: 0.5,
    },
    saveBtn: {
        backgroundColor: "#222",
        borderRadius: 10,
        padding: 18,
        alignItems: "center",
    },
    saveBtnText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 20,
        letterSpacing: 1,
    },
});
