import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Colors from '../constants/Colors.ts';
import Ionicons from '@react-native-vector-icons/ionicons';

type VehicleListProps = {
  title: string;
  type: string;
  statusColor?: string;
  onClick?: () => void;
};

const VehicleList: React.FC<VehicleListProps> = ({
  title,
  type,
  statusColor = '#E5FFF2',
  onClick,
}) => {
  return (
    <View style={styles.card} {...(onClick ? { onTouchEnd: onClick } : {})}>
      <View style={styles.titleRow}>
        <View style={styles.titleTypeContainer}>
          <Text style={styles.title}>{title} </Text>
          <View style={styles.separator} />
          <Text style={styles.statusText}>{type}</Text>
        </View>

        {/* Arrow Icon */}
        <View style={styles.iconContainer}>
          <Ionicons
            name="chevron-forward-outline"
            size={20}
            color={Colors.secondaryColor}
          />
        </View>
      </View>
    </View>
  );
};

export default VehicleList;
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Ensures the icon is on the far right
  },
  titleTypeContainer: {
    flexDirection: 'row', // Keeps Title and Type in a horizontal row
    alignItems: 'center', // Vertically aligns them in the center
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 5, // Small space between Title and Type
  },
  statusText: {
    color: Colors.primeColor,
    fontWeight: 'bold',
    fontSize: 16,
  },
  iconContainer: {
    marginLeft: 10, // Provides space between the last column and the icon
  },
  separator: {
    width: 1, // Thickness of the separator
    height: '80%', // Make it almost as tall as the text
    backgroundColor: '#666', // Color of the separator
    marginHorizontal: 10, // Space around the separator
  },
});
