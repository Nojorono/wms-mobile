import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";

import { useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/FontAwesome5";
import { useLoadingDialogStore } from "../../../../../store/useLoadingStore";
import InboundServices from "../../../../../service/inboundServices";
import HelperModal from "./CheckerModal";
import { useConfirmationStore } from "../../../../../store/useConfirmationStore";
import inboundServices from "../../../../../service/inboundServices";

type InboundDetailRouteParams = {
  item: {
    id: string;
    inbound_number: string;
    license_plate: string;
  };
};

export default function HelperListScreen() {
  const route = useRoute();
  const payload = route.params as InboundDetailRouteParams;
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingHelper, setEditingHelper] = useState<any | null>(null);
  const [dataHelper, setDataHelper] = useState<any[]>([]);
  
      const confirm = useConfirmationStore();
      console.log("confirm", payload.item.id);

  const fetchInbound = async () => {
    try {
      showLoadingDialog("Loading List Helpers");
      const response = await InboundServices.getHelperList(payload.item.id);
      setDataHelper(response?.data || []);
    } catch (error) {
      console.error("Error fetching helper list data:", error);
    } finally {
      hideLoadingDialog();
    }
  };

  useEffect(() => {
    fetchInbound();
  }, []);

  // Refresh saat modal ditutup
  useEffect(() => {
    if (!modalVisible) {
      fetchInbound();
    }
  }, [modalVisible]);

  const openAddModal = () => {
    setEditingHelper(null); // null → Add Mode
    setModalVisible(true);
  };

  const openEditModal = (helper: any) => {
    setEditingHelper({
      id: helper.id,
      deviceId: helper.deviceId ?? helper.helper_user_id ?? "",
      name: helper.name ?? helper.helper_name ?? "",
      contact: helper.contact ?? helper.helper_phone ?? "",
    });
    setModalVisible(true);
  };

  const renderHelper = ({ item }: any) => (
    <View style={styles.card}>
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <View style={{ flex: 1, gap: 6 }}>
          <View style={{ flexDirection: "row", marginBottom: 2 }}>
            <Text style={[styles.label, { width: 90 }]}>Username</Text>
            <Text style={styles.value}>
              { item.user?.username ?? "-"}
            </Text>
          </View>
          <View style={{ flexDirection: "row", marginBottom: 2 }}>
            <Text style={[styles.label, { width: 90 }]}>Name</Text>
            <Text style={styles.value}>{item.name ?? item.helper_name}</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text style={[styles.label, { width: 90 }]}>Contact</Text>
            <Text style={styles.value}>{item.contact ?? item.helper_phone}</Text>
          </View>
       <View style={{ marginTop: 10 }}>
  <TouchableOpacity
    onPress={() =>  confirm.show("decline", "Are you sure want to Delete this helper?", async () => {
                                   await inboundServices.deleteHelper(item.id)
                                    fetchInbound()
                                }, false
                                )
                              }
    style={{
      backgroundColor: "#DC2626",
      borderRadius: 10,
      paddingVertical: 6,
      paddingHorizontal: 12,
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    }}
  >
    <Ionicons name="trash" size={16} color="#fff" />
    <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>
      Remove
    </Text>
  </TouchableOpacity>
</View>

        </View>



        <TouchableOpacity
          onPress={() => openEditModal(item)}
          style={{ marginLeft: 8 }}
        >
          <Ionicons name="pen" size={20} color="#FF6B00" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Info Box */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbound Planning Number</Text>
        <Text style={styles.headerNumber}>{payload.item.inbound_number}</Text>
        <Text style={styles.vehicle}>
          <Ionicons name="truck" size={20} /> {payload.item.license_plate}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Assigned Helper</Text>

      {dataHelper.length > 0 ? (
        <FlatList
          data={dataHelper}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderHelper}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      ) : (
        <View style={{ alignItems: "center", marginVertical: 40 }}>
          <Text style={{ color: "#6B7280", fontSize: 18 }}>
            Add new helper first
          </Text>
        </View>
      )}

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Ionicons name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal */}
      <HelperModal
        visible={modalVisible}
        helperData={editingHelper}
        inboundId={payload.item.id}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFCFB", padding: 16 },
  header: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, color: "#6B7280", textAlign: "center" },
  headerNumber: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "center",
  },
  vehicle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 8,
    color: "#DC2626",
    textAlign: "center",
  },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: { fontSize: 18, fontWeight: "600" },
  value: { fontSize: 18, fontWeight: "400", color: "#FF6B00" },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#FF6B00",
    borderRadius: 50,
    padding: 16,
    elevation: 4,
  },
});
