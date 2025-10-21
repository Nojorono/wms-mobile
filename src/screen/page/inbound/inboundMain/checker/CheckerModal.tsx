import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useLoadingDialogStore } from "../../../../../store/useLoadingStore";
import InboundServices from "../../../../../service/inboundServices";
import UserServices from "../../../../../service/userServices";

type HelperModalProps = {
  visible: boolean;
  helperData: any | null; // null untuk add, object untuk edit
  inboundId: string; // selalu dikirim dari parent
  onClose: () => void;
};

export default function HelperModal({
  visible,
  helperData,
  inboundId,
  onClose,
}: HelperModalProps) {
  const [formData, setFormData] = useState<any>({
    deviceId: "",
    name: "",
    contact: "",
  });
  const [userList, setUserList] = useState<any[]>([]);

  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();

  // Reset data setiap kali modal dibuka
  useEffect(() => {
    if (visible) {
      if (helperData) {
        setFormData({
          deviceId: helperData.deviceId || "",
          name: helperData.name || "",
          contact: helperData.contact || "",
        });
      } else {
        setFormData({ deviceId: "", name: "", contact: "" });
      }
    }
  }, [visible, helperData]);

  const handleSave = async () => {
    try {
      showLoadingDialog("Loading");
      if (helperData) {
        // Edit mode
        const payload = {
          inbound_id: inboundId,
          helper_user_id: formData.deviceId || "",
          helper_name: formData.name || "",
          helper_phone: formData.contact || "",
        };
        await InboundServices.updateHelper(helperData.id, payload);
      } else {
        // Add mode
        const payload = {
          inbound_id: inboundId,
          helper_user_id: formData.deviceId || "",
          helper_name: formData.name || "",
          helper_phone: formData.contact || "",
        };
        await InboundServices.postHelper(payload);
      }
    } catch (error) {
      console.error("Error saving helper data:", error);
    } finally {
      hideLoadingDialog();
      onClose();
    }
  };

const fetchUserList = async (roleName = "HELPER") => {
  try {
    showLoadingDialog(`Loading Data Users (${roleName})`);
    const response = await UserServices.getUserList();
    const filteredUsers = (response?.data || []).filter(
      (user:any) => user?.role?.name?.toUpperCase() === roleName.toUpperCase()
    );
    setUserList(filteredUsers);
  } catch (error) {
    console.error("Error fetching user list data:", error);
  } finally {
    hideLoadingDialog();
  }
};


  useEffect(() => {
    fetchUserList();
  }, []);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {helperData ? "Edit Helper" : "Add Helper"}
          </Text>

          <Text style={styles.inputLabel}>Device ID</Text>
          <Picker
            selectedValue={formData.deviceId}
            onValueChange={(itemValue) =>
              setFormData((prev: any) => ({ ...prev, deviceId: itemValue }))
            }
            style={styles.picker}
          >
            <Picker.Item label="Select Device" value="" />
            {userList.map((user: any) => (
              <Picker.Item
                key={user.id}
                label={user.username || "-"}
                value={user.id}
              />
            ))}
          </Picker>

          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) =>
              setFormData((prev: any) => ({ ...prev, name: text }))
            }
            placeholder="Enter name"
          />

          <Text style={styles.inputLabel}>Contact</Text>
          <TextInput
            style={styles.input}
            value={formData.contact}
            onChangeText={(text) =>
              setFormData((prev: any) => ({ ...prev, contact: text }))
            }
            placeholder="Enter contact"
            keyboardType="phone-pad"
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#ccc" }]}
              onPress={onClose}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#FF6B00" }]}
              onPress={handleSave}
            >
              <Text style={{ color: "#fff" }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  inputLabel: { fontSize: 18, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
    fontSize: 18,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 4,
    fontSize: 18,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    gap: 10,
  },
  button: { padding: 12, borderRadius: 8, minWidth: 80, alignItems: "center" },
});
