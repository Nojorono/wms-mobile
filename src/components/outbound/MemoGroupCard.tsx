import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
} from "react-native";
import MemoItemCard from "./MemoItemCard";

import Ionicons from 'react-native-vector-icons/FontAwesome5';
import { useDialogStore } from "../../store/useGlobalDialog";


const MemoGroupCard = ({memo, items, onRefresh }: { memo: any; items: any; onRefresh: () => void }) => {
  const [expanded, setExpanded] = useState(false);
  const showDialog = useDialogStore((state) => state.showDialog);

  const toggleExpand = () => {
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
      {/* HEADER */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {/* LEFT: TEXT + EXPAND */}
        <TouchableOpacity
          onPress={toggleExpand}
          style={{ flex: 1, marginRight: 8 }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              Memo: {memo.outbound_memo_number}
            </Text>
            {expanded ? <Ionicons name="angle-up" size={25} color="#F26E1F" /> : <Ionicons name="angle-down" size={25} color="#F26E1F" />}

          </View>
        </TouchableOpacity>
      </View>

      {/* LIST ITEM MEMO */}
      {expanded && (
        <View style={{ marginTop: 14 }}>
          {items.length === 0 ? (
            <Text style={{ color: "#777", textAlign: "center" }}>
              No memo items.
            </Text>
          ) : (
            items.map((item: any, index: number) => (
              <MemoItemCard key={item.item_id + index} item={item} onRefresh={onRefresh} />
            ))
          )}
        </View>
      )}
    </View>
  );
};

export default MemoGroupCard;
