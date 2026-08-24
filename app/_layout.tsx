import { Stack } from 'expo-router';
import { AuthProvider } from '../src/presentation/contexts/AuthContext';

export default function RootLayout() {
  return (
     <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name='zona-relajacion'
          options={{
            headerShown: false,
            animation: 'slide_from_right'
          }}
          />
        <Stack.Screen 
          name="(modals)/RegisterEmotion"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="(modals)/EmotionDetail"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="terms" 
          options={{ headerShown: true, title: 'Términos' }} 
        />
      </Stack>
    </AuthProvider>
  );
}