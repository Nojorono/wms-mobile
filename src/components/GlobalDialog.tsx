// components/GlobalDialog.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useDialogStore } from '../store/useGlobalDialog';

// 1. Pindahkan require ke luar komponen agar JSON tidak di-load berulang kali
const ANIMATIONS = {
  success: require('../assets/success-animation.json'),
  error: require('../assets/error-animation.json'),
};

const GlobalDialog = () => {
  const { visible, type, title, hideDialog } = useDialogStore();
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      // 2. Gunakan setTimeout pendek untuk memastikan layout tergambar dulu
      // sebelum memaksa animasi berjalan dari frame 0
      const playTimer = setTimeout(() => {
        animationRef.current?.play(0);
      }, 50);

      const hideTimer = setTimeout(() => hideDialog(), 3000);
      
      return () => {
        clearTimeout(playTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [visible, hideDialog]);

  if (!visible) return null;

  return (
    <View style={styles.absoluteOverlay}>
      <View style={styles.card}>
        <LottieView
          ref={animationRef}
          source={ANIMATIONS[type]}
          style={styles.animation}
          autoPlay={false} // 3. Matikan autoPlay, biarkan ref yang bekerja
          loop={type === 'error'}
        />
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  absoluteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: 250,
  },
  animation: {
    width: 150,
    height: 150,
  },
  title: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});

export default GlobalDialog;