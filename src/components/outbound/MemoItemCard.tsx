import React, { useState } from "react";
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from "react-native";

// enable animation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MemoItemCardProps {
  item: {
    item_id: string;
    quantity_plan: number;
    uom: string;
    picked_quantity: number;
    is_scanned: boolean;
    scan_detail?: {
      user_name?: string;
      status?: string;
      pallet_source_id?: string;
      pallet_use_id?: string;
    };
  };
}

const MemoItemCard: React.FC<MemoItemCardProps> = ({ item }) => {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  // Indicator warna
  let statusColor = "#FF3B30"; // red = belum scan
  if (item.is_scanned) statusColor = "#4CAF50"; // green
  if (item.picked_quantity > 0 && item.picked_quantity < item.quantity_plan) statusColor = "#2196F3"; // blue = partial

  return (
    <TouchableOpacity
      onPress={handleToggle}
      style={{
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: statusColor,
      }}
    >
      {/* HEADER */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            Item: {item.item_id}
          </Text>
          <Text style={{ marginTop: 4 }}>
            Plan: {item.quantity_plan} {item.uom}
          </Text>
          <Text>
            Picked: {item.picked_quantity} {item.uom}
          </Text>
        </View>

        {/* DOT STATUS */}
        <View
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: statusColor,
            marginTop: 4,
          }}
        />
      </View>

      {/* COLLAPSE AREA */}
      {expanded && (
        <View style={{ marginTop: 12 }}>
          {item.is_scanned ? (
            <>
              <Text style={{ fontWeight: "bold", marginBottom: 4 }}>Detail Scan</Text>
              <Text>User: {item.scan_detail?.user_name}</Text>
              <Text>Status: {item.scan_detail?.status}</Text>
              <Text>Pallet Source: {item.scan_detail?.pallet_source_id}</Text>
              <Text>Pallet Use: {item.scan_detail?.pallet_use_id}</Text>
            </>
          ) : (
            <Text style={{ color: "#FF3B30", fontWeight: "bold" }}>
              Belum ada scan.
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default MemoItemCard;
