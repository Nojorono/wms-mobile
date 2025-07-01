import React, {useState} from 'react';
import { StyleSheet, ScrollView, Text, TouchableOpacity, View, Image} from "react-native";
import {useAuthStore} from "../store/useAuthStore";
import Ionicons from '@react-native-vector-icons/ionicons';
import GlobalStyles from "../util/GlobalStyles.ts";
import Colors from "../constants/Colors";
import StatusCard from "../components/NameCard";
import MenuGrid from "../components/MenuGrid";
import {useDialogStore} from "../store/useGlobalDialog";
import {useLoadingDialogStore} from "../store/useLoadingStore";

function HomeScreen() {
    const styles = GlobalStyles();
    const { user } = useAuthStore();
    const [showMainCard, setShowMainCard] = useState(true);
    const [showMenuCards, setShowMenuCards] = useState(false);
    const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();

    return (
        <View style={{flex: 1, backgroundColor: Colors.secondaryColor}}>
            {/* Header */}
            <View style={styles.headerHome}>
                <View style={styles.profileSection}>
                    <Text style={styles.profileText}>Hi! Handsome</Text>
                    <Text style={styles.profileSubtext}>Selamat beraktifitas, jaga selalu kesehatan rumah tanggamu</Text>
                </View>
            </View>
            {/* Main Scrollable Content */}
            <ScrollView contentContainerStyle={styles.menuContainer} stickyHeaderIndices={[2]}>
                <View style={styles.menuCard}>
                    <View style={styles.activitiesHeader}>
                        <Text style={styles.activitiesHeaderText}>Dahboard</Text>
                    </View>
                    <View style={stylez.rowWithMargin}>
                        <View style={[stylez.cardx, stylez.flexOne, stylez.marginRight8]}>
                            <Ionicons name="arrow-down-circle" size={32} color={Colors.primeColor} />
                            <Text style={stylez.titlex}>Inbound</Text>
                            <Text style={stylez.inboundText}>5</Text>
                        </View>
                        <View style={[stylez.cardx, stylez.flexOne, stylez.marginLeft8]}>
                            <Ionicons name="arrow-up-circle" size={32} color={Colors.secondaryColor} />
                            <Text style={stylez.titlex}>Outbound</Text>
                            <Text style={stylez.outboundText}>9</Text>
                        </View>
                    </View>
                    <View style={stylez.row}>
                        <View style={[stylez.cardx, stylez.flexOne, stylez.marginRight8]}>
                            <Ionicons name="person-add" size={32} color={Colors.primeColor} />
                            <Text style={stylez.titlex}>Assign</Text>
                            <Text style={stylez.inboundText}>8</Text>
                        </View>
                        <View style={[stylez.cardx, stylez.flexOne, stylez.marginLeft8]}>
                            <Ionicons name="person-remove" size={32} color={Colors.secondaryColor} />
                            <Text style={stylez.titlex}>Not Assign</Text>
                            <Text style={stylez.outboundText}>6</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

export default HomeScreen;
const stylez = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    backgroundColor: '#fff',
  },
  icon: {
    width: 70,
    height: 70,
    marginRight: 10,
    color: '#333',
  },
  title: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  cardx: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  titlex: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  rowWithMargin: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flexOne: {
    flex: 1,
  },
  marginRight8: {
    marginRight: 8,
  },
  marginLeft8: {
    marginLeft: 8,
  },
  inboundText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primeColor,
  },
  outboundText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.secondaryColor,
  },
})

