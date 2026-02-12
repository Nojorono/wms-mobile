import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    StatusBar,
    ScrollView,
    Alert,
    RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, CommonActions, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { MoveLocationParamList } from '../../../navigation/movement/MoveLocationNavigator';
import { useDialogStore } from '../../../../store/useGlobalDialog';
import { useLoadingDialogStore } from '../../../../store/useLoadingStore';
import MovementService from '../../../../service/movementService';
import Colors from '../../../../constants/Colors';
type NavigationProp = StackNavigationProp<MoveLocationParamList, 'MoveLocationMain'>;

const MoveLocationDetail = () => {
    const route = useRoute();
    const navigation = useNavigation<NavigationProp>();
    const payload = route.params as any;
    const dataBefore = payload.item; // Objek movement utama
    const [item, setItem] = useState<any>({});
    const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
    const showDialog = useDialogStore((state) => state.showDialog);
    const [refreshing, setRefreshing] = useState(false);

    const isAllPalletConfirmed =
        Array.isArray(item.pallets) &&
        item.pallets.length > 0 &&
        item.pallets.every((palletItem: any) =>
            palletItem.inventoryTracking?.warehouse_bin_id === item.destination_bin_id &&
            palletItem.inventoryTracking?.warehouse_sub_id === item.destination_warehouse_sub_id
        );

    const handleCompleteMovement = () => {
        Alert.alert(
            'Complete Movement',
            'Are you sure want to complete this movement?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: async () => {
                        // navigation.dispatch(
                        //     CommonActions.reset({
                        //         index: 0,
                        //         routes: [{ name: 'MoveLocationMain' }],
                        //     })
                        // );
                        try {
                            showLoadingDialog('Completing movement...');
                            const response = await MovementService.updateInventoryMovementStatus(item.id, { status: 'COMPLETED' });
                            console.log('Movement marked as COMPLETED:', response);
                            Alert.alert('Success', 'Movement completed successfully');
                        } catch (error) {
                            console.log('Error completing movement:', error);
                            Alert.alert('Error', 'Failed to complete movement');
                        } finally {
                            hideLoadingDialog();
                        }
                    }
                },
            ]
        );
    };


    const fetchMoveLocation = async () => {
        try {
            setRefreshing(true);
            showLoadingDialog('Loading List MoveLocation Planning');
            const response = await MovementService.getInventoryMovement({ status: '', limit: 100 });
            const foundItem = (response.data || []).find((d: any) => d.id === dataBefore.id);
            console.log('FOUND ITEM DETAIL:', foundItem);
            setItem(foundItem || {});
        } catch (error) {
            hideLoadingDialog();
            showDialog('error', 'Error while Fetching Data MoveLocation!');
        } finally {
            hideLoadingDialog();
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchMoveLocation();
        }, [])
    );


    // --- Action: Confirm Per Pallet ---
    const handleConfirmPallet = async (palletItem: any) => {
        try {
            showLoadingDialog('Submitting movement...');

            const payloadSubmit = {
                inventory_movement_id: item.id,
                pallet_id: palletItem.pallet_id,
                inventory_tracking_id: palletItem.inventory_tracking_id,
                destination_warehouse_id: item.destination_warehouse_id,
                destination_warehouse_sub_id: item.destination_warehouse_sub_id,
                destination_bin_id: item.destination_bin_id,
            };

            await MovementService.postInspectionByPallet(payloadSubmit);

            Alert.alert("Success", `Pallet ${palletItem.pallet.pallet_code} moved successfully`, [
                {
                    text: "OK",
                    onPress: () => {
                        // Jika ingin kembali ke list setelah satu pallet selesai
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: "MoveLocationMain" }],
                            })
                        );
                    }
                }
            ]);
        } catch (error) {
            Alert.alert("Error", "Failed to complete task");
        } finally {
            hideLoadingDialog();
        }
    };

    // --- Components ---
    const SummaryCard = () => (
        <View style={styles.summaryCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                    <Text style={styles.summaryLabel}>Move Location ID</Text>
                    <View style={styles.idRow}>
                        <Icon name="package-variant-closed" size={20} color="#1A1A1A" />
                        <Text style={styles.idText}>{item.movement_number}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        Alert.alert(
                            'Delete Movement',
                            'Are you sure you want to delete this movement?',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Delete',
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            showLoadingDialog('Deleting movement...');
                                            await MovementService.deleteInventoryMovement(item.id);
                                            Alert.alert('Success', 'Movement deleted successfully');
                                            navigation.dispatch(
                                                CommonActions.reset({
                                                    index: 0,
                                                    routes: [{ name: 'MoveLocationMain' }],
                                                })
                                            );
                                        } catch (error) {
                                            Alert.alert('Error', 'Failed to delete movement');
                                        } finally {
                                            hideLoadingDialog();
                                        }
                                    }
                                }
                            ]
                        );
                    }}
                >
                    <Icon name="trash-can-outline" size={22} color="#FF3B30" />
                </TouchableOpacity>
            </View>
            <View style={styles.destInfo}>
                <Text style={styles.destLabel}>Target Bin:</Text>
                <Text style={styles.destValue}>{item.destinationBin?.code || "N/A"}</Text>
            </View>
        </View>
    );

    const renderPalletItem = ({ item: palletItem }: { item: any }) => {
        const isFullConfirmed =
            palletItem.inventoryTracking?.warehouse_bin_id === item.destination_bin_id &&
            palletItem.inventoryTracking?.warehouse_sub_id === item.destination_warehouse_sub_id;



        return (
            <View style={styles.card}>
                <View style={styles.cardRow}>
                    <View style={styles.iconContainer}>
                        <Icon name="forklift" size={28} color="#1A1A1A" />
                    </View>
                    <View style={styles.detailsContainer}>
                        <Text style={styles.palletCode}>{palletItem.pallet.pallet_code}</Text>
                        <Text style={styles.labelSource}>Loc: {item.destinationWarehouseSub?.name}</Text>
                        <Text style={styles.qtyText}>
                            {palletItem.pallet.currentQuantity} {palletItem.pallet.uom}
                        </Text>
                    </View>
                    <View style={styles.destinationContainer}>
                        <View style={styles.qtyRow}>
                            <TouchableOpacity
                                style={[
                                    styles.confirmBtnSmall,
                                    (isFullConfirmed || !item.destination_bin_id) && { backgroundColor: '#E9ECEF' }
                                ]}
                                onPress={() => {
                                    if (!isFullConfirmed && item.destination_bin_id) {
                                        handleConfirmPallet(palletItem);
                                    }
                                }}
                                disabled={isFullConfirmed || !item.destination_bin_id}
                            >
                                <Icon
                                    name={isFullConfirmed ? "check-circle" : "checkbox-blank-circle-outline"}
                                    size={18}
                                    color={isFullConfirmed ? "#16a34a" : "#FFF"}
                                />
                                <Text
                                    style={[
                                        styles.confirmBtnText,
                                        isFullConfirmed && { color: '#ADB5BD' }
                                    ]}
                                >
                                    CONFIRM
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={fetchMoveLocation}
                        colors={[Colors.primeColor]}
                    />
                }>
                <SummaryCard />

                <Text style={styles.sectionHeader}>Pallets in this movement</Text>

                <FlatList
                    data={item.pallets}
                    renderItem={renderPalletItem}
                    keyExtractor={(item) => item.id.toString()}
                    scrollEnabled={false}
                />
            </ScrollView>
            <View style={styles.footer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {item.destination_bin_id && (
                        <TouchableOpacity
                            style={[
                                styles.nextBtn,
                                { backgroundColor: '#FF3B30', flex: 1, marginLeft: 10 }
                            ]}
                            onPress={() => {
                                Alert.alert(
                                    'Reject Movement',
                                    'Are you sure want to reject this movement?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Yes',
                                            onPress: async () => {
                                                try {
                                                    showLoadingDialog('Rejecting movement...');
                                                    await MovementService.updateInventoryMovementStatus(item.id, { status: 'CANCELLED' });
                                                    Alert.alert('Success', 'Movement cancelled successfully');
                                                    navigation.dispatch(
                                                        CommonActions.reset({
                                                            index: 0,
                                                            routes: [{ name: 'MoveLocationMain' }],
                                                        })
                                                    );

                                                } catch (error) {
                                                    Alert.alert('Error', 'Failed to cancel movement');
                                                } finally {
                                                    hideLoadingDialog();
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            disabled={item.status === 'CANCELLED'}
                        >
                            <Text style={styles.btnTextLarge}>
                                {item.status === 'CANCELLED' ? 'Cancelled' : 'Cancel'}
                            </Text>
                        </TouchableOpacity>
                    )}
                    {isAllPalletConfirmed && <TouchableOpacity
                        style={[
                            styles.nextBtn,
                            item.status === 'COMPLETED' && { backgroundColor: '#ADB5BD' },
                            { flex: 1, marginLeft: 10 }
                        ]}
                        onPress={handleCompleteMovement}
                        disabled={item.status === 'COMPLETED'}
                    >
                        <Text style={styles.btnTextLarge}>
                            {item.status === 'COMPLETED' ? 'Completed' : 'Complete'}
                        </Text>
                    </TouchableOpacity>
                    }
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 120, },

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
    waitingText: { color: '#ADB5BD', fontWeight: '600' },
    confirmBtnSmall: {
        flexDirection: 'row',
        backgroundColor: '#16a34a',
        paddingHorizontal: 8,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    confirmBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13, marginLeft: 8 },
});

export default MoveLocationDetail;