import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import GlobalStyles from '../../util/GlobalStyles.ts';
import Colors from '../../constants/Colors';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MenuCard from "../../components/MenuCard.tsx";
import { OutboundParamList } from '../navigation/outbound/OutboundNavigator.tsx';
import { ROLES } from '../../constants/Roles.ts';
import { MovementParamList } from '../navigation/movement/MovementNavigator.tsx';


type NavigationProp = StackNavigationProp<MovementParamList, 'MovementMain'>;

function MovementIndex() {
    const styles = GlobalStyles();
    const { user } = useAuthStore();
    const navigation = useNavigation<NavigationProp>();
    const roleName = user?.role?.name || "";

    return (
        <View style={{ flex: 1, backgroundColor: Colors.secondaryColor }}>
            {/* Header */}
            <View style={styles.headerHome}>
                <View style={styles.profileSection}>
                    <Text style={styles.profileText}>Hi! {roleName}</Text>
                    <Text style={styles.profileSubtext}>
                        Selamat beraktifitas, jaga selalu kesehatan
                    </Text>
                </View>
            </View>
            {/* Main Scrollable Content */}
            <View style={{ flex: 1 }}>
                {/* Sticky Header */}
                <View
                    style={[
                        styles.activitiesHeader,
                        {
                            borderBottomWidth: 2,
                            borderBottomColor: '#ccc',
                            zIndex: 1,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            backgroundColor: "#fff" // Tambahkan ini agar background tetap sesuai
                        }
                    ]}
                >
                    <Text style={styles.activitiesHeaderText}>Movement Menu</Text>
                </View>
                <ScrollView
                    contentContainerStyle={[styles.menuContainer, { paddingTop: 60 }]}
                    style={styles.scrollViewContent}
                >
                    <View style={styles.menuCard}>
                        {roleName === ROLES.DRIVER_FORKLIFT && (
                            <MenuCard
                                title={"Move Like Jagger"}
                            //   onPress={() => navigation.navigate("OutboundForkliftGate")}
                            />
                        )}

                        {roleName === ROLES.WH_STAFF && (
                            <>
                                <MenuCard
                                    title={"Move Location"}
                                // onPress={() => navigation.navigate("OutboundInspection")}
                                />
                                <MenuCard
                                    title={"Update Inventory"}
                                // onPress={() => navigation.navigate("OutboundAssignGate")}
                                />
                                {/* <MenuCard
                  title={"Update Inventory"}
                // onPress={() => navigationMovement.navigate("MovementMain")}
                /> */}
                            </>
                        )}

                        {roleName === ROLES.HELPER && (
                            <>
                                <MenuCard
                                    title={"PICKING"}
                                // onPress={() => navigation.navigate("OutboundPicking")}
                                />
                                {/* <MenuCard
                  title={"LOADING"}
                // onPress={() => navigationMovement.navigate("UnloadingNavigator")}
                /> */}
                            </>

                        )}

                        {/* 🔸 Optional: fallback jika role tidak dikenali */}
                        {!Object.values(ROLES).includes(roleName as typeof ROLES[keyof typeof ROLES]) && (
                            <Text style={{
                                textAlign: "center",
                                color: "#999",
                                marginTop: 20
                            }}>
                                Role "{roleName}" belum memiliki menu khusus.
                            </Text>
                        )}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

export default MovementIndex;
