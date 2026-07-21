import { Stack } from 'expo-router';
import { AuthProvider } from '../src/presentation/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="terms" options={{ headerShown: true, title: 'Términos' }} />
      </Stack>
    </AuthProvider>
  );
}