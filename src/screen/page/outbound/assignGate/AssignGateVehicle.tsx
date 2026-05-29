import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    RefreshControl,
    Keyboard,
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
import { Dropdown } from "react-native-element-dropdown";

interface Payload {
    expedition: string;
    vendor_id?: string | null;
    delivery_category?: string;
    type_calculation?: string;
    qty_utilitas?: number;
    truck_utilitas?: string;
    vendor_po_number?: string;
    license_plate: string;
    driver_name: string;
    driver_phone: string;
    container_number?: string;
}

type NavigationProp = StackNavigationProp<AssignGateParamList, 'AssignGateMain'>;

// Map string array ke format object {label, value} untuk Dropdown
const DELIVERY_CATEGORIES = [
    { label: "Ekspedisi External", value: "Ekspedisi External" },
    { label: "Expedisi Internal", value: "Expedisi Internal" },
    { label: "Expedisi Vendor", value: "Expedisi Vendor" }
];

export default function AssignGateVehicle() {
    const [data, setData] = useState<Payload | null>(null);
    const [dataAssigned, setDataAssigned] = useState<any>(null);
    const [dataAssignedLoading, setDataAssignedLoading] = useState<any>(null);

    // Dropdown States
    const [dataVendor, setDataVendor] = useState<any[]>([]);
    const [truckOptions, setTruckOptions] = useState<any[]>([]);
    const [poOptions, setPoOptions] = useState<any[]>([]);

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
        setValue,
        watch,
        formState: { errors }
    } = useForm<Payload>({
        defaultValues: {
            delivery_category: "",
            expedition: "",
            vendor_id: null,
            truck_utilitas: "",
            qty_utilitas: 0,
            type_calculation: "",
            license_plate: "",
            driver_name: "",
            driver_phone: "",
            container_number: "",
            vendor_po_number: "",
        }
    });

    const deliveryCategory = watch("delivery_category");
    const isExternal = deliveryCategory === "Ekspedisi External";

    // --- Efek Logika Delivery Category ---
    useEffect(() => {
        if (deliveryCategory === "Expedisi Internal" || deliveryCategory === "Expedisi Vendor") {
            setValue("expedition", "-1");
            setValue("vendor_id", "-1");
            setValue("vendor_po_number", "");
            setValue("type_calculation", "");
        } else if (deliveryCategory === "Ekspedisi External") {
            // setValue("expedition", ""); // Opsional: Reset jika kategori kembali ke Eksternal
        }
    }, [deliveryCategory, setValue]);

    async function fetchData() {
        try {
            showLoadingDialog("Loading...");
            const response = await OutboundService.getOutboundDetailById(params.item.id);
            const assignedGate = await OutboundService.getAssignedGateByDoId(params.item.id);
            const resVendor = await ConstantService.getSuppliers();
            const truckUtilitas = await ConstantService.getTruckUtilitas();

            // Format truck options menjadi { label, value } jika datanya string
            const formattedTrucks = truckUtilitas.data.data.map((item: any) => ({
                label: item.ITEM_DESCRIPTION,
                value: item.ITEM_DESCRIPTION
            }));
            setTruckOptions(formattedTrucks);

            if (assignedGate.data.length > 0) {
                const assignedLoading = await OutboundService.getAssignedLoadingByDoId(assignedGate.data[0].id);
                setDataAssignedLoading(assignedLoading.data);
            }
            setDataAssigned(assignedGate.data);
            setDataVendor(resVendor.data || []);

            const newData = {
                delivery_category: response?.data?.delivery_category ?? "",
                expedition: response?.data?.expedition ?? "",
                vendor_id: response?.data?.vendor_id ?? null,
                truck_utilitas: response?.data?.truck_utilitas ?? "",
                qty_utilitas: response?.data?.qty_utilitas?.toString() ?? "",
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
            const payload = {
                ...values,
                qty_utilitas: Number(values.qty_utilitas),
            };
            console.log("Submitting payload:", payload);
            const response = await OutboundService.updateOutboundDoVehicleInfo(params.item.id, payload);
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

    // --- Logic Select Expedition ---
    const handleSelectVendor = async (item: any) => {
        setValue("expedition", item.VENDOR_NAME);
        setValue("vendor_id", item.VENDOR_ID.toString());
        setValue("vendor_po_number", ""); // Reset PO jika vendor berubah
        Keyboard.dismiss();

        try {
            // Hit API ConstantService untuk mengambil data PO Lines. 
            const response: any = await ConstantService.getPoLines(item.VENDOR_ID.toString());

            // Format data agar mudah dibaca oleh react-native-element-dropdown
            const formattedPo = response.data.length === 0
                ? [{
                    displayLabel: "PO tidak ditemukan",
                    stringValue: "po_data_not_found"
                }]
                : response.data.map((po: any) => ({
                    ...po,
                    displayLabel: `${po.ITEM_DESCRIPTION}`,
                    stringValue: po.PO_LINE_ID.toString()
                }));

            setPoOptions(formattedPo);
        } catch (error) {
            console.log("Error Fetching PO:", error);
        }
    };

    // --- Render Components ---

    // Komponen Pembungkus Dropdown (Lebih Rapi & Universal)
    interface FormDropdownProps {
        name: keyof Payload;
        label: string;
        data: any[];
        labelField: string;
        valueField: string;
        placeholder: string;
        search?: boolean;
        searchPlaceholder?: string;
        onChangeCustom?: (item: any) => void;
    }
    const FormDropdown = ({
        name, label, data, labelField, valueField, placeholder, search = false, searchPlaceholder, onChangeCustom
    }: FormDropdownProps) => (
        <View style={{ marginBottom: 16 }}>
            <Text style={styles.label}>{label}</Text>
            <Controller
                control={control}
                name={name}
                rules={{ required: `${label} wajib diisi` }}
                render={({ field: { value, onChange } }) => (
                    <Dropdown
                        style={[styles.dropdownSelect, errors[name] && { borderColor: 'red' }]}
                        containerStyle={styles.dropdownPopup}
                        data={data}
                        search={search}
                        labelField={labelField}
                        valueField={valueField}
                        placeholder={placeholder}
                        searchPlaceholder={searchPlaceholder || "Search..."}
                        value={value}
                        onChange={(item) => {
                            onChange(item[valueField]);
                            if (onChangeCustom) onChangeCustom(item);
                        }}
                    />
                )}
            />
            {errors[name] && <Text style={styles.error}>{errors[name]?.message}</Text>}
        </View>
    );

    const renderInput = (label: string, name: keyof Payload, placeholder: string) => (
        <View style={{ marginBottom: 16 }}>
            <Text style={styles.label}>{label}</Text>
            <Controller
                control={control}
                name={name}
                rules={{
                    required: `${label} wajib diisi`,
                    ...(name === "driver_phone" && {
                        minLength: { value: 10, message: "Minimum 10 digit" },
                        pattern: { value: /^\d+$/, message: "Only numbers are allowed" }
                    }),
                    ...(name === "qty_utilitas" && {
                        pattern: { value: /^\d+$/, message: "Only numbers are allowed" },
                        max: { value: 100, message: "Maximum value is 100" }
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
                        keyboardType={(name === "driver_phone" || name === "qty_utilitas") ? "numeric" : "default"}
                    />
                )}
            />
            {errors[name] && <Text style={styles.error}>{errors[name]?.message}</Text>}
        </View>
    );

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.contentseal}
            keyboardShouldPersistTaps="handled"
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <Text style={styles.header}>Driver & Vehicle Information</Text>

            {!data || isEdit ? (
                <View style={styles.card}>

                    <FormDropdown
                        name="delivery_category"
                        label="Delivery Category"
                        data={DELIVERY_CATEGORIES}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Delivery Category"
                    />

                    {isExternal && (
                        <>
                            <FormDropdown
                                name="expedition"
                                label="Expedition"
                                data={dataVendor}
                                search={true}
                                labelField="VENDOR_NAME"
                                valueField="VENDOR_NAME"
                                placeholder="Select Ekspedisi"
                                searchPlaceholder="Search Ekspedisi..."
                                onChangeCustom={handleSelectVendor}
                            />

                            <FormDropdown
                                name="vendor_po_number"
                                label="Vendor PO Number"
                                data={poOptions}
                                search={true}
                                labelField="displayLabel"
                                valueField="stringValue"
                                placeholder="Select Vendor PO Number"
                                searchPlaceholder="Search PO..."
                            />
                        </>
                    )}

                    <FormDropdown
                        name="truck_utilitas"
                        label="Truck Utilitas"
                        data={truckOptions}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Truck Utilitas"
                    />

                    {renderInput("Qty Utilitas", "qty_utilitas", "Maximal: 100")}
                    {renderInput("License Plate", "license_plate", "Example: B1234ABC")}
                    {renderInput("Driver Name", "driver_name", "Example: John Doe")}
                    {renderInput("Driver Phone", "driver_phone", "Example: 081234567890")}
                    {renderInput("Container Number", "container_number", "Example: C099372")}

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
                    {/* Mode Detail View */}
                    <View style={styles.card}>
                        <Text style={styles.itemTitle}>Delivery Category</Text>
                        <Text style={styles.itemValue}>{data.delivery_category || "-"}</Text>

                        <Text style={styles.itemTitle}>Truck Utilitas</Text>
                        <Text style={styles.itemValue}>{data.truck_utilitas || "-"}</Text>

                        <Text style={styles.itemTitle}>Qty Utilitas</Text>
                        <Text style={styles.itemValue}>{data.qty_utilitas || "-"}</Text>

                        {data.delivery_category === "Ekspedisi External" && (
                            <>
                                <Text style={styles.itemTitle}>Vendor PO Number</Text>
                                <Text style={styles.itemValue}>{data.vendor_po_number || "-"}</Text>

                                <Text style={styles.itemTitle}>Expedition</Text>
                                <Text style={styles.itemValue}>{data.expedition}</Text>
                            </>
                        )}

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

                    {/* Section Assign Gate */}
                    <Text style={styles.header}>List Assign Gate</Text>
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
                                            <Text style={styles.bold}>Gate:</Text> {ag.gate?.code ?? "-"}
                                        </Text>
                                        <Text style={styles.compactText}>
                                            <Text style={styles.bold}>Full Name:</Text> {latestUser?.user_name ?? "-"}
                                        </Text>
                                        <Text style={styles.compactText}>
                                            <Text style={styles.bold}>Username :</Text> {latestUser?.user?.username ?? "-"}
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

                    {dataAssigned?.length < 1 && (
                        <TouchableOpacity
                            style={styles.assignButton}
                            onPress={() => navigation.navigate('AssignGateActivity', { item: params.item })}
                        >
                            <Text style={styles.assignButtonText}>Assign Gate</Text>
                        </TouchableOpacity>
                    )}

                    {/* Section Assign Helper */}
                    {dataAssigned && dataAssigned.length > 0 && (
                        <>
                            <Text style={styles.header}>List Assign Helper Loading</Text>
                            {dataAssignedLoading && dataAssignedLoading.length > 0 ? (
                                dataAssignedLoading.map((ag: any, index: number) => {
                                    const handleDeleteHelperLoading = () => {
                                        confirm.show("decline", "Are you sure you want to delete this assigned helper?", async () => {
                                            try {
                                                showLoadingDialog("Deleting...");
                                                await OutboundService.deleteAssignedLoadingHelper(ag.assigned_gate_id, ag.id);
                                                showDialog("success", "Assigned helper deleted!");
                                                fetchData();
                                            } catch (err) {
                                                showDialog("error", "Failed to delete assigned helper.");
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
    contentseal: {
        padding: 18,
        paddingBottom: 40,
        backgroundColor: "#F8F9FA",
        flexGrow: 1,
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
    // Tambahan Style Khusus Dropdown
    dropdownSelect: {
        height: 45,
        borderWidth: 1,
        borderColor: "#DDD",
        borderRadius: 12,
        paddingHorizontal: 12,
        backgroundColor: "#FAFAFA",
    },
    dropdownPopup: {
        borderRadius: 12,
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
    }
});