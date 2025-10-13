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

type NavigationProp = StackNavigationProp<ForkLiftParamList, 'ForkLiftMain'>;

function ForkLiftScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const styles = GlobalStyles();
  const { user } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const showDialog = useDialogStore((state) => state.showDialog);

  const fetchForkLift = async () => {
    try {
      setRefreshing(true);
      showLoadingDialog('Loading List ForkLift Task');
    //   const response = await ForkLiftServices.getForkLiftList();
    //   setForkLiftList(response?.data || []);
    //   console.log('ForkLift data fetched successfully:', response.data);
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
            <Text style={{ fontSize: 16, color: '#374151' }}>
              This is where the ForkLift tasks will be displayed.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default ForkLiftScreen;


