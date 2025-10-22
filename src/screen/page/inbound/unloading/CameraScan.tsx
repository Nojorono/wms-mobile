import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Keyboard,
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera";
import { useRoute, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import DatePicker from "react-native-date-picker";
import { Picker } from "@react-native-picker/picker";
import InboundServices from "../../../../service/inboundServices";
import { useAuthStore } from "../../../../store/useAuthStore";
import { useDialogStore } from "../../../../store/useGlobalDialog";
import { UnloadingParamList } from "../../../navigation/inbound/UnloadingNavigator";
import { set } from "react-hook-form";

type NavigationProp = StackNavigationProp<UnloadingParamList, "UnloadingMain">;

interface RouteParams {
  item: { id: string; inbound_id: string; uom: string };
  dataExist?: any[];
  payload?: any;
  onScanFinish?: (data: PalletItem | null) => void;
}

interface PalletItem {
  id: string;
  palletNo: string;
  qty: string;
  production_date: string | null;
  week: string | null;
  inbound_id: string;
  item_id: string;
  user_id: string;
  user_name: string;
  uom: string;
  status: string;
  staging_area_id?: string;
}

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const CameraScreen = () => {
  const route = useRoute<any>();
  const { user } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();
  const { item, dataExist = [] } = route.params as RouteParams;
  const showDialog = useDialogStore((state) => state.showDialog);

  // Camera setup
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [scan, setScan] = useState<PalletItem | null>(null);
  const [qtyPalletExist, setQtyPalletExist] = useState(0);
  const [stagingAreas, setStagingAreas] = useState<any[]>([]);
  const [openPicker, setOpenPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [isEditMode, setIsEditMode] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // 🧠 QR / Barcode via kamera
  const codeScanner = useCodeScanner({
    codeTypes: ["qr", "code-128", "ean-13"],
    onCodeScanned: (codes) => {
      const val = codes[0]?.value ?? "";
      if (val) {
        setManualInput(val);
        handleAddPallet(val);
      }
    },
  });

  // Pastikan input selalu fokus walau keyboard tidak muncul
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isCameraActive && inputRef.current && !inputRef.current.isFocused()) {
        inputRef.current.focus();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isCameraActive]);

  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleTextChange = (text: string) => {
    setManualInput(text);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      if (text.trim()) handleAddPallet(text);
    }, 300);
  };


  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission]);

  // 📦 fetch staging area
  useEffect(() => {
    const fetchStaging = async () => {
      try {
        const res = await InboundServices.getStagingArea();
        setStagingAreas(res?.data || []);
      } catch (err) {
        console.error("Gagal fetch staging area:", err);
      }
    };
    fetchStaging();
  }, []);

  // 🧩 Focus input untuk hardware scanner
  useEffect(() => {
    if (!isCameraActive) {
      inputRef.current?.focus();
      const showListener = Keyboard.addListener("keyboardDidHide", () => {
        inputRef.current?.focus();
      });
      return () => showListener.remove();
    }
  }, [isCameraActive]);

  // 🔄 handle tambah/edit pallet
  const handleAddPallet = async (code: string) => {
    setIsCameraActive(false);
    Keyboard.dismiss();
    const value = code.trim().toUpperCase();
    if (!value || !user) return;

    // 🔍 Cek apakah pallet_code sudah ada di dataExist
    const existing = dataExist?.find(
      (item: any) => item.palletCode?.toUpperCase() === value
    );

    try {
      if (existing) {
        // 🚫 Jika status bukan OPEN, blokir edit/post
        if (existing.status !== "OPEN") {
          setManualInput("");
          showDialog(
            "error",
            `Pallet ${existing.palletCode} tidak dapat diedit karena status-nya "${existing.status}".`
          );
          return;
        }


        // 🔄 Jika status OPEN, tetap lakukan getPalletInfo untuk refresh data
        const res = await InboundServices.getPalletInfo(value);
        const palletData = res?.data;

        if (!palletData) {
          setManualInput("");
          showDialog("error", "Pallet not found or invalid!");
          return;
        }

        // if (!palletData.success) {
        //   showDialog("error", palletData.message || "Something went wrong!");
        //   return;
        // }

        // if (palletData.data && palletData.data.success === false) {
        //   showDialog("error", palletData.data.message || "Pallet invalid!");
        //   return;
        // }

        const refreshedItem: PalletItem = {
          id: existing.id, // tetap gunakan ID existing
          palletNo: existing.palletCode,
          qty:
            palletData.data?.qty?.toString() ||
            existing.qty?.toString() ||
            "",
          production_date:
            palletData.data?.production_date || existing.productionDate || null,
          week:
            palletData.data?.week?.toString() ||
            existing.weekNumber?.toString() ||
            null,
          inbound_id: item.inbound_id,
          item_id: item.id,
          user_id: user.id,
          user_name: user.username,
          status: existing.status || "OPEN",
          uom: item.uom,
          staging_area_id: existing.stagingArea || "",
        };
        setQtyPalletExist(
          palletData.pallet_status.capacity -
          palletData.pallet_status.current_quantity || 0
        );
        setScan(refreshedItem);
        setIsEditMode(true);
        setManualInput("");
        showDialog(
          "success",
          "Data existing pallet (OPEN) berhasil dimuat & diperbarui dari server."
        );
        return;
      }

      // 🆕 Jika belum ada di existing, fetch dari API seperti biasa
      const res = await InboundServices.getPalletInfo(value);
      const palletData = res?.data;

      if (!palletData) {
        setManualInput("");
        showDialog("error", "Pallet not found or invalid!");
        return;
      }

      if (!palletData.success) {
        setManualInput("");
        showDialog("error", palletData.message || "Something went wrong!");
        return;
      }

      if (palletData.data && palletData.data.success === false) {
        setManualInput("");
        showDialog("error", palletData.data.message || "Pallet invalid!");
        return;
      }

      const newItem: PalletItem = {
        id: Date.now().toString(),
        palletNo: value,
        qty: palletData.qty?.toString() || "",
        production_date: palletData.production_date || null,
        week: palletData.week?.toString() || null,
        inbound_id: item.inbound_id,
        item_id: item.id,
        user_id: user.id,
        user_name: user.username,
        status: "OPEN",
        uom: item.uom,
        staging_area_id: "",
      };

      setQtyPalletExist(
        palletData.pallet_status.capacity -
        palletData.pallet_status.current_quantity || 0
      );
      setScan(newItem);
      setIsEditMode(false);
      setManualInput("");
    } catch (err) {
      setManualInput("");
      showDialog("error", "Error fetching pallet info!");
    }
  };


  const handleSubmitEditing = () => {
    handleAddPallet(manualInput);
  };

  const deletePallet = () => setScan(null);

  const updatePallet = (field: keyof PalletItem, value: string | null) => {
    if (scan) setScan({ ...scan, [field]: value || "" });
  };

  const fetchWeek = async (date: string) => {
    try {
      const res = await InboundServices.getWeekProduction(date);
      const minggu = res?.data?.[0]?.MINGGU?.toString() || null;
      setScan((prev) => (prev ? { ...prev, week: minggu } : prev));
    } catch {
      showDialog("error", "Error fetching week production!");
    }
  };

  const handleDateSelect = (selectedDate: Date) => {
    if (scan) {
      const formatted = formatDate(selectedDate);
      setScan({ ...scan, production_date: formatted });
      fetchWeek(formatted);
    }
  };

  const handleNext = () => {
    if (!scan) return;

    // 🚫 Validasi status
    if (scan.status !== "OPEN") {
      showDialog(
        "error",
        `Tidak dapat melakukan ${isEditMode ? "edit" : "post"} karena status pallet adalah "${scan.status}".`
      );
      return;
    }

    const data = {
      production_date: scan.production_date ?? "",
      week_number: scan.week ? Number(scan.week) : 0,
      inbound_id: scan.inbound_id,
      item_id: scan.item_id,
      quantity: Number(scan.qty) || 0,
      uom: scan.uom,
      user_id: scan.user_id,
      user_name: scan.user_name,
      pallet_code: scan.palletNo,
      status: scan.status,
      m_warehouse_sub_id: scan.staging_area_id || "",
    };

    if (isEditMode) {
      const editData = {
        production_date: scan.production_date ?? "",
        week_number: scan.week ? Number(scan.week) : 0,
        quantity: Number(scan.qty) || 0,
        m_warehouse_sub_id: scan.staging_area_id || "",
      };
      InboundServices.updateInspectionData(scan.id, editData)
        .then(() => navigation.goBack())
        .catch((err) =>
          showDialog("error", err?.data?.error || "Error while updating pallet!")
        );
    } else {
      InboundServices.postUnloading(data)
        .then(() => navigation.goBack())
        .catch((err) =>
          showDialog(
            "error",
            err?.data?.error || "Error while Posting Unloading!"
          )
        );
    }
  };

  // 🌗 Toggle antara kamera dan scanner hardware
  if (isCameraActive) {
    if (!device) return <Text>Loading camera...</Text>;
    if (!hasPermission) return <Text>No camera permission</Text>;
  }

  return (
    <View style={styles.container}>
      {isCameraActive && device && (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isCameraActive}
          codeScanner={codeScanner}
        />
      )}

      <View style={{ position: "absolute", height: 0, width: 0 }}>
        <TextInput
          ref={inputRef}
          style={{ height: 0, width: 0, opacity: 0 }}
          value={manualInput}
          onChangeText={handleTextChange}
          blurOnSubmit={false}
        />
      </View>


      <View style={styles.overlay}>
        {/* Tombol toggle mode */}
        <TouchableOpacity
          style={[
            styles.modeBtn,
            { backgroundColor: isCameraActive ? "#dc2626" : "#16a34a" },
          ]}
          onPress={() => setIsCameraActive((prev) => !prev)}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            {isCameraActive ? "Tutup Kamera" : "Gunakan Kamera"}
          </Text>
        </TouchableOpacity>

        {/* Manual input (jika kamera aktif) */}
        {isCameraActive && (
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              placeholder="Input manual jika QR gagal"
              value={manualInput}
              onChangeText={setManualInput}
            />
            <TouchableOpacity
              style={[
                styles.addBtn,
                { backgroundColor: manualInput ? "#f97316" : "#6b7280" },
              ]}
              onPress={() => handleAddPallet(manualInput)}
              disabled={!manualInput}
            >
              <Text style={styles.btnText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}

        {scan ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.palletTitle}>
                {scan.palletNo} | available capacity: {qtyPalletExist}
              </Text>
              <TouchableOpacity style={styles.deleteBtn} onPress={deletePallet}>
                <Text style={{ color: "#fff" }}>Delete</Text>
              </TouchableOpacity>
            </View>

            {/* Indikator status */}
            {scan.status !== "OPEN" && (
              <Text style={{ color: "#f87171", marginBottom: 8 }}>
                ⚠️ Status: {scan.status} — tidak bisa diedit.
              </Text>
            )}

            {/* Staging Area */}
            <View style={{ marginBottom: 12 }}>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={scan.staging_area_id ?? ""}
                  onValueChange={(itemValue) =>
                    updatePallet("staging_area_id", itemValue)
                  }
                  style={styles.picker}
                  dropdownIconColor="#111"
                >
                  <Picker.Item label="Select Staging Area" value="" />
                  {stagingAreas.map((area: any) => (
                    <Picker.Item
                      key={area.id}
                      label={area.code}
                      value={area.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Qty */}
            <TextInput
              style={styles.input}
              placeholder="Qty"
              keyboardType="numeric"
              value={scan.qty}
              onChangeText={(val) => updatePallet("qty", val)}
              textAlign="right"
            />

            {/* Week */}
            <TextInput
              style={[styles.input, { backgroundColor: "#fef9c3", marginTop: 8 }]}
              placeholder="Week (auto)"
              value={scan.week ?? ""}
              editable={false}
              textAlign="right"
            />

            {/* Production Date */}
            <TouchableOpacity
              style={[styles.input, { justifyContent: "center", marginTop: 8 }]}
              onPress={() => {
                setTempDate(
                  scan.production_date
                    ? new Date(scan.production_date)
                    : new Date()
                );
                setOpenPicker(true);
              }}
              disabled={scan.status !== "OPEN"}
            >
              <Text
                style={{
                  color: scan.production_date ? "#111" : "#9ca3af",
                  textAlign: "right",
                }}
              >
                {scan.production_date || "Select Production Date"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={{ color: "#9ca3af" }}>Belum ada hasil scan</Text>
        )}

        <TouchableOpacity
          style={[
            styles.nextBtn,
            {
              backgroundColor:
                scan?.status !== "OPEN"
                  ? "#9ca3af"
                  : isEditMode
                    ? "#f59e0b"
                    : "#16a34a",
            },
          ]}
          onPress={handleNext}
          disabled={scan?.status !== "OPEN"}
        >
          <Text style={styles.btnText}>
            {scan?.status !== "OPEN"
              ? "Locked"
              : isEditMode
                ? "Edit"
                : "Next"}
          </Text>
        </TouchableOpacity>
      </View>

      <DatePicker
        modal
        open={openPicker}
        date={tempDate}
        mode="date"
        onConfirm={(selectedDate) => {
          handleDateSelect(selectedDate);
          setOpenPicker(false);
        }}
        onCancel={() => setOpenPicker(false)}
      />
    </View>
  );
};

export default CameraScreen;

// 💅 STYLE
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  overlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 16,
  },
  hiddenInput: {
    height: 0,
    width: 0,
    opacity: 0,
    position: "absolute",
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
  },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  btnText: { color: "#fff", fontWeight: "600" },
  nextBtn: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    alignItems: "center",
  },
  palletTitle: { color: "#fff", fontWeight: "600", fontSize: 16 },
  deleteBtn: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  modeBtn: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 10,
    marginBottom: 12,
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  picker: {
    height: 50,
    fontSize: 13,
    color: "#111",
  },
});
