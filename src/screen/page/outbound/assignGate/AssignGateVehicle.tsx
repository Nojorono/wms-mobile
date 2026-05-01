import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    RefreshControl,
    FlatList, // Import FlatList
    Keyboard, // Import Keyboard
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import OutboundService from "../../../../service/outboundService";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useLoadingDialogStore } from "../../../../store/useLoadingStore";
import { useDialogStore } from "../../../../store/useGlobalDialog";
import { AssignGateParamList } from "../../../navigation/outbound/AssignGateNavigator";
import { StackNavigationProp } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useConfirmationStore } from "../../../../store/useConfirmationStore";
import ConstantService from "../../../../service/constantService";

interface Payload {
    expedition: string;
    vendor_id?: string | null; // Tambahkan vendor_id
    vendor_po_number?: string;
    license_plate: string;
    driver_name: string;
    driver_phone: string;
    container_number?: string;
}
type NavigationProp = StackNavigationProp<AssignGateParamList, 'AssignGateMain'>;

export default function AssignGateVehicle() {
    const [data, setData] = useState<Payload | null>(null);
    const [dataAssigned, setDataAssigned] = useState<any>(null);
    const [dataAssignedLoading, setDataAssignedLoading] = useState<any>(null);
    
    // Vendor / Expedition Search State
    const [dataVendor, setDataVendor] = useState<any[]>([]);
    const [filteredVendor, setFilteredVendor] = useState<any[]>([]);
    const [showVendorList, setShowVendorList] = useState(false);

    const [isEdit, setIsEdit] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const route = useRoute();
    const showDialog = useDialogStore((state) => state.showDialog);
    const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
    const confirm = useConfirmationStore();
    const params = (route.params || {}) as any;
    const navigation = useNavigation<NavigationProp>();

    const {
        control,
        handleSubmit,
        reset,
        setValue, // Ambil setValue untuk update manual
        watch, // Ambil watch untuk memantau nilai
        formState: { errors }
    } = useForm<Payload>({
        defaultValues: {
            expedition: "",
            vendor_id: null,
            license_plate: "",
            driver_name: "",
            driver_phone: "",
            container_number: "",
            vendor_po_number: "",
        }
    });

    async function fetchData() {
        try {
            showLoadingDialog("Loading...");
            const response = await OutboundService.getOutboundDetailById(params.item.id);
            const assignedGate = await OutboundService.getAssignedGateByDoId(params.item.id);
            const resVendor = await ConstantService.getSuppliers();
            console.log('Vendors fetched:', resVendor);
            
            if (assignedGate.data.length > 0) {
                const assignedLoading = await OutboundService.getAssignedLoadingByDoId(assignedGate.data[0].id);
                setDataAssignedLoading(assignedLoading.data);
            }
            setDataAssigned(assignedGate.data);
            setDataVendor(resVendor.data || []); // Pastikan array

            const newData = {
                expedition: response?.data?.expedition ?? "",
                vendor_id: response?.data?.vendor_id ?? null, // Mapping jika ada
                license_plate: response?.data?.license_plate ?? "",
                driver_name: response?.data?.driver_name ?? "",
                driver_phone: response?.data?.driver_phone ?? "",
                container_number: response?.data?.container_number ?? "",
                vendor_po_number: response?.data?.vendor_po_number ?? "",
            };

            setData(newData);
            reset(newData);
        } catch (error) {
            console.log("Fetch data failed:", error);
            showDialog("error", "failed to load data");
        } finally {
            hideLoadingDialog();
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchData();
        } finally {
            setRefreshing(false);
        }
    };

    const onSubmit = async (values: Payload) => {
        try {
            showLoadingDialog("Updating vehicle information...");
            // Kirim values (termasuk vendor_id jika ada, atau expedition string biasa)
            const response = await OutboundService.updateOutboundDoVehicleInfo(params.item.id, values);
            showDialog("success", "Vehicle information updated successfully!");
            await fetchData();
            setIsEdit(false);
        } catch (error) {
            console.log("Update vehicle failed:", error);
            showDialog("error", "Failed to update vehicle information.");
        } finally {
            hideLoadingDialog();
        }
    };

    // --- Logic Search Expedition ---
    const handleSearchExpedition = (text: string) => {
        setValue("expedition", text);
        
        // Jika user mengetik, kita anggap ini free text dulu (kosongkan ID)
        // Kecuali user nanti klik salah satu item dari list
        setValue("vendor_id", null); 

        if (text && dataVendor.length > 0) {
            const filtered = dataVendor.filter((item) => 
                item.VENDOR_NAME?.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredVendor(filtered);
            setShowVendorList(true);
        } else {
            setShowVendorList(false);
        }
    };

    const handleSelectVendor = (item: any) => {
        setValue("expedition", item.VENDOR_NAME); // Tampilkan nama vendor
        setValue("vendor_id", item.VENDOR_ID.toString());    // Simpan ID vendor
        setShowVendorList(false);
        Keyboard.dismiss();
    };

    // --- Render Input Component ---

    // Khusus untuk Expedition (Searchable)
    const renderExpeditionInput = () => (
        <View style={{ marginBottom: 16, zIndex: 10 }}> 
            <Text style={styles.label}>Expedition</Text>
            <Controller
                control={control}
                name="expedition"
                rules={{ required: "Expedition wajib diisi" }}
                render={({ field: { value } }) => (
                    <View>
                        <TextInput
                            placeholder="Find or fill manually"
                            style={[
                                styles.input,
                                errors.expedition ? { borderColor: "red" } : {}
                            ]}
                            value={value}
                            onChangeText={handleSearchExpedition}
                            onFocus={() => {
                                // Tampilkan list lagi jika ada value saat focus
                                if (value && dataVendor.length > 0) handleSearchExpedition(value);
                            }}
                        />
                        
                        {/* Dropdown Search Results */}
                        {showVendorList && filteredVendor.length > 0 && (
                            <View style={styles.dropdownContainer}>
                                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                                    {filteredVendor.map((item, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.dropdownItem}
                                            onPress={() => handleSelectVendor(item)}
                                        >
                                            <Text style={styles.dropdownText}>{item.VENDOR_NAME}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>
                )}
            />
            {errors.expedition && (
                <Text style={styles.error}>{errors.expedition?.message}</Text>
            )}
        </View>
    );

    // Input Biasa
    const renderInput = (label: string, name: keyof Payload, placeholder: string) => (
        <View style={{ marginBottom: 16, zIndex: 1 }}>
            <Text style={styles.label}>{label}</Text>
            <Controller
                control={control}
                name={name}
                rules={{ 
                    required: `${label} wajib diisi`,
                    ...(name === "driver_phone" && {
                        minLength: { value: 10, message: "Minimum 10 digit" },
                        pattern: { value: /^\d+$/, message: "Only numbers are allowed" }
                    })
                }}
                render={({ field: { onChange, value } }) => (
                    <TextInput
                        placeholder={placeholder}
                        style={[
                            styles.input,
                            errors[name] ? { borderColor: "red" } : {}
                        ]}
                        value={value as string}
                        onChangeText={onChange}
                        keyboardType={name === "driver_phone" ? "numeric" : "default"}
                    />
                )}
            />
            {errors[name] && (
                <Text style={styles.error}>{errors[name]?.message}</Text>
            )}
        </View>
    );

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.contentseal}
            keyboardShouldPersistTaps="handled" // Penting agar klik dropdown tidak close keyboard duluan
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <Text style={styles.header}>Driver & Vehicle Information</Text>

            {!data || isEdit ? (
                <View style={styles.card}>
                    {/* Render Expedition secara khusus */}
                    {renderExpeditionInput()}
                    {renderInput("Vendor PO Number", "vendor_po_number", "Contoh: PO123456")}
                    {renderInput("License Plate", "license_plate", "Contoh: B1234ABC")}
                    {renderInput("Driver Name", "driver_name", "Contoh: John Doe")}
                    {renderInput("Driver Phone", "driver_phone", "Contoh: 081234567890")}
                    {renderInput("Container Number", "container_number", "Contoh: C099372")}

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSubmit(onSubmit)}
                    >
                        <Text style={styles.saveButtonText}>
                            {data ? "Save Changes" : "Save Data"}
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <View style={styles.card}>
                        <Text style={styles.itemTitle}>Vendor PO Number</Text>
                        <Text style={styles.itemValue}>{data.vendor_po_number || "-"}</Text>

                        <Text style={styles.itemTitle}>Expedition</Text>
                        <Text style={styles.itemValue}>{data.expedition}</Text>

                        <Text style={styles.itemTitle}>License Plate</Text>
                        <Text style={styles.itemValue}>{data.license_plate}</Text>

                        <Text style={styles.itemTitle}>Driver Name</Text>
                        <Text style={styles.itemValue}>{data.driver_name}</Text>

                        <Text style={styles.itemTitle}>Driver Phone</Text>
                        <Text style={styles.itemValue}>{data.driver_phone}</Text>

                        <Text style={styles.itemTitle}>Container Number</Text>
                        <Text style={styles.itemValue}>{data.container_number}</Text>

                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => {
                                setIsEdit(true);
                                reset(data);
                            }}
                        >
                            <Text style={styles.editButtonText}>Edit Data</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.header}>List Assign Gate</Text>
                    {/* ... Bagian Assign Gate tetap sama ... */}
                    {dataAssigned && dataAssigned.length > 0 ? (
                        dataAssigned.map((ag: any, index: number) => {
                            const sortedUsers = [...(ag.assigned_gate_users ?? [])].sort(
                                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                            );
                            const latestUser = sortedUsers[0];

                            const handleDelete = () => {
                                confirm.show("decline", "Are you sure you want to delete this assigned gate?", async () => {
                                    try {
                                        showLoadingDialog("Deleting...");
                                        await OutboundService.deleteAssignedGate(ag.id);
                                        showDialog("success", "Assigned gate deleted!");
                                        fetchData();
                                    } catch (err) {
                                        showDialog("error", "Failed to delete assigned gate.");
                                    } finally {
                                        hideLoadingDialog();
                                    }
                                }, false);
                            };

                            const handleEdit = () => {
                                navigation.navigate('AssignGateActivity', {
                                    item: params.item,
                                    mode: "edit",
                                    assignedGate: ag,
                                });
                            };

                            return (
                                <View key={ag.id} style={styles.compactCard}>
                                    <Text style={styles.indexNumber}>{index + 1}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.compactText}>
                                            <Text style={styles.bold}>Gate:</Text> {ag.gate.code ?? "-"}
                                        </Text>
                                        <Text style={styles.compactText}>
                                            <Text style={styles.bold}>Full Name:</Text> {latestUser?.user_name ?? "-"}
                                        </Text>
                                        <Text style={styles.compactText}>
                                            <Text style={styles.bold}>Username :</Text> {latestUser?.user.username ?? "-"}
                                        </Text>
                                    </View>
                                    <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
                                        <Icon name="edit" size={16} color="#007AFF" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
                                        <Icon name="trash" size={16} color="red" />
                                    </TouchableOpacity>
                                </View>
                            );
                        })
                    ) : (
                        <Text style={{ color: "#999", marginBottom: 12 }}>No assigned gate yet</Text>
                    )}

                    {dataAssigned.length < 1 && (
                        <TouchableOpacity
                            style={styles.assignButton}
                            onPress={() => navigation.navigate('AssignGateActivity', { item: params.item })}
                        >
                            <Text style={styles.assignButtonText}>Assign Gate</Text>
                        </TouchableOpacity>
                    )}
                    
                    {/* ... Bagian Assign Helper Loading tetap sama ... */}
                    {dataAssigned && dataAssigned.length > 0 && (
                        <>
                            <Text style={styles.header}>List Assign Helper Loading</Text>
                            {dataAssignedLoading && dataAssignedLoading.length > 0 ? (
                                dataAssignedLoading.map((ag: any, index: number) => {
                                    const handleDeleteHelperLoading = () => {
                                        confirm.show("decline", "Are you sure you want to delete this assigned gate?", async () => {
                                            try {
                                                showLoadingDialog("Deleting...");
                                                await OutboundService.deleteAssignedLoadingHelper(ag.assigned_gate_id, ag.id);
                                                showDialog("success", "Assigned gate deleted!");
                                                fetchData();
                                            } catch (err) {
                                                showDialog("error", "Failed to delete assigned gate.");
                                            } finally {
                                                hideLoadingDialog();
                                            }
                                        }, false);
                                    };

                                    const handleEditHelper = () => {
                                        navigation.navigate('AssignGateLoading', {
                                            item: params.item,
                                            mode: "edit",
                                            assignedGate: ag, 
                                        });
                                    };

                                    return (
                                        <View key={ag.id} style={styles.compactCard}>
                                            <Text style={styles.indexNumber}>{index + 1}</Text>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.compactText}>
                                                    <Text style={styles.bold}>Full Name:</Text> {ag?.helper_name ?? "-"}
                                                </Text>
                                                <Text style={styles.compactText}>
                                                    <Text style={styles.bold}>Phone Number :</Text> {ag?.helper_phone ?? "-"}
                                                </Text>
                                            </View>
                                            <TouchableOpacity style={styles.actionButton} onPress={handleEditHelper}>
                                                <Icon name="edit" size={16} color="#007AFF" />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.actionButton} onPress={handleDeleteHelperLoading}>
                                                <Icon name="trash" size={16} color="red" />
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })
                            ) : (
                                <Text style={{ color: "#999", marginBottom: 12 }}>No assigned helper for loading</Text>
                            )}

                            <TouchableOpacity
                                style={styles.assignButton}
                                onPress={() => navigation.navigate('AssignGateLoading', { item: dataAssigned[0] })}
                            >
                                <Text style={styles.assignButtonText}>Assign Helper Loading</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    seal: {
        flex: 1,
        padding: 18,
        backgroundColor: "#F8F9FA",
    },
    header: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 16,
        marginTop: 10,
    },
    actionButton: {
        padding: 6,
        marginLeft: 6,
    },
    card: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 18,
        marginBottom: 20,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        marginBottom: 6,
        color: "#555",
    },
    input: {
        height: 45,
        borderWidth: 1,
        borderColor: "#DDD",
        borderRadius: 12,
        paddingHorizontal: 12,
        backgroundColor: "#FAFAFA",
    },
    error: {
        color: "red",
        marginTop: 4,
        fontSize: 12,
    },
    itemTitle: {
        fontSize: 13,
        color: "#999",
        marginTop: 10,
    },
    itemValue: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 6,
    },
    saveButton: {
        marginTop: 10,
        backgroundColor: "#4CAF50",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    saveButtonText: {
        color: "white",
        fontWeight: "600",
    },
    editButton: {
        marginTop: 15,
        backgroundColor: "#007AFF",
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: "center",
    },
    editButtonText: {
        color: "white",
        fontWeight: "600",
    },
    assignButton: {
        backgroundColor: "black",
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: "center",
        marginBottom: 20,
    },
    assignButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    compactCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        elevation: 2,
        marginBottom: 8,
    },
    compactText: {
        fontSize: 13,
        color: "#333",
        marginHorizontal: 4,
        flexShrink: 1,
    },
    bold: {
        fontWeight: "600",
    },
    indexNumber: {
        fontSize: 13,
        fontWeight: "700",
        marginRight: 6,
        color: "#000",
    }, 
    contentseal: {
        padding: 18,
        paddingBottom: 40,
        backgroundColor: "#F8F9FA",
        flexGrow: 1,
    },
    // --- Style Baru untuk Dropdown ---
    dropdownContainer: {
        position: 'absolute',
        top: 50, // Sesuaikan dengan tinggi Input
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        elevation: 5, // Android shadow
        shadowColor: "#000", // iOS shadow
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 1000,
        maxHeight: 200, // Batasi tinggi dropdown
    },
    dropdownScroll: {
        width: '100%',
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    dropdownText: {
        fontSize: 14,
        color: '#333',
    },
});