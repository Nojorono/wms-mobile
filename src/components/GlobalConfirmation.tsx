// components/GlobalConfirmation.tsx
import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { useConfirmationStore } from "../store/useConfirmationStore";
import Ionicons from "react-native-vector-icons/FontAwesome5";

export default function GlobalConfirmation() {
  const { visible, type, message, onConfirm, hide } = useConfirmationStore();
  const [reason, setReason] = useState("");

  if (!visible) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      type === "decline" ? onConfirm(reason) : onConfirm();
    }
    hide();
    setReason("");
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {type === "accept" ? (
            <Ionicons name="check-circle" size={60} color="green" />
          ) : (
            <Ionicons name="times-circle" size={60} color="red" />
          )}
          <Text style={styles.message}>{message}</Text>

          {type === "decline" && (
            <TextInput
              style={styles.input}
              placeholder="Reason..."
              value={reason}
              onChangeText={setReason}
            />
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancel} onPress={hide}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirm} onPress={handleConfirm}>
              <Text style={styles.btnText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  message: {
    fontSize: 18,
    marginVertical: 15,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    width: "100%",
    marginBottom: 15,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancel: {
    flex: 1,
    padding: 12,
    backgroundColor: "#ccc",
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  confirm: {
    flex: 1,
    padding: 12,
    backgroundColor: "#007BFF",
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: {
    color: "white",
    fontWeight: "600",
  },
});
