import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import UserServices from "../../../../service/userServices";
import { useLoadingDialogStore } from "../../../../store/useLoadingStore";
import { ROLES } from "../../../../constants/Roles";
import OutboundService from "../../../../service/outboundService";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDialogStore } from "../../../../store/useGlobalDialog";
import { AssignGateParamList } from "../../../navigation/outbound/AssignGateNavigator";
import { StackNavigationProp } from "@react-navigation/stack";
import Ionicons from "react-native-vector-icons/FontAwesome5";

interface AssignForm {
    name: string;
    contact: string;
    gateId: string;
}


type NavigationProp = StackNavigationProp<AssignGateParamList, 'AssignGateMain'>;

export default function AssignGateLoading() {
    const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
    const [userManageList, setUserManageList] = useState<any[]>([]);
    const navigation = useNavigation<NavigationProp>();
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    const showDialog = useDialogStore((state) => state.showDialog);
    const route = useRoute();
    const params = (route.params || {}) as any;
    const isEdit = params?.mode === "edit";
    const assignedGate = params?.assignedGate || null;
    const [userList, setUserList] = useState<any[]>([]);
    const [gateList, setGateList] = useState<any[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [userMode, setUserMode] = useState<"add" | "edit">("add");

    const [formData, setFormData] = useState<AssignForm>({
        gateId: "",
        name: "",
        contact: "",
    });

    const handleSubmit = async () => {
        try {
            showLoadingDialog("Processing...");
            console.log("Form Data Submitted:", params.item);

            if (!isEdit) {
                // CREATE MODE
                const payload = {
                    assigned_gate_id: params.item.id,
                    helper_name: formData.name,
                    helper_phone: formData.contact,
                };
                const res = await OutboundService.postHelperToAssignedLoading(params.item.id, payload);
                console.log("Response:", res);
                showDialog("success", "Gate assignment saved.");
                navigation.goBack();
                return;
            }

            // EDIT MODE ----------------------------------

            if (userMode === "add") {
                // ➕ ADD NEW USER
                const payload = {
                    assigned_gate_id: assignedGate.id,
                    helper_name: formData.name,
                    helper_phone: formData.contact,
                };
                await OutboundService.postHelperToAssignedLoading(assignedGate.id, payload);
                showDialog("success", "Gate assignment saved.");

                showDialog("success", "User added to assigned gate.");
            } else if (userMode === "edit") {
                // ✏️ UPDATE EXISTING
                const res = await OutboundService.updateAssignedLoadingHelper(
                    assignedGate.assigned_gate_id,
                    assignedGate.id,
                    {
                        helper_name: formData.name,
                        helper_phone: formData.contact,
                    }
                );
                showDialog("success", "User updated.");
            }

            navigation.goBack();
        } catch (err) {
            console.log(err);
            showDialog("error", "Failed processing request.");
        } finally {
            hideLoadingDialog();
        }
    };


    const fetchUserList = async (roleName = ROLES.DRIVER_FORKLIFT) => {
        try {
            showLoadingDialog("Loading Data Users");

            const response = await UserServices.getUserList();
            const responseManage = await UserServices.getUserManagementList();
            const responseGate = await OutboundService.getGateList();
            setGateList(responseGate?.data || []);
            setUserManageList(responseManage?.data || []);
            const filteredUsers = (response?.data || []).filter(
                (user: any) =>
                    user?.role?.name?.toUpperCase() === roleName.toUpperCase()
            );

            setUserList(filteredUsers);
        } catch (error) {
            console.log("Error:", error);
        } finally {
            hideLoadingDialog();
        }
    };

    useEffect(() => {
        fetchUserList();
    }, []);

    useEffect(() => {
        if (
            isEdit &&
            assignedGate &&
            assignedGate.assigned_gate &&
            gateList.length > 0
        ) {
            setFormData({
                gateId: assignedGate.assigned_gate.gate_id, // ✅ FIX UTAMA
                name: assignedGate.helper_name || "",
                contact: assignedGate.helper_phone || "",
            });

            setUserMode("edit");
        }
    }, [isEdit, assignedGate, gateList]);



    const handleNameChange = (text: string) => {
        setFormData((prev) => ({ ...prev, name: text }));
        setShowUserDropdown(true);

        if (!text.trim()) {
            setSearchResults([]);
            return;
        }

        const filtered = userManageList.filter((u) =>
            u.name?.toLowerCase().includes(text.toLowerCase())
        );

        setSearchResults(filtered);
    };



    const handleSelectUser = (user: any) => {
        setFormData(prev => ({
            ...prev,
            name: user.name,
            contact: user.phone,
        }));

        setSearchResults([]);
        setShowUserDropdown(false);
    };

    const handlePickerGateChange = (selectedId: string) => {
        setFormData((prev) => ({ ...prev, gateId: selectedId }));

        if (!selectedId) return;

        const foundInUserList = userList.find((u) => u.id === selectedId);
        const foundInManage = userManageList.find((u) => u.id === selectedId);
        const found = foundInUserList || foundInManage;

        if (found) {
            setFormData((prev) => ({
                ...prev,
                name: found.name || prev.name,
                contact: found.phone || prev.contact,
            }));
        }
    };



    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Assign Helper to Gate</Text>

            <Text style={styles.label}>Select Gate</Text>
            <Picker
                selectedValue={formData.gateId}
                onValueChange={(itemValue) => handlePickerGateChange(String(itemValue))}
                style={styles.picker}
            >
                <Picker.Item label="Select Gate" value="" />
                {gateList.map((gate) => (
                    <Picker.Item
                        key={gate.id}
                        label={gate.name || " -"}
                        value={gate.id}
                    />
                ))}
            </Picker>

            <Text style={styles.label}>User</Text>

            <View style={{ zIndex: 100 }}>
                <TextInput
                    style={styles.input}
                    placeholder="Search or type name..."
                    value={formData.name}
                    onChangeText={handleNameChange}
                    onFocus={() => setShowUserDropdown(true)}
                />

                {showUserDropdown && searchResults.length > 0 && (
                    <View style={styles.dropdown}>
                        <ScrollView style={{ maxHeight: 200 }}>
                            {searchResults.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.dropdownItem}
                                    onPress={() => handleSelectUser(item)}
                                >
                                    <Text style={styles.dropdownName}>{item.name}</Text>
                                    <Text style={styles.dropdownPhone}>{item.phone}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>

            {/* CONTACT */}
            <Text style={styles.label}>Phone</Text>
            <TextInput
                style={styles.input}
                editable={false}
                value={formData.contact}
                placeholder="Auto-filled"
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitText}>Save Assignment</Text>
            </TouchableOpacity>



        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 80,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 20,
        color: "#111",
    },
    label: {
        fontSize: 14,
        color: "#555",
        marginBottom: 6,
        marginTop: 18,
    },

    // INPUT
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 12,
        borderRadius: 12,
        fontSize: 15,
        backgroundColor: "#fafafa",
    },

    // SELECT BOX
    selectBox: {
        position: "relative",
    },
    selectButton: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 12,
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#fafafa",
    },
    selectText: {
        fontSize: 15,
        color: "#333",
    },
    picker: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginTop: 4,
        backgroundColor: "#fafafa",
    },

    // DROPDOWN
    dropdown: {
        position: "absolute",
        top: 55,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#eee",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        zIndex: 99,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f3f3",
    },
    dropdownName: {
        fontSize: 15,
        color: "#222",
    },
    dropdownPhone: {
        fontSize: 12,
        color: "#888",
    },

    submitButton: {
        marginTop: 30,
        backgroundColor: "#111",
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
    },
    submitText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginTop: 20,
        marginBottom: 10,
    },

    userCard: {
        padding: 12,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fafafa",
    },

    userName: { fontSize: 15, fontWeight: "600" },
    userPhone: { fontSize: 12, color: "#666" },

    editBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: "#007AFF33",
        borderRadius: 8,
        marginRight: 6,
    },

    editText: { color: "#007AFF", fontWeight: "600" },

    addUserButton: {
        marginTop: 14,
        padding: 14,
        borderRadius: 12,
        backgroundColor: "#111",
        alignItems: "center",
    },

    addUserText: { color: "#fff", fontWeight: "700" },

});
