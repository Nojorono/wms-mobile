import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    RefreshControl,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import OutboundService from "../../../../service/outboundService";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useLoadingDialogStore } from "../../../../store/useLoadingStore";
import { useDialogStore } from "../../../../store/useGlobalDialog";
import { AssignGateParamList } from "../../../navigation/outbound/AssignGateNavigator";
import { StackNavigationProp } from "@react-navigation/stack";

interface Payload {
    expedition: string;
    license_plate: string;
    driver_name: string;
    driver_phone: string;
}
type NavigationProp = StackNavigationProp<AssignGateParamList, 'AssignGateMain'>;

export default function AssignGateVehicle() {
    const [data, setData] = useState<Payload | null>(null);
    const [isEdit, setIsEdit] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const route = useRoute();
    const showDialog = useDialogStore((state) => state.showDialog);
    const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
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
        const response = await OutboundService.getOutboundDetailById(params.item.id);

        const newData = {
            expedition: response?.data?.expedition ?? "",
            license_plate: response?.data?.license_plate ?? "",
            driver_name: response?.data?.driver_name ?? "",
            driver_phone: response?.data?.driver_phone ?? "",
        };

        setData(newData);

        // Reset form biar input terisi otomatis
        reset(newData);
    }

    useEffect(() => {
        fetchData();
    }, []);

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
            console.log("Submitting values:", values);
            const response = await OutboundService.updateOutboundDoVehicleInfo(params.item.id, values);
            console.log("Update response:", response);

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
            style={styles.container}
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

                    <TouchableOpacity style={styles.assignButton}  onPress={() => navigation.navigate('AssignGateActivity', { item: params.item})}>
                        <Text style={styles.assignButtonText}>Assign Gate</Text>
                    </TouchableOpacity>
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
    }
});
