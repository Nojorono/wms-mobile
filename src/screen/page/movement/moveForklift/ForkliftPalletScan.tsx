import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    StatusBar,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ForkliftMovementParamList } from '../../../navigation/movement/ForkliftMovementNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDialogStore } from '../../../../store/useGlobalDialog';


type NavigationProp = StackNavigationProp<ForkliftMovementParamList, 'ForkliftMovementMain'>;

const ForkliftPallet = () => {
    const route = useRoute();
    const payload = route.params as any
  const showDialog = useDialogStore((state) => state.showDialog);
    const navigation = useNavigation<NavigationProp>();
    const pallets = payload?.item?.pallets ?? [];
    const sourceBinLabel =
        payload?.item?.sourceBin?.name ??
        payload?.item?.sourceBin?.code ??
        payload?.item?.sourceWarehouseSub?.name ??
        'Unknown';
    const destinationBinLabel =
        payload?.item?.destinationBin?.name ??
        payload?.item?.destinationBin?.code ??
        payload?.item?.destinationWarehouseSub?.name ??
        'Unknown';
    const totalPallets = pallets.length;
    const scannedPallets = pallets.filter((p: any) => p.is_completed).length;

    // Summary Card Component
    const SummaryCard = () => (
        <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Move Location ID</Text>
            <View style={styles.idRow}>
                <Icon name="package-variant-closed" size={20} color="#1A1A1A" />
                <Text style={styles.idText}>{payload?.item?.movement_number ?? '-'}</Text>
            </View>

            <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                    {scannedPallets}/{totalPallets} Pallet
                </Text>
            </View>
        </View>
    );

    // Pallet Item Component
    type PalletItem = typeof payload.item.pallets[number];
    const renderPalletItem = ({ item }: { item: PalletItem }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => {
            if (!item.is_completed) {
                navigation.navigate('ForkliftDestination', { pallet: item, item: payload.item });
            } else {
                // Show popup if already completed
               showDialog("success", "Kamu sudah memindahkan pallet ini.");
            }
            }}
        >
            <View style={styles.cardRow}>
            {/* Left: Icon */}
            <View style={styles.iconContainer}>
                <Icon name="forklift" size={28} color="#1A1A1A" />
            </View>

            {/* Center: Details */}
            <View style={styles.detailsContainer}>
                <Text style={styles.palletCode}>{item.pallet?.pallet_code ?? '-'}</Text>

                <Text style={styles.labelSource}>Source</Text>
                <Text style={styles.productName}>
                Bin: {sourceBinLabel}
                </Text>
            </View>

            {/* Right: Destination Info */}
            <View style={styles.destinationContainer}>
                <View style={styles.qtyRow}>
                <Text style={styles.qtyText}>
                    {item.pallet?.currentQuantity ?? 0} {item.pallet?.uom ?? ''}
                </Text>
                <Icon name="arrow-right" size={20} color="#FF6B00" style={{ marginLeft: 4 }} />
                </View>
            </View>
            </View>

            {/* Status Badge */}
            <View style={styles.statusBadgeContainer}>
            <View style={[styles.statusBadge, item.is_completed ? styles.statusDone : styles.statusMoving]}>
                <Text style={[styles.statusText, item.is_completed ? styles.textDone : styles.textMoving]}>
                {item.is_completed ? "Completed" : "Moving"}
                </Text>
            </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <SummaryCard />

                {/* Destination Section Header */}
                <Text style={styles.sectionHeader}>
                    Destination: {destinationBinLabel}
                </Text>

                {/* List of Pallets */}
                <FlatList
                    data={pallets}
                    renderItem={renderPalletItem}
                    keyExtractor={(item, index) => item.id ?? item.pallet?.id ?? String(index)}
                    scrollEnabled={false} // Handle scrolling via parent ScrollView
                />

                {/* Padding for Floating Button */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating Scan Button */}
            <View style={styles.floatingContainer}>
                <TouchableOpacity style={styles.scanButton}>
                    <Icon name="qrcode-scan" size={24} color="#FF6B00" />
                    <Text style={styles.scanButtonText}>Scan Pallet</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA', // Minimalist light gray bg
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    // --- Header ---
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#F8F9FA',
    },
    backButton: {
        padding: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        elevation: 2, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FF6B00',
    },
    // --- Summary Card ---
    summaryCard: {
        backgroundColor: '#D1DEE8', // Matches the blueish card in image
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    idRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    idText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginLeft: 8,
    },
    progressContainer: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    progressText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1A1A1A',
    },
    // --- Section ---
    sectionHeader: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    // --- Card Item ---
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    detailsContainer: {
        flex: 1,
        paddingHorizontal: 8,
    },
    palletCode: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    labelSource: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    productName: {
        fontSize: 12,
        color: '#666666',
        marginTop: 2,
    },
    destinationContainer: {
        alignItems: 'flex-end',
    },
    destCode: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FF6B00',
        marginBottom: 4,
    },
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    qtyText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    // --- Status Pill ---
    statusBadgeContainer: {
        marginTop: 12,
        alignItems: 'flex-start',
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        width: '100%',
        alignItems: 'center',
    },
    statusMoving: {
        backgroundColor: '#D6EAF8', // Light blue
    },
    statusDone: {
        backgroundColor: '#D4EFDF', // Light green
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    textMoving: { color: '#2E86C1' },
    textDone: { color: '#27AE60' },

    // --- Floating Button ---
    floatingContainer: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    scanButton: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    scanButtonText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
    },
});

export default ForkliftPallet;