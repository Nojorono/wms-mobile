import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useLoadingDialogStore } from "../../../../../store/useLoadingStore";
import InboundServices from "../../../../../service/inboundServices";
import UserServices from "../../../../../service/userServices";
import { ROLES } from "../../../../../constants/Roles";

type HelperModalProps = {
  visible: boolean;
  helperData: any | null;
  inboundId: string;
  onClose: () => void;
};

type FormData = {
  deviceId: string;
  name: string;
  contact: string;
};

export default function HelperModal({
  visible,
  helperData,
  inboundId,
  onClose,
}: HelperModalProps) {
  const [formData, setFormData] = useState<FormData>({
    deviceId: "",
    name: "",
    contact: "",
  });

  const [userList, setUserList] = useState<any[]>([]);
  const [userManageList, setUserManageList] = useState<any[]>([]);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();

  // === RESET DATA MODAL ===
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
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, [visible, helperData]);

  // === FETCH USERS ===
  const fetchUserList = async (roleName = ROLES.HELPER) => {
    try {
      showLoadingDialog("Loading Data Users");

      const response = await UserServices.getUserList();
      const responseManage = await UserServices.getUserManagementList();

      setUserManageList(responseManage?.data || []);

      const filteredUsers = (response?.data || []).filter(
        (user: any) =>
          user?.role?.name?.toUpperCase() === roleName.toUpperCase()
      );

      setUserList(filteredUsers);
    } catch (error) {
      console.log("Error:", error);
    } finally {
      hideLoadingDialog();
    }
  };

  useEffect(() => {
    fetchUserList();
  }, []);

  // === SEARCH AUTOCOMPLETE (MERGED WITH NAME INPUT) ===
  const handleNameChange = (text: string) => {
    // set name in form
    setFormData((prev: FormData) => ({ ...prev, name: text }));

    setShowDropdown(true);

    if (!text.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = userManageList.filter((u) =>
      u.name?.toLowerCase().includes(text.toLowerCase())
    );

    setSearchResults(filtered);
  };

  // === SELECT AUTOCOMPLETE USER ===
  const handleSelectUser = (user: any) => {
    setFormData((prev: FormData) => ({
      // hanya overwrite deviceId jika user.id ada; otherwise keep prev.deviceId
      deviceId: prev.deviceId,
      name: user.name ?? prev.name,
      contact: user.phone ?? prev.contact,
    }));

    setSearchResults([]);
    setShowDropdown(false);
  };

  // === PICKER (DEVICE ID) CHANGE ===
  const handlePickerChange = (selectedId: string) => {
    setFormData((prev: FormData) => ({ ...prev, deviceId: selectedId }));

    if (!selectedId) return;

    const foundInUserList = userList.find((u) => u.id === selectedId);
    const foundInManage = userManageList.find((u) => u.id === selectedId);
    const found = foundInUserList || foundInManage;

    if (found) {
      setFormData((prev: FormData) => ({
        ...prev,
        name: found.name || prev.name,
        contact: found.phone || prev.contact,
      }));
    }
  };

  // === SAVE DATA ===
  const handleSave = async () => {
    try {
      showLoadingDialog("Saving...");

      const payload = {
        inbound_id: inboundId,
        helper_user_id: formData.deviceId || "",
        helper_name: formData.name || "",
        helper_phone: formData.contact || "",
      };

      if (helperData) {
        await InboundServices.updateHelper(helperData.id, payload);
      } else {
        await InboundServices.postHelper(payload);
      }
    } catch (error) {
      console.log(error);
    } finally {
      hideLoadingDialog();
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>
            {helperData ? "Edit Helper" : "Add Helper"}
          </Text>

          {/* DEVICE ID */}
          <Text style={styles.label}>Device ID</Text>
          <Picker
            selectedValue={formData.deviceId}
            onValueChange={(itemValue) => handlePickerChange(String(itemValue))}
            style={styles.picker}
          >
            <Picker.Item label="Select Device" value="" />
            {userList.map((user) => (
              <Picker.Item
                key={user.id}
                label={user.username || user.name || "-"}
                value={user.id}
              />
            ))}
          </Picker>

          {/* MERGED NAME INPUT (NOW WITH AUTOCOMPLETE) */}
          <Text style={styles.label}>Name</Text>

          <View style={{ zIndex: 100 }}>
            <TextInput
              style={styles.input}
              placeholder="Search or type name..."
              value={formData.name}
              onChangeText={handleNameChange}
              onFocus={() => setShowDropdown(true)}
            />

            {/* AUTOCOMPLETE DROPDOWN */}
            {showDropdown && searchResults.length > 0 && (
              <View style={styles.dropdown}>
                <ScrollView style={{ maxHeight: 180 }}>
                  {searchResults.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.dropdownItem}
                      onPress={() => handleSelectUser(item)}
                    >
                      <Text style={styles.dropdownName}>{item.name}</Text>
                      <Text style={styles.dropdownPhone}>{item.phone}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* CONTACT */}
          <Text style={styles.label}>Contact</Text>
          <TextInput
            style={styles.input}
            value={formData.contact}
            onChangeText={(text) =>
              setFormData((prev: FormData) => ({ ...prev, contact: text }))
            }
            placeholder="Enter contact"
            keyboardType="phone-pad"
          />

          {/* BUTTONS */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
              <Text style={{ color: "#fff" }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  label: { fontSize: 18, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
    fontSize: 18,
    backgroundColor: "#fafafa",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: "#fafafa",
  },
  dropdown: {
    position: "absolute",
    top: 58,
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    zIndex: 999,
    elevation: 9,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dropdownPhone: {
    fontSize: 14,
    color: "#666",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    gap: 10,
  },
  btnCancel: {
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
    backgroundColor: "#ccc",
  },
  btnSave: {
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
    backgroundColor: "#FF6B00",
  },
});
