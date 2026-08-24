
import React, { JSX } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { COLORS } from '../../../constants/colors';

export interface BottomNavigationProps {
  activeTab?: 'home' | 'bitacora' | 'racha' | 'profile';
  onAddPress?: () => void;
}

export default function BottomNavigation({
  activeTab = 'home',
  onAddPress,
}: BottomNavigationProps): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();

  const currentTab = activeTab !== 'home' ? activeTab :
    pathname.includes('/bitacora') ? 'bitacora' :
    pathname.includes('/racha') ? 'racha' :
    pathname.includes('/profile') ? 'profile' : 'home';

  const showComingSoon = (): void => {
    Alert.alert(
      'Próximamente',
      'Esta funcionalidad estará disponible pronto.'
    );
  };

  const getIconColor = (tab: string): string => {
    return currentTab === tab ? '#4CAF50' : '#9E9E9E';
  };

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity onPress={() => router.push('/(tabs)')}>
        <Ionicons 
          name={currentTab === 'home' ? 'home' : 'home-outline'} 
          size={26} 
          color={getIconColor('home')} 
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(tabs)/bitacora')}>
        <Ionicons 
          name={currentTab === 'bitacora' ? 'heart' : 'heart-outline'} 
          size={26} 
          color={getIconColor('bitacora')} 
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={showComingSoon}>
        <Ionicons 
          name="add-circle-outline" 
          size={30} 
          color={'#9E9E9E'} 
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(tabs)/racha')}>
        <Ionicons 
          name={currentTab === 'racha' ? 'paw' : 'paw-outline'} 
          size={26} 
          color={getIconColor('racha')} 
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
        <Ionicons 
          name={currentTab === 'profile' ? 'person' : 'person-outline'} 
          size={26} 
          color={getIconColor('profile')} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    backgroundColor: '#FFFFFF',
  },
});