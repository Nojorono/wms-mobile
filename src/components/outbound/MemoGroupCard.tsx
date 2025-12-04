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
import OutboundService from "../../service/outboundService";
import { useLoadingDialogStore } from "../../store/useLoadingStore";
import { useDialogStore } from "../../store/useGlobalDialog";


const MemoGroupCard = ({ memo, items, onRefresh }: { memo: any; items: any; onRefresh: () => void }) => {
  const [expanded, setExpanded] = useState(false);
  // const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const showDialog = useDialogStore((state) => state.showDialog);
  const handleLepasMemo = () => {
    try {
      Alert.alert(
        'Confirm',
        'Are you sure you want to release the memo?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: async () => {
              await OutboundService.cancelMemo(memo.id);
              showDialog('success', 'Memo released successfully!');
              await onRefresh
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error releasing memo:', error);
    }
  };

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

          <Text style={{ marginTop: 4, color: "#555" }}>
            Tipe: {memo.type}
          </Text>
          <Text style={{ marginTop: 4, color: "#555" }}>
            Ship To: {memo.ship_to}
          </Text>
        </TouchableOpacity>

        {/* RIGHT: DELETE BUTTON */}
        <TouchableOpacity
          onPress={() => { handleLepasMemo() }}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 8,
            backgroundColor: "#FF3B30",
            alignSelf: "flex-start",
            height: 32,
            justifyContent: "center",
          }}
        >
          <Ionicons name="times" size={14} color="#fff" />
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
            items.map((item: any) => (
              <MemoItemCard key={item.item_id} item={item} onRefresh={onRefresh} />
            ))
          )}
        </View>
      )}
    </View>
  );
};

export default MemoGroupCard;
