import React, { useEffect, useState, useMemo } from 'react';
import {
    ScrollView,
    Text,
    View,
    RefreshControl,
} from 'react-native';
import { useAuthStore } from '../../../../store/useAuthStore.ts';
import GlobalStyles from '../../../../util/GlobalStyles.ts';
import Colors from '../../../../constants/Colors.ts';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useLoadingDialogStore } from '../../../../store/useLoadingStore.ts';
import { useDialogStore } from '../../../../store/useGlobalDialog.ts';
import { ForkLiftParamList } from '../../../navigation/inbound/ForkLiftNavigator.tsx';
import ForkLiftList from '../../../../components/inbound/forklift/ForkLiftListCard.tsx';
import InboundServices from '../../../../service/inboundServices.ts';

type NavigationProp = StackNavigationProp<ForkLiftParamList, 'ForkLiftMain'>;

function ForkLiftScreen() {
    const [refreshing, setRefreshing] = useState(false);

    const styles = GlobalStyles();
    const { user } = useAuthStore();
    const navigation = useNavigation<NavigationProp>();
    const [forkLiftList, setForkLiftList] = useState<any[]>([]);
    const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
    const showDialog = useDialogStore((state) => state.showDialog);

    const fetchForkLift = async () => {
        try {
            setRefreshing(true);
            showLoadingDialog('Loading List ForkLift Task');
            const response = await InboundServices.getForkLiftList("7ca0f958-6c1b-4d18-81bd-6489c9a7c6ad");
            setForkLiftList(response?.data || []);
            console.log('ForkLift data fetched successfully:', response.data);
        } catch (error) {
            hideLoadingDialog();
            showDialog('error', 'Error while Fetching Data ForkLift!');
        } finally {
            hideLoadingDialog();
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchForkLift();
    }, []);


    return (
        <View style={{ flex: 1, backgroundColor: Colors.secondaryColor }}>
            <ScrollView
                contentContainerStyle={styles.menuContainer}
                stickyHeaderIndices={[2]}
                style={styles.scrollViewContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={fetchForkLift}
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
                            List ForkLift Task
                        </Text>
                    </View>
                    <View style={{ padding: 20 }}>
                        {forkLiftList.map((item, index) =>
                        (
                            <ForkLiftList
                                key={item.id}
                                item={item}
                                index={index}
                                onClick={() => navigation.navigate('ForkLiftDetail', { item })}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

export default ForkLiftScreen;


