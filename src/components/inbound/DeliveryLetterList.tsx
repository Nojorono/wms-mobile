import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Colors from '../../constants/Colors.ts';
import Ionicons from '@react-native-vector-icons/ionicons';

type DeliveryLetterListProps = {
  title: string;
  type: string;
  onClick?: () => void;
};

const DeliveryLetterList: React.FC<DeliveryLetterListProps> = ({
                                                   title,
                                                   type,
                                                   onClick
                                                 }) => {
  return (
    <View style={styles.card} >
      <View style={styles.titleRow}>
        <View style={styles.titleTypeContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="logo-dropbox" size={24} color={Colors.secondaryColor} />
          </View>
          <View>
            <Text style={styles.title}>{title} </Text>
            <Text style={styles.statusText}>{type}</Text>
          </View>
        </View>
        <View style={styles.buttonGroup}>
          <Text
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Detail"
            style={[styles.actionButton, { backgroundColor: Colors.primeColor }]}
            onPress={() => {
              onClick && onClick();
            }}
          >
            Detail
          </Text>
        </View>
      </View>
    </View>
  );
};

export default DeliveryLetterList;
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primeColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: Colors.secondaryColor,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  statusText: {
    color: Colors.primeColor,
    fontWeight: '600',
    fontSize: 14,
    marginTop: 2,
  },
  buttonGroup: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  actionButton: {
    backgroundColor: Colors.secondaryColor,
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 6,
    overflow: 'hidden',
    elevation: 2,
  },
});
