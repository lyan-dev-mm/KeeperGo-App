import { Stack } from 'expo-router';
import { AuthProvider } from '../src/presentation/contexts/AuthContext';
import { Platform } from 'react-native';
import Providers from './providers';

if (Platform.OS === 'web') {
  require('leaflet/dist/leaflet.css');
}


export default function RootLayout() {
  
  return (
     <AuthProvider>
        <Providers> 
          <Stack screenOptions={{ headerShown: false }}> 
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="terms" options={{ headerShown: true, title: 'Términos' }} />
            <Stack.Screen name='zona-relajacion' options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="(modals)/RegisterEmotion" options={{ presentation: 'modal', headerShown: false, }} />
            <Stack.Screen name="(modals)/EmotionDetail" options={{ presentation: 'modal', headerShown: false, }}  />
            <Stack.Screen name="(modals)/EjercicioRespiracion" options={{ presentation: 'modal', headerShown: false, }} />
            <Stack.Screen name="(modals)/DASS21" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="(modals)/SUS" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="(modals)/Autopercepcion" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="(modals)/Feedback" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="(modals)/Paywall" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="(modals)/BienvenidaPiloto" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="(modals)/CierrePiloto" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="kii-chat" options={{ headerShown: false }} />
            <Stack.Screen name="admin" options={{ headerShown: false }} />
            <Stack.Screen name="admin-messages" options={{ headerShown: false }} />
            <Stack.Screen name="admin-milestones" options={{ headerShown: false }} />
            <Stack.Screen name="admin-pet-options" options={{ headerShown: false }} />
            <Stack.Screen name="admin-users" options={{ headerShown: false }} />
            <Stack.Screen name="ask-location" options={{ headerShown: false }} />
            <Stack.Screen name="verify-email" options={{ headerShown: false }} />
            <Stack.Screen name="specialists" options={{ headerShown: false }} />
            <Stack.Screen name="specialist-profile" options={{ headerShown: false }} />
            <Stack.Screen name="specialist-chat" options={{ headerShown: false }} />
          </Stack>
      </Providers>
    </AuthProvider>
  );
}