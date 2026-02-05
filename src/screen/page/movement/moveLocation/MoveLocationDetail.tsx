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
import { MoveLocationParamList } from '../../../navigation/movement/MoveLocationNavigator';
type NavigationProp = StackNavigationProp<MoveLocationParamList, 'MoveLocationMain'>;

const MoveLocationDetail = () => {
    const route = useRoute();
    const navigation = useNavigation<NavigationProp>();
    const payload = route.params as any;
    const item = payload.item; // Objek movement utama
    console.log("MoveLocationDetail payload:", payload);

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
            // await MovementService.postForkliftMovement(payloadSubmit);
            Alert.alert("Success", "Movement completed successfully");
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: "MoveLocationMain" }],
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

    const renderPalletItem = ({ item: palletItem }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardRow}>
                <View style={styles.iconContainer}>
                    <Icon name="forklift" size={28} color="#1A1A1A" />
                </View>
                <View style={styles.detailsContainer}>
                    <Text style={styles.palletCode}>{palletItem.pallet.pallet_code}</Text>
                    <Text style={styles.labelSource}>Loc: {item.destinationWarehouseSub.name}</Text>
                </View>
                <View style={styles.destinationContainer}>
                    <View style={styles.qtyRow}>
                        <Text style={styles.qtyText}>
                            {palletItem.pallet.currentQuantity} {palletItem.pallet.uom}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <SummaryCard />

                <Text style={styles.sectionHeader}>Pallets in this movement</Text>

                <FlatList
                    data={item.pallets}
                    renderItem={renderPalletItem}
                    keyExtractor={(item) => item.id.toString()}
                    scrollEnabled={false}
                />
            </ScrollView>

            {/* Bottom Match Indicator & Next Button */}
            <View style={styles.footer}>
              
                    <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                        <Text style={styles.btnTextLarge}>CONFIRM</Text>
                    </TouchableOpacity>
               
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    scrollContent: { paddingHorizontal: 20, paddingTop: 10 },

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

export default MoveLocationDetail;