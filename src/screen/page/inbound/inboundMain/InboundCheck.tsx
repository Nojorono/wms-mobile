import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { InboundParamList } from '../../../navigation/inbound/InboundNavigator';

const inboundData = {
    inboundNumber: 'CWH02-IN-0625-0001',
    vehicleNumber: 'K 9985 AT',
    deliveryNoteNumber: '188258',
    deliveryNoteDate: '03/07/2025',
    poNumber: '25210102629',
    poDate: '24/06/2025',
    skuList: [
        { id: 'SKU-01', name: 'Purple Duo', quantity: 200, unit: 'Dus' },
        { id: 'SKU-01', name: 'Purple Duo', quantity: 200, unit: 'Dus' },
        { id: 'SKU-01', name: 'Purple Duo', quantity: 200, unit: 'Dus' },
        { id: 'SKU-01', name: 'Purple Duo', quantity: 200, unit: 'Dus' },
    ],
};

type NavigationProp = StackNavigationProp<InboundParamList,'InboundMain'>;
const InboundCheckList = () => {
    
      const navigation = useNavigation<NavigationProp>();
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Inbound Planning Number</Text>
            <Text style={styles.inboundNumber}>{inboundData.inboundNumber}</Text>

            <TouchableOpacity style={styles.deliveryButton}>
                <Text style={styles.deliveryText}>🚚 Delivery Order</Text>
            </TouchableOpacity>

            <View style={styles.infoSection}>
                <InfoField label="Nomor Kendaraan" value={inboundData.vehicleNumber} />
                <InfoField label="Nomor Surat Jalan" value={inboundData.deliveryNoteNumber} />
                <InfoField label="Tanggal Surat Jalan" value={inboundData.deliveryNoteDate} />
                <InfoField label="Nomor PO" value={inboundData.poNumber} />
                <InfoField label="Tanggal PO" value={inboundData.poDate} />
            </View>

            <Text style={styles.skuTitle}>List SKU</Text>
            <View style={styles.skuSection}>
                {inboundData.skuList.map((sku, index) => (
                    <View key={index} style={styles.skuItem}>
                        <Text style={styles.skuId}>{sku.id}</Text>
                        <Text style={styles.skuName}>{sku.name}</Text>
                        <Text style={styles.skuQty}>Qty: {sku.quantity} {sku.unit}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.declineButton}>
                    <Text style={styles.declineText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.approveButton} onPress={() =>  navigation.navigate('InboundAssign', { item: inboundData })}>
                    <Text style={styles.approveText}>Approve</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const InfoField = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoField}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#FFF', // putih
        minHeight: '100%',
    },
    title: {
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 18, // lebih besar
        color: '#222',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    inboundNumber: {
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 26, // lebih besar
        color: '#2563EB',
        marginBottom: 22,
        letterSpacing: 1,
    },
    deliveryButton: {
        alignSelf: 'center',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 12,
        marginBottom: 22,
        elevation: 0,
    },
    deliveryText: {
        color: '#2563EB',
        fontWeight: '500',
        fontSize: 18, // lebih besar
    },
    infoSection: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 18,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    infoField: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16, // lebih besar
        fontWeight: '500',
        color: '#64748B',
        marginBottom: 4,
    },
    value: {
        fontSize: 18, // lebih besar
        color: '#222',
        backgroundColor: '#F1F5F9',
        padding: 10,
        borderRadius: 8,
        fontWeight: '400',
    },
    skuTitle: {
        fontWeight: '600',
        fontSize: 20, // lebih besar
        color: '#2563EB',
        marginBottom: 14,
        marginTop: 14,
        letterSpacing: 0.5,
    },
    skuSection: {
        gap: 14,
        marginBottom: 28,
    },
    skuItem: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 18,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    skuId: {
        fontWeight: '600',
        fontSize: 16, // lebih besar
        color: '#2563EB',
        marginBottom: 4,
    },
    skuName: {
        fontSize: 18, // lebih besar
        color: '#222',
        marginBottom: 4,
    },
    skuQty: {
        fontSize: 16, // lebih besar
        color: '#64748B',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 14,
        gap: 14,
    },
    declineButton: {
        flex: 1,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#2563EB',
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginRight: 7,
    },
    approveButton: {
        flex: 1,
        backgroundColor: '#2563EB',
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginLeft: 7,
    },
    declineText: {
        color: '#2563EB',
        fontWeight: '600',
        fontSize: 18, // lebih besar
    },
    approveText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 18, // lebih besar
    },
});

export default InboundCheckList;
