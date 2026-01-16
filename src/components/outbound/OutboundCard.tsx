import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../../constants/Colors.ts";

type OutboundCardProps = {
  title: string; // CWH02-IN-0625-0001
  subTitle?: string; // K 9985 AT
  origin?: string; // 2025-01-02
  role?: string; // Warehouse Staff
  status?: string; // Draft
  statusColor?: string; // default abu-abu
  onClick?: () => void;
};

const OutboundCard: React.FC<OutboundCardProps> = ({
  title,
  subTitle,
  origin,
  role,
  status,
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
        <Text style={styles.code}>{title}</Text>
        <Ionicons name="arrow-forward" size={20} color="orange" />
      </View>

      {/* Middle: Icon + Info */}
      <View style={styles.infoRow}>
        <Ionicons name="cube-outline" size={58} color="black" />
        <View style={{ marginLeft: 8, flex: 1 }}>
          <Text style={styles.plate}>{subTitle}</Text>
          <Text style={styles.date} numberOfLines={0} ellipsizeMode="tail">
            {origin}
          </Text>
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

export default OutboundCard;

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
    fontSize: 13, // lebih besar
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
    color: "#fff",
  },
});
