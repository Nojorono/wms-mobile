import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/FontAwesome5';
import Colors from '../../constants/Colors.ts';

type InboundListProps = {
  title: string;
  status?: string;
  statusColor?: string;
  onClick?: () => void;
  role?: string;
  client_name?: string;
  task_type?: string;
};

const InboundList: React.FC<InboundListProps> = ({
  title,
  status,
  statusColor = '#E5FFF2',
  onClick,
  role,
  client_name ='',
  task_type=''
}) => {
  return (
    <View style={styles.card} {...(onClick ? { onTouchEnd: onClick } : {})}>
      <View style={styles.titleRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Ionicons
            style={{ marginRight: 10 }}
            size={25}
            color={Colors.secondaryColor}
            name={'boxes'}
          />
          <View style={{ flexDirection: 'column', flex: 1, padding: 6 }}>
            <Text style={styles.title}>{title}</Text>
            {role && <Text style={styles.role}>{role}</Text>}
            {client_name && <Text style={styles.role}>{client_name}</Text>}
            {task_type && <Text style={styles.role}>{task_type}</Text>}
            {status && (
              <View
                style={[
                  styles.statusBadge,
                  {
                    marginTop: 10,
                    backgroundColor: statusColor,
                    alignSelf: 'flex-start',
                  },
                ]}
              >
                <Text style={styles.statusText}>{status}</Text>
              </View>
            )}
          </View>
        </View>

        <Ionicons
          name="chevron-right"
          size={20}
          color={Colors.secondaryColor}
        />
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
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  role: {
    fontSize: 24,
    color: 'black',
    marginLeft: 10,
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
