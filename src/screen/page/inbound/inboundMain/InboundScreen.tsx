import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { useAuthStore } from '../../../../store/useAuthStore.ts';
import GlobalStyles from '../../../../util/GlobalStyles.ts';
import Colors from '../../../../constants/Colors.ts';
import InboundList from '../../../../components/inbound/InboundList.tsx';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { InboundParamList } from '../../../navigation/inbound/InboundNavigator.tsx';
import { useLoadingDialogStore } from '../../../../store/useLoadingStore.ts';
import InboundCard from '../../../../components/inbound/InboundListCard.tsx';


type NavigationProp = StackNavigationProp<InboundParamList,'InboundMain'>;

function InboundScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const styles = GlobalStyles();
  const { user } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();
  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();

  // const fetchInbound = async () => {
  //   try {
  //     setRefreshing(true);
  //     showLoadingDialog("Loading List Inbound Planning")
  //     //add you api here dewe
  //   } catch (error) {
  //     hideLoadingDialog()
  //     console.error('Error fetching inbound data:', error);
  //     Alert.alert(
  //       'Error',
  //       'Failed to fetch inbound data. Please check your connection and try again.',
  //       [{ text: 'OK' }]
  //     );
  //   }finally {
  //     hideLoadingDialog()
  //     setRefreshing(false);
  //   }
  // }

  // useEffect(() => {
  //   const initialize = async () => {
  //     try {
  //       await fetchInbound()
  //     } catch (error) {
  //       console.error('Initialization error:', error);
  //     }
  //   };
  //   initialize();
  // },[user])

  return (
    <View style={{ flex: 1, backgroundColor: Colors.secondaryColor }}>
      {/* Main Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.menuContainer}
        stickyHeaderIndices={[2]}
        style={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={()=> {}}
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
            <Text style={styles.activitiesHeaderText}>List Inbound Planning</Text>
          </View>
            {[
              {
              id: 1,
              code: 'CWH02-IN-0625-0001',
              plate: 'K 9985 AT',
              date: '2025-01-02',
              role: 'Admin',
              status: 'Pending',
              },
              {
              id: 2,
              code: 'CWH02-IN-0625-0002',
              plate: 'B 1234 XY',
              date: '2025-01-03',
              role: 'Operator',
              status: 'Completed',
              },
              {
              id: 3,
              code: 'CWH02-IN-0625-0003',
              plate: 'D 5678 ZZ',
              date: '2025-01-04',
              role: 'Supervisor',
              status: 'In Progress',
              },
            ].map((item: any) => {
              let statusColor;
              if (item.status === 'Completed') {
              statusColor = '#228B22'; // dark green
              } else if (item.status === 'In Progress') {
              statusColor = '#FFB347'; // pastel orange
              } else {
              statusColor = '#696969'; // dark gray
              }
              return (
              <InboundCard
                key={item.id}
                code={item.code}
                plate={item.plate}
                date={item.date}
                role={item.role}
                status={item.status}
                statusColor={statusColor}
                onClick={() => console.log(`Card ${item.id} clicked!`)}
              />
              );
            })}
        </View>
      </ScrollView>
    </View>
  );
}

export default InboundScreen;
