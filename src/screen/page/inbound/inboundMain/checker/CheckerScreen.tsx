import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Modal,
    TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Ionicons from "react-native-vector-icons/FontAwesome5";
import { useRoute } from "@react-navigation/core";

    // Ambil payload dari route params
    type InboundDetailRouteParams = {
        item: {
            id: string;
            inbound_number: string;
            license_plate: string;
        };
    };

export default function HelperListScreen() {
    const route = useRoute();
    const payload = route.params as InboundDetailRouteParams;
    const [helpers, setHelpers] = useState([
        { id: "1", deviceId: "Device 1", name: "Ahmad", contact: "0878773940" },
        { id: "2", deviceId: "Device 2", name: "Eko", contact: "0878773940" },
    ]);

    const [modalVisible, setModalVisible] = useState(false);
    const [editingHelper, setEditingHelper] = useState<any>(null);

    const [deviceId, setDeviceId] = useState("Device 1");
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");

    const openAddModal = () => {
        setEditingHelper(null);
        setDeviceId("Device 1");
        setName("");
        setContact("");
        setModalVisible(true);
    };

    const openEditModal = (helper: any) => {
        setEditingHelper(helper);
        setDeviceId(helper.deviceId);
        setName(helper.name);
        setContact(helper.contact);
        setModalVisible(true);
    };

    const handleSave = () => {
        if (editingHelper) {
            setHelpers((prev) =>
                prev.map((h) =>
                    h.id === editingHelper.id ? { ...h, deviceId, name, contact } : h
                )
            );
        } else {
            setHelpers((prev) => [
                ...prev,
                { id: Date.now().toString(), deviceId, name, contact },
            ]);
        }
        setModalVisible(false);
    };

    const renderHelper = ({ item }: any) => (
        <View style={styles.card}>
            <Text style={styles.label}>Device ID: <Text style={styles.value}>{item.deviceId}</Text></Text>
            <Text style={styles.label}>Name: <Text style={styles.value}>{item.name}</Text></Text>
            <View style={styles.row}>
                <Text style={styles.label}>Contact: <Text style={styles.value}>{item.contact}</Text></Text>
                <TouchableOpacity onPress={() => openEditModal(item)}>
                    <Ionicons name="pen" size={20} color="#000" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Info Box */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Inbound Planning Number</Text>
                <Text style={styles.headerNumber}>{payload.item.inbound_number}</Text>
                <Text style={styles.vehicle}> <Ionicons name="truck" size={20} /> {payload.item.license_plate}</Text>
            </View>

            <Text style={styles.sectionTitle}>Assigned Helper</Text>

            <FlatList
                data={helpers}
                keyExtractor={(item) => item.id}
                renderItem={renderHelper}
                contentContainerStyle={{ paddingBottom: 100 }}
            />

            {/* Floating Add Button */}
            <TouchableOpacity style={styles.fab} onPress={openAddModal}>
                <Ionicons name="plus" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editingHelper ? "Edit Helper" : "Add Helper"}
                        </Text>

                        <Text style={styles.inputLabel}>Device ID</Text>
                        <Picker
                            selectedValue={deviceId}
                            onValueChange={(itemValue) => setDeviceId(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Device 1" value="Device 1" />
                            <Picker.Item label="Device 2" value="Device 2" />
                            <Picker.Item label="Device 3" value="Device 3" />
                        </Picker>

                        <Text style={styles.inputLabel}>Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter name"
                        />

                        <Text style={styles.inputLabel}>Contact</Text>
                        <TextInput
                            style={styles.input}
                            value={contact}
                            onChangeText={setContact}
                            placeholder="Enter contact"
                            keyboardType="phone-pad"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: "#ccc" }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: "#FF6B00" }]}
                                onPress={handleSave}
                            >
                                <Text style={{ color: "#fff" }}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FDFCFB", padding: 16 },
    title: { fontSize: 20, fontWeight: "bold", color: "#FF6B00", marginBottom: 12 },
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
    infoBox: {
        backgroundColor: "#E8F0FB",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    infoLabel: { fontSize: 14, fontWeight: "600", textAlign: "center" },
    infoValue: { fontSize: 16, fontWeight: "bold", textAlign: "center" },
    truck: { fontSize: 16, fontWeight: "bold", textAlign: "center", marginTop: 8, color: "#FF6B00" },
    sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    label: { fontSize: 14, fontWeight: "600" },
    value: { fontSize: 14, fontWeight: "400", color: "#FF6B00" },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    fab: {
        position: "absolute",
        bottom: 30,
        right: 20,
        backgroundColor: "#FF6B00",
        borderRadius: 50,
        padding: 16,
        elevation: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
    },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
    inputLabel: { fontSize: 14, marginTop: 8 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginTop: 4,
    },
    picker: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginTop: 4,
    },
    modalButtons: { flexDirection: "row", justifyContent: "flex-end", marginTop: 20, gap: 10 },
    button: { padding: 10, borderRadius: 8, minWidth: 80, alignItems: "center" },
});
