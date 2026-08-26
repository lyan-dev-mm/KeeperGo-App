import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { LiquidTabBar } from '../../src/presentation/components/LiquidTabBar';

export default function TabsLayout() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
     <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="racha" options={{ headerShown: true, title: 'Tu Racha' }} />
      <Stack.Screen name="bitacora" />
          <Stack.Screen name="home" />
          <Stack.Screen name="racha" />
          <Stack.Screen name="habits" />
          <Stack.Screen name="search-community" />
          <Stack.Screen name="community-rules" />
          <Stack.Screen name="habit-detail" />
        </Stack>
      </View>
      <LiquidTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});