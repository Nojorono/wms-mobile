import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import MemoItemCard from "./MemoItemCard";


const MemoGroupCard = ({ memo, items, onRefresh }: { memo: any; items: any; onRefresh: () => void }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };
  return (
    <View
      style={{
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 14,
        borderWidth: 1.5,
        borderColor: "#ddd",
      }}
    >
      {/* HEADER MEMO */}
      <TouchableOpacity onPress={toggleExpand}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            Memo: {memo.outbound_memo_number}
          </Text>

          <Text style={{ fontSize: 14, fontWeight: "600", color: "#F26E1F" }}>
            {expanded ? "▲" : "▼"}
          </Text>
        </View>

        <Text style={{ marginTop: 4, color: "#555" }}>
          Tipe: {memo.type}
        </Text>
        <Text style={{ marginTop: 4, color: "#555" }}>
          Ship To: {memo.ship_to}
        </Text>
      </TouchableOpacity>

      {/* LIST ITEM MEMO */}
      {expanded && (
        <View style={{ marginTop: 14 }}>
          {items.length === 0 ? (
            <Text style={{ color: "#777", textAlign: "center" }}>
              No memo items.
            </Text>
          ) : (
            items.map((item: any) => (
              <MemoItemCard key={item.item_id} item={item}  onRefresh={onRefresh} />
            ))
          )}
        </View>
      )}
    </View>
  );
};

export default MemoGroupCard;
