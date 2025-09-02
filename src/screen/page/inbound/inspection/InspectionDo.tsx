import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

import Ionicons from 'react-native-vector-icons/FontAwesome5';
import Colors from "../../../../constants/Colors";
import { StackNavigationProp } from "@react-navigation/stack";
import { InspectionParamList } from "../../../navigation/inbound/InspectionNavigator";
import { useNavigation } from "@react-navigation/native";

    type NavigationProp = StackNavigationProp<InspectionParamList,'InspectionMain'>;
const InspectionDo = () => {
    
      const navigation = useNavigation<NavigationProp>();
    const data = {
        inboundPlanningId: "CWH02-IN-0625-0002",
        suratJalan: [
            { id: "188258" },
            { id: "188259" },
            { id: "188260" },
        ],
    };

    return (
        
        <View style={{ flex: 1, backgroundColor: "#fff", padding: 24 }}>
            {/* Header */}
            <View style={{ alignItems: "center", marginBottom: 32 }}>
                <Text style={{ color: "#9ca3af", fontSize: 18, marginBottom: 6 }}>
                    Inbound Planning ID
                </Text>
                <Text style={{ fontSize: 28, fontWeight: "700", color: "#111827" }}>
                    {data.inboundPlanningId}
                </Text>
            </View>

            {/* List Surat Jalan */}
            <ScrollView showsVerticalScrollIndicator={false}>
                {data.suratJalan.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => {
                            // Replace with your navigation logic
                            // Example using React Navigation:
                            navigation.navigate('InspectionList', { id: item.id });
                        }}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: 20,
                            paddingHorizontal: 18,
                            backgroundColor: "#f3f4f6",
                            borderRadius: 18,
                            marginBottom: 18,
                            shadowColor: "#000",
                            shadowOpacity: 0.05,
                            shadowOffset: { width: 0, height: 2 },
                            shadowRadius: 10,
                            elevation: 2,
                        }}
                    >
                        <Ionicons name="chevron-right" size={20} color={Colors.secondaryColor} />
                        <Text style={{ marginLeft: 18, fontWeight: "600", fontSize: 22, color: "#1f2937", flex: 1 }}>
                            Surat Jalan No. {item.id}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

export default InspectionDo;
