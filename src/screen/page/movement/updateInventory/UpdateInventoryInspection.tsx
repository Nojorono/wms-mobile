import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
    Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import MovementService from '../../../../service/movementService';
import { useAuthStore } from '../../../../store/useAuthStore.ts';
import { useLoadingDialogStore } from '../../../../store/useLoadingStore.ts';
import { useDialogStore } from '../../../../store/useGlobalDialog.ts';
import { StackNavigationProp } from '@react-navigation/stack';
import { UpdateInventoryParamList } from '../../../navigation/movement/UpdateInventoryNavigator.tsx';
import { useNavigation } from '@react-navigation/native';

type NavigationProp = StackNavigationProp<UpdateInventoryParamList, 'UpdateInventoryMain'>;

const UpdateInventoryInspection = () => {
    const route = useRoute();
    const payload = route.params as any;
    // Berdasarkan log Anda, itemData adalah satu objek tunggal
    const itemData = payload.item;
    const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
    const showDialog = useDialogStore((state) => state.showDialog);
    const { user } = useAuthStore();
    const userId = user?.id;
      const navigation = useNavigation<NavigationProp>();

    if (!itemData) {
        return (
            <View style={styles.center}>
                <Text>No Data Available</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>Inventory Inspection</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    {/* Header Card */}
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.updateNumber}>{itemData.updateNumber}</Text>
                            <Text style={styles.updateType}>{itemData.updateType?.replace('_', ' ')}</Text>
                        </View>
                        <View style={[
                            styles.badge,
                            itemData.inspectionStatus === 'PENDING' ? styles.badgePending : styles.badgeSuccess
                        ]}>
                            <Text style={[
                                styles.badgeText,
                                { color: itemData.inspectionStatus === 'PENDING' ? '#FF9800' : '#006064' }
                            ]}>
                                {itemData.inspectionStatus}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Info Section */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Notes:</Text>
                        <Text style={styles.value}>{itemData.notes || '-'}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.label}>Status:</Text>
                        <Text style={styles.statusValue}>{itemData.status?.replace(/_/g, ' ')}</Text>
                    </View>

                    {/* Items / Pallets Section */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Origin Items / Pallets:</Text>
                        {itemData.items?.map((subItem: any) => (
                            <View key={subItem.id} style={styles.itemRow}>
                                <View>
                                    <Text style={styles.palletCode}>{subItem.pallet?.pallet_code}</Text>
                                    <Text style={styles.subText}>Initial Qty: {subItem.pallet?.currentQuantity}</Text>
                                </View>
                                <Text style={styles.itemQty}>{subItem.quantity} {subItem.uom}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Scans / Result Section */}
                    {itemData.scans && itemData.scans.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.label}>Scan Results (Target Pallet):</Text>
                            {itemData.scans.map((scan: any) => (
                                <View key={scan.id} style={[styles.itemRow, styles.scanRow]}>
                                    <View>
                                        <Text style={styles.palletCode}>{scan.pallet?.pallet_code}</Text>
                                        <Text style={styles.subText}>Target Total Qty</Text>
                                    </View>
                                    <Text style={[styles.itemQty, { color: '#1976D2' }]}>{scan.quantity} {scan.uom}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <Text style={styles.dateText}>
                        Last Update: {new Date(itemData.updatedAt).toLocaleString()}
                    </Text>
                </View>
            </ScrollView>

            {/* Floating Action Buttons */}
            <View style={styles.floatingActionContainer}>
                

               {
    /* Pastikan bukan status final (COMPLETED/APPROVED) */
    itemData.status !== 'COMPLETED' && 
    itemData.status !== 'APPROVED' && 
    /* Izinkan jika statusnya bukan PENDING_HELPER_ACTION ATAU jika ada data scan */
    (itemData.status === 'PENDING_HELPER_ACTION' && itemData.scans && itemData.scans.length > 0) && (
        <>
        
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => {
            try {
                 Alert.alert("confirm", "Are you sure want to reject this inspection?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Reject",
                onPress: async () => {
                    showLoadingDialog("Rejecting...");
                    MovementService.rejectInspectionPallet(itemData.id)
                    .then(() => {
                        showDialog('success', 'Inventory inspection rejected successfully!');
                        navigation.goBack();
                    })
                    .catch((error) => {
                        hideLoadingDialog();
                        showDialog('error', error?.data?.message || 'Error while rejecting inventory update!');
                    });
                }
            }
           ]);  
            } catch (error) {
                hideLoadingDialog();
                showDialog('error', 'Error while rejecting inventory update!');
            }
          }}
        >
          <Text style={styles.buttonText}>REJECT</Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={async () => {
                try {
                    showLoadingDialog("waiting for approval...");
                    
                    if (itemData.updateType === 'SPLIT_PALLET') {
                        await MovementService.approveInspectionSplit(itemData.id, {
                            inspectionByUserId: userId
                        });
                    } else if (itemData.updateType === 'MERGE_PALLET') {
                        await MovementService.approveInspectionMerge(itemData.id, {
                            inspectionByUserId: userId
                        });
                    }
                    
                    hideLoadingDialog();
                    showDialog('success', 'Inventory inspection approved successfully!');
                    navigation.goBack();
                } catch (error:any) {
                    hideLoadingDialog();
                    showDialog('error', error?.data?.message || 'Error while approving inventory update!');
                }
            }}
        >
            <Text style={styles.buttonText}>APPROVE</Text>
        </TouchableOpacity>
    </>
    )
}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 120, // Ruang ekstra agar tidak tertutup tombol
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    updateNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    updateType: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
        fontWeight: '500',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgePending: {
        backgroundColor: '#FFF4E5',
    },
    badgeSuccess: {
        backgroundColor: '#E0F7FA', // Biru muda cerah sesuai #80e5f3 tapi lebih soft untuk teks
    },
    badgeText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 12,
    },
    section: {
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        color: '#999',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    value: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    statusValue: {
        fontSize: 14,
        color: '#555',
        fontWeight: '600',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#4CAF50',
    },
    scanRow: {
        borderLeftColor: '#2196F3',
        backgroundColor: '#F0F7FF',
    },
    palletCode: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    subText: {
        fontSize: 11,
        color: '#888',
    },
    itemQty: {
        fontSize: 16,
        color: '#2E7D32',
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 11,
        color: '#CCC',
        textAlign: 'right',
        marginTop: 10,
    },
    floatingActionContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        height: 52,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    rejectButton: {
        backgroundColor: '#FF5252',
    },
    approveButton: {
        backgroundColor: '#2E7D32',
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 1,
    },
});

export default UpdateInventoryInspection;