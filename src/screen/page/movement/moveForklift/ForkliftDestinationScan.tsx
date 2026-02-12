import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    StatusBar,
    ScrollView,
    TextInput,
    Keyboard,
    Alert,
} from 'react-native';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from 'react-native-vision-camera';
import { StackNavigationProp } from '@react-navigation/stack';
import { ForkliftMovementParamList } from '../../../navigation/movement/ForkliftMovementNavigator';
import MovementService from '../../../../service/movementService';

type NavigationProp = StackNavigationProp<ForkliftMovementParamList, 'ForkliftMovementMain'>;

const ForkliftDestination = () => {
    const route = useRoute();
    const navigation = useNavigation<NavigationProp>();
    const payload = route.params as any;
    const item = payload.item; // Objek movement utama
    const pallets = payload.pallet; // Objek pallet yang dipilih

    console.log("ForkliftDestination payload:", payload);


    // --- State Management ---
    const [manualInput, setManualInput] = useState('');
    const [matched, setMatched] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [useCamera, setUseCamera] = useState(false);
    const inputRef = useRef<TextInput>(null);

    // --- Camera Hooks ---
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('back');

    // --- Logic: Handle Matching ---
    const handleMatch = (value: string) => {
        if (!value.trim()) {
            setMatched(false);
            return;
        }

        // Bandingkan dengan destinationBin.code dari payload
        const targetBin = item.destinationBin?.code?.toUpperCase() || "";
        const isMatched = value.trim().toUpperCase() === targetBin;

        setMatched(isMatched);

        if (isMatched) {
            console.log("✅ Destination Bin matched:", value);
            Keyboard.dismiss();
        }
    };

    // --- Logic: Scanner Hook ---
    const codeScanner = useCodeScanner({
        codeTypes: ["qr", "code-128", "ean-13"],
        onCodeScanned: (codes) => {
            const val = codes[0]?.value ?? "";
            if (val && !isProcessing && val !== manualInput) {
                setIsProcessing(true);
                setManualInput(val);
                handleMatch(val);

                // Delay agar tidak scan berkali-kali secara instan
                setTimeout(() => setIsProcessing(false), 2000);
            }
        },
    });

    // --- Effects ---
    useEffect(() => {
        if (useCamera && !hasPermission) requestPermission();
    }, [useCamera, hasPermission]);

    useEffect(() => {
        // Auto focus input untuk hardware scanner jika tidak pakai kamera
        if (!useCamera) {
            const focusInput = () => inputRef.current?.focus();
            const hideSub = Keyboard.addListener("keyboardDidHide", focusInput);
            focusInput();
            return () => hideSub.remove();
        }
    }, [useCamera]);

    // --- Action: Final Submit ---
    const handleNext = async () => {
        try {
            // Ambil data pallet pertama (asumsi hanya satu pallet per movement)
            const palletItem = item.pallets[0];

            const payloadSubmit = {
                inventory_movement_id: item.id,
                pallet_id: palletItem.pallet_id,
                inventory_tracking_id: palletItem.inventory_tracking_id,
                destination_warehouse_id: item.destination_warehouse_id,
                destination_warehouse_sub_id: item.destination_warehouse_sub_id,
                destination_bin_id: item.destination_bin_id,
            };

            console.log("Submitting payload:", payloadSubmit);
            const response = await MovementService.postForkliftMovement(payloadSubmit);
            console.log("Response:", response);
            Alert.alert("Success", "Movement completed successfully");
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: "ForkliftMovementMain" }],
                })
            );
        } catch (error) {
            Alert.alert("Error", "Failed to complete task");
        }
    };

    // --- Components ---
    const SummaryCard = () => (
        <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Move Location ID</Text>
            <View style={styles.idRow}>
                <Icon name="package-variant-closed" size={20} color="#1A1A1A" />
                <Text style={styles.idText}>{item.movement_number}</Text>
            </View>
            <View style={styles.destInfo}>
                <Text style={styles.destLabel}>Target Bin:</Text>
                <Text style={styles.destValue}>{item.destinationBin?.code || "N/A"}</Text>
            </View>
        </View>
    );

    const renderPalletItem = ({ item }: { item: any }) => (
        // console.log("Rendering pallet item:", palletItem),
        <View style={styles.card}>
            <View style={styles.cardRow}>
                <View style={styles.iconContainer}>
                    <Icon name="forklift" size={28} color="#1A1A1A" />
                </View>
                <View style={styles.detailsContainer}>
                    <Text style={styles.palletCode}>{item.pallet.pallet_code}</Text>
                    {/* <Text style={styles.labelSource}>Loc: {item.destinationWarehouseSub.name}</Text> */}
                </View>
                <View style={styles.destinationContainer}>
                    <View style={styles.qtyRow}>
                        <Text style={styles.qtyText}>
                            {item.pallet.currentQuantity} {item.pallet.uom}
                        </Text>
                        <Icon name="check-circle" size={20} color={matched ? "#27AE60" : "#CED4DA"} style={{ marginLeft: 4 }} />
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Camera View (Hanya muncul jika mode kamera aktif) */}
            {useCamera && device && hasPermission && (
                <View style={styles.cameraContainer}>
                    <Camera
                        style={StyleSheet.absoluteFill}
                        device={device}
                        isActive={true}
                        codeScanner={codeScanner}
                    />
                    <View style={styles.cameraOverlay}>
                        <View style={styles.scanTarget} />
                    </View>
                </View>
            )}

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <SummaryCard />

                <Text style={styles.sectionHeader}>Pallets in this movement</Text>
                {/* 
                <FlatList
                    data={item.pallets}
                    renderItem={renderPalletItem}
                    keyExtractor={(item) => item.id.toString()}
                    scrollEnabled={false}
                /> */}

                <View style={{ marginBottom: 12 }}>
                    {renderPalletItem({ item: pallets })}
                </View>

                {/* Input & Scanner Control Section */}
                <View style={styles.scannerSection}>
                    <TextInput
                        ref={inputRef}
                        value={manualInput}
                        onChangeText={(text) => {
                            setManualInput(text);
                            handleMatch(text);
                        }}
                        placeholder="Scan or type Bin Code..."
                        style={[
                            styles.input,
                            matched && { borderColor: "#22c55e", borderWidth: 2 },
                        ]}
                    />

                    <TouchableOpacity
                        onPress={() => setUseCamera(!useCamera)}
                        style={[styles.switchBtn, { backgroundColor: useCamera ? "#6c757d" : "#FF6B00" }]}
                    >
                        <Icon name={useCamera ? "barcode-scan" : "camera"} size={20} color="#FFF" />
                        <Text style={styles.btnText}>
                            {useCamera ? " Use Hardware Scanner" : " Use Camera Scanner"}
                        </Text>
                    </TouchableOpacity>
                </View>



                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom Match Indicator & Next Button */}
            <View style={styles.footer}>
                {matched ? (
                    <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                        <Text style={styles.btnTextLarge}>COMPLETE MOVEMENT</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.waitingBadge}>
                        <Text style={styles.waitingText}>Waiting for Bin Match...</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    scrollContent: { paddingHorizontal: 20, paddingTop: 10 },

    // Camera
    cameraContainer: { height: 200, marginBottom: 15, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000' },
    cameraOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
    scanTarget: { width: 150, height: 100, borderWidth: 2, borderColor: '#FF6B00', borderRadius: 8, backgroundColor: 'rgba(255,107,0,0.1)' },

    // Summary
    summaryCard: { backgroundColor: '#D1DEE8', borderRadius: 16, padding: 20, marginBottom: 20 },
    summaryLabel: { fontSize: 12, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
    idRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    idText: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginLeft: 8 },
    destInfo: { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 10 },
    destLabel: { fontSize: 11, color: '#444' },
    destValue: { fontSize: 20, fontWeight: '800', color: '#FF6B00' },

    // Scanner UI
    scannerSection: { marginBottom: 20 },
    input: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, fontSize: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, marginBottom: 10 },
    switchBtn: { flexDirection: 'row', padding: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    btnText: { color: '#FFF', fontWeight: '700', marginLeft: 8 },

    // List
    sectionHeader: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconContainer: { width: 40 },
    detailsContainer: { flex: 1, paddingHorizontal: 8 },
    palletCode: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
    labelSource: { fontSize: 12, color: '#666' },
    destinationContainer: { alignItems: 'flex-end' },
    qtyRow: { flexDirection: 'row', alignItems: 'center' },
    qtyText: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },

    // Footer
    footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, backgroundColor: '#F8F9FA' },
    nextBtn: { backgroundColor: '#16a34a', padding: 18, borderRadius: 16, alignItems: 'center', elevation: 4 },
    btnTextLarge: { color: '#FFF', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
    waitingBadge: { backgroundColor: '#E9ECEF', padding: 15, borderRadius: 12, alignItems: 'center' },
    waitingText: { color: '#ADB5BD', fontWeight: '600' }
});

export default ForkliftDestination;