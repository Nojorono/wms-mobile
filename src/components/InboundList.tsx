import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type InboundListProps = {
  title: string;
  status: string;
  statusColor?: string;
  onClick?: () => void;
};

const InboundList: React.FC<InboundListProps> = ({
  title,
  status,
  statusColor = '#E5FFF2',
  onClick,
}) => {
  return (
    <View style={styles.card} {...(onClick ? { onTouchEnd: onClick } : {})}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>
    </View>
  );
};

export default InboundList;

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
    justifyContent: 'space-between',
    borderColor: '#666',
  },
  titleStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 2,
  },
  statusText: {
    color: '#00994D',
    fontWeight: 'bold',
    fontSize: 12,
  },
  routeText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  date: {
    fontSize: 14,
    color: 'black',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between', // This ensures the content is spaced between
  },
});
