import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    RefreshControl,
} from "react-native";
import { useForm, Controller, set } from "react-hook-form";
import OutboundService from "../../../../service/outboundService";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useLoadingDialogStore } from "../../../../store/useLoadingStore";
import { useDialogStore } from "../../../../store/useGlobalDialog";
import { AssignGateParamList } from "../../../navigation/outbound/AssignGateNavigator";
import { StackNavigationProp } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useConfirmationStore } from "../../../../store/useConfirmationStore";

interface Payload {
    expedition: string;
    license_plate: string;
    driver_name: string;
    driver_phone: string;
}
type NavigationProp = StackNavigationProp<AssignGateParamList, 'AssignGateMain'>;

export default function AssignGateVehicle() {
    const [data, setData] = useState<Payload | null>(null);
    const [dataAssigned, setDataAssigned] = useState<any>(null);
    const [dataAssignedLoading, setDataAssignedLoading] = useState<any>(null);
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
        formState: { errors }
    } = useForm<Payload>({
        defaultValues: {
            expedition: "",
            license_plate: "",
            driver_name: "",
            driver_phone: "",
        }
    });

    async function fetchData() {
        try {
            showLoadingDialog("Loading...");
            const response = await OutboundService.getOutboundDetailById(params.item.id);
            const assignedGate = await OutboundService.getAssignedGateByDoId(params.item.id);
            const assignedLoading = await OutboundService.getAssignedLoadingByDoId(assignedGate.data[0].id);
            setDataAssigned(assignedGate.data);
            setDataAssignedLoading(assignedLoading.data);

            const newData = {
            expedition: response?.data?.expedition ?? "",
            license_plate: response?.data?.license_plate ?? "",
            driver_name: response?.data?.driver_name ?? "",
            driver_phone: response?.data?.driver_phone ?? "",
            };

            setData(newData);

            // Reset form biar input terisi otomatis
            reset(newData);
        } catch (error) {
            showDialog("error", "Gagal mengambil data kendaraan dan assigned gate.");
        } finally {
            hideLoadingDialog();
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );


    // Refresh control
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
            const response = await OutboundService.updateOutboundDoVehicleInfo(params.item.id, values);
            showDialog("success", "Vehicle information updated successfully!");
            await fetchData();
            setIsEdit(false);
        } catch (error) {
            showDialog("error", "Failed to update vehicle information.");
        } finally {
            hideLoadingDialog();
        }
    };

    const renderInput = (label: string, name: keyof Payload, placeholder: string) => (
        <View style={{ marginBottom: 16 }}>
            <Text style={styles.label}>{label}</Text>
            <Controller
                control={control}
                name={name}
                rules={{ required: `${label} wajib diisi` }}
                render={({ field: { onChange, value } }) => (
                    <TextInput
                        placeholder={placeholder}
                        style={[
                            styles.input,
                            errors[name] ? { borderColor: "red" } : {}
                        ]}
                        value={value}
                        onChangeText={onChange}
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
            style={styles.contentContainer}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <Text style={styles.header}>Driver & Vehicle Information</Text>

            {!data || isEdit ? (
                <View style={styles.card}>
                    {renderInput("Expedition", "expedition", "Contoh: JNE Express")}
                    {renderInput("License Plate", "license_plate", "Contoh: B1234ABC")}
                    {renderInput("Driver Name", "driver_name", "Contoh: John Doe")}
                    {renderInput("Driver Phone", "driver_phone", "Contoh: 081234567890")}

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSubmit(onSubmit)}
                    >
                        <Text style={styles.saveButtonText}>
                            {data ? "Simpan Perubahan" : "Simpan Data"}
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <View style={styles.card}>
                        <Text style={styles.itemTitle}>Expedition</Text>
                        <Text style={styles.itemValue}>{data.expedition}</Text>

                        <Text style={styles.itemTitle}>License Plate</Text>
                        <Text style={styles.itemValue}>{data.license_plate}</Text>

                        <Text style={styles.itemTitle}>Driver Name</Text>
                        <Text style={styles.itemValue}>{data.driver_name}</Text>

                        <Text style={styles.itemTitle}>Driver Phone</Text>
                        <Text style={styles.itemValue}>{data.driver_phone}</Text>

                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => {
                                setIsEdit(true);
                                reset(data); // pastikan form terisi saat edit
                            }}
                        >
                            <Text style={styles.editButtonText}>Edit Data</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.header}>List Assign Gate</Text>

                    {dataAssigned && dataAssigned.length > 0 ? (
                        dataAssigned.map((ag: any, index: number) => {
                            const sortedUsers = [...(ag.assigned_gate_users ?? [])].sort(
                                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                            );
                            const latestUser = sortedUsers[0];

                            const pallets = (ag.assigned_gate_pallets ?? []).map(
                                (p: any) => p?.pallet?.pallet_code
                            );

                            const handleDelete = () => {
                                confirm.show("decline", "Yakin ingin menghapus assigned gate ini ?", async () => {
                                    try {
                                        showLoadingDialog("Deleting...");
                                        const res = await OutboundService.deleteAssignedGate(ag.id);
                                        showDialog("success", "Assigned gate deleted!");
                                        fetchData();
                                    } catch (err) {
                                        showDialog("error", "Failed to delete assigned gate.");
                                    } finally {
                                        hideLoadingDialog();
                                    }
                                }, false
                                );
                            };

                            const handleEdit = () => {
                                navigation.navigate('AssignGateActivity', {
                                    item: params.item,
                                    mode: "edit",
                                    assignedGate: ag,   // kirim data lengkap
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
                                            <Text style={styles.bold}>User:</Text> {latestUser?.user_name ?? "-"}
                                        </Text>

                                        <Text style={styles.compactText}>
                                            <Text style={styles.bold}>Device :</Text>{" "}
                                            {/* {pallets.length > 0 ? pallets.join(", ") : "-"} */}
                                            {latestUser?.user.username ?? "-"}
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
                        <Text style={{ color: "#999", marginBottom: 12 }}>Belum ada assign gate</Text>
                    )}

                   {dataAssigned.length < 1 && (
                        <TouchableOpacity
                            style={styles.assignButton}
                            onPress={() => navigation.navigate('AssignGateActivity', { item: params.item })}
                        >
                            <Text style={styles.assignButtonText}>Assign Gate</Text>
                        </TouchableOpacity>
                    )}


                    <Text style={styles.header}>List Assign Loading</Text>

                    {dataAssignedLoading && dataAssignedLoading.length > 0 ? (
                        dataAssignedLoading.map((ag: any, index: number) => {
                            console.log("Assigned Gate Loading:", ag);



                            const handleDeleteHelperLoading = () => {
                                confirm.show("decline", "Yakin ingin menghapus assigned gate ini ?", async () => {
                                    try {
                                        showLoadingDialog("Deleting...");
                                        const res = await OutboundService.deleteAssignedLoadingHelper(ag.assigned_gate_id, ag.id);
                                        showDialog("success", "Assigned gate deleted!");
                                        fetchData();
                                    } catch (err) {
                                        showDialog("error", "Failed to delete assigned gate.");
                                    } finally {
                                        hideLoadingDialog();
                                    }
                                }, false
                                );
                            };

                            const handleEdit = () => {
                                console.log("Navigating to edit assigned loading:", ag);
                                navigation.navigate('AssignGateLoading', {
                                    item: params.item,
                                    mode: "edit",
                                    assignedGate: ag,   // kirim data lengkap
                                });
                            };

                            return (
                                <View key={ag.id} style={styles.compactCard}>
                                    <Text style={styles.indexNumber}>{index + 1}</Text>

                                    <View style={{ flex: 1 }}>
                                
                                        <Text style={styles.compactText}>
                                            <Text style={styles.bold}>User:</Text> {ag?.helper_name ?? "-"}
                                        </Text>

                                        <Text style={styles.compactText}>
                                            <Text style={styles.bold}>Device :</Text>{" "}
                                            {ag?.helper_phone ?? "-"}
                                        </Text>
                                    </View>

                                    
                                    <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
                                        <Icon name="edit" size={16} color="#007AFF" />
                                    </TouchableOpacity>

                                   
                                    <TouchableOpacity style={styles.actionButton} onPress={handleDeleteHelperLoading}>
                                        <Icon name="trash" size={16} color="red" />
                                    </TouchableOpacity>
                                </View>
                            );
                        })
                    ) : (
                        <Text style={{ color: "#999", marginBottom: 12 }}>Belum ada assign helper untuk loading</Text>
                    )}

                   {/* {dataAssigned.length < 0 && ( */}
                        <TouchableOpacity
                            style={styles.assignButton}
                            onPress={() => navigation.navigate('AssignGateLoading', { item: dataAssigned[0] })}
                        >
                            <Text style={styles.assignButtonText}>Assign Loading</Text>
                        </TouchableOpacity>
                    {/* )} */}
                </>

                
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 18,
        backgroundColor: "#F8F9FA",
    },
    header: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 16,
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
        flexWrap: "wrap",
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
    divider: {
        marginHorizontal: 6,
        color: "#999",
    },
    assignedHeader: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 6,
    },
    indexNumber: {
        fontSize: 13,
        fontWeight: "700",
        marginRight: 6,
        color: "#000",
    },contentContainer: {
  padding: 18,
  paddingBottom: 40, // 🔴 INI PENTING supaya button tidak kepotong
  backgroundColor: "#F8F9FA",
  flexGrow: 1,       // 🔴 WAJIB untuk scroll penuh
},


});
