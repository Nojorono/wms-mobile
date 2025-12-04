import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Alert,
    Keyboard,
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
    const [useCamera, setUseCamera] = useState(true);

    const inputRef = useRef<TextInput>(null);

    // ✅ Fungsi untuk cek match
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

    // ✅ Scanner VisionCamera
    // const codeScanner = useCodeScanner({
    //     codeTypes: ["qr", "ean-13", "code-128", "code-39"],
    //     onCodeScanned: (codes) => {
    //         const value = codes[0]?.value ?? "";
    //         if (value && value !== manualInput) {
    //             setManualInput(value);
    //             handleMatch(value);
    //         }
    //     },
    // });
    const [isProcessing, setIsProcessing] = useState(false);

    const codeScanner = useCodeScanner({
        codeTypes: ["qr", "code-128", "ean-13"],
        onCodeScanned: (codes) => {
            const val = codes[0]?.value ?? "";

            if (val && !isProcessing && val !== manualInput) {
                setIsProcessing(true);
                setManualInput(val);
                handleMatch(val);

                // Reset after 2 seconds
                setTimeout(() => {
                    setIsProcessing(false);
                }, 5000);
            }
        },
    })

    // ✅ Minta izin kamera
    useEffect(() => {
        if (!hasPermission) requestPermission();
    }, [hasPermission]);

    // ✅ Fokus ke TextInput jika pakai hardware scanner
    useEffect(() => {
        const focusInput = () => inputRef.current?.focus();

        const hideSub = Keyboard.addListener("keyboardDidHide", focusInput);
        focusInput(); // fokus awal

        return () => hideSub.remove();
    }, []);

    // ✅ Saat user tekan enter di scanner
    const handleSubmitEditing = () => {
        handleMatch(manualInput);
    };

    // ✅ Tombol Next
    const handleNext = async () => {
        try {
            await InboundServices.postForkLiftComplete(item.id);
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: "ForkLiftMain" }],
                })
            );
        } catch (error) {
            showDialog("error", "Error completing forklift task");
        }
    };

    // ✅ Jika kamera belum siap
    if (useCamera && (!device || !hasPermission)) {
        return (
            <View style={styles.loadingView}>
                <Text style={{ color: "#fff" }}>
                    Waiting for camera permission or device...
                </Text>
                <TouchableOpacity
                    onPress={() => setUseCamera(false)}
                    style={[styles.switchBtn, { backgroundColor: "#FF6B00" }]}
                >
                    <Text style={styles.btnText}>Use Hardware Scanner Instead</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* ✅ Mode Kamera */}
            {useCamera && (
                <Camera
                    style={StyleSheet.absoluteFill}
                    device={device!}
                    isActive={true}
                    codeScanner={codeScanner}
                />
            )}

            {/* ✅ Mode Input Manual / Scanner */}
            <View style={styles.overlay}>
                {/* Input Text untuk scanner fisik */}
                <TextInput
                    ref={inputRef}
                    value={manualInput}
                    onChangeText={(text) => {
                        setManualInput(text);
                        handleMatch(text);
                    }}
                    onSubmitEditing={handleSubmitEditing}
                    blurOnSubmit={false}
                    autoFocus
                    placeholder="Scan atau input manual kode bin..."
                    style={[
                        styles.input,
                        matched && { borderColor: "#22c55e", borderWidth: 2 },
                    ]}
                />

                {/* Tombol Ganti Mode */}
                <TouchableOpacity
                    onPress={() => setUseCamera((prev) => !prev)}
                    style={[
                        styles.switchBtn,
                        { backgroundColor: useCamera ? "#6b7280" : "#FF6B00" },
                    ]}
                >
                    <Text style={styles.btnText}>
                        {useCamera ? "Use Hardware Scanner" : "Use Camera Scanner"}
                    </Text>
                </TouchableOpacity>

                {/* Status */}
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
                    style={[
                        styles.nextBtn,
                        { backgroundColor: matched ? "#16a34a" : "#6b7280" },
                    ]}
                    onPress={handleNext}
                    disabled={!matched}
                >
                    <Text style={styles.btnText}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default CameraScreenForkLift;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    loadingView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
    },
    overlay: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: 16,
    },
    input: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        marginBottom: 12,
    },
    switchBtn: {
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 10,
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
    matchText: { color: "#22c55e", fontSize: 18, fontWeight: "bold" },
    matchSub: { color: "#fff", fontSize: 14, marginTop: 4 },
    notMatchText: {
        color: "#f87171",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 6,
    },
});
