import React from 'react';
import { View, StyleSheet } from 'react-native';
import GoodReceiveDetailCard from '../../../../../../components/inbound/GoodReceiveDetailCard';
import { useRoute } from '@react-navigation/native';
import { Text, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/FontAwesome5';

const GoodReceiveDetail = () => {
    // type InboundDetailRouteParams = {
    //     payload: {
    //         id: string;
    //         inbound_number: string;
    //         license_plate: string;
    //         inbound_type: string;
    //         status: string;
    //     };
    // };
    const route = useRoute();
    const payload = route.params as any;
    const mergedData = payload.items || [];
    const handleCheck = () => {};

    return (
        <View style={styles.container}>
            {/* Info Section */}
            <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Inbound Planning Number</Text>
                <View style={styles.row}>
                    <Ionicons name="book" size={18} color="black" />
                    <Text style={styles.infoValue}>{payload.payload.inbound_number}</Text>
                </View>

                <View style={styles.vehicleBox}>
                    <Ionicons name="truck" size={18} color="#FF6B00" />
                    <Text style={styles.vehicleText}>{payload.payload.license_plate}</Text>
                </View>

                <View style={styles.typeBox}>
                    <Text style={styles.typeText}>{payload.payload.inbound_type}</Text>
                </View>
            </View>

            {/* Scrollable Dynamic Card List */}
            <View style={{ flex: 1 }}>
                    <GoodReceiveDetailCard data={payload.item} />
                
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
        padding: 16,
    },
    infoCard: {
        backgroundColor: "#E6EEFA",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    infoTitle: {
        fontSize: 12,
        color: "#555",
        textAlign: "center",
        marginBottom: 6,
    },
    row: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 6,
    },
    vehicleBox: {
        flexDirection: "row",
        backgroundColor: "#FFF",
        borderRadius: 8,
        padding: 8,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    vehicleText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FF6B00",
        marginLeft: 6,
    },
    typeBox: {
        backgroundColor: "#FFF",
        borderRadius: 8,
        padding: 10,
        alignItems: "center",
    },
    typeText: {
        fontSize: 14,
        fontWeight: "600",
    },
});

export default GoodReceiveDetail;