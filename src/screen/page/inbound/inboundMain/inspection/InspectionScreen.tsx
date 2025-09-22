// screens/UnloadingScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import Ionicons from "react-native-vector-icons/FontAwesome5";
import { UnloadingParamList } from "../../../../navigation/inbound/UnloadingNavigator";
import {  MergedItem, mergeUnloadingData, transformInspectionResponse } from "../../service/inboundService";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useLoadingDialogStore } from "../../../../../store/useLoadingStore";
import InboundServices from "../../../../../service/inboundServices";
import UnloadingCardList from "../../../../../components/inbound/UnloadingListCard";
import { StackNavigationProp } from "@react-navigation/stack";
import { InspectionParamList } from "../../../../navigation/inbound/InspectionNavigator";
import InspectionCardList from "../../../../../components/inbound/InspectionListCard";


type NavigationProp = StackNavigationProp<InspectionParamList, 'InspectionMain'>;


const InspectionScreen = () => {
  // Ambil payload dari route params
  type InboundDetailRouteParams = {
    item: {
      id: string;
      inbound_number: string;
      license_plate: string;
      inbound_type: string;
      status: string;
    };
  };


  const navigation = useNavigation<NavigationProp>();
  const [mergedData, setMergedData] = useState<any>([]);
  const route = useRoute();
  const payload = route.params as InboundDetailRouteParams;
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();


  const handleCheck = (item: any) => {
    // navigation.navigate("UnloadingScan", {
    //   item,
    //   payload: payload.item,
    // });
  };

  const fetchInspectionById = async () => {
    try {
      showLoadingDialog("Loading List Inbound Planning")
      const response = await InboundServices.getInspectionList('PENDING');
      const inbound = response.data;
      const dataInspection: any = transformInspectionResponse(inbound);
      console.log("Data Inspection:", dataInspection);
      setMergedData(dataInspection[0].items_summary);
    } catch (error) {
      hideLoadingDialog()
      console.error('Error fetching inspection data:', error);
      Alert.alert(
        'Error',
        'Failed to fetch inspection data. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      hideLoadingDialog()
    }
  }


  useEffect(() => {
    const initialize = async () => {
      try {
        await fetchInspectionById()
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    initialize();
  }, [])


  return (
    <View style={styles.container}>
      {/* Info Section */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Inbound Planning Number</Text>
        <View style={styles.row}>
          <Ionicons name="book" size={18} color="black" />
          <Text style={styles.infoValue}>{payload.item.inbound_number}</Text>
        </View>

        <View style={styles.vehicleBox}>
          <Ionicons name="truck" size={18} color="#FF6B00" />
          <Text style={styles.vehicleText}>{payload.item.license_plate}</Text>
        </View>

        <View style={styles.typeBox}>
          <Text style={styles.typeText}>{payload.item.inbound_type}</Text>
        </View>
      </View>

      {/* Scrollable Dynamic Card List */}
      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <InspectionCardList
            items={mergedData}
            onCheck={handleCheck}
          />
      
        </ScrollView>
      </View>
    </View>
  );
};

export default InspectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF6B00",
    marginLeft: 10,
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
