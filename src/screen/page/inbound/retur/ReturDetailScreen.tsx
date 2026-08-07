// screens/ReturDetail.tsx
import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome5'; 
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

// Dummy Type untuk Navigation
type ReturParamList = { ReturMain: undefined; ReturDetail: { item: any } };
type NavigationPropRetur = StackNavigationProp<ReturParamList, 'ReturMain'>;
type ReturDetailRouteProp = RouteProp<ReturParamList, 'ReturDetail'>;

export default function ReturDetail() {
    const navigationRetur = useNavigation<NavigationPropRetur>();
    const route = useRoute<ReturDetailRouteProp>();
    
    // 1. Menangkap payload item dari halaman sebelumnya
    const item = route.params?.item || {};
    const [status, setStatus] = useState<string>(item.status || 'CREATED');
    
    // Dummy Data SKU (tetap dipertahankan karena di halaman sebelumnya belum ada detail SKU)
    const [mergedData, setMergedData] = useState<any[]>([
        { id: 1, name: 'Class Mild - 16', qty: 30, uom: 'BKS', tahunBs: '2026' },
        { id: 2, name: 'Class Mild - 12', qty: 50, uom: 'BKS', tahunBs: '2025' }
    ]);

    // 2. Logika untuk Stepper berdasarkan status item
    const getStepLevel = (currentStatus: string) => {
        const statuses = ['CREATED', 'UNLOADING', 'INSPECTION', 'READY_INTEGRATION'];
        return statuses.indexOf(currentStatus);
    };

    const stepLevel = getStepLevel(status);

    const renderStepper = () => (
        <View style={styles.stepperContainer}>
            {/* Step 1: Helper List (Mewakili CREATED ke atas) */}
            <View style={styles.stepItem}>
                <View style={[styles.stepCircle, stepLevel >= 0 && styles.stepCircleActive]} />
                <Text style={styles.stepText}>Helper List</Text>
            </View>
            
            {/* Garis Penghubung 1 */}
            <View style={[
                stepLevel >= 1 ? styles.stepLineDotted : styles.stepLineDottedGrey
            ]} />
            
            {/* Step 2: Picking (Mewakili UNLOADING ke atas) */}
            <View style={styles.stepItem}>
                <View style={[styles.stepCircle, stepLevel >= 1 && styles.stepCircleActive]} />
                <Text style={styles.stepText}>Picking</Text>
            </View>
            
            {/* Garis Penghubung 2 */}
            <View style={[
                stepLevel >= 2 ? styles.stepLineDotted : styles.stepLineDottedGrey
            ]} />
            
            {/* Step 3: Inspection (Mewakili INSPECTION ke atas) */}
            <View style={styles.stepItem}>
                <View style={[styles.stepCircle, stepLevel >= 2 && styles.stepCircleActive]} />
                <Text style={styles.stepText}>Inspection</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Top Card (Vehicle/Retur ID Info) */}
                <View style={styles.topCard}>
                    <View style={styles.rowBetween}>
                        <View style={styles.rowCenter}>
                            <Icon name="box" size={18} color="#333" />
                            {/* 3. Menampilkan Nomor Retur dari Item */}
                            <Text style={styles.returId}>{item.inbound_number || 'IN-000000-0000'}</Text>
                        </View>
                        <Text style={styles.dNumber}>D123456789</Text>
                    </View>
                    <View style={styles.vehicleBadge}>
                        <Icon name="truck" size={16} color="#F47524" />
                        {/* 4. Menampilkan Plat Nomor dari Item */}
                        <Text style={styles.vehicleText}>{item.license_plate || 'X 0000 XX'}</Text>
                    </View>
                </View>

                {/* Main Content Card */}
                <View style={styles.mainCard}>
                    {/* Stepper Progress */}
                    {renderStepper()}

                    {/* Informasi Detail */}
                    <View style={styles.sectionHeader}>
                        <Icon name="store" size={16} color="#333" />
                        <Text style={styles.sectionTitle}>Informasi Detail</Text>
                    </View>
                    <View style={styles.infoBox}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoColumn}>
                                <Text style={styles.infoLabel}>Tipe</Text>
                                <Text style={styles.infoValue}>AMO</Text>
                            </View>
                            <View style={[styles.infoColumn, { alignItems: 'flex-end' }]}>
                                <Text style={styles.infoLabel}>Pengirim</Text>
                                <Text style={styles.infoValue}>BANDUNG</Text>
                            </View>
                        </View>
                        <View style={[styles.infoRow, { marginTop: 16 }]}>
                            <View style={styles.infoColumn}>
                                <Text style={styles.infoLabel}>Date</Text>
                                {/* 5. Menampilkan Tanggal dari Item */}
                                <Text style={styles.infoValue}>{item.arrival_date || '00-00-0000'}</Text>
                            </View>
                            <View style={[styles.infoColumn, { alignItems: 'flex-end' }]}>
                                <Text style={styles.infoLabel}>Action</Text>
                                <Text style={[styles.infoValue, { color: '#B0B0B0', fontWeight: 'normal' }]}>Assign Helper</Text>
                            </View>
                        </View>
                    </View>

                    {/* List SKU */}
                    <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                        <Icon name="list" size={16} color="#333" />
                        <Text style={styles.sectionTitle}>List SKU:</Text>
                    </View>
                    
                    <View style={styles.skuContainer}>
                        {mergedData.map((skuItem, index) => (
                            <View key={skuItem.id} style={styles.skuItem}>
                                <Text style={styles.skuName}>{skuItem.name}</Text>
                                <View style={styles.skuRowBetween}>
                                    <Text style={styles.skuLabel}>Qty</Text>
                                    <Text style={styles.skuValue}>{skuItem.qty} {skuItem.uom}</Text>
                                </View>
                                <View style={styles.skuRowBetween}>
                                    <Text style={styles.skuLabel}>Tahun BS</Text>
                                    <Text style={styles.skuValue}>{skuItem.tahunBs}</Text>
                                </View>
                                {/* Garis Pemisah (Kecuali item terakhir) */}
                                {index !== mergedData.length - 1 && (
                                    <View style={styles.divider} />
                                )}
                            </View>
                        ))}
                    </View>

                    {/* Button Assign Helper */}
                    <TouchableOpacity style={styles.primaryButton}>
                        <Text style={styles.primaryButtonText}>Assign Helper</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F2F6FA', 
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#F47524',
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    topCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#EAEAEA',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    returId: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    dNumber: {
        fontSize: 12,
        color: '#888',
    },
    vehicleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#EAEAEA',
        borderRadius: 8,
        paddingVertical: 10,
    },
    vehicleText: {
        marginLeft: 8,
        color: '#F47524',
        fontWeight: 'bold',
        fontSize: 14,
    },
    mainCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 32,
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    stepItem: {
        alignItems: 'center',
    },
    stepCircle: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#C4C4C4',
        marginBottom: 4,
    },
    stepCircleActive: {
        backgroundColor: '#F47524',
        width: 18,
        height: 18,
        borderRadius: 9,
    },
    stepLineDotted: {
        flex: 1,
        height: 1,
        borderWidth: 1,
        borderColor: '#F47524',
        borderStyle: 'dashed',
        marginHorizontal: 8,
        marginTop: -16,
    },
    stepLineDottedGrey: {
        flex: 1,
        height: 1,
        borderWidth: 1,
        borderColor: '#C4C4C4',
        borderStyle: 'dashed',
        marginHorizontal: 8,
        marginTop: -16,
    },
    stepText: {
        fontSize: 10,
        color: '#333',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    infoBox: {
        borderWidth: 1,
        borderColor: '#EAEAEA',
        borderRadius: 12,
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoColumn: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 11,
        color: '#888',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#333',
    },
    skuContainer: {
        marginTop: 8,
    },
    skuItem: {
        marginBottom: 16,
    },
    skuName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    skuRowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    skuLabel: {
        fontSize: 12,
        color: '#888',
    },
    skuValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
    },
    divider: {
        height: 1,
        backgroundColor: '#EAEAEA',
        marginTop: 12,
    },
    primaryButton: {
        backgroundColor: '#F47524',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 24,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
});