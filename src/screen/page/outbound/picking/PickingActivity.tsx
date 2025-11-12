import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PickingParamList } from '../../../navigation/outbound/PickingNavigator';


type NavigationProp = StackNavigationProp<PickingParamList, 'PickingDoMain'>;

export default function PickingActivity() {
    const navigation = useNavigation<NavigationProp>();
    

      const handleAddActivity = () => {
        navigation.navigate('PickingDetailActivity', { item: {} });
      };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Picking Activity</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Clasmild - 12</Text>
                <Text style={styles.subLabel}>
                    <Text style={{ fontStyle: 'italic' }}>Suggested Location</Text> {'\n'}
                    WEEK41 - JT6 - D - 0/40 DUS
                </Text>

                <Text style={styles.noActivityText}>
                    Belum ada Activity, silahkan lakukan Activity Picking
                </Text>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddActivity}
                >
                    <Text style={styles.addButtonText}>+ Add Activity</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#EDE8E3',
        flexGrow: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#F26E1F',
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#F4F7FB',
        borderRadius: 12,
        padding: 16,
    },
    label: {
        fontWeight: '700',
        fontSize: 16,
        marginBottom: 4,
    },
    subLabel: {
        color: '#444',
        marginBottom: 12,
    },
    noActivityText: {
        textAlign: 'center',
        color: '#666',
        marginBottom: 12,
    },
    addButton: {
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    addButtonText: {
        textAlign: 'center',
        fontWeight: '600',
        color: '#333',
    },
});
