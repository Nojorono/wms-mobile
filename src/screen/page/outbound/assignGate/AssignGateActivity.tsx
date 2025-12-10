import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import UserServices from "../../../../service/userServices";
import { useLoadingDialogStore } from "../../../../store/useLoadingStore";
import { ROLES } from "../../../../constants/Roles";
import OutboundService from "../../../../service/outboundService";
import { set } from "react-hook-form";
import { useNavigation, useRoute } from "@react-navigation/native";
import { combine } from "zustand/middleware";
import { useDialogStore } from "../../../../store/useGlobalDialog";
import { AssignGateParamList } from "../../../navigation/outbound/AssignGateNavigator";
import { StackNavigationProp } from "@react-navigation/stack";

interface AssignForm {
  name: string;
  contact: string;
  deviceId: string;
  gateId: string;
}


type NavigationProp = StackNavigationProp<AssignGateParamList, 'AssignGateMain'>;

export default function AssignGateActivity() {
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const [userManageList, setUserManageList] = useState<any[]>([]);
  const navigation = useNavigation<NavigationProp>();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
const showDialog = useDialogStore((state) => state.showDialog);
  const route = useRoute();
  const params = (route.params || {}) as any;
  const [userList, setUserList] = useState<any[]>([]);
  const [gateList, setGateList] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [formData, setFormData] = useState<AssignForm>({
    gateId: "",
    name: "",
    contact: "",
    deviceId: "",
  });

  function getPickedWithScan(data: any) {
    const memos = data.item?.outbound_memos ?? [];

    let result: any[] = [];

    memos.forEach((memo: any) => {
      memo.transaction_pickings.forEach((tp: any) => {

        // hanya ambil yang punya scan
        if (tp.transactionScanPicking && tp.transactionScanPicking.length > 0) {
          result.push({
            picking: tp,                            // parent
            scans: tp.transactionScanPicking        // array scan item
          });
        }

      });
    });

    return result;
  }


  const pickedWithScan = getPickedWithScan(params);
 
const handleSubmit = async () => {
    try {
      showLoadingDialog("Saving Assignment...");  
      const payload = {
        gate_id: formData.gateId,
        outbound_do_id: params.item.id,
        users: [
          {
        user_id: formData.deviceId,
        user_name: formData.name,
        user_phone: formData.contact,
          },
        ],
      };
      await OutboundService.postAssignGate(payload);
      showDialog("success", "Gate assignment saved successfully.");
      hideLoadingDialog();
      navigation.goBack();
    } catch (error) {
      showDialog("error", "Failed to save gate assignment.");
      hideLoadingDialog();
    }
  }

  const fetchUserList = async (roleName = ROLES.DRIVER_FORKLIFT) => {
    try {
      showLoadingDialog("Loading Data Users");

      const response = await UserServices.getUserList();
      const responseManage = await UserServices.getUserManagementList();
      const responseGate = await OutboundService.getGateList();
      setGateList(responseGate?.data || []);
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

  const handleNameChange = (text: string) => {
    setFormData((prev) => ({ ...prev, name: text }));
    setShowUserDropdown(true);

    if (!text.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = userManageList.filter((u) =>
      u.name?.toLowerCase().includes(text.toLowerCase())
    );

    setSearchResults(filtered);
  };



  const handleSelectUser = (user: any) => {
    setFormData(prev => ({
      ...prev,
      name: user.name,
      contact: user.phone,
    }));

    setSearchResults([]);
    setShowUserDropdown(false);
  };

  // === PICKER (DEVICE ID) CHANGE ===
  const handlePickerChange = (selectedId: string) => {
    setFormData((prev) => ({ ...prev, deviceId: selectedId }));

    if (!selectedId) return;

    const foundInUserList = userList.find((u) => u.id === selectedId);
    const foundInManage = userManageList.find((u) => u.id === selectedId);
    const found = foundInUserList || foundInManage;

    if (found) {
      setFormData((prev) => ({
        ...prev,
        name: found.name || prev.name,
        contact: found.phone || prev.contact,
      }));
    }
  };

  const handlePickerGateChange = (selectedId: string) => {
    setFormData((prev) => ({ ...prev, gateId: selectedId }));

    if (!selectedId) return;

    const foundInUserList = userList.find((u) => u.id === selectedId);
    const foundInManage = userManageList.find((u) => u.id === selectedId);
    const found = foundInUserList || foundInManage;

    if (found) {
      setFormData((prev) => ({
        ...prev,
        name: found.name || prev.name,
        contact: found.phone || prev.contact,
      }));
    }
  };



  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Assign Gate</Text>

      <Text style={styles.label}>Select Gate</Text>
      <Picker
        selectedValue={formData.gateId}
        onValueChange={(itemValue) => handlePickerGateChange(String(itemValue))}
        style={styles.picker}
      >
        <Picker.Item label="Select Gate" value="" />
        {gateList.map((gate) => (
          <Picker.Item
            key={gate.id}
            label={gate.name || " -"}
            value={gate.id}
          />
        ))}
      </Picker>


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

      <Text style={styles.label}>User</Text>

      <View style={{ zIndex: 100 }}>
        <TextInput
          style={styles.input}
          placeholder="Search or type name..."
          value={formData.name}
          onChangeText={handleNameChange}
          onFocus={() => setShowUserDropdown(true)}
        />

        {showUserDropdown && searchResults.length > 0 && (
          <View style={styles.dropdown}>
            <ScrollView style={{ maxHeight: 200 }}>
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
      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        editable={false}
        value={formData.contact}
        placeholder="Auto-filled"
      />
    
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Save Assignment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 80,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#111",
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
    marginTop: 18,
  },

  // INPUT
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 12,
    fontSize: 15,
    backgroundColor: "#fafafa",
  },

  // SELECT BOX
  selectBox: {
    position: "relative",
  },
  selectButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fafafa",
  },
  selectText: {
    fontSize: 15,
    color: "#333",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: "#fafafa",
  },

  // DROPDOWN
  dropdown: {
    position: "absolute",
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 99,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f3f3",
  },
  dropdownName: {
    fontSize: 15,
    color: "#222",
  },
  dropdownPhone: {
    fontSize: 12,
    color: "#888",
  },

  submitButton: {
    marginTop: 30,
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
