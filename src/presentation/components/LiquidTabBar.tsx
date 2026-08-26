import React, { useRef, useState, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, LayoutChangeEvent, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { QuickActionsSheet } from './QuickActionsSheet';

interface TabConfig {
  key: string;
  icon: string;
  route?: string;
}

const LEFT_TABS: TabConfig[] = [
  { key: 'home', icon: 'home', route: '/(tabs)/home' },
  { key: 'emociones', icon: 'heart', route: '/(tabs)/bitacora' },
];

const RIGHT_TABS: TabConfig[] = [
  { key: 'mascota', icon: 'paw', route: '/(tabs)/racha' },
  { key: 'perfil', icon: 'person' },
];

function getActiveKeyFromPathname(pathname: string): string {
  if (pathname.includes('racha')) return 'mascota';
  return 'home';
}

export function LiquidTabBar() {
  const pathname = usePathname();
  const routeActiveKey = getActiveKeyFromPathname(pathname);
  const [tappedKey, setTappedKey] = useState<string | null>(null);
  const activeKey = tappedKey ?? routeActiveKey;

  const [sheetVisible, setSheetVisible] = useState(false);
  const layouts = useRef<Record<string, { x: number; width: number }>>({});
  const pillX = useRef(new Animated.Value(0)).current;
  const pillWidth = useRef(new Animated.Value(0)).current;
  const [pillReady, setPillReady] = useState(false);

  const animateTo = useCallback(
    (key: string) => {
      const layout = layouts.current[key];
      if (!layout) return;
      Animated.parallel([
        Animated.spring(pillX, { toValue: layout.x, useNativeDriver: false, friction: 8, tension: 60 }),
        Animated.spring(pillWidth, { toValue: layout.width, useNativeDriver: false, friction: 8, tension: 60 }),
      ]).start();
    },
    [pillX, pillWidth]
  );

  const handleLayout = (key: string) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    layouts.current[key] = { x, width };
    if (key === activeKey && !pillReady) {
      pillX.setValue(x);
      pillWidth.setValue(width);
      setPillReady(true);
    }
  };

  const handleTabPress = (tab: TabConfig) => {
    setTappedKey(tab.key);
    animateTo(tab.key);
    if (tab.route) {
      router.replace(tab.route as any);
    } else {
      Alert.alert('Próximamente', 'Estamos trabajando en esto, pronto estará disponible.');
    }
  };

  const renderTab = (tab: TabConfig) => {
    const isActive = tab.key === activeKey;
    const iconName = (isActive ? tab.icon : `${tab.icon}-outline`) as keyof typeof Ionicons.glyphMap;
    return (
      <TouchableOpacity
        key={tab.key}
        style={styles.tab}
        onLayout={handleLayout(tab.key)}
        onPress={() => handleTabPress(tab)}
        activeOpacity={0.7}
      >
        <Ionicons name={iconName} size={22} color={isActive ? '#2E7D32' : '#9E9E9E'} />
      </TouchableOpacity>
    );
  };

  return (
    <>
      <SafeAreaView style={styles.wrapper} edges={['bottom']}>
        <View style={styles.bar}>
          {pillReady && <Animated.View style={[styles.pill, { left: pillX, width: pillWidth }]} />}
          {LEFT_TABS.map(renderTab)}
          <TouchableOpacity style={styles.centerButton} onPress={() => setSheetVisible(true)} activeOpacity={0.85}>
            <Ionicons name="add" size={26} color="#fff" />
          </TouchableOpacity>
          {RIGHT_TABS.map(renderTab)}
        </View>
      </SafeAreaView>

      <QuickActionsSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    zIndex: 2,
  },
  pill: {
    position: 'absolute',
    top: 8,
    height: 42,
    backgroundColor: '#E3F2DA',
    borderRadius: 21,
    zIndex: 1,
  },
  centerButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -14,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});