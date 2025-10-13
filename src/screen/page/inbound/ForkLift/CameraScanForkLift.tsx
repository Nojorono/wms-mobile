import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
} from "react-native";
import {
    Camera,
    useCameraDevice,
    useCameraPermission,
    useCodeScanner,
} from "react-native-vision-camera";
import { useRoute, useNavigation, CommonActions } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useDialogStore } from "../../../../store/useGlobalDialog";
import { ForkLiftParamList } from "../../../navigation/inbound/ForkLiftNavigator";
import InboundServices from "../../../../service/inboundServices";

type NavigationProp = StackNavigationProp<ForkLiftParamList, "ForkLiftMain">;

interface RouteParams {
    item: any;
}

const CameraScreenForkLift = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<NavigationProp>();
    const { item } = route.params as RouteParams;
    const showDialog = useDialogStore((state) => state.showDialog);

    const device = useCameraDevice("back");
    const { hasPermission, requestPermission } = useCameraPermission();

    const [manualInput, setManualInput] = useState("");
    const [matched, setMatched] = useState(false);

    const handleMatch = (value: string) => {
        if (!value.trim()) {
            setMatched(false);
            return;
        }

        const isMatched =
            value.trim().toUpperCase() === item.destinationBin.code.toUpperCase();

        setMatched(isMatched);

        if (isMatched) {
            console.log("✅ Destination Bin matched:", value);
        }
    };

    const codeScanner = useCodeScanner({
        codeTypes: ["qr", "ean-13"],
        onCodeScanned: (codes) => {
            const value = codes[0]?.value ?? "";
            if (value && value !== manualInput) {
                setManualInput(value);
                handleMatch(value);
            }
        },
    });

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
    }, [hasPermission]);

    if (!device) return <Text>Loading camera...</Text>;
    if (!hasPermission) return <Text>No camera permission</Text>;

    return (
        <View style={styles.container}>
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                codeScanner={codeScanner}
            />

            <View style={styles.overlay}>
                {/* Manual input tetap aktif */}
                <View style={styles.row}>
                    <TextInput
                        style={[
                            styles.input,
                            matched && { borderColor: "#22c55e", borderWidth: 2 },
                        ]}
                        placeholder="Input manual jika QR gagal"
                        value={manualInput}
                        onChangeText={(text) => {
                            setManualInput(text);
                            handleMatch(text);
                        }}
                    />
                </View>

                {/* Status match */}
                {matched ? (
                    <View style={styles.matchCard}>
                        <Text style={styles.matchText}>✅ Destination Bin Matched</Text>
                        <Text style={styles.matchSub}>{item.destinationBin.code}</Text>
                    </View>
                ) : (
                    <Text style={styles.notMatchText}>❌ Not matched yet</Text>
                )}

                {/* Tombol Next */}
                <TouchableOpacity
                    style={[styles.nextBtn, { backgroundColor: matched ? "#16a34a" : "#6b7280" }]}
                    onPress={async () => {
                        try {
                            await InboundServices.postForkLiftComplete(item.id)
                            navigation.dispatch(
                                CommonActions.reset({
                                    index: 0,
                                    routes: [{ name: "ForkLiftMain" }],
                                })
                            );
                        } catch (error) {
                            showDialog("error", "Error completing forklift task");
                        }
                    }}
                    disabled={!matched}
                >
                    <Text style={styles.btnText}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    overlay: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: 16,
    },
    row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    input: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
    },
    nextBtn: {
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 12,
    },
    btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
    matchCard: {
        backgroundColor: "rgba(34,197,94,0.15)",
        borderColor: "#22c55e",
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        alignItems: "center",
    },
    matchText: {
        color: "#22c55e",
        fontSize: 18,
        fontWeight: "bold",
    },
    matchSub: {
        color: "#fff",
        fontSize: 14,
        marginTop: 4,
    },
    notMatchText: {
        color: "#f87171",
        fontSize: 14,
        textAlign: "center",
    },
});

export default CameraScreenForkLift;
