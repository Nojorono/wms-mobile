import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { useAuthStore } from '../../../../store/useAuthStore.ts';
import GlobalStyles from '../../../../util/GlobalStyles.ts';
import Colors from '../../../../constants/Colors.ts';
import InboundList from '../../../../components/inbound/InboundList.tsx';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useLoadingDialogStore } from '../../../../store/useLoadingStore.ts';
import { InspectionParamList } from '../../../navigation/inbound/InspectionNavigator.tsx';


type NavigationProp = StackNavigationProp<InspectionParamList,'InspectionMain'>;

function InspectionScreen() {
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
            <Text style={styles.activitiesHeaderText}>List Inspection</Text>
          </View>
            {[
              {
                id: 1,
                title: 'Checking Shipment #001',
                status: 'checking',
                role: 'Admin',
              },
              {
                id: 2,
                title: 'Checking Shipment #002',
                status: 'checking',
                role: 'Operator',
              },
              {
                id: 3,
                title: 'Checking Shipment #003',
                status: 'checking',
                role: 'Supervisor',
              },
            ].map((item: any) => {
              let statusColor;
                if (item.status === 'Completed') {
                statusColor = '#228B22'; // dark green
                } else if (item.status === 'In Progress' || item.status === 'checking') {
                statusColor = '#FFB347'; // pastel orange
                } else {
                statusColor = '#696969'; // dark gray
                }
              return (
                <InboundList
                  key={item.id}
                  title={item.title}
                  status={item.status}
                  statusColor={statusColor}
                  role={item.role}
                  onClick={() => {
                    navigation.navigate('InspectionDo', { item });
                  }}
                />
              );
            })}
        </View>
      </ScrollView>
    </View>
  );
}

export default InspectionScreen;
