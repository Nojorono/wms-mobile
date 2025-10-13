import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { ForkLiftParamList } from "../../../navigation/inbound/ForkLiftNavigator";

type NavigationProp = StackNavigationProp<
    ForkLiftParamList,
    "ForkLiftMain"
>;


const ForkLiftDetailScreen = () => {
  const route = useRoute();
  const { item } = route.params as any; // ambil payload.item dari navigasi
  const pallet = item.inventoryTracking.pallet;
  
      const navigation = useNavigation<NavigationProp>();
  const staging = item.inventoryTracking.warehouseSub;
  const destination = item.destinationBin;

  return (
    <View style={styles.container}>
      {/* Card Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="pallet" size={38} color="#2B2B2B" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.cardLabel}>Pallet Code</Text>
            <Text style={styles.cardTitle}>{pallet.pallet_code}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Current Qty</Text>
          <Text style={styles.infoValue}>{pallet.currentQuantity}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Staging Area</Text>
          <Text style={styles.infoValue}>{staging.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Destination Bin</Text>
          <Text style={styles.infoValue}>{destination.code}</Text>
        </View>

      </View>


      {/* Scan Button */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={[styles.scanButton, { backgroundColor: "#FF6B00" }]}
          onPress={() =>  navigation.navigate("CameraScreen", {
              item: item,
            })}
        >
          <Icon name="barcode" size={20} color="#fff" />
          <Text style={styles.scanText}>Scan Bin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ForkLiftDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF7F2",
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  cardLabel: {
    fontSize: 15,
    color: "#A0A0A0",
    fontWeight: "500",
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2B2B2B",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  infoLabel: {
    fontSize: 17,
    color: "#6F6F6F",
  },
  infoValue: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FF6B00",
    marginLeft: 8,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2B2B2B",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 16,
    color: "#333",
    marginTop: 14,
  },
  buttonWrapper: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 48,
    elevation: 4,
  },
  scanText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 12,
  },
});
