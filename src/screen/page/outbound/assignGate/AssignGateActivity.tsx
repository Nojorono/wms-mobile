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

export default function AssignGateActivity() {
  const [gates, setGates] = useState<any[]>([]);
  const [loadingGate, setLoadingGate] = useState(false);

  const [selectedGate, setSelectedGate] = useState("");

  const [userList, setUserList] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    deviceId: "",
  });

  // ============================
  // FETCH GATE LIST
  // ============================
  const fetchGateList = async () => {
    try {
      setLoadingGate(true);
      const res = await fetch("https://api.example.com/gates");
      const json = await res.json();
      setGates(json.data || []);
    } catch (err) {
      console.log("Gate API Error:", err);
    } finally {
      setLoadingGate(false);
    }
  };

  useEffect(() => {
    fetchGateList();
  }, []);

  // ============================
  // AUTOCOMPLETE SEARCH
  // ============================
  const handleNameChange = (text: string) => {
    setFormData((prev) => ({ ...prev, name: text }));
    setShowDropdown(true);

    if (!text.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = userList.filter((u) =>
      u.name?.toLowerCase().includes(text.toLowerCase())
    );

    setSearchResults(filtered);
  };

  const handleSelectUser = (user: any) => {
    setFormData((prev) => ({
      ...prev,
      name: user.name,
      contact: user.phone,
    }));
    setShowDropdown(false);
    setSearchResults([]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Assign Gate</Text>

      {/* ============================
        SELECT GATE
      ============================ */}
      <Text style={styles.label}>Select Gate</Text>

      <View style={styles.selectBox}>
        {loadingGate ? (
          <ActivityIndicator size="small" />
        ) : (
          <>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowDropdown((prev) => !prev)}
            >
              <Text style={styles.selectText}>
                {selectedGate
                  ? gates.find((g) => g.id === selectedGate)?.name
                  : "Choose gate..."}
              </Text>
              <Icon name="chevron-down" size={18} />
            </TouchableOpacity>

            {showDropdown && (
              <View style={styles.dropdown}>
                {gates.map((gate) => (
                  <TouchableOpacity
                    key={gate.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedGate(gate.id);
                      setShowDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownName}>{gate.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </View>

      {/* ============================
        AUTOCOMPLETE USER INPUT
      ============================ */}
      <Text style={styles.label}>User</Text>

      <View style={{ zIndex: 10 }}>
        <TextInput
          style={styles.input}
          placeholder="Search or type name..."
          value={formData.name}
          onChangeText={handleNameChange}
          onFocus={() => setShowDropdown(true)}
        />

        {showDropdown && searchResults.length > 0 && (
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

      {/* ============================
         SUBMIT
      ============================ */}
      <TouchableOpacity style={styles.submitButton}>
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
