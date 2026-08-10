import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { ReturParamList } from '../../../../navigation/inbound/ReturNavigator';

type ReturDetailRouteProp = RouteProp<ReturParamList, 'ReturDetail'>;

export default function ReturInspectionList() {
    const route = useRoute<ReturDetailRouteProp>();
    const navigation = useNavigation<StackNavigationProp<ReturParamList, 'ReturDetail'>>();
    
    // 1. Menangkap payload item dari halaman sebelumnya
    const item = route.params?.item || {};

    // 2. Membuat Data Dummy untuk SKU
    const [dummyDataSKU] = useState([
        {
            id: '1',
            name: 'Class Mild - 16',
            status: 'Inspection',
            totalQty: 30,
            uom: 'BKS',
            claim: 20,
            unclaim: 8,
            tracking: 2,
        },
        {
            id: '2',
            name: 'Class Mild - 12',
            status: 'Inspection',
            totalQty: 50,
            uom: 'BKS',
            claim: 50,
            unclaim: 0,
            tracking: 0,
        }
    ]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Top Info Card */}
                <View style={styles.card}>
                    <View style={styles.rowBetween}>
                        <View style={styles.rowCenter}>
                            <Icon name="box" size={16} color="#333" />
                            <Text style={styles.inboundText}>IN-030226-0001</Text>
                        </View>
                        <Text style={styles.doText}>0123456789</Text>
                    </View>
                    <View style={styles.vehicleBadge}>
                        <Icon name="truck" size={14} color="#F47524" />
                        <Text style={styles.vehicleText}>K 9985 AT</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>List SKU:</Text>

                {/* Render Dynamic SKU Cards */}
                {dummyDataSKU.map((sku) => (
                    <View key={sku.id} style={styles.card}>
                        <View style={styles.skuHeader}>
                            <View style={styles.skuIconBox}>
                                <Icon name="box-open" size={20} color="#A0A0A0" />
                            </View>
                            <View style={styles.skuTitleWrapper}>
                                <Text style={styles.skuName}>{sku.name}</Text>
                                <Text style={styles.skuTotalLabel}>Total</Text>
                            </View>
                            <View style={styles.skuBadgeWrapper}>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>{sku.status}</Text>
                                </View>
                                <Text style={styles.skuTotalValue}>{sku.totalQty} {sku.uom}</Text>
                            </View>
                        </View>

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Claim</Text>
                                <Text style={styles.statValue}>{sku.claim}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Unclaim</Text>
                                <Text style={styles.statValue}>{sku.unclaim}</Text>
                            </View>
                            <View style={[styles.statItem, { alignItems: 'flex-end' }]}>
                                <Text style={styles.statLabel}>Tracking</Text>
                                <Text style={styles.statValue}>{sku.tracking}</Text>
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={styles.actionOutlineButton}
                            onPress={() => navigation.navigate('ReturInspectionDetail', { item: sku })}
                        >
                            <Text style={styles.actionButtonText}>Mulai Inspection</Text>
                            <Icon name="arrow-right" size={14} color="#F47524" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F0F4F8' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#FFFFFF',
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#F47524' },
    container: { padding: 16 },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    rowCenter: { flexDirection: 'row', alignItems: 'center' },
    inboundText: { fontSize: 14, fontWeight: 'bold', color: '#333', marginLeft: 8 },
    doText: { fontSize: 12, color: '#A0A0A0' },
    vehicleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#EFEFEF',
        borderRadius: 8,
        paddingVertical: 10,
    },
    vehicleText: { marginLeft: 8, color: '#F47524', fontWeight: 'bold', fontSize: 14 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 12 },

    // SKU Card Styles
    skuHeader: { flexDirection: 'row', marginBottom: 16 },
    skuIconBox: {
        width: 40, height: 40, backgroundColor: '#F5F5F5', borderRadius: 8,
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    skuTitleWrapper: { flex: 1, justifyContent: 'space-between' },
    skuName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
    skuTotalLabel: { fontSize: 12, color: '#888' },
    skuBadgeWrapper: { alignItems: 'flex-end', justifyContent: 'space-between' },
    statusBadge: { backgroundColor: '#F4E8FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    statusText: { color: '#9B51E0', fontSize: 10, fontWeight: 'bold' },
    skuTotalValue: { fontSize: 12, fontWeight: 'bold', color: '#F47524' },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    statItem: { flex: 1 },
    statLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
    statValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },

    actionOutlineButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F47524',
        backgroundColor: '#FFF4ED',
        paddingVertical: 12,
        borderRadius: 8,
    },
    actionButtonText: { color: '#F47524', fontWeight: 'bold', fontSize: 14 },
});