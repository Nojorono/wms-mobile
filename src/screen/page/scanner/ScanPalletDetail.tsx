import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useAuthStore } from "../../../store/useAuthStore";
import ScannerService from "../../../service/palletServices";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ScannerParamList } from "../../navigation/scanner/ScannerNavigator";
import { useDialogStore } from "../../../store/useGlobalDialog";

type NavigationProp = StackNavigationProp<ScannerParamList, 'ScannerMain'>;

export default function EditItemForm({ route }: any) {
    const data = route.params.data;
    const { user } = useAuthStore();
    const userId = user?.id || "";
    const navigation = useNavigation<NavigationProp>();
    const showDialog = useDialogStore((state) => state.showDialog);
    const [isMovePallet, setIsMovePallet] = useState(false);
    const [loadingCheck, setLoadingCheck] = useState(false);
    const [palletInfo, setPalletInfo] = useState<any>(null);

    const { control, handleSubmit, getValues } = useForm({
        defaultValues: {
            item_name: data.item_name,
            uom: data.uom,
            week_number: String(data.week_number),
            current_quantity: String(data.current_quantity),
            pallet_destination: "",
        },
    });

    const checkPalletDestination = async (palletId: string) => {
        try {
            setLoadingCheck(true);
            setPalletInfo(null);

            // TODO: ganti dengan API kamu
            const response = await new Promise((resolve) =>
                setTimeout(
                    () =>
                        resolve({
                            pallet_id: palletId,
                            pallet_name: "PLT-002",
                            warehouse: "STG-JT-01",
                            current_item: "Box 20kg",
                            qty: 12,
                        }),
                    1500
                )
            );

            setPalletInfo(response);
        } catch (error: any) {
            showDialog('error', `Error submitting adjustment: ${error.data.message || ''}.`);
        } finally {
            setLoadingCheck(false);
        }
    };

    const onSubmit = async (values: any) => {
        const payload = {
            pallet_id: data.id,
            item_id: data.item_id,
            requested_quantity: Number(values.current_quantity),
            uom: values.uom,
            production_date: data.production_date,
            week_number: Number(values.week_number),
            reason: "Inventory correction due to physical count discrepancy",
            notes: "", // You can add a notes field in the form if needed
            requested_by: userId
            //   target_pallet_id: isMovePallet ? values.pallet_destination : null,
        };
        try {
            const res = await ScannerService.postPalletAdjustment(payload);
            if (res && res.success) {
                // Kembali ke halaman sebelumnya jika sukses
                navigation.goBack();
            }
        } catch (error: any) {
            showDialog('error', `Error submitting adjustment: ${error.data.message || ''}.`);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={{ padding: 20 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >

                {/* ITEM NAME */}
                <Text style={styles.label}>Item Name</Text>
                <Controller
                    control={control}
                    name="item_name"
                    render={({ field: { value, onChange } }) => (
                        <TextInput style={[styles.input, { backgroundColor: "#d0ccccff" }]} value={value} onChangeText={onChange} editable={false} />
                    )}
                />

                {/* UOM */}
                <Text style={styles.label}>UOM</Text>
                <Controller
                    control={control}
                    name="uom"
                    render={({ field: { value, onChange } }) => (
                        <TextInput style={[styles.input, { backgroundColor: "#d0ccccff" }]} value={value} onChangeText={onChange} editable={false} />
                    )}
                />

                {/* WEEK NUMBER */}
                <Text style={styles.label}>Week Number</Text>
                <Controller
                    control={control}
                    name="week_number"
                    render={({ field: { value, onChange } }) => (
                        <TextInput
                            style={[styles.input, { backgroundColor: "#d0ccccff" }]}
                            value={value}
                            onChangeText={onChange}
                            keyboardType="numeric"
                            editable={false}
                        />
                    )}
                />

                {/* CURRENT QUANTITY */}
                <Text style={styles.label}>Current Quantity</Text>
                <Controller
                    control={control}
                    name="current_quantity"
                    render={({ field: { value, onChange } }) => (
                        <TextInput
                            style={styles.input}
                            value={value}
                            onChangeText={onChange}
                            keyboardType="numeric"
                        />
                    )}
                />

                {/* SWITCH MOVE PALLET */}
                <Text style={[styles.label, { marginTop: 20 }]}>Pindah Pallet?</Text>
                <View style={styles.row}>
                    <TouchableOpacity
                        style={[styles.choiceBtn, isMovePallet && styles.choiceActive, { flexDirection: "row", alignItems: "center" }]}
                        onPress={() => setIsMovePallet(!isMovePallet)}
                    >
                        <View
                            style={{
                                width: 20,
                                height: 20,
                                borderRadius: 4,
                                borderWidth: 2,
                                borderColor: "#007AFF",
                                backgroundColor: isMovePallet ? "#007AFF" : "#fff",
                                marginRight: 10,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {isMovePallet && (
                                <View
                                    style={{
                                        width: 12,
                                        height: 12,
                                        backgroundColor: "#fff",
                                        borderRadius: 2,
                                    }}
                                />
                            )}
                        </View>
                        <Text style={styles.choiceText}>Ya, pindah pallet</Text>
                    </TouchableOpacity>
                </View>

                {/* IF MOVE PALLET */}
                {isMovePallet && (
                    <>
                        {/* INPUT PALLET DESTINATION */}
                        <Text style={styles.label}>Pallet Tujuan</Text>
                        <Controller
                            control={control}
                            name="pallet_destination"
                            rules={{ required: true }}
                            render={({ field: { value, onChange } }) => (
                                <TextInput
                                    style={styles.input}
                                    value={value}
                                    onChangeText={onChange}
                                    placeholder="Masukkan kode pallet tujuan"
                                />
                            )}
                        />

                        {/* CHECK PALLET BUTTON */}
                        <TouchableOpacity
                            style={styles.checkBtn}
                            onPress={() =>
                                checkPalletDestination(getValues("pallet_destination"))
                            }
                        >
                            {loadingCheck ? (
                                <ActivityIndicator color={"white"} />
                            ) : (
                                <Text style={styles.checkText}>Check Pallet</Text>
                            )}
                        </TouchableOpacity>

                        {/* PALLET INFO */}
                        {palletInfo && (
                            <View style={styles.infoBox}>
                                <Text style={styles.infoTitle}>Pallet Found:</Text>
                                <Text>Pallet ID: {palletInfo.pallet_id}</Text>
                                <Text>Name: {palletInfo.pallet_name}</Text>
                                <Text>Warehouse: {palletInfo.warehouse}</Text>
                                <Text>Item: {palletInfo.current_item}</Text>
                                <Text>Qty: {palletInfo.qty}</Text>
                            </View>
                        )}
                    </>
                )}

                {/* SUBMIT BUTTON */}
                <TouchableOpacity style={styles.btn} onPress={handleSubmit(onSubmit)}>
                    <Text style={styles.btnText}>Save Changes</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
    label: { fontSize: 14, marginTop: 10 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 8,
        marginTop: 5,
    },
    row: { flexDirection: "row", gap: 10, marginTop: 10 },
    choiceBtn: {
        backgroundColor: "#555555ff",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#aaa",
    },
    choiceActive: { backgroundColor: "#007AFF" },
    choiceText: { color: "white", fontWeight: "bold" },
    checkBtn: {
        backgroundColor: "#FF9500",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    checkText: { color: "white", fontWeight: "bold" },
    infoBox: {
        marginTop: 15,
        padding: 15,
        borderRadius: 10,
        backgroundColor: "#f0f0f0",
    },
    infoTitle: { fontWeight: "bold", marginBottom: 5 },
    btn: {
        marginTop: 25,
        backgroundColor: "#007AFF",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    btnText: { color: "white", fontWeight: "bold" },
});
