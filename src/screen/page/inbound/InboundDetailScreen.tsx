import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import GlobalStyles from '../../../util/GlobalStyles.ts';
import Colors from '../../../constants/Colors';
import {  RouteProp, useNavigation } from '@react-navigation/native';
import { InboundParamList } from '../../navigation/InboundNavigator.tsx';
import VehicleList from '../../../components/VehicleList.tsx';
import { StackNavigationProp } from '@react-navigation/stack';


type FormInboundRouteProp = RouteProp<
  InboundParamList,
  'InboundDetail'
>;
type FormActivityProps = {
  route: FormInboundRouteProp;
};


const VehicleListData = [
  {
    id: 1,
    title: 'B 123 TYX',
    type: 'Mini Van',
  },
  {
    id: 2,
    title: 'H 7833 TYY',
    type: 'BOX',
  },
  {
    id: 3,
    title: 'H 9082 PO',
    type: 'BOX',
  },
];



export default function InboundDetailScreen( { route }: FormActivityProps ) {
  const styles = GlobalStyles();
  const { user } = useAuthStore();
  const { item, vehicle } = route.params;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.secondaryColor }}>
      <View style={styles.headerHome}>
        <View style={styles.profileSection}>
          <Text style={styles.profileText}>{item.title || 'Undefined'}</Text>
          <Text style={styles.profileText}>{vehicle.title || 'Undefined'}</Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.menuContainer}
        stickyHeaderIndices={[2]}
      >
        <View style={styles.menuCard}>
          <View
            style={[
              styles.activitiesHeader,
              { borderBottomWidth: 2, borderBottomColor: '#666' },
            ]}
          >
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <Text style={styles.activitiesHeaderText}>List Vehicle</Text>
            </View>
          </View>
          {VehicleListData.map(item => (
            <VehicleList
              key={item.id}
              onClick={() => {

              }}
              title={item.title}
              type={item.type}
              statusColor="#E5FFF2"
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}


const style = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.secondaryColor,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  modalButton: {
    backgroundColor: Colors.secondaryColor,
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

