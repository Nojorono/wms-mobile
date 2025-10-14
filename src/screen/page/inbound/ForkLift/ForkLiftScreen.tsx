import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';

import { useAuthStore } from '../../../../store/useAuthStore.ts';
import { useLoadingDialogStore } from '../../../../store/useLoadingStore.ts';
import { useDialogStore } from '../../../../store/useGlobalDialog.ts';
import { ForkLiftParamList } from '../../../navigation/inbound/ForkLiftNavigator.tsx';
import InboundServices from '../../../../service/inboundServices.ts';
import ForkLiftList from '../../../../components/inbound/forklift/ForkLiftListCard.tsx';
import GlobalStyles from '../../../../util/GlobalStyles.ts';
import Colors from '../../../../constants/Colors.ts';

type NavigationProp = StackNavigationProp<ForkLiftParamList, 'ForkLiftMain'>;

export default function ForkLiftScreen() {
  const [forkLiftList, setForkLiftList] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [scanned, setScanned] = useState(false);

  const navigation = useNavigation<NavigationProp>();
  const styles = GlobalStyles();
  const inputRef = useRef<TextInput>(null);

  const { showLoadingDialog, hideLoadingDialog } = useLoadingDialogStore();
  const showDialog = useDialogStore((state) => state.showDialog);
  const { user } = useAuthStore();

  // 📦 Fetch data forklift
  const fetchForkLift = async () => {
    try {
      setRefreshing(true);
      showLoadingDialog('Loading List ForkLift Task');
      const response = await InboundServices.getForkLiftList(
        '7ca0f958-6c1b-4d18-81bd-6489c9a7c6ad'
      );
      setForkLiftList(response?.data || []);
    } catch (error) {
      showDialog('error', 'Error while fetching ForkLift data!');
    } finally {
      hideLoadingDialog();
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchForkLift();
  }, []);

  // 🎯 Fokus ke TextInput agar scanner bisa mengetik ke sana
  useEffect(() => {
    if (!showCamera) {
      const focusInput = () => inputRef.current?.focus();
      const showListener = Keyboard.addListener('keyboardDidHide', focusInput);
      focusInput();
      return () => showListener.remove();
    }
  }, [showCamera]);

  // 🔍 Submit dari hardware scanner
  const handleSubmitEditing = () => {
    const code = scannedCode.trim();
    if (!code) return;
    handleMatch(code);
  };

  // 🎯 Fungsi pencocokan data forklift
  const handleMatch = (code: string) => {
    console.log('Scanned Code:', code);
    const matchedItem = forkLiftList.find(
      (item) => item?.inventoryTracking?.pallet?.pallet_code === code
    );

    if (matchedItem) {
      setScannedCode('');
      setShowCamera(false);
      navigation.navigate('ForkLiftDetail', { item: matchedItem });
    } else {
      Alert.alert('Not Found', `No pallet matched for: ${code}`, [
        { text: 'OK', onPress: () => inputRef.current?.focus() },
      ]);
      setScannedCode('');
    }
  };

  // 📸 Vision Camera setup
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission]);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'code-128', 'ean-13', 'code-39'],
    onCodeScanned: (codes) => {
      if (scanned) return;
      setScanned(true);
      const value = codes[0]?.value || '';
      if (value) handleMatch(value);
    },
  });

  // 📸 View kamera
  if (showCamera) {
    if (!device || !hasPermission) {
      return (
        <View style={styles.menuContainer}>
          <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>
            Waiting for camera permission or device not found...
          </Text>
        </View>
      );
    }

    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          codeScanner={codeScanner}
        />

        <View style={cameraStyles.overlay}>
          <Text style={cameraStyles.overlayText}>Scan Pallet Code</Text>
          <TouchableOpacity
            style={cameraStyles.closeButton}
            onPress={() => {
              setShowCamera(false);
              setScanned(false);
              setTimeout(() => inputRef.current?.focus(), 500);
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 📋 Mode Hardware Scanner (default)
  return (
    <View style={{ flex: 1, backgroundColor: Colors.secondaryColor }}>
      {/* Hidden input untuk menangkap scan dari tombol fisik */}
      <TextInput
        ref={inputRef}
        value={scannedCode}
        onChangeText={setScannedCode}
        onSubmitEditing={handleSubmitEditing}
        blurOnSubmit={false}
        autoFocus
        style={hiddenInputStyle.input}
      />

      {/* List ForkLift */}
      <ScrollView
        contentContainerStyle={styles.menuContainer}
        style={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchForkLift}
            colors={[Colors.primeColor]}
          />
        }
      >
        <View style={styles.menuCard}>
          <View
            style={[
              styles.activitiesHeader,
              { borderBottomWidth: 2, borderBottomColor: '#ccc' },
            ]}
          >
            <Text style={styles.activitiesHeaderText}>List ForkLift Task</Text>
          </View>

          <View style={{ padding: 20 }}>
            {forkLiftList.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>
                No tasks found.
              </Text>
            ) : (
              forkLiftList.map((item, index) => (
                <ForkLiftList
                  key={item.id}
                  item={item}
                  index={index}
                  onClick={() => navigation.navigate('ForkLiftDetail', { item })}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* 🔘 Tombol toggle scanner mode */}
      <View style={stylex.buttonWrapper}>
        <TouchableOpacity
          style={[stylex.scanButton, { backgroundColor: '#FF6B00' }]}
          onPress={() => {
            Alert.alert(
              'Pilih Mode Scan',
              'Gunakan hardware scanner atau kamera?',
              [
                {
                  text: 'Hardware',
                  onPress: () => inputRef.current?.focus(),
                },
                {
                  text: 'Kamera',
                  onPress: () => {
                    setScanned(false);
                    setShowCamera(true);
                  },
                },
                { text: 'Batal', style: 'cancel' },
              ]
            );
          }}
        >
          <Icon name="barcode" size={20} color="#fff" />
          <Text style={stylex.scanText}>Scan Pallet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const hiddenInputStyle = StyleSheet.create({
  input: {
    height: 0,
    width: 0,
    position: 'absolute',
    opacity: 0,
  },
});

const stylex = StyleSheet.create({
  buttonWrapper: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 48,
    elevation: 4,
  },
  scanText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
});

const cameraStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
});
