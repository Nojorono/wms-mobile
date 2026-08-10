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
import { useLoadingDialogStore } from "../../../../../store/useLoadingStore";
import ReturServices from "../../../../../service/returService";
import UserServices from "../../../../../service/userServices";
import { ROLES } from "../../../../../constants/Roles";
import { useDialogStore } from "../../../../../store/useGlobalDialog";
import { Dropdown } from "react-native-element-dropdown";

type HelperModalProps = {
  visible: boolean;
  helperData: any | null;
  ReturId: string;
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
  ReturId,
  onClose,
}: HelperModalProps) {
  const [formData, setFormData] = useState<FormData>({
    deviceId: "",
    name: "",
    contact: "",
  });

  const [userList, setUserList] = useState<any[]>([]);
  const showDialog = useDialogStore((state) => state.showDialog);

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
    }
  }, [visible, helperData]);

  // === FETCH USERS ===
  const fetchUserList = async (roleName = ROLES.HELPER) => {
    try {
      showLoadingDialog("Loading Data Users");

      const response = await UserServices.getUserList();

      const filteredUsers = (response?.data || []).filter(
        (user: any) =>
          user?.role?.name?.toUpperCase() === roleName.toUpperCase()
      );

      setUserList(filteredUsers);
    } catch (error: any) {
      showDialog('error', `Error submitting adjustment: ${error.data.message || ''}.`);
    } finally {
      hideLoadingDialog();
    }
  };

  useEffect(() => {
    fetchUserList();
  }, []);

  // === PICKER (DEVICE ID) CHANGE ===
  const handlePickerChange = (selectedId: string) => {
    if (!selectedId) {
      setFormData({
        deviceId: "",
        name: "",
        contact: "",
      });
      return;
    }

    const foundUser = userList.find((u) => u.id === selectedId);

    setFormData({
      deviceId: selectedId,
      name: `${foundUser?.userDetail?.firstName || ""} ${foundUser?.userDetail?.lastName || ""}`.trim(),
      contact: foundUser?.userDetail?.phone || "",
    });
  };

  // === SAVE DATA ===
  const handleSave = async () => {
    // prevent submit if required data is empty
    if (!formData.deviceId || !formData.name || !formData.contact) {
      showDialog('error', 'Please complete all fields before saving.');
      return;
    }

    try {
      showLoadingDialog("Saving...");
      const payload = {
        inbound_retur_id: ReturId,
        helper_user_id: formData.deviceId ,
        helper_name: formData.name ,
        helper_phone: formData.contact ,


      };

      if (helperData) {
        await ReturServices.updateHelper(helperData.id, payload);
      } else {
        await ReturServices.postHelper(payload);
      }
    } catch (error: any) {
      showDialog('error', `Error: ${error?.data?.message || ''}.`);
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

          <Text style={styles.label}>Username</Text>
          <Dropdown
            style={styles.dropdownSelect}
            data={userList}
            search
            labelField="username"
            valueField="id"
            placeholder="Select Device"
            searchPlaceholder="Search device..."
            value={formData.deviceId}
            onChange={(item) => handlePickerChange(item.id)}
          />

          {/* MERGED NAME INPUT (NOW WITH AUTOCOMPLETE) */}
          <Text style={styles.label}>Name</Text>

          <View style={{ zIndex: 100 }}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={formData.name}
              editable={false}

            />
          </View>

          {/* CONTACT */}
          <Text style={styles.label}>Contact</Text>
          <TextInput
            style={styles.input}
            value={formData.contact}
            placeholder="Contact"
            editable={false}
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
  dropdownSelect: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: "#fafafa",
  },
});
