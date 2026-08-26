import { Stack } from 'expo-router';
import { AuthProvider } from '../src/presentation/contexts/AuthContext';
import { PetActivityProvider } from '../src/presentation/contexts/PetActivityContext';
import { HabitsProvider } from '../src/presentation/contexts/HabitsContext';  

export default function RootLayout() {
  return (
    <AuthProvider>
      <PetActivityProvider>
        <HabitsProvider>                                                     
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="terms" options={{ headerShown: true, title: 'Términos' }} />
            <Stack.Screen name="kii-chat" options={{ headerShown: false }} />
            <Stack.Screen name="admin" options={{ headerShown: false }} />
            <Stack.Screen name="admin-messages" options={{ headerShown: false }} />
            <Stack.Screen name="admin-milestones" options={{ headerShown: false }} />
            <Stack.Screen name="admin-users" options={{ headerShown: false }} />
            <Stack.Screen name="ask-location" options={{ headerShown: false }} />
          </Stack>
        </HabitsProvider>
      </PetActivityProvider>
    </AuthProvider>
  );
}