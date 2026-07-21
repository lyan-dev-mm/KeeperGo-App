import { Stack } from 'expo-router';

export default function TabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="racha" options={{ headerShown: true, title: 'Tu Racha' }} />
    </Stack>
  );
}