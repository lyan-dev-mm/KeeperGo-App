import { Stack } from 'expo-router';
import { AuthProvider } from '../src/presentation/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Pantallas de autenticación (sin tabs) */}
        <Stack.Screen name="(auth)" />
        
        {/* Pantallas principales (con tabs) */}
        <Stack.Screen name="(tabs)" />
        
        {/* Pantallas modales */}
        <Stack.Screen 
          name="RegisterEmotion" 
          options={{ 
            presentation: 'modal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }} 
        />
        
        <Stack.Screen 
          name="EmotionDetail" 
          options={{ 
            presentation: 'modal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }} 
        />
        
        {/* Pantallas adicionales */}
        <Stack.Screen 
          name="terms" 
          options={{ 
            headerShown: true, 
            title: 'Términos' 
          }} 
        />
      </Stack>
    </AuthProvider>
  );
}