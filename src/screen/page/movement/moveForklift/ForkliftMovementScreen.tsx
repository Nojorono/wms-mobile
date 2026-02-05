import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
    RefreshControl,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import { useAuthStore } from '../../../../store/useAuthStore.ts';
import GlobalStyles from '../../../../util/GlobalStyles.ts';
import Colors from '../../../../constants/Colors.ts';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useLoadingDialogStore } from '../../../../store/useLoadingStore.ts';
import { useDialogStore } from '../../../../store/useGlobalDialog.ts';
import MovementCard from '../../../../components/movement/MovementCard.tsx';
import MovementService from '../../../../service/movementService.ts';
import { ForkliftMovementParamList } from '../../../navigation/movement/ForkliftMovementNavigator.tsx';

type NavigationProp = StackNavigationProp<ForkliftMovementParamList, 'ForkliftMovementMain'>;

function ForkliftMovementScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [ForkliftMovementList, setForkliftMovementList] = useState<any[]>([]);
    const styles = GlobalStyles();
    const { user } = useAuthStore();
    const userId = user?.id ?? '';
    const navigation = useNavigation<NavigationProp>();
    const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
    const showDialog = useDialogStore((state) => state.showDialog);

    const fetchForkliftMovement = async () => {
        try {
            setRefreshing(true);
            showLoadingDialog('Loading List ForkliftMovement Planning');
            const response = await MovementService.getMoveLocationForklift(userId);
            console.log("ForkliftMovement response data:", response.data);
            setForkliftMovementList(response.data || []);
        } catch (error) {
            hideLoadingDialog();
            showDialog('error', 'Error while Fetching Data ForkliftMovement!');
        } finally {
            hideLoadingDialog();
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchForkliftMovement();
        }, [])
    );


    return (
        <View style={{ flex: 1, backgroundColor: Colors.secondaryColor }}>
            <ScrollView
                contentContainerStyle={styles.menuContainer}
                stickyHeaderIndices={[2]}
                style={styles.scrollViewContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={fetchForkliftMovement}
                        colors={[Colors.primeColor]}
                    />
                }
            >
                <View style={styles.menuCard}>
                    <View
                        style={[
                            styles.activitiesHeader,
                            { borderBottomWidth: 2, borderBottomColor: '#ccc' },
                        ]}
                    >
                        <Text style={styles.activitiesHeaderText}>
                            List Forklift Movement
                        </Text>
                    </View>

                    {/* 📦 List Card */}
                    {ForkliftMovementList.length === 0 ? (
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <Text style={{ color: '#888', fontSize: 16 }}>There is no data</Text>
                        </View>
                    ) : (
                        ForkliftMovementList.map((item: any, index: number) => {
                            let statusColor;
                            if (item.status === 'PENDING') {
                                statusColor = '#228B22';
                            } else if (item.status === 'COMPLETED') {
                                statusColor = '#FFB347';
                            } else {
                                statusColor = '#696969';
                            }

                            return (
                                <>
                                    <MovementCard
                                        key={index}
                                        Title={item.movement_number}
                                        source={`Source: ${item.sourceBin?.name ?? "Unknown"}`}
                                        destination={`Destination: ${item.destinationBin?.name ?? "Unknown"}`}
                                        date={item.createdAt}
                                        status={item.status}
                                        statusColor={statusColor}
                                        onClick={() =>
                                            // console.log('Clicked ForkliftMovement:', item)
                                            navigation.navigate('ForkliftPallet', { item })
                                        }
                                    />

                                </>

                            );
                        })
                    )}

                </View>
            </ScrollView>
        </View>
    );
}

export default ForkliftMovementScreen;

const localStyles = StyleSheet.create({
    searchInput: {
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        color: '#333',
    },
    filterButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        marginRight: 8,
        backgroundColor: '#fff',
    },
    filterText: {
        fontSize: 13,
        color: '#333',
    },
});
