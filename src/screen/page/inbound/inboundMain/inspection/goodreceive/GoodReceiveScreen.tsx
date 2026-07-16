
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import Ionicons from "react-native-vector-icons/FontAwesome5";
import { InspectionParamList } from "../../../../../navigation/inbound/InspectionNavigator";
import { StackNavigationProp } from "@react-navigation/stack";
import { useLoadingDialogStore } from "../../../../../../store/useLoadingStore";
import InboundServices from "../../../../../../service/inboundServices";
import { mergeGoodReceive, transformInspectionResponse } from "../../../service/inboundService";
import InspectionCardList from "../../../../../../components/inbound/InspectionListCard";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import GoodReceivedCardList from "../../../../../../components/inbound/GoodReceiveListCard";



type NavigationProp = StackNavigationProp<InspectionParamList, 'InspectionMain'>;


const GoodReceiveScreen = () => {
  // Ambil payload dari route params
  type InboundDetailRouteParams = {
    payload: {
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
  const [isIntegrating, setIsIntegrating] = useState(false);
  const payload = route.params as InboundDetailRouteParams;
  const [statusRecent, setStatusRecent] = useState<string>("");
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const handleCheck = (item: any) => {
    navigation.navigate("GoodReceiveDetail", {
      item,
      payload: payload.payload,
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchInspectionById();
    }, [])
  );

  const fetchInspectionById = async () => {
    try {
      showLoadingDialog("Loading List Good Receive")
      const response = await InboundServices.getInspectionByInboundId(payload.payload.id);
      const inbound = response.data;
      setStatusRecent(inbound.status);
      const dataInspection: any = mergeGoodReceive(inbound);

      // Urutkan data: status === "PENDING" di atas
      const sortedData = [
        ...dataInspection.filter((item: any) => item.inspection_status === "PENDING"),
        ...dataInspection.filter((item: any) => item.inspection_status !== "PENDING"),
      ];

      setMergedData(sortedData);
      console.log("Merged and sorted data:", sortedData);
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
    <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
      {/* Info Section */}
      <View style={[styles.infoCard, { width: "100%" }]}>
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
      <View style={{ flex: 1, width: "100%" }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ width: "100%", paddingHorizontal: 16 }}>
          <GoodReceivedCardList
            items={mergedData}
            onCheck={handleCheck}
          />
        </ScrollView>
      </View>

      {/* Floating Button "meta" */}
      {mergedData.every((item: any) => item.inspection_status === "APPROVED") && (
        <TouchableOpacity
          style={{
            position: "absolute",
            alignSelf: "center",
            bottom: 32,
            backgroundColor: mergedData.every((item: any) => item.integration_status === "SUCCESS") ||
              mergedData.some((item: any) => item.status_do === "PROCESSING")
              ? "#ccc"
              : "#421dfaff",
            borderRadius: 28,
            paddingVertical: 14,
            paddingHorizontal: 28,
            elevation: 4,
          }}
          disabled={
            mergedData.every((item: any) => item.integration_status === "SUCCESS") ||
            mergedData.some((item: any) => item.status_do === "PROCESSING")
          }
          onPress={async () => {
            // TODO: handle meta button press
            Alert.alert(
              "Confirmation",
              "Are you sure you want to integrate to META?",
              [
                {
                  text: "Cancel",
                  onPress: () => { },
                  style: "cancel",
                },
                {
                  text: "OK",
                  onPress: async () => {
                  if (isIntegrating) return; // Guard kedua saat klik OK di alert
                      
                    setIsIntegrating(true);
                    try {
                      showLoadingDialog("Integrating to META...");
                      const res = await InboundServices.postIntegrationToOracle(payload.payload.id);
                      console.log("Integration response:", res);
                      Alert.alert("Success", res.data.status, [
                        {
                          text: "OK",
                          onPress: () => {
                            // navigation.pop(2);
                            fetchInspectionById() // Refresh data setelah integrasi
                            return
                          },
                        },
                      ]);
                    } catch (error: any) {
                      Alert.alert('Error', error?.data?.message);
                      setIsIntegrating(false); // Buka kunci jika terjadi error
                    } finally {
                      hideLoadingDialog();
                    }
                  },
                },
              ]
            );
          }}
        >
          <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 16 }}>{isIntegrating ? "INTEGRATING..." : "INTEGRATE TO META"}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default GoodReceiveScreen;

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
