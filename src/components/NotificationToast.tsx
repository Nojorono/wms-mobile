import React, { useEffect } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

interface NotificationToastProps {
  visible: boolean;
  title: string;
  message: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  onHide: () => void;
}

export default function NotificationToast({
  visible,
  title,
  message,
  priority = 'LOW',
  onHide,
}: NotificationToastProps) {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto hide after 4s
      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(onHide);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const backgroundColor =
    priority === 'HIGH' ? "red" :
    priority === 'MEDIUM' ? "orange" :
    Colors.primeColor;

  return (
    <Animated.View style={[styles.container, { opacity, backgroundColor }]}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    zIndex: 9999,
  },
  content: {
    gap: 4,
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
    color: '#fff',
  },
  message: {
    color: '#fff',
    fontSize: 14,
  },
});
