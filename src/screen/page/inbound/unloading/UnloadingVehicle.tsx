
import {useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useLoadingDialogStore } from "../../../../store/useLoadingStore";
import { StackNavigationProp } from "@react-navigation/stack";
import { UnloadingParamList } from "../../../navigation/inbound/UnloadingNavigator";

type NavigationProp = StackNavigationProp<UnloadingParamList,'UnloadingMain'>;



export default function UnloadingVehicleScreen() {
    const vehicles = ["B 2324 TRS", "B 8976 XYZ", "B 1209 ASD"];
    const navigation = useNavigation<NavigationProp>();
      const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.subTitle}>Unloading Planning ID</Text>
                <Text style={styles.planningId}>CWH02-IN-0625-0002</Text>

                <TouchableOpacity style={styles.chooseBtn}>
                    <Text style={styles.chooseText}>🚚 Choose Your Vehicle</Text>
                </TouchableOpacity>

                {vehicles.map((item, idx) => (
                    <TouchableOpacity key={idx} style={styles.vehicleCard} onPress={() => { navigation.navigate('UnloadingDetail', { item });}}>
                        <Text style={styles.vehicleText}>🚚 {item}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
        padding: 20,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 24,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    subTitle: {
        fontSize: 18,
        color: "#888",
        textAlign: "center",
        fontWeight: "500",
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    planningId: {
        fontSize: 22,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 28,
        color: "#222",
        letterSpacing: 1,
    },
    chooseBtn: {
        backgroundColor: "#f8f9fa",
        borderWidth: 0,
        borderRadius: 14,
        paddingVertical: 18,
        marginBottom: 18,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
    },
    chooseText: {
        color: "#ff6600",
        fontWeight: "700",
        fontSize: 18,
        letterSpacing: 0.5,
    },
    vehicleCard: {
        backgroundColor: "#f8f9fa",
        borderRadius: 14,
        paddingVertical: 18,
        paddingHorizontal: 20,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
    },
    vehicleText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#222",
        letterSpacing: 0.5,
    },
});
