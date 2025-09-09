import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../../constants/Colors.ts";

type InboundCardProps = {
  code: string; // CWH02-IN-0625-0001
  plate: string; // K 9985 AT
  date: string; // 2025-01-02
  role: string; // Warehouse Staff
  status?: string; // Draft
  statusColor?: string; // default abu-abu
  onClick?: () => void;
};

const InboundCard: React.FC<InboundCardProps> = ({
  code,
  plate,
  date,
  role,
  status = "Draft",
  statusColor = "#D3D6D9",
  onClick,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={onClick}
    >
      {/* Header: Code */}
      <View style={styles.headerRow}>
        <Text style={styles.code}>{code}</Text>
        <Ionicons name="arrow-forward" size={20} color="orange" />
      </View>

      {/* Middle: Icon + Info */}
      <View style={styles.infoRow}>
        <Ionicons name="cube-outline" size={58} color="black" />
        <View style={{ marginLeft: 8 }}>
          <Text style={styles.plate}>{plate}</Text>
          <Text style={styles.date}>{date}</Text>
          <Text style={styles.role}>{role}</Text>
        </View>
      </View>

      {/* Status */}
      {status && (
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default InboundCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    code: {
        fontSize: 20, // lebih besar
        fontWeight: "bold",
        color: "#000",
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    plate: {
        fontSize: 18, // lebih besar
        fontWeight: "600",
        color: "#000",
    },
    date: {
        fontSize: 16, // lebih besar
        color: "#333",
        marginTop: 2,
    },
    role: {
        fontSize: 16, // lebih besar
        color: "#333",
        marginTop: 2,
    },
    statusBadge: {
        alignSelf: "flex-start",
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 16, // lebih besar
        fontWeight: "500",
        color: "#333",
    },
});
