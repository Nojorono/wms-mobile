// screens/InboundDetail.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    SafeAreaView,
    Alert,
    Linking,
    Modal,
    Pressable,
    Image,
    Platform,
    PermissionsAndroid,
} from "react-native";
import Ionicons from 'react-native-vector-icons/FontAwesome5';
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useLoadingDialogStore } from "../../../../store/useLoadingStore";
import InboundServices from "../../../../service/inboundServices";
import { StackNavigationProp } from "@react-navigation/stack";
import { InboundParamList } from "../../../navigation/inbound/InboundNavigator";
import { useConfirmationStore } from "../../../../store/useConfirmationStore";
import { useDialogStore } from "../../../../store/useGlobalDialog";
import WebView from "react-native-webview";
import { launchCamera } from "react-native-image-picker";
import { extractBucketPath } from "../service/inboundService";

/* ========================
   1. Type & Merge Function
   ======================== */
type Item = {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    sku: string;
    item_number: string;
    description: string;
    inventory_item_id: string;
    dus_per_stack: number | null;
    bal_per_dus: number | null;
    press_per_bal: number | null;
    bks_per_press: number | null;
    btg_per_bks: number | null;
    organization_id: string | null;
};

type InboundItem = {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    inbound_id: string;
    inbound_do_id: string;
    item_id: string;
    quantity: number;
    classification_id: string | null;
    uom: string;
    item: Item;
};

type InboundDo = {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    inbound_id: string;
    inbound_do_number: string;
    inbound_do_date: string;
    attachment: string | null;
    inbound_po_number: string;
    inbound_po_date: string;
    flag_validated: boolean;
    inbound_items: InboundItem[];
};

type InboundItemWithPo = InboundItem & { inbound_po_number: string };

function mergeInboundDos(data: InboundDo[]): (Omit<InboundDo, 'inbound_items'> & { inbound_items: InboundItemWithPo[] })[] {
    // Group by inbound_do_number
    const map = new Map<string, Omit<InboundDo, 'inbound_items'> & { inbound_items: InboundItemWithPo[] }>();

    data.forEach((doItem) => {
        const key = `${doItem.inbound_do_number}`;
        // Gabungkan item_id yang sama dan jumlahkan quantity
        const itemMap = new Map<string, InboundItemWithPo>();
        doItem.inbound_items.forEach(item => {
            const itemKey = item.item_id;
            if (itemMap.has(itemKey)) {
                const existing = itemMap.get(itemKey)!;
                itemMap.set(itemKey, {
                    ...existing,
                    quantity: existing.quantity + item.quantity,
                });
            } else {
                itemMap.set(itemKey, {
                    ...item,
                    inbound_po_number: doItem.inbound_po_number,
                });
            }
        });
        const itemsWithPo = Array.from(itemMap.values());

        if (map.has(key)) {
            const existing = map.get(key)!;
            // Gabungkan item_id yang sama juga pada existing
            const combinedMap = new Map<string, InboundItemWithPo>();
            [...existing.inbound_items, ...itemsWithPo].forEach(item => {
                const itemKey = item.item_id;
                if (combinedMap.has(itemKey)) {
                    const exist = combinedMap.get(itemKey)!;
                    combinedMap.set(itemKey, {
                        ...exist,
                        inbound_po_number: exist.inbound_po_number + ', ' + item.inbound_po_number,
                        quantity: exist.quantity + item.quantity,
                    });
                } else {
                    combinedMap.set(itemKey, { ...item });
                }
            });
            existing.inbound_items = Array.from(combinedMap.values());
        } else {
            // Copy all fields except inbound_items, then add inbound_items with PO number
            const { inbound_items, ...rest } = doItem;
            map.set(key, { ...rest, inbound_items: itemsWithPo });
        }
    });
    return Array.from(map.values());
}

export default function InboundDetail() {

    // Ambil payload dari route params
    type InboundDetailRouteParams = {
        item: {
            id: string;
            inbound_number: string;
            license_plate: string;
            inbound_dos: InboundDo[];
            status: string;
        };
    };

    type NavigationPropInbound = StackNavigationProp<InboundParamList, 'InboundMain'>;
    const navigationInbound = useNavigation<NavigationPropInbound>();
    const route = useRoute();
    const payload = route.params as InboundDetailRouteParams;
    const [mergedData, setMergedData] = useState<(Omit<InboundDo, 'inbound_items'> & { inbound_items: InboundItemWithPo[] })[]>([]);
    const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
    const [status, setStatus] = useState<string>(payload.item ? payload.item.status : ''); // Inisialisasi status dari payload
    const showDialog = useDialogStore((state) => state.showDialog);
    const confirm = useConfirmationStore();
    const [refreshing, setRefreshing] = useState(false);

    const requestCameraPermission = async () => {
  if (Platform.OS !== "android") return true;

  const granted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.CAMERA
  );

  if (granted) return true;

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    {
      title: "Camera Permission",
      message: "App needs camera access to take photos",
      buttonPositive: "OK",
      buttonNegative: "Cancel",
    }
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
};
    type PhotoMeta = {
        url: string;
        bucket: string;
        key: string;
        size: number;
    } | null;

    const [photos, setPhotos] = useState<{
        segel: PhotoMeta;
        barang: PhotoMeta;
        nopol: PhotoMeta;
    }>({
        segel: null,
        barang: null,
        nopol: null,
    });
    const [initialPhotos, setInitialPhotos] = useState({
        segel: false,
        barang: false,
        nopol: false
    });

    const [dirty, setDirty] = useState(false);
    // dirty = true = ada perubahan → button jadi EDIT

    const onRefresh = async () => {
        try {
            setRefreshing(true);
            await fetchInboundById(); // fungsi fetch kamu yang sudah ada
        } catch (error) {
            console.error("Error refreshing data:", error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleAccept = () => {
        confirm.show("accept", "Are you sure to approve this?", async () => {
            try {
                showLoadingDialog("Approving inbound...");
                 const res = await InboundServices.updatePhotoToInbound(payload.item.id, {
                        photo_seal: photos.segel?.url,
                        photo_condition: photos.barang?.url,
                        photo_license_plate: photos.nopol?.url,
                    });
                

                try {
                    showLoadingDialog("Submitting photos...");
                   await InboundServices.updateStatusInbound(payload.item.id, { status: 'UNLOADING' });
                    showDialog("success", "Photos submitted successfully");
                    navigationInbound.navigate("CheckerScreen", { item: payload.item });
                } catch (err) {
                    console.error(err);
                    showDialog("error", "Failed to submit photos");
                } finally {
                    hideLoadingDialog();
                }
            } catch (error) {
                console.error('Error Accepting inbound:', error);
                showDialog('error', 'Error while Accepting Inbound!' + error);
            }
        });
    };

    const handleDecline = () => {
        confirm.show("decline", "Are you sure to decline this?", async (reason) => {
            try {
                await InboundServices.updateStatusInbound(payload.item.id, { status: 'WAITING FOR REVISION', notes: reason });
                navigationInbound.goBack();
            } catch (error) {
                console.error('Error Declining inbound:', error);
                showDialog('error', 'Error while Declining Inbound!');
            }
        }, true // require reason
        );
    };
    const fetchInboundById = async () => {
        try {
            showLoadingDialog("Loading List Inbound Planning")
            const response = await InboundServices.getInboundDetail(payload.item.id);
            setStatus(response.data.status); // Update status dari response
            const inbound_dos = response.data.inbound_dos;
            setMergedData(mergeInboundDos(inbound_dos));
            setPhotos({
                segel: response.data.photo_seal
                    ? {
                        url: response.data.photo_seal,
                        bucket: "mybucket",
                        key: extractBucketPath(response.data.photo_seal),
                        size: 0,
                    }
                    : null,

                barang: response.data.photo_condition
                    ? {
                        url: response.data.photo_condition,
                        bucket: "mybucket",
                        key: extractBucketPath(response.data.photo_condition),
                        size: 0,
                    }
                    : null,

                nopol: response.data.photo_license_plate
                    ? {
                        url: response.data.photo_license_plate,
                        bucket: "mybucket",
                        key: extractBucketPath(response.data.photo_license_plate),
                        size: 0,
                    }
                    : null,
            });

            // simpan kondisi awal apakah foto sudah ada
            setInitialPhotos({
                segel: !!response.data.photo_seal,
                barang: !!response.data.photo_condition,
                nopol: !!response.data.photo_license_plate,
            });

            setDirty(false); // data fresh dari backend = tidak dirty
        } catch (error) {
            hideLoadingDialog()
            console.error('Error fetching inbound data:', error);
            Alert.alert(
                'Error',
                'Failed to fetch inbound data. Please check your connection and try again.',
                [{ text: 'OK' }]
            );
        } finally {
            hideLoadingDialog()
        }
    }

    const [pdfVisible, setPdfVisible] = useState(false);
    const [pdfUrl, setPdfUrl] = useState("");

    const handleOpenAttachment = (url: any) => {
        setPdfUrl(url);
        setPdfVisible(true);
    };

    const handleClosePdf = () => {
        setPdfVisible(false);
        setPdfUrl("");
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchInboundById();
        }, [payload.item.id])
    );


    useEffect(() => {
        const initialize = async () => {
            try {
                await fetchInboundById()
            } catch (error) {
                console.error('Initialization error:', error);
            }
        };
        initialize();
    }, [])

    // Support multiple expanded cards
    const [expandedIds, setExpandedIds] = useState<string[]>(
        mergedData.map((item) => item.id)
    );

    const toggleExpand = (id: string) => {
        setExpandedIds((prev) =>
            prev.includes(id)
                ? prev.filter((itemId) => itemId !== id)
                : [...prev, id]
        );
    };

   const handleUpload = async (type: "segel" | "barang" | "nopol") => {
  try {
    const hasPermission = await requestCameraPermission();

    if (!hasPermission) {
      Alert.alert(
        "Permission ditolak",
        "Camera permission diperlukan untuk mengambil foto"
      );
      return;
    }

    const result = await launchCamera({
      mediaType: "photo",
      quality: 0.4,
      cameraType: "back",
      saveToPhotos: false,
    });

    if (result.didCancel) return;

    const file = result.assets?.[0];
    if (!file) return;

    showLoadingDialog("Uploading photo...");

    const s3 = await InboundServices.postdPhotoToS3(file, `${type}`);
    const data = s3.data;

    setPhotos((prev) => ({
      ...prev,
      [type]: {
        url: data.url,
        bucket: data.bucket,
        key: data.key,
        size: data.size,
      },
    }));

    setDirty(true);
    showDialog("success", `Photo ${type} uploaded`);
  } catch (error) {
    console.error(error);
    showDialog("error", "Upload failed");
  } finally {
    hideLoadingDialog();
  }
};


    const handleDelete = async (type: "segel" | "barang" | "nopol") => {
        try {
            const target = photos[type];
            if (!target) return;

            confirm.show("decline", "Delete this photo?", async () => {
                showLoadingDialog("Deleting photo...");

                await InboundServices.deletePhotoFromS3(
                    target.bucket,
                    target.key
                );

                // reset UI
                setPhotos((prev) => ({
                    ...prev,
                    [type]: null,
                }));
                setDirty(true);

                showDialog("success", "Photo deleted");
                hideLoadingDialog();
            });
        } catch (error) {
            console.error(error);
            hideLoadingDialog();
            showDialog("error", "Delete failed");
        }
    };

    // const handleSubmit = async () => {
    //     try {
    //         showLoadingDialog("Submitting photos...");
    //         // TODO: API upload
    //         const res = await InboundServices.updatePhotoToInbound(payload.item.id, {
    //             photo_seal: photos.segel?.url,
    //             photo_condition: photos.barang?.url,
    //             photo_license_plate: photos.nopol?.url,
    //         });
    //         showDialog("success", "Photos submitted successfully");

    //         // success ...
    //     } catch (err) {
    //         console.error(err);
    //     } finally {
    //         hideLoadingDialog();
    //     }
    // };

    const allUploaded = photos.segel && photos.barang && photos.nopol;
    const hadInitial = initialPhotos.segel && initialPhotos.barang && initialPhotos.nopol;

    const shouldShowSubmit = !hadInitial || dirty;
    const submitLabel = dirty ? "Upload" : "Upload";

 useEffect(() => {
  const unsubscribe = navigationInbound.addListener("beforeRemove", (e) => {

      const initialEmpty =
          !initialPhotos.segel &&
          !initialPhotos.barang &&
          !initialPhotos.nopol;

      const hasNewPhotos =
          photos.segel || photos.barang || photos.nopol;

      // tidak ada upload baru → boleh back
      if (!initialEmpty || !hasNewPhotos || !dirty) return;

      // block back
      e.preventDefault();

      confirm.show(
          "decline",
          "You uploaded photos but haven't submitted. Going back will delete them. Continue?",
          async () => {
              for (const key of ["segel", "barang", "nopol"] as Array<keyof typeof photos>) {
                  const p = photos[key];
                  if (p) {
                      await InboundServices.deletePhotoFromS3(p.bucket, p.key);
                  }
              }

              navigationInbound.dispatch(e.data.action);
          }
      );
  });

  return unsubscribe;
}, [photos, initialPhotos, dirty]);




    // if (status !== "CREATED") {
    //     showDialog("error", "Can only upload while CREATED");
    //     return;
    // }


    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Inbound Planning Number</Text>
                <Text style={styles.headerNumber}>{payload.item.inbound_number}</Text>
                <Text style={styles.vehicle}> <Ionicons name="truck" size={20} /> {payload.item.license_plate}</Text>
            </View>

            {payload?.item?.status !== "CREATED" && (
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 20 }}>
                    <TouchableOpacity style={{ alignItems: "center", flex: 1 }} onPress={() => navigationInbound.navigate("CheckerScreen", { item: payload.item })}>
                        <Ionicons name="user-friends" size={28} color="#059669" />
                        <Text style={{ marginTop: 6, fontSize: 14, color: "#374151" }}>Helper List</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ alignItems: "center", flex: 1 }} onPress={() => navigationInbound.navigate("InspectionNavigator", {
                        screen: "InspectionMain",
                        params: { item: payload.item },
                    })}>
                        <Ionicons name="clipboard-check" size={28} color="#059669" />
                        <Text style={{ marginTop: 6, fontSize: 14, color: "#374151" }}>Inspection</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* add upload photo here */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
                {(["segel", "barang", "nopol"] as Array<keyof typeof photos>).map((key) => {
                    const img = photos[key];

                    return (
                        <View
                            key={key}
                            style={{
                                flex: 1,
                                height: 110,
                                backgroundColor: "#E5E7EB",
                                borderRadius: 12,
                                marginHorizontal: 4,
                                overflow: "hidden",
                            }}
                        >
                            {img ? (
                                <>
                                    <Image
                                        source={{ uri: img.url }}
                                        style={{ width: "100%", height: "100%" }}
                                        resizeMode="cover"
                                    />

                                    {/* Delete button - floating at top right */}
                                    {status !== "UNLOADING" && (
                                        <TouchableOpacity
                                            onPress={() => handleDelete(key)}
                                            style={{
                                                position: "absolute",
                                                top: 6,
                                                right: 6,
                                                backgroundColor: "rgba(255,255,255,0.8)",
                                                borderRadius: 16,
                                                padding: 4,
                                                zIndex: 10,
                                            }}
                                        >
                                            <Ionicons name="trash" size={20} color="#DC2626" />
                                        </TouchableOpacity>
                                    )}
                                </>
                            ) : (
                                <TouchableOpacity
                                    style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                                    onPress={() => handleUpload(key)}
                                >
                                    <Text style={{ textAlign: "center", color: "#6B7280" }}>
                                        No Photo{'\n'}({key})
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                    );
                })}

            </View>

            {/* Submit button */}

            {/* {shouldShowSubmit && (
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={!allUploaded}
                    style={{
                        backgroundColor: allUploaded ? "#2563EB" : "#9CA3AF",
                        paddingVertical: 14,
                        borderRadius: 12,
                        alignItems: "center",
                    }}
                >
                    <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
                        {submitLabel}
                    </Text>
                </TouchableOpacity>
            )} */}



            {/* List Delivery Orders */}
            <FlatList
                data={mergedData}
                keyExtractor={(item) => item.id}
                refreshing={refreshing}
                onRefresh={onRefresh}
                renderItem={({ item }) => {
                    const expanded = expandedIds.includes(item.id);
                    return (
                        <View style={styles.card}>
                            <TouchableOpacity
                                style={styles.cardHeader}
                                onPress={() => toggleExpand(item.id)}
                            >
                                <Text style={styles.cardTitle}>
                                    Delivery Order {item.inbound_do_number}
                                </Text>
                                {/* Arrow icon */}
                                <Text style={{ fontSize: 18 }}>
                                    {expanded ? <Ionicons name="chevron-down" size={20} /> : <Ionicons name="chevron-right" size={20} />}
                                </Text>
                            </TouchableOpacity>

                            {/* 📎 Attachment link */}
                            <TouchableOpacity
                                onPress={() => handleOpenAttachment(item.attachment)}
                                style={{ paddingHorizontal: 16, marginBottom: 4 }}
                            >
                                <Text
                                    style={{
                                        color: "#007bff",
                                        textDecorationLine: "underline",
                                    }}
                                >
                                    📎 Attachment
                                </Text>
                            </TouchableOpacity>



                            {/* Date below title */}
                            <View style={{ paddingHorizontal: 16, marginBottom: expanded ? 10 : 10 }}>
                                <Text style={styles.cardDate}>
                                    {new Date(item.inbound_do_date).toISOString().split("T")[0]}
                                </Text>
                            </View>
                            {expanded && (
                                <View style={styles.cardBody}>
                                    {item.inbound_items.map((sku, index) => (
                                        <View key={sku.id} style={styles.skuRow}>
                                            <Text style={styles.skuText}>
                                                {index + 1}. {sku.item.sku}
                                            </Text>
                                            <Text style={styles.skuQty}>
                                                {sku.quantity} {sku.uom}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    );
                }}
            />

            {/* 🧾 PDF Viewer Modal */}
            <Modal visible={pdfVisible} animationType="slide" transparent>
                <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}>
                    <View style={{ height: "50%", backgroundColor: "#000", borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: "hidden" }}>

                        {/* Header Close Button */}
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: 12,
                                backgroundColor: "#111",
                            }}
                        >
                            <Text style={{ color: "#fff", fontSize: 16 }}>Attachment Viewer</Text>
                            <Pressable onPress={handleClosePdf}>
                                <Ionicons name="minus" size={24} color="#fff" />
                            </Pressable>
                        </View>

                        {/* PDF / Image Viewer */}
                        {pdfUrl ? (
                            (() => {
                                const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(pdfUrl);

                                if (isImage) {
                                    return (
                                        <Image
                                            source={{ uri: pdfUrl }}
                                            style={{
                                                flex: 1,
                                                resizeMode: "contain",
                                                backgroundColor: "#000",
                                            }}
                                        />
                                    );
                                }

                                return (
                                    <WebView
                                        source={{
                                            uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
                                                pdfUrl
                                            )}`,
                                        }}
                                        style={{ flex: 1 }}
                                        startInLoadingState={true}
                                        scalesPageToFit={true}
                                    />
                                );
                            })()
                        ) : (
                            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                                <Text style={{ color: "#fff", fontSize: 18 }}>No attachment available.</Text>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>


            {status === "CREATED" && (
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.declineBtn} onPress={handleDecline}>
                        <Text style={styles.declineText}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.approveBtn} onPress={handleAccept}>
                        <Text style={styles.approveText}>Approve</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#F8FAFC" },
    header: {
        backgroundColor: "white",
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        alignItems: "center", // Center content horizontally
    },
    headerTitle: { fontSize: 18, color: "#6B7280", textAlign: "center" },
    headerNumber: { fontSize: 22, fontWeight: "700", marginTop: 4, textAlign: "center" },
    vehicle: {
        fontSize: 20,
        fontWeight: "600",
        marginTop: 8,
        color: "#DC2626",
        textAlign: "center",
    },
    card: {
        backgroundColor: "white",
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    cardTitle: { fontSize: 20, fontWeight: "600", color: "#111827" },
    cardDate: { fontSize: 18, color: "#6B7280" },
    cardBody: { padding: 16, borderTopWidth: 1, borderColor: "#E5E7EB" },
    skuRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    skuText: { fontSize: 16, color: "#374151" },
    skuQty: { fontSize: 16, fontWeight: "600" },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    declineBtn: {
        flex: 1,
        marginRight: 8,
        padding: 14,
        borderRadius: 12,
        backgroundColor: "#F87171",
    },
    approveBtn: {
        flex: 1,
        marginLeft: 8,
        padding: 14,
        borderRadius: 12,
        backgroundColor: "#F97316",
    },
    declineText: { textAlign: "center", fontSize: 18, color: "white" },
    approveText: { textAlign: "center", fontSize: 18, color: "white" },
});
